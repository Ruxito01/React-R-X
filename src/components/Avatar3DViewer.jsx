import React, { useEffect, useState } from 'react';
import '@google/model-viewer';

const Avatar3DViewer = ({ url, animationName }) => {
    const [loading, setLoading] = useState(true);

    if (!url) return <div className="avatar-viewer-placeholder">No hay modelo 3D disponible</div>;

    return (
        <div className="avatar-viewer-container" style={{ width: '100%', height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #f0f0f0 0%, #e0e0e0 100%)', borderRadius: '12px', overflow: 'hidden' }}>
            <model-viewer
                src={url}
                alt="Avatar 3D"
                animation-name={animationName || "Idle"}
                autoplay
                camera-controls
                auto-rotate
                shadow-intensity="1"
                style={{ width: '100%', height: '400px' }}
                onLoad={() => setLoading(false)}
                onError={(e) => {
                    console.error("Error loading 3D model:", e);
                    setLoading(false);
                }}
            >
                {loading && (
                     <div slot="poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                        Cargando modelo 3D...
                     </div>
                )}
            </model-viewer>
            <div style={{ padding: '10px', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                <p>Usa el mouse para rotar y hacer zoom</p>
                {animationName && <span className="badge-general" style={{background: '#e3f2fd', color: '#1976d2'}}>Animación: {animationName}</span>}
            </div>
        </div>
    );
};

export default Avatar3DViewer;
