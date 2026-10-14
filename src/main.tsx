import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";

import { AuthProvider } from "./state/AuthContext";
import { ShipmentProvider } from "./state/ShipmentContext";
import { AppShell } from "./components/AppShell";
import { RequireRole } from "./components/RequireRole";
import { RedirectIfAuthed } from "./components/RedirectIfAuthed";
import { SHIPPER_TABS, CARRIER_TABS } from "./components/navTabs";

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

import CarrierHome from "./pages/carrier/CarrierHome";
import CarrierAvailability from "./pages/carrier/CarrierAvailability";
import CarrierMissionDetail from "./pages/carrier/CarrierMissionDetail";
import CarrierCourse from "./pages/carrier/CarrierCourse";
import CarrierDeliveryConfirm from "./pages/carrier/CarrierDeliveryConfirm";
import CarrierHistory from "./pages/carrier/CarrierHistory";
import CarrierProfile from "./pages/carrier/CarrierProfile";

import Notifications from "./pages/shared/Notifications";
import Support from "./pages/shared/Support";
import Settings from "./pages/shared/Settings";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ShipmentProvider>
        <BrowserRouter>
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

            {/* Espace Transporteur */}
            <Route element={<RequireRole role="carrier"><AppShell tabs={CARRIER_TABS} roleLabel="Espace Transporteur" notificationsPath="/transporteur/notifications" /></RequireRole>}>
              <Route path="/transporteur" element={<CarrierHome />} />
              <Route path="/transporteur/disponibilite" element={<CarrierAvailability />} />
              <Route path="/transporteur/mission/:id" element={<CarrierMissionDetail />} />
              <Route path="/transporteur/course/:id" element={<CarrierCourse />} />
              <Route path="/transporteur/course/:id/confirmation" element={<CarrierDeliveryConfirm />} />
              <Route path="/transporteur/historique" element={<CarrierHistory />} />
              <Route path="/transporteur/profil" element={<CarrierProfile />} />
              <Route path="/transporteur/notifications" element={<Notifications />} />
              <Route path="/transporteur/support" element={<Support />} />
              <Route path="/transporteur/parametres" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ShipmentProvider>
    </AuthProvider>
  </StrictMode>
);
