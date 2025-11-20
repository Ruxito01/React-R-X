// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

// Este será el "contenedor" para las páginas de Diego
const MainLayout = () => {
  return (
    <div>
      {/* Aquí pondremos el Navbar principal de la app (cuando esté logueado) */}
      <nav style={{ 
        background: '#1a1a1a', 
        color: 'white', 
        padding: '1rem', 
        textAlign: 'center',
        fontSize: '1.2rem'
      }}>
        Barra de Navegación de RUX (Logueado)
      </nav>

      {/* El <Outlet> renderizará Home o Dashboard */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

// La línea que soluciona el error:
export default MainLayout;