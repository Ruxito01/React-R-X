import React, { useState, useEffect, useRef } from 'react';
import '@google/model-viewer';
import './AdminAvatares.css';
import catalogoAvatarService from '../services/catalogoAvatarService';
import { subirArchivoAvatar, eliminarArchivoAvatar } from '../services/supabaseStorageService';
import { API_CONFIG, buildURL } from '../config/api';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const AvatarCardItem = ({ avatar, usos, abrirModal, eliminarAvatar }) => {
    const [animations, setAnimations] = useState([]);
    const [currentAnim, setCurrentAnim] = useState(null);
    const [showAnims, setShowAnims] = useState(false);
    const modelRef = useRef(null);

    useEffect(() => {
        const modelViewer = modelRef.current;
        if (modelViewer) {
            const loadHandler = () => {
                setAnimations(modelViewer.availableAnimations || []);
            };
            modelViewer.addEventListener('load', loadHandler);
            // Verificar inmediatamente si ya está cargado
            if (modelViewer.loaded) loadHandler();
            return () => modelViewer.removeEventListener('load', loadHandler);
        }
    }, [avatar.urlModelo3d]);

    return (
        <div className={`avatar-card ${avatar.esPremium ? 'premium' : ''}`}>
            <div className="avatar-preview-container">
                {avatar.esPremium ? 
                    <div className="badge-premium">PREMIUM</div> : 
                    <div className="badge-gratis">GRATIS</div>
                }
                
                {avatar.urlModelo3d ? (
                    <model-viewer
                        ref={modelRef}
                        src={avatar.urlModelo3d}
                        alt={avatar.nombre}
                        auto-rotate={!currentAnim} 
                        camera-controls
                        shadow-intensity="1"
                        background-color="transparent"
                        disable-zoom
                        animation-name={currentAnim}
                        autoplay={!!currentAnim}
                    ></model-viewer>
                ) : (
                    <div style={{color:'var(--text-muted)'}}>Sin modelo 3D</div>
                )}

                {/* Botón para alternar animaciones (Solo si existen animaciones) */}
                {animations.length > 0 && (
                    <button 
                        className={`btn-anim-toggle ${showAnims ? 'active' : ''}`}
                        onClick={() => setShowAnims(!showAnims)}
                        title={showAnims ? "Ver Info" : "Ver Animaciones"}
                    >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                            <line x1="7" y1="2" x2="7" y2="22"></line>
                            <line x1="17" y1="2" x2="17" y2="22"></line>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <line x1="2" y1="7" x2="7" y2="7"></line>
                            <line x1="2" y1="17" x2="7" y2="17"></line>
                            <line x1="17" y1="17" x2="22" y2="17"></line>
                            <line x1="17" y1="7" x2="22" y2="7"></line>
                         </svg>
                         <span style={{fontWeight:600}}>{animations.length}</span>
                    </button>
                )}
            </div>

            {/* Área de contenido: Cambia entre Info y Animaciones para mantener la altura fija */}
            <div className="avatar-content-area">
                {showAnims ? (
                    <div className="avatar-animations-panel">
                        <div className="anim-header">
                            <h4>Animaciones</h4>
                            <button className="btn-close-anim" onClick={() => setShowAnims(false)}>×</button>
                        </div>
                        <div className="anim-list">
                            {animations.map(anim => (
                                <button 
                                    key={anim} 
                                    className={`anim-chip ${currentAnim === anim ? 'active' : ''}`}
                                    onClick={() => setCurrentAnim(anim === currentAnim ? null : anim)}
                                >
                                    {anim}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="avatar-info">
                        <h3>{avatar.nombre}</h3>
                        <p className="avatar-desc">{avatar.descripcion || 'Sin descripción'}</p>
                        
                        <div className="avatar-stats">
                            <div className="stat-users" title="Usuarios usando este avatar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <span>{usos} usuarios</span>
                            </div>
                            
                            <div className="card-actions">
                                <button 
                                    className="btn-icon-admin edit" 
                                    onClick={() => abrirModal(avatar)}
                                    disabled={usos > 0} 
                                    title={usos > 0 ? "No editable (en uso)" : "Editar"}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button 
                                    className="btn-icon-admin delete" 
                                    onClick={() => eliminarAvatar(avatar)}
                                    disabled={usos > 0}
                                    title={usos > 0 ? "No se puede eliminar (en uso)" : "Eliminar"}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminAvatares = () => {
    const [avatares, setAvatares] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    
    // Estado del Modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [avatarEditando, setAvatarEditando] = useState(null); // null = creando
    const [guardando, setGuardando] = useState(false);

    // Estado del Formulario
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [esPremium, setEsPremium] = useState(false);
    const [archivo3D, setArchivo3D] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // Para mostrar preview si ya existe
    
    // Animaciones extraídas del nuevo archivo
    const [extractedAnimations, setExtractedAnimations] = useState([]);
    const hiddenViewerRef = useRef(null);

    useEffect(() => {
        const viewer = hiddenViewerRef.current;
        if (viewer && archivo3D) {
            const onLoad = () => {
                console.log("Animaciones extraídas:", viewer.availableAnimations);
                setExtractedAnimations(viewer.availableAnimations || []);
            };
            viewer.addEventListener('load', onLoad);
            return () => viewer.removeEventListener('load', onLoad);
        }
    }, [archivo3D]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const listaAvatares = await catalogoAvatarService.obtenerTodos();
            
            const resUsuarios = await fetch(buildURL(API_CONFIG.endpoints.usuarios));
            const listaUsuarios = resUsuarios.ok ? await resUsuarios.json() : [];

            setAvatares(listaAvatares);
            setUsuarios(listaUsuarios);
            console.log("Avatares cargados:", listaAvatares);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setCargando(false);
        }
    };

    const contarUsos = (avatarId) => {
        if (!usuarios || usuarios.length === 0) return 0;
        return usuarios.filter(u => u.avatarActivo && u.avatarActivo.id === avatarId).length;
    };

    const abrirModal = (avatar = null) => {
        if (avatar) {
            setAvatarEditando(avatar);
            setNombre(avatar.nombre);
            setDescripcion(avatar.descripcion || '');
            setEsPremium(avatar.esPremium);
            setPreviewUrl(avatar.urlModelo3d);
            setArchivo3D(null);
            setExtractedAnimations(avatar.animaciones || []); // Mantener existentes si no se cambia archivo
        } else {
            setAvatarEditando(null);
            setNombre('');
            setDescripcion('');
            setEsPremium(false);
            setPreviewUrl(null);
            setArchivo3D(null);
            setExtractedAnimations([]);
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setAvatarEditando(null);
        setGuardando(false);
        setExtractedAnimations([]);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar extensión
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext !== 'glb' && ext !== 'gltf') {
                alert('Solo se permiten archivos .glb o .gltf');
                e.target.value = ''; // Limpiar input
                return;
            }

            // Validar tamaño (Max 50MB)
            const MAX_SIZE_MB = 50;
            const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024; // 52,428,800 bytes

            if (file.size > MAX_SIZE_BYTES) {
                alert(`El archivo excede el tamaño máximo permitido de ${MAX_SIZE_MB}MB.`);
                e.target.value = ''; // Limpiar input
                return;
            }

            setArchivo3D(file);
            setExtractedAnimations([]); // Resetear mientras carga
        }
    };

    const guardarAvatar = async (e) => {
        e.preventDefault();
        
        if (!nombre.trim()) return alert('El nombre es obligatorio');
        if (!avatarEditando && !archivo3D) return alert('Debes subir un archivo 3D');

        // Si se subió un archivo, esperar a que el viewer extraiga animaciones si aun no lo ha hecho
        // (Aunque el usuario probablemente espere unos segundos, podriamos forzar chequeo)
        // Por simplicidad confiamos en que el viewer carga rápido localmente.
        let animacionesFinales = extractedAnimations;
        if (!archivo3D && avatarEditando) {
             // Si no cambiamos archivo, mantenemos las de la base (que ya pusimos en state al abrir modal)
             // o si el usuario edito y no cambio archivo.
             animacionesFinales = avatarEditando.animaciones || [];
        }

        setGuardando(true);
        try {
            let urlModelo = avatarEditando?.urlModelo3d;

            if (archivo3D) {
                if (avatarEditando && avatarEditando.urlModelo3d) {
                    await eliminarArchivoAvatar(avatarEditando.urlModelo3d);
                }
                
                urlModelo = await subirArchivoAvatar(archivo3D, nombre, 'models');
                if (!urlModelo) throw new Error('Error al subir archivo');
            }

            const avatarData = {
                nombre,
                descripcion,
                esPremium,
                urlModelo3d: urlModelo,
                urlPreview: null,
                animaciones: animacionesFinales
            };

            if (avatarEditando) {
                const datosActualizar = { ...avatarData, id: avatarEditando.id };
                await catalogoAvatarService.actualizar(avatarEditando.id, datosActualizar);
            } else {
                await catalogoAvatarService.crear(avatarData);
            }

            cerrarModal();
            cargarDatos();

        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar el avatar');
        } finally {
            setGuardando(false);
        }
    };

    const eliminarAvatar = async (avatar) => {
        const usos = contarUsos(avatar.id);
        if (usos > 0) {
            return alert(`No se puede eliminar este avatar porque ${usos} usuarios lo están usando.`);
        }

        if (window.confirm(`¿Estás seguro de eliminar el avatar "${avatar.nombre}"?`)) {
            try {
                if (avatar.urlModelo3d) {
                    await eliminarArchivoAvatar(avatar.urlModelo3d);
                }
                await catalogoAvatarService.eliminar(avatar.id);
                cargarDatos();
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar avatar');
            }
        }
    };

    const avataresFiltrados = avatares.filter(a => 
        a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="admin-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
            <div className="admin-main-card admin-avatares-card">
                
                <div className="admin-actions-bar">
                    <div className="buscador-container">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'#666'}}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Buscar avatar..." 
                            className="input-busqueda" 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-refrescar" onClick={cargarDatos} disabled={cargando}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 4v6h-6"></path>
                                <path d="M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Refrescar
                        </button>
                        <button className="btn-crear-admin" onClick={() => abrirModal()}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Nuevo Avatar
                        </button>
                    </div>
                </div>

                <div className="avatares-scroll-container">
                    {cargando ? (
                         <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>Cargando avatares...</div>
                    ) : (
                        <div className="avatars-grid">
                            {avataresFiltrados.map(avatar => {
                                const usos = contarUsos(avatar.id);
                                return (
                                    <AvatarCardItem 
                                        key={avatar.id} 
                                        avatar={avatar} 
                                        usos={usos} 
                                        abrirModal={abrirModal} 
                                        eliminarAvatar={eliminarAvatar}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {modalAbierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div 
                        className={`modal-content ${esPremium ? 'premium-modal' : ''}`} 
                        onClick={e => e.stopPropagation()} 
                        style={{ maxWidth: '500px', background: '#1e1e1e', border: '1px solid #333' }}
                    >
                        <div className="modal-header">
                            <h2>{avatarEditando ? 'Editar Avatar' : 'Nuevo Avatar'}</h2>
                            <button className="modal-close" onClick={cerrarModal}>×</button>
                        </div>
                        <form onSubmit={guardarAvatar} className="modal-body modal-form-grid">
                            
                            <div className="form-group">
                                <label>Nombre</label>
                                <input 
                                    className="form-input" 
                                    value={nombre} 
                                    onChange={e => setNombre(e.target.value)}
                                    placeholder="Ej: Robot, Piloto"
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea 
                                    className="form-textarea" 
                                    value={descripcion} 
                                    onChange={e => setDescripcion(e.target.value)}
                                    placeholder="Breve descripción..."
                                    rows="3"
                                />
                            </div>

                            <div className="switch-container">
                                <span className="switch-label-text" style={{color: esPremium ? 'var(--text-secondary)' : '#4CAF50'}}>Gratis</span>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={esPremium} 
                                        onChange={e => setEsPremium(e.target.checked)} 
                                    />
                                    <span className="slider round"></span>
                                </label>
                                <span className="switch-label-text" style={{color: esPremium ? '#FFD700' : 'var(--text-secondary)'}}>Premium</span>
                            </div>

                            <div className="form-group">
                                <label style={{marginBottom:'8px', display:'block'}}>Modelo 3D (.glb)</label>
                                {archivo3D ? (
                                    <div className="file-drop-area file-selected" onClick={() => setArchivo3D(null)}>
                                        <div className="file-drop-content">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                            </svg>
                                            <p style={{color:'#4CAF50', fontWeight:'bold', margin:0}}>{archivo3D.name}</p>
                                            <span style={{fontSize:'0.8rem', opacity:0.8}}>Click para reemplazar</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="file-drop-area">
                                        <input 
                                            type="file" 
                                            accept=".glb,.gltf" 
                                            onChange={handleFileChange}
                                            style={{display: 'none'}}
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" style={{cursor:'pointer', width:'100%', height:'100%', display:'block'}}>
                                            <div className="file-drop-content">
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.5}}>
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="17 8 12 3 7 8"></polyline>
                                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                                </svg>
                                                <span>{previewUrl ? 'Cambiar modelo actual' : 'Click para subir archivo .glb'}</span>
                                            </div>
                                        </label>
                                    </div>
                                )}
                                {previewUrl && !archivo3D && (
                                    <div style={{marginTop:'10px', fontSize:'0.85rem', color:'var(--text-muted)', textAlign:'center', fontStyle:'italic'}}>
                                        * Se mantiene el modelo 3D actual
                                    </div>
                                )}
                                
                                <div style={{marginTop: '12px', textAlign: 'center'}}>
                                    <a 
                                        href="https://sketchfab.com/search?features=downloadable+animated&q=pilot+character&type=models" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn-link-sketchfab"
                                        style={{display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary-orange)', textDecoration: 'none'}}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <line x1="10" y1="14" x2="21" y2="3"></line>
                                        </svg>
                                        ¿No tienes modelo? Busca uno animado aquí
                                    </a>
                                </div>
                            </div>
                            
                            {/* Hidden model-viewer for animation extraction */}
                            <model-viewer
                                ref={hiddenViewerRef}
                                id="hidden-extraction-viewer"
                                src={archivo3D ? URL.createObjectURL(archivo3D) : null}
                                style={{ display: 'none' }} 
                            ></model-viewer>

                            <div className="modal-footer" style={{marginTop:'20px'}}>
                                <button type="button" className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                                <button type="submit" className="btn-guardar" disabled={guardando}>
                                    {guardando ? 'Guardando...' : 'Guardar Avatar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAvatares;
