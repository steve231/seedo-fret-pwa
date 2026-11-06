import { Navigate } from "react-router";
import { useAuth } from "../state/AuthContext";
import FleetPendingApproval from "../pages/fleet/FleetPendingApproval";

/**
 * Comme RequireRole, mais spécifique au gestionnaire de flotte : son
 * compte doit en plus être "active" (validé par SEEDO) — sinon on
 * affiche l'écran d'attente plutôt que de rediriger, pour qu'il
 * comprenne pourquoi il n'a pas accès au tableau de bord.
 */
export function RequireActiveFleetManager({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== "fleet_manager") return <Navigate to="/" replace />;
  if (user.fleetManagerStatus !== "active") return <FleetPendingApproval />;

  return <>{children}</>;
}
