import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './PlayStoreButton.css';

const PlayStoreButton = () => {
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setMostrarModal(true)}
        className="play-store-button"
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

      {/* Modal de Proximamente usando Portal para escapar del stacking context de framer-motion */}
      {mostrarModal && createPortal(
        <div className="proximamente-overlay" onClick={() => setMostrarModal(false)}>
          <div className="proximamente-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-glow"></div>
            <svg className="modal-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
            </svg>
            <h3>Próximamente</h3>
            <p>Estamos trabajando para traerte la app muy pronto</p>
            <button className="modal-close-btn" onClick={() => setMostrarModal(false)}>
              Entendido
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PlayStoreButton;
