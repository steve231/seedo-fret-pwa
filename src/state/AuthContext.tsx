import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "shipper" | "fleet_manager" | "admin";
export type AccountType = "individual" | "business";
export type FleetManagerStatus = "pending" | "active" | "suspended";

export interface AuthUser {
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  accountType?: AccountType;
  // Un gestionnaire de flotte démarre toujours "pending" : SEEDO doit
  // valider le partenariat avant qu'il puisse enregistrer des
  // transporteurs. Non pertinent (undefined) pour les autres rôles.
  fleetManagerStatus?: FleetManagerStatus;
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
  login: (phone: string, password: string) => AuthResult;
  signup: (input: SignupInput) => AuthResult;
  logout: () => void;
  listFleetManagers: () => AuthUser[];
  setFleetManagerStatus: (phone: string, status: FleetManagerStatus) => void;
}

const SESSION_KEY = "seedo_fret_session";
const ACCOUNTS_KEY = "seedo_fret_mock_accounts";

// Compte admin de démonstration : SEEDO ne s'auto-inscrit pas (comme côté
// backend, POST /users refuse role='admin'), donc on l'amorce une fois
// plutôt que de laisser l'admin inaccessible tant qu'aucun vrai provisioning
// n'existe.
const DEFAULT_ADMIN: AuthUser = {
  name: "Admin SEEDO",
  phone: "+229 00 00 00 01",
  email: "admin@seedofret.com",
  role: "admin",
};

/**
 * Authentification simulée en localStorage — en attendant le backend (Firebase Auth
 * + Postgres). Le rôle (shipper/carrier) est choisi à l'inscription et persiste par
 * compte, exactement comme le ferait un vrai profil serveur. Le mot de passe n'est
 * pas vérifié (champ collecté pour la continuité UX, pas de sécurité réelle ici).
 */
function readAccounts(): Record<string, AuthUser> {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "{}");
    if (!accounts[DEFAULT_ADMIN.phone]) {
      accounts[DEFAULT_ADMIN.phone] = DEFAULT_ADMIN;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
    return accounts;
  } catch {
    return { [DEFAULT_ADMIN.phone]: DEFAULT_ADMIN };
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      // session illisible, on repart sans utilisateur connecté
    }
    setLoading(false);
  }, []);

  const persistSession = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  };

  const login: AuthContextValue["login"] = (phone, password) => {
    if (!phone || !password) return { ok: false, error: "Téléphone et mot de passe requis." };
    const accounts = readAccounts();
    const account = accounts[phone];
    if (!account) return { ok: false, error: "Aucun compte trouvé avec ce numéro." };
    persistSession(account);
    return { ok: true, user: account };
  };

  const signup: AuthContextValue["signup"] = ({ name, phone, email, role, accountType }) => {
    if (!name || !phone || !email) return { ok: false, error: "Tous les champs sont requis." };
    const accounts = readAccounts();
    if (accounts[phone]) return { ok: false, error: "Un compte existe déjà avec ce numéro." };
    const newUser: AuthUser = {
      name,
      phone,
      email,
      role,
      accountType,
      fleetManagerStatus: role === "fleet_manager" ? "pending" : undefined,
    };
    accounts[phone] = newUser;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    persistSession(newUser);
    return { ok: true, user: newUser };
  };

  const logout = () => persistSession(null);

  const listFleetManagers: AuthContextValue["listFleetManagers"] = () => {
    return Object.values(readAccounts()).filter(a => a.role === "fleet_manager");
  };

  const setFleetManagerStatus: AuthContextValue["setFleetManagerStatus"] = (phone, status) => {
    const accounts = readAccounts();
    const account = accounts[phone];
    if (!account || account.role !== "fleet_manager") return;
    account.fleetManagerStatus = status;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    // Si c'est le compte actuellement connecté (cas rare en pratique, mais
    // possible en test), on reflète le changement immédiatement.
    if (user?.phone === phone) persistSession(account);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, listFleetManagers, setFleetManagerStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}

export function roleHome(role: UserRole): string {
  if (role === "shipper") return "/";
  if (role === "admin") return "/admin/gestionnaires";
  return "/flotte";
}
