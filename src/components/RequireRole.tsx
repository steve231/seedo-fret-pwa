import { Navigate } from "react-router";
import { useAuth, roleHome, type UserRole } from "../state/AuthContext";

export function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== role) return <Navigate to={roleHome(user.role)} replace />;

  return <>{children}</>;
}
