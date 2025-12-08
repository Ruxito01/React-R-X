// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// La página principal para usuarios NO logueados
import LandingPage from "./pages/LandingPage"; 

// El layout y páginas para usuarios SÍ logueados
import MainLayout from "./layouts/MainLayout"; 
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Vehiculos from "./pages/Vehiculos";

function App() {
  return (
    <Router>
      <Routes>
        {/* RUTA PRINCIPAL: 
          Muestra la página larga de bienvenida (Intro + Login + Descarga)
        */}
        <Route path="/" element={<LandingPage />} /> 
        
        {/* RUTAS INTERNAS (Protegidas): 
          Usan MainLayout 
        */}
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehiculos" element={<Vehiculos />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;