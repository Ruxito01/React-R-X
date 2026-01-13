import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const TableImage = ({ src, alt, className, style, width = '40px', height = '40px' }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Actualizar posición del mouse
  const handleMouseMove = (e) => {
    if (!showPreview) return;
    
    // Calcular posición para que no se salga de la pantalla
    const previewWidth = 250; 
    const previewHeight = 250;
    const padding = 15;
    
    let x = e.clientX + padding;
    let y = e.clientY + padding;
    
    // Ajustar si se sale por la derecha
    if (x + previewWidth > window.innerWidth) {
      x = e.clientX - previewWidth - padding;
    }
    
    // Ajustar si se sale por abajo
    if (y + previewHeight > window.innerHeight) {
      y = e.clientY - previewHeight - padding;
    }
    
    setPosition({ x, y });
  };

  const handleMouseEnter = (e) => {
    setShowPreview(true);
    // Establecer posición inicial
    setPosition({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const handleError = () => {
    setImgError(true);
  };

  if (imgError) {
    return (
      <div 
        className={className}
        style={{ 
          ...style, 
          width: width, 
          height: height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#888',
          fontWeight: 'bold',
          fontSize: '14px',
          border: '1px solid #ddd',
          borderRadius: style?.borderRadius || '4px'
        }}
        title={alt}
      >
        {alt ? alt.charAt(0).toUpperCase() : 'U'}
      </div>
    );
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ 
          ...style, 
          width: width, 
          height: height, 
          objectFit: 'cover', 
          cursor: 'zoom-in',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onError={handleError}
      />
      
      {showPreview && createPortal(
        <div
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            zIndex: 9999,
            pointerEvents: 'none',
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '2px solid #FF6610',
            maxWidth: '300px',
            maxHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: '100%',
              maxHeight: '250px',
              objectFit: 'contain',
              borderRadius: '4px',
              display: 'block'
            }}
          />
          <span style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#666',
            fontWeight: '600'
          }}>
            {alt || 'Vista previa'}
          </span>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
};

export default TableImage;
