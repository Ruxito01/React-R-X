// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; // Importar ThemeProvider
import ProtectedRoute from "./components/ProtectedRoute";
import { AnimatePresence } from "framer-motion";
import "./Theme.css"; // Importar variables CSS

// La página principal para usuarios NO logueados
import LandingPage from "./pages/LandingPage";
import QueEsRux from "./pages/QueEsRux";

// El layout y páginas para usuarios SÍ logueados
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DashboardGeneral from "./pages/DashboardGeneral";
import Vehiculos from "./pages/Vehiculos";
import Rutas from "./pages/Rutas";
import Comunidades from "./pages/Comunidades";

// Pantallas de Administracion
import AdminMarcas from "./pages/AdminMarcas";
import AdminModelos from "./pages/AdminModelos";
import AdminLogros from "./pages/AdminLogros";
import AdminTiposVehiculo from "./pages/AdminTiposVehiculo";
import AdminUsuarios from "./pages/AdminUsuarios";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Componente interno para manejar las rutas animadas con useLocation
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* RUTA PRINCIPAL: 
          Muestra la página larga de bienvenida (Intro + Login + Descarga)
        */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/que-es-rux" element={<QueEsRux />} />

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
          
          {/* Rutas de Administracion */}
          <Route path="/admin/marcas" element={<AdminMarcas />} />
          <Route path="/admin/modelos" element={<AdminModelos />} />
          <Route path="/admin/logros" element={<AdminLogros />} />
          <Route path="/admin/tipos-vehiculo" element={<AdminTiposVehiculo />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider> {/* Envolver con ThemeProvider */}
          <Router>
            <AnimatedRoutes />
          </Router>
          <Analytics />
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;