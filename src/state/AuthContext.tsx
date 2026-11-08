import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { api, ApiError } from "../lib/api";

export type UserRole = "shipper" | "fleet_manager" | "admin";
export type AccountType = "individual" | "business";
export type FleetManagerStatus = "pending" | "active" | "suspended";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  accountType?: AccountType;
  // Un gestionnaire de flotte démarre toujours "pending" : SEEDO doit
  // valider le partenariat avant qu'il puisse enregistrer des
  // transporteurs. Non pertinent (undefined) pour les autres rôles.
  fleetManagerStatus?: FleetManagerStatus;
  // Dossier d'inscription (gestionnaire de flotte) — pièce d'identité
  // toujours requise, RCCM seulement si accountType === "business".
  idDocumentUploaded?: boolean;
  rccmDocumentUploaded?: boolean;
  contractAccepted?: boolean;
}

interface SignupInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: UserRole;
  accountType: AccountType;
}

interface AuthResult {
  ok: boolean;
  error?: string;
  user?: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (input: SignupInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  /** Recharge le profil (GET /users/me) — après upload de document ou
   * acceptation du contrat, pour que l'état reflète le dossier à jour. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface MeResponse {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  account_type: AccountType | null;
  fleet_manager_status: FleetManagerStatus | null;
  id_document_uploaded: boolean | null;
  rccm_document_uploaded: boolean | null;
  contract_accepted: boolean | null;
}

interface UserCreateResponse {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  email: string | null;
  city: string | null;
  account_type: AccountType;
  created_at: string;
}

function fromMe(me: MeResponse): AuthUser {
  return {
    id: me.id,
    name: me.full_name,
    phone: me.phone,
    email: me.email ?? "",
    role: me.role,
    accountType: me.account_type ?? undefined,
    fleetManagerStatus: me.fleet_manager_status ?? undefined,
    idDocumentUploaded: me.id_document_uploaded ?? undefined,
    rccmDocumentUploaded: me.rccm_document_uploaded ?? undefined,
    contractAccepted: me.contract_accepted ?? undefined,
  };
}

/**
 * Authentification Firebase réelle (email/mot de passe — le palier
 * gratuit Spark ne couvre pas l'auth par SMS, voir discussion produit).
 * Firebase gère l'identité ; le profil métier (rôle, statut, etc.) vit
 * dans Postgres (Neon) et se récupère via GET /users/me.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // login()/signup() pilotent déjà explicitement `user` de bout en bout ;
  // pendant qu'ils tournent, le listener ne doit pas interférer — sinon il
  // peut appeler /users/me avant que POST /users ait fini de créer le
  // profil (juste après la création du compte Firebase) et écraser l'état
  // avec un faux "non connecté".
  const explicitFlowInProgress = React.useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (explicitFlowInProgress.current) return;
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const me = await api.get<MeResponse>("/users/me");
        setUser(fromMe(me));
      } catch {
        // Compte Firebase authentifié mais profil métier introuvable
        // (POST /users jamais terminé) — pas de session fantôme.
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    explicitFlowInProgress.current = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const me = await api.get<MeResponse>("/users/me");
      const authUser = fromMe(me);
      setUser(authUser);
      return { ok: true, user: authUser };
    } catch (err) {
      return { ok: false, error: loginErrorMessage(err) };
    } finally {
      explicitFlowInProgress.current = false;
    }
  };

  const signup: AuthContextValue["signup"] = async ({ name, phone, email, password, role, accountType }) => {
    explicitFlowInProgress.current = true;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      try {
        const created = await api.post<UserCreateResponse>("/users", {
          role,
          full_name: name,
          phone,
          email,
          account_type: accountType,
        });
        const authUser: AuthUser = {
          id: created.id,
          name: created.full_name,
          phone: created.phone,
          email: created.email ?? "",
          role: created.role,
          accountType: created.account_type,
          fleetManagerStatus: role === "fleet_manager" ? "pending" : undefined,
          idDocumentUploaded: role === "fleet_manager" ? false : undefined,
          rccmDocumentUploaded: role === "fleet_manager" ? false : undefined,
          contractAccepted: role === "fleet_manager" ? false : undefined,
        };
        setUser(authUser);
        return { ok: true, user: authUser };
      } catch (err) {
        // Le compte Firebase existe mais le profil métier a échoué à se
        // créer — on nettoie plutôt que de laisser un compte fantôme.
        await credential.user.delete().catch(() => {});
        throw err;
      }
    } catch (err) {
      return { ok: false, error: signupErrorMessage(err) };
    } finally {
      explicitFlowInProgress.current = false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;
    try {
      const me = await api.get<MeResponse>("/users/me");
      setUser(fromMe(me));
    } catch {
      // Pas de session fantôme si le rechargement échoue — l'état précédent reste affiché.
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}

/** Pièce d'identité toujours requise, RCCM seulement pour un compte entreprise. */
export function isFleetManagerOnboardingComplete(user: AuthUser): boolean {
  if (!user.idDocumentUploaded) return false;
  if (user.accountType === "business" && !user.rccmDocumentUploaded) return false;
  if (!user.contractAccepted) return false;
  return true;
}

export function roleHome(role: UserRole): string {
  if (role === "shipper") return "/";
  if (role === "admin") return "/admin/gestionnaires";
  return "/flotte";
}

function signupErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  const code = (err as { code?: string } | null)?.code;
  if (code === "auth/email-already-in-use") return "Un compte existe déjà avec cet email.";
  if (code === "auth/weak-password") return "Mot de passe trop court (6 caractères minimum).";
  if (code === "auth/invalid-email") return "Adresse email invalide.";
  return "Inscription impossible. Réessayez.";
}

function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  const code = (err as { code?: string } | null)?.code;
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Email ou mot de passe incorrect.";
  }
  return "Connexion impossible. Réessayez.";
}
