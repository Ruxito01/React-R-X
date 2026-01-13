import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css'; // Reutilizamos estilos, especialmente el botón y navbar

// Componentes
import Footer from '../components/Footer';

// Imagenes
import ruxLogo from '../assets/rux-logo.png';

const InvitePage = () => {
  // Estado para modal (reutilizado lógica)
  const [mostrarModal, setMostrarModal] = useState(false);
  
  return (
    <motion.div 
      className="landing-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ 
        background: 'linear-gradient(135deg, #0f0f19 0%, #1a1a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}
    >
      
      {/* --- NAVBAR SIMPLE (Siempre visible) --- */}
      <nav className="simple-navbar" style={{ top: '25px', background: 'rgba(15, 15, 25, 0.9)' }}>
        <Link to="/">Inicio</Link>
        <Link to="/que-es-rux">¿Qué es RÜX?</Link>
      </nav>

      {/* --- CONTENIDO CENTRAL --- */}
      <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '120px 20px 60px',
          zIndex: 2
      }}>
        
        <img 
            src={ruxLogo} 
            alt="RUX Logo" 
            className="intro-logo" 
            style={{ width: '180px', marginBottom: '30px' }}
        />

        <h1 className="intro-title" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
          ¡Te han invitado a una ruta!
        </h1>
        
        <p style={{ 
            color: 'rgba(255,255,255,0.8)', 
            fontSize: '1.2rem', 
            maxWidth: '600px',
            lineHeight: '1.6',
            marginBottom: '50px'
        }}>
          Para unirte al viaje y ver la ubicación de tus compañeros en tiempo real, necesitas tener instalada la aplicación <strong>RÜX</strong>.
        </p>

        {/* Botón de Play Store (Reutilizado de LandingPage.css) */}
        <div style={{ position: 'relative', height: '80px', width: '220px' }}>
            <button 
                onClick={() => setMostrarModal(true)}
                className="play-store-button"
                style={{ position: 'relative', bottom: 'auto' }}
            >
                <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z"/>
                </svg>
                <div className="button-text-content">
                    <span className="small-text">Descargar en</span>
                    <span className="main-text">Play Store</span>
                </div>
                <div className="button-shine"></div>
                <div className="button-particles">
                    <span></span><span></span><span></span><span></span><span></span>
                </div>
            </button>
        </div>

      </div>

      {/* Modal de Proximamente */}
      {mostrarModal && (
        <div className="proximamente-overlay" onClick={() => setMostrarModal(false)}>
          <div className="proximamente-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-glow"></div>
            <svg className="modal-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
            </svg>
            <h3>Próximamente</h3>
            <p>La aplicación estará disponible muy pronto en la Play Store.</p>
            <button className="modal-close-btn" onClick={() => setMostrarModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      <Footer />
    
    </motion.div>
  );
};

export default InvitePage;
