import { Navigate } from "react-router";
import { useAuth, isFleetManagerOnboardingComplete } from "../state/AuthContext";
import FleetPendingApproval from "../pages/fleet/FleetPendingApproval";
import FleetOnboarding from "../pages/fleet/FleetOnboarding";

/**
 * Comme RequireRole, mais spécifique au gestionnaire de flotte : son
 * compte doit en plus être "active" (validé par SEEDO) — sinon on
 * affiche le bon écran intermédiaire plutôt que de rediriger :
 * - dossier incomplet (document/contrat manquant) → formulaire d'onboarding
 * - dossier complet mais encore "pending" → écran d'attente
 */
export function RequireActiveFleetManager({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== "fleet_manager") return <Navigate to="/" replace />;
  if (user.fleetManagerStatus !== "active") {
    if (!isFleetManagerOnboardingComplete(user)) return <FleetOnboarding />;
    return <FleetPendingApproval />;
  }

  return <>{children}</>;
}
