import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "shipper" | "carrier";

export interface AuthUser {
  name: string;
  phone: string;
  email: string;
  role: UserRole;
}

interface SignupInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: UserRole;
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
}

const SESSION_KEY = "seedo_fret_session";
const ACCOUNTS_KEY = "seedo_fret_mock_accounts";

/**
 * Authentification simulée en localStorage — en attendant le backend (Firebase Auth
 * + Postgres). Le rôle (shipper/carrier) est choisi à l'inscription et persiste par
 * compte, exactement comme le ferait un vrai profil serveur. Le mot de passe n'est
 * pas vérifié (champ collecté pour la continuité UX, pas de sécurité réelle ici).
 */
function readAccounts(): Record<string, AuthUser> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "{}");
  } catch {
    return {};
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

  const signup: AuthContextValue["signup"] = ({ name, phone, email, role }) => {
    if (!name || !phone || !email) return { ok: false, error: "Tous les champs sont requis." };
    const accounts = readAccounts();
    if (accounts[phone]) return { ok: false, error: "Un compte existe déjà avec ce numéro." };
    const newUser: AuthUser = { name, phone, email, role };
    accounts[phone] = newUser;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    persistSession(newUser);
    return { ok: true, user: newUser };
  };

  const logout = () => persistSession(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
  return role === "shipper" ? "/" : "/transporteur";
}
