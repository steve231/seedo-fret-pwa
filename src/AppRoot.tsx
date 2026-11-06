import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { AuthProvider } from "./state/AuthContext";
import { ShipmentProvider } from "./state/ShipmentContext";
import { AppShell } from "./components/AppShell";
import { RequireRole } from "./components/RequireRole";
import { RequireActiveFleetManager } from "./components/RequireActiveFleetManager";
import { RedirectIfAuthed } from "./components/RedirectIfAuthed";
import { SplashScreen } from "./components/SplashScreen";
import { SHIPPER_TABS, FLEET_TABS, ADMIN_TABS } from "./components/navTabs";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import ShipperHome from "./pages/ShipperHome";
import Step1Cargo from "./pages/shipment/Step1Cargo";
import Step2Route from "./pages/shipment/Step2Route";
import Offers from "./pages/shipment/Offers";
import Matching from "./pages/shipment/Matching";
import Tracking from "./pages/shipment/Tracking";
import MyShipments from "./pages/MyShipments";
import ShipmentDetail from "./pages/ShipmentDetail";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";

import FleetHome from "./pages/fleet/FleetHome";
import FleetCarriers from "./pages/fleet/FleetCarriers";
import FleetCarrierNew from "./pages/fleet/FleetCarrierNew";
import FleetCarrierDetail from "./pages/fleet/FleetCarrierDetail";
import FleetCourseDetail from "./pages/fleet/FleetCourseDetail";
import FleetDeliveryConfirm from "./pages/fleet/FleetDeliveryConfirm";
import FleetHistory from "./pages/fleet/FleetHistory";
import FleetAvailability from "./pages/fleet/FleetAvailability";
import FleetProfile from "./pages/fleet/FleetProfile";

import AdminFleetManagers from "./pages/admin/AdminFleetManagers";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminCarrierDocuments from "./pages/admin/AdminCarrierDocuments";

import Notifications from "./pages/shared/Notifications";
import Support from "./pages/shared/Support";
import Settings from "./pages/shared/Settings";

export default function AppRoot() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <ShipmentProvider>
        <BrowserRouter>
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
          <Routes>
            {/* Authentification */}
            <Route path="/connexion" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
            <Route path="/inscription" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />

            {/* Espace Expéditeur */}
            <Route element={<RequireRole role="shipper"><AppShell tabs={SHIPPER_TABS} roleLabel="Espace Expéditeur" notificationsPath="/notifications" /></RequireRole>}>
              <Route path="/" element={<ShipperHome />} />
              <Route path="/nouvelle-demande" element={<Step1Cargo />} />
              <Route path="/nouvelle-demande/trajet" element={<Step2Route />} />
              <Route path="/nouvelle-demande/offres" element={<Offers />} />
              <Route path="/nouvelle-demande/recherche" element={<Matching />} />
              <Route path="/course/:id" element={<Tracking />} />
              <Route path="/mes-courses" element={<MyShipments />} />
              <Route path="/mes-courses/:id" element={<ShipmentDetail />} />
              <Route path="/tarifs" element={<Pricing />} />
              <Route path="/compte" element={<Account />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/support" element={<Support />} />
              <Route path="/parametres" element={<Settings />} />
            </Route>

            {/* Espace Gestionnaire de flotte */}
            <Route element={<RequireActiveFleetManager><AppShell tabs={FLEET_TABS} roleLabel="Espace Gestionnaire de flotte" notificationsPath="/flotte/notifications" /></RequireActiveFleetManager>}>
              <Route path="/flotte" element={<FleetHome />} />
              <Route path="/flotte/courses/:id" element={<FleetCourseDetail />} />
              <Route path="/flotte/courses/:id/confirmation" element={<FleetDeliveryConfirm />} />
              <Route path="/flotte/transporteurs" element={<FleetCarriers />} />
              <Route path="/flotte/transporteurs/nouveau" element={<FleetCarrierNew />} />
              <Route path="/flotte/transporteurs/:id" element={<FleetCarrierDetail />} />
              <Route path="/flotte/historique" element={<FleetHistory />} />
              <Route path="/flotte/disponibilite" element={<FleetAvailability />} />
              <Route path="/flotte/profil" element={<FleetProfile />} />
              <Route path="/flotte/notifications" element={<Notifications />} />
              <Route path="/flotte/support" element={<Support />} />
              <Route path="/flotte/parametres" element={<Settings />} />
            </Route>

            {/* Espace Admin SEEDO */}
            <Route element={<RequireRole role="admin"><AppShell tabs={ADMIN_TABS} roleLabel="Espace Admin SEEDO" notificationsPath="/admin/notifications" /></RequireRole>}>
              <Route path="/admin" element={<Navigate to="/admin/gestionnaires" replace />} />
              <Route path="/admin/gestionnaires" element={<AdminFleetManagers />} />
              <Route path="/admin/vehicules" element={<AdminVehicles />} />
              <Route path="/admin/documents" element={<AdminCarrierDocuments />} />
              <Route path="/admin/notifications" element={<Notifications />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ShipmentProvider>
    </AuthProvider>
  );
}
