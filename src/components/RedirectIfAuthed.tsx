import { Navigate } from "react-router";
import { useAuth, roleHome } from "../state/AuthContext";

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to={roleHome(user.role)} replace />;

  return <>{children}</>;
}
