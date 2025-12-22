// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// La página principal para usuarios NO logueados
import LandingPage from "./pages/LandingPage";

// El layout y páginas para usuarios SÍ logueados
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DashboardGeneral from "./pages/DashboardGeneral";
import Vehiculos from "./pages/Vehiculos";
import Rutas from "./pages/Rutas";
import Comunidades from "./pages/Comunidades";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* RUTA PRINCIPAL: 
              Muestra la página larga de bienvenida (Intro + Login + Descarga)
            */}
            <Route path="/" element={<LandingPage />} />

            {/* RUTAS INTERNAS (Protegidas): 
              Usan MainLayout y requieren autenticación de ADMIN
            */}
            <Route element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route path="/general" element={<DashboardGeneral />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vehiculos" element={<Vehiculos />} />
              <Route path="/rutas" element={<Rutas />} />
              <Route path="/comunidades" element={<Comunidades />} />
            </Route>
          </Routes>
        </Router>
        <Analytics />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;