import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../assets/rux-logo.png';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  const handleLogout = (e) => {
    // Obtener la posición del botón para centrar la expansión
    const rect = e.currentTarget.getBoundingClientRect();
    setButtonPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    
    // Iniciar animación
    setIsLoggingOut(true);
    
    // Navegar rápido para que la página tenga tiempo de hacer fade-in
    setTimeout(() => {
      navigate('/');
    }, 250);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="header-logo">
            <img src={logo} alt="RUX Logo" />
          </div>
          
          <nav className="header-nav">
            <NavLink 
              to="/general" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              General
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              Usuarios
            </NavLink>
            <NavLink 
              to="/vehiculos" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              Vehículos
            </NavLink>
            <NavLink 
              to="/rutas" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              Rutas
            </NavLink>
            <NavLink 
              to="/comunidades" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              Comunidades
            </NavLink>
          </nav>

          <div className="header-actions">
            <button 
              className="logout-button" 
              onClick={handleLogout}
              title="Cerrar Sesión"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay de transición */}
      {isLoggingOut && (
        <div 
          className="logout-transition-overlay"
          style={{
            '--button-x': `${buttonPosition.x}px`,
            '--button-y': `${buttonPosition.y}px`
          }}
        />
      )}
    </>
  );
};

export default Header;
