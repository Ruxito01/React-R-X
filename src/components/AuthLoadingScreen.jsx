import React from 'react';
import './AuthLoadingScreen.css';
import ruxLogo from '../assets/rux-logo.png';

/**
 * Pantalla de carga deportiva para autenticacion Google
 * Con animaciones dinamicas y colores de la pagina
 */
const AuthLoadingScreen = () => {
  return (
    <div className="auth-loading-screen">
      {/* Ondas de energia expansivas */}
      <div className="auth-loading-waves">
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
      </div>

      {/* Particulas flotantes */}
      <div className="auth-loading-particles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      {/* Tarjeta central */}
      <div className="auth-loading-card">
        {/* Logo flotante con brillo */}
        <img 
          src={ruxLogo} 
          alt="RUX Logo" 
          className="auth-loading-logo" 
        />

        {/* Spinner de triple anillo */}
        <div className="auth-loading-spinner-container">
          <div className="spinner-ring-outer" />
          <div className="spinner-ring-middle" />
          <div className="spinner-ring-inner" />
          <div className="spinner-core" />
        </div>

        {/* Texto de carga con efecto glow */}
        <p className="auth-loading-text">
          Iniciando<span className="auth-loading-dots"></span>
        </p>

        {/* Linea decorativa animada */}
        <div className="auth-loading-decoration" />
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
