import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import './AdminUsuarios.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';
import TableImage from '../components/TableImage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const libraries = ['places']; // Define libraries outside to avoid re-renders

const AdminUsuarios = () => {
    // Cargar API de Google Maps globalmente para evitar parpadeos
    const { isLoaded: googleLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    // Estados principales
    const [usuarios, setUsuarios] = useState([]);
    const [usuariosConDatos, setUsuariosConDatos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estados de filtrado y ordenamiento
    const [busqueda, setBusqueda] = useState('');
    const [ordenamiento, setOrdenamiento] = useState({ columna: 'id', direccion: 'asc' });

    // Estados del Modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [activeTab, setActiveTab] = useState('info'); 
    const [detallesExtra, setDetallesExtra] = useState({ rutas: [], viajes: [] });
    const [cargandoDetalles, setCargandoDetalles] = useState(false);

    // Cache simple
    const [detallesCache, setDetallesCache] = useState({});

    // Estados para vistas detalladas en modal y Mapa
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail_ruta', 'detail_viaje'
    const [selectedItem, setSelectedItem] = useState(null);
    const [puntosRutaDetalle, setPuntosRutaDetalle] = useState([]);
    const [cargandoPuntos, setCargandoPuntos] = useState(false);
    
    // Map States inside Modal
    const [mapCenter, setMapCenter] = useState({ lat: -0.180653, lng: -78.467834 });
    const [directionsResponse, setDirectionsResponse] = useState(null);

    // Estados para galeria de fotos
    const [fotosUsuario, setFotosUsuario] = useState([]);
    const [cargandoFotos, setCargandoFotos] = useState(false);
    const [fotoLightbox, setFotoLightbox] = useState(null);

    // ... (Mantener lógica de carga de usuarios intacta, omitida por brevedad en reemplazo pero NO eliminar) ...
    // NOTA: Para este replace solo reemplazamos la parte superior y lógica nueva del mapa, conservando el medio.
    // Usaremos MultiReplace si no calza, pero replace_file_content permite reemplazar bloques. 
    // Vamos a reemplazar desde Imports hasta antes de cargarDetallesUsuario para actualizar hook e imports.
    // LUEGO reemplazar MapContainerView con la nueva logica de renderizado.
    
    // Mejor estrategia: Reemplazar imports y hook inicial
    
    // Cargar usuarios al inicio y configurar polling para el log
    useEffect(() => {
        cargarDatosIniciales();
        window.scrollTo(0, 0);

        // Polling para log en tiempo real (cada 5 seg)
        const intervalId = setInterval(() => {
            actualizarUsuariosEnSegundoPlano();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    // Función ligera para actualizar log sin loading screen
    const actualizarUsuariosEnSegundoPlano = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/usuario`);
            if (res.ok) {
                const data = await res.json();
                // Solo actualizamos si hay cambios o para refrescar el log
                // Mapeamos igual que en carga inicial pero simplificado para el log
                const usuariosEnriquecidos = data.map(u => ({
                    ...u,
                    // No recalculamos viajes aqui para no saturar, usamos lo basico para el log
                    usuarios: u // Preservamos data raw si se necesita
                }));
                
                // Actualizamos estado silenciosamente
                setUsuarios(prev => {
                   // Mezclar con datos previos para no perder info de viajes si es compleja
                   // Pero para el log, necesitamos la lista actualizada
                   // Estrategia: Actualizar la lista completa pero preservando campos calculados si coinciden ID
                   // O simplemente actualizar todo. Como el log usa `usuarios`, necesitamos que tenga fechaCreacion
                   return usuariosEnriquecidos.map(nuevo => {
                       const existente = prev.find(p => p.id === nuevo.id);
                       return existente ? { ...existente, ...nuevo } : nuevo; // Update or Add
                   });
                });
            }
        } catch (e) {
            console.warn('Error polling usuarios', e);
        }
    };

    const cargarDatosIniciales = async () => {
        try {
            setCargando(true);
            const [usuariosRes, viajesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/usuario`),
                fetch(`${API_BASE_URL}/viaje`)
            ]);

            if (!usuariosRes.ok) throw new Error('Error al cargar usuarios');
            
            const usuariosData = await usuariosRes.json();
            const viajesData = viajesRes.ok ? await viajesRes.json() : [];

            const viajesPorUsuario = {};
            viajesData.forEach(viaje => {
                if (viaje.creadorId) {
                    viajesPorUsuario[viaje.creadorId] = (viajesPorUsuario[viaje.creadorId] || 0) + 1;
                }
                if (viaje.participantes && Array.isArray(viaje.participantes)) {
                    viaje.participantes.forEach(p => {
                        const uid = p.usuario?.id || p.id?.usuarioId || p.usuarioId; 
                        if (uid && uid !== viaje.creadorId) { 
                             viajesPorUsuario[uid] = (viajesPorUsuario[uid] || 0) + 1;
                        }
                    });
                }
            });

            const usuariosEnriquecidos = usuariosData.map(u => ({
                ...u,
                viajesCount: viajesPorUsuario[u.id] || 0,
                nombre: u.nombre || 'Sin Nombre',
                apellido: u.apellido || '',
                alias: u.alias || 'Usuario',
                email: u.email || 'Sin Email'
            }));

            setUsuarios(usuariosEnriquecidos);
            setUsuariosConDatos(usuariosEnriquecidos);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los datos.');
        } finally {
            setCargando(false);
        }
    };

    const cargarDetallesUsuario = async (usuario) => {
        if (detallesCache[usuario.id]) {
            setDetallesExtra(detallesCache[usuario.id]);
            return;
        }

        setCargandoDetalles(true);
        try {
            const [rutasRes, viajesRes, vehiculosRes, tiposRes] = await Promise.all([
                fetch(`${API_BASE_URL}/ruta`),
                fetch(`${API_BASE_URL}/viaje`),
                fetch(`${API_BASE_URL}/vehiculo`),
                fetch(`${API_BASE_URL}/tipovehiculo`)
            ]);

            const rutasData = rutasRes.ok ? await rutasRes.json() : [];
            const viajesData = viajesRes.ok ? await viajesRes.json() : [];
            const vehiculosData = vehiculosRes.ok ? await vehiculosRes.json() : [];
            const tiposData = tiposRes.ok ? await tiposRes.json() : [];

            const rutasUsuario = rutasData.filter(r => r.creadorId === usuario.id || r.creador?.id === usuario.id);
            const viajesUsuario = viajesData.filter(v => 
                 v.creadorId === usuario.id || 
                 (v.participantes && v.participantes.some(p => {
                    const uid = p.usuario?.id || p.id?.usuarioId || p.usuarioId;
                    return uid === usuario.id;
                 }))
            );

            const vehiculosUsuario = vehiculosData.filter(v => 
                v.usuario_id === usuario.id || (v.usuario && v.usuario.id === usuario.id)
            ).map(v => {
                // Normalizar keys para manejar inconsistencias camelCase/snake_case
                const foto = v.url_foto || v.urlFoto || v.urlImagen || v.foto;
                const anio = v.anio_fabricacion || v.anioFabricacion || v.year || v.anio;
                const traccion = v.traccion || v.traccionVehiculo;
                const tipoId = v.tipo_vehiculo_id || v.tipoVehiculoId;
                // Buscar nombre del tipo
                const tipoObj = tiposData.find(t => t.id === tipoId);
                const tipoNombre = tipoObj ? tipoObj.nombre : (v.tipoVehiculo?.nombre || 'Desconocido');

                return {
                    ...v,
                    nombre: v.alias || `${v.marca || ''} ${v.modelo || ''}`.trim() || 'Sin nombre',
                    marca: v.marca || 'Sin marca',
                    modelo: v.modelo || 'Sin modelo',
                    url_foto: foto,
                    anio_fabricacion: anio, // Estandarizar
                    traccion: traccion,
                    tipo_nombre: tipoNombre.trim()
                };
            });

            // Cargar comunidades del usuario usando el endpoint directo (igual que la app móvil)
            let comunidadesUsuario = [];
            try {
                const comunidadesRes = await fetch(`${API_BASE_URL}/usuario/${usuario.id}/comunidades`);
                if (comunidadesRes.ok) {
                    comunidadesUsuario = await comunidadesRes.json();
                    
                    // Asegurar que tenemos la info de si es creador
                    comunidadesUsuario = comunidadesUsuario.map(c => ({
                        ...c,
                        esCreador: c.creador?.id === usuario.id || c.creadorId === usuario.id
                    }));
                }
            } catch (e) {
                console.warn("Error cargando comunidades del usuario", e);
            }

            const detalles = { rutas: rutasUsuario, viajes: viajesUsuario, vehiculos: vehiculosUsuario, comunidades: comunidadesUsuario };
            setDetallesExtra(detalles);
            setDetallesCache(prev => ({ ...prev, [usuario.id]: detalles }));

        } catch (err) {
            console.warn("Error cargando detalles extra", err);
            setDetallesExtra({ rutas: [], viajes: [], vehiculos: [] });
        } finally {
            setCargandoDetalles(false);
        }
    };

    const calcularRutaMapa = useCallback((ruta, puntos) => {
        if (!window.google || !ruta?.latitudInicio || !ruta?.latitudFin) {
             setDirectionsResponse(null);
             return;
        }

        const directionsService = new window.google.maps.DirectionsService();
        const origin = { lat: parseFloat(ruta.latitudInicio), lng: parseFloat(ruta.longitudInicio) };
        const destination = { lat: parseFloat(ruta.latitudFin), lng: parseFloat(ruta.longitudFin) };

        const waypoints = puntos
            .filter(p => p.latitud && p.longitud)
            .map(p => ({
                 location: { lat: parseFloat(p.latitud), lng: parseFloat(p.longitud) },
                 stopover: true
            }));

        directionsService.route({
            origin,
            destination,
            waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false
        }, (result, status) => {
            if (status === 'OK') {
                setDirectionsResponse(result);
            } else {
                console.warn('Map direction error:', status);
                setDirectionsResponse(null);
            }
        });
    }, []);

    // ... (rest of helper functions) ...

    const cargarPuntosRuta = async (ruta) => {
        if (!ruta) return;
        setCargandoPuntos(true);
        setDirectionsResponse(null);
        
        if (ruta.latitudInicio && ruta.longitudInicio) {
            setMapCenter({
                lat: parseFloat(ruta.latitudInicio),
                lng: parseFloat(ruta.longitudInicio)
            });
        }

        try {
            const res = await fetch(`${API_BASE_URL}/puntoruta/ruta/${ruta.id}`);
            if (res.ok) {
                const puntos = await res.json();
                const puntosOrdenados = puntos.sort((a, b) => a.ordenSecuencia - b.ordenSecuencia);
                setPuntosRutaDetalle(puntosOrdenados);
                
                if (googleLoaded) {
                    calcularRutaMapa(ruta, puntosOrdenados);
                }
            } else {
                setPuntosRutaDetalle([]);
            }
        } catch (e) {
            console.error("Error cargando puntos", e);
            setPuntosRutaDetalle([]);
        } finally {
            setCargandoPuntos(false);
        }
    };

    useEffect(() => {
        if (googleLoaded && selectedItem && puntosRutaDetalle.length > 0) {
            const ruta = selectedItem.latitudInicio ? selectedItem : selectedItem.ruta;
            if(ruta) calcularRutaMapa(ruta, puntosRutaDetalle);
        }
    }, [googleLoaded, selectedItem, puntosRutaDetalle, calcularRutaMapa]);

    const handleRutaClick = (ruta) => {
        setSelectedItem(ruta);
        setViewMode('detail_ruta');
        cargarPuntosRuta(ruta);
    };

    const handleViajeClick = (viaje) => {
        setSelectedItem(viaje);
        setViewMode('detail_viaje');
        if (viaje.ruta?.id) {
             cargarPuntosRuta(viaje.ruta); 
        }
    };

    const handleVehiculoClick = (vehiculo) => {
        setSelectedItem(vehiculo);
        setViewMode('detail_vehiculo');
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedItem(null);
        setPuntosRutaDetalle([]);
        setDirectionsResponse(null);
    };

    const abrirModal = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setModalAbierto(true);
        setActiveTab('info');
        setViewMode('list');
        cargarDetallesUsuario(usuario);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setUsuarioSeleccionado(null);
        setDetallesExtra({ rutas: [], viajes: [], vehiculos: [], comunidades: [] });
        setViewMode('list');
        setSelectedItem(null);
        setDirectionsResponse(null);
        setFotosUsuario([]);
        setFotoLightbox(null);
    };

    // Cargar fotos del usuario
    const cargarFotosUsuario = async (usuarioId) => {
        setCargandoFotos(true);
        try {
            const res = await fetch(`${API_BASE_URL}/foto-usuario/usuario/${usuarioId}`);
            if (res.ok) {
                const fotos = await res.json();
                setFotosUsuario(fotos);
            } else {
                setFotosUsuario([]);
            }
        } catch (err) {
            console.error('Error cargando fotos:', err);
            setFotosUsuario([]);
        } finally {
            setCargandoFotos(false);
        }
    };

    // Manejar cambio de pestaña a fotos
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'fotos' && usuarioSeleccionado && fotosUsuario.length === 0) {
            cargarFotosUsuario(usuarioSeleccionado.id);
        }
    };

    // Sub-componentes para vistas detalladas
    const MapContainerView = () => {
        if (!googleLoaded) return <div className="detail-map-container" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>Cargando mapa...</div>;

        const rutaActual = selectedItem ? (selectedItem.latitudInicio ? selectedItem : selectedItem.ruta) : null;

        return (
            <div className="detail-map-container">
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={13}
                    options={{
                        disableDefaultUI: false,
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false
                    }}
                >
                    {/* Marcador Inicio */}
                    {rutaActual?.latitudInicio && (
                         <Marker
                            position={{ lat: parseFloat(rutaActual.latitudInicio), lng: parseFloat(rutaActual.longitudInicio) }}
                            icon={{
                                path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                                scale: 8,
                                fillColor: '#4CAF50',
                                fillOpacity: 1,
                                strokeColor: 'white',
                                strokeWeight: 2
                            }}
                            title="Inicio"
                         />
                    )}

                    {/* Puntos Intermedios */}
                    {puntosRutaDetalle.map((p, i) => {
                         const isServicio = p.tipoPunto === 'servicio' || p.tipoPunto === 'SS';
                         if(!p.latitud) return null;
                         return (
                            <Marker
                                key={p.id || i}
                                position={{ lat: parseFloat(p.latitud), lng: parseFloat(p.longitud) }}
                                icon={{
                                    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                                    scale: 7,
                                    fillColor: isServicio ? '#FF6610' : '#00BCD4',
                                    fillOpacity: 1,
                                    strokeColor: 'white',
                                    strokeWeight: 2
                                }}
                                title={p.nombre}
                            />
                         );
                    })}

                    {/* Marcador Fin */}
                    {rutaActual?.latitudFin && (
                         <Marker
                            position={{ lat: parseFloat(rutaActual.latitudFin), lng: parseFloat(rutaActual.longitudFin) }}
                            icon={{
                                path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                                scale: 8,
                                fillColor: '#1a1a1a',
                                fillOpacity: 1,
                                strokeColor: 'white',
                                strokeWeight: 2
                            }}
                            title="Destino"
                         />
                    )}

                    {directionsResponse && (
                        <DirectionsRenderer 
                            directions={directionsResponse}
                            options={{ 
                                suppressMarkers: true,
                                polylineOptions: {
                                    strokeColor: '#FF6610',
                                    strokeOpacity: 0.9,
                                    strokeWeight: 5
                                }
                            }} 
                        />
                    )}
                </GoogleMap>
            </div>
        );
    };

    const VehiculoDetailView = ({ vehiculo, onBack }) => (
        <div className="detail-view-container">
            <div className="detail-header-row">
                <button className="btn-back" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver
                </button>
                <h3>Detalle de Vehículo</h3>
            </div>
            
            <div className="vehicle-detail-main">
                <div className="vehicle-photo-large">
                    {vehiculo.url_foto ? (
                        <img src={vehiculo.url_foto} alt={vehiculo.alias} />
                    ) : (
                        <div className="placeholder-large">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                                <circle cx="7" cy="17" r="2" />
                                <path d="M9 17h6" />
                                <circle cx="17" cy="17" r="2" />
                            </svg>
                            <span>Sin foto</span>
                        </div>
                    )}
                </div>

                <div className="vehicle-info-content">
                    <h2 className="detail-title">{vehiculo.alias || 'Sin Alias'}</h2>
                    
                    <div className="detail-tags-row">
                        <span className={`badge-estado large ${vehiculo.estado === 'en_posesion' ? 'active' : ''}`}>
                             {vehiculo.estado === 'en_posesion' ? 'Activo / En Posesión' : vehiculo.estado}
                        </span>
                    </div>

                    <div className="info-grid-2">
                        <div className="info-box">
                            <span className="label">Marca</span>
                            <span className="value">{vehiculo.marca}</span>
                        </div>
                        <div className="info-box">
                            <span className="label">Modelo</span>
                            <span className="value">{vehiculo.modelo}</span>
                        </div>
                        <div className="info-box">
                            <span className="label">Año</span>
                            <span className="value">{vehiculo.anio_fabricacion || 'N/A'}</span>
                        </div>
                        <div className="info-box">
                            <span className="label">Tracción</span>
                            <span className="value">{vehiculo.traccion || 'N/A'}</span>
                        </div>
                        <div className="info-box">
                            <span className="label">Tipo</span>
                            <span className="value">{vehiculo.tipo_nombre || 'Desconocido'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const RutaDetailView = ({ ruta, puntos, loadingPuntos, onBack }) => (
        <div className="detail-view-container">
            <div className="detail-header-row">
                <button className="btn-back" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver
                </button>
                <h3>Detalle de Ruta</h3>
            </div>
            
            <MapContainerView />

            <div className="detail-cards-scroller with-map">
                <h2 className="detail-title">{ruta.nombre || 'Sin nombre'}</h2>
                
                <div className="stats-grid-3">
                    <div className="stat-box">
                        <span className="stat-label">Distancia</span>
                        <span className="stat-value">{ruta.distanciaEstimadaKm?.toFixed(1) || 0} km</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Duración</span>
                        <span className="stat-value">{ruta.duracionEstimadaMinutos || 0} min</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Dificultad</span>
                        <span className={`badge-dificultad ${ruta.nivelDificultad?.toLowerCase()}`}>
                            {ruta.nivelDificultad || 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="detail-section">
                    <h4>Descripción</h4>
                    <p>{ruta.descripcion || 'Sin descripción'}</p>
                </div>

                <div className="detail-section">
                     <h4>Privacidad</h4>
                     <span className="badge-general">{ruta.privacidad}</span>
                </div>

                <div className="detail-section">
                    <h4>Puntos de Ruta</h4>
                    {loadingPuntos ? <ShimmerList /> : (
                        <div className="points-timeline">
                            {puntos.length > 0 ? puntos.map((p, idx) => (
                                <div key={p.id || idx} className="timeline-item">
                                    <div className={`timeline-dot ${idx === 0 ? 'start' : (idx === puntos.length - 1 ? 'end' : '')}`}></div>
                                    <div className="timeline-content">
                                        <span className="point-name">{p.nombre || `Punto ${p.ordenSecuencia}`}</span>
                                        {p.tipoPunto === 'SS' && <span className="badge-service">Servicio</span>}
                                    </div>
                                </div>
                            )) : <p className="text-muted">No hay puntos registrados.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const ViajeDetailView = ({ viaje, puntos, onBack }) => {
        const organizador = viaje.organizador || (viaje.creadorId === viaje.organizadorId ? viaje.creador : null);
        const fecha = viaje.fechaProgramada ? new Date(viaje.fechaProgramada).toLocaleString() : 'Por definir';
        
        return (
            <div className="detail-view-container">
                <div className="detail-header-row">
                    <button className="btn-back" onClick={onBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </button>
                    <h3>Detalle de Viaje</h3>
                </div>

                <MapContainerView />

                <div className="detail-cards-scroller with-map">
                    <div className="status-banner" style={{marginBottom: '1rem'}}>
                         <span className={`badge-estado large ${viaje.estado?.toLowerCase()}`}>
                             {viaje.estado === 'en_curso' ? 'En Curso Ahora' : viaje.estado}
                         </span>
                    </div>

                    <h2 className="detail-title">
                        {viaje.ruta?.nombre ? `Viaje: ${viaje.ruta.nombre}` : `Viaje #${viaje.id}`}
                    </h2>

                     <div className="detail-section-row">
                        <div className="info-block">
                             <span className="label-sm">Fecha Programada</span>
                             <span className="value-md">{fecha}</span>
                        </div>
                        {organizador && (
                            <div className="info-block">
                                <span className="label-sm">Organizador</span>
                                <div className="user-mini-row">
                                     <div className="avatar-xs">{organizador.nombre?.charAt(0)}</div>
                                     <span>{organizador.nombre} {organizador.apellido}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Código de Invitación */}
                    {viaje.codigoInvitacion && (
                        <div className="invite-box">
                             <span className="invite-label">Código de Invitación:</span>
                             <span className="invite-code">{viaje.codigoInvitacion}</span>
                        </div>
                    )}

                    <div className="detail-section">
                        <h4>Participantes ({viaje.participantes?.length || 0})</h4>
                        <div className="participants-list">
                            {viaje.participantes && viaje.participantes.length > 0 ? (
                                viaje.participantes.map((p, idx) => {
                                    const usuarioP = p.usuario || {};
                                    return (
                                        <div key={idx} className="participant-card">
                                            <div className="participant-avatar">
                                                {usuarioP.foto ? 
                                                    <img src={usuarioP.foto} alt="av" /> :
                                                    <div className="placeholder">{usuarioP.nombre?.charAt(0)}</div>
                                                }
                                            </div>
                                            <div className="participant-info">
                                                <span className="p-name">{usuarioP.nombre} {usuarioP.apellido}</span>
                                                <span className="p-alias">@{usuarioP.alias}</span>
                                            </div>
                                            <div className="participant-status">
                                                 {p.estado === 'ingresa' && <span className="badge-ingresa">Ingresó</span>}
                                                 {p.estado === 'cancela' && <span className="badge-cancela">Canceló</span>}
                                                 {/* Si es organizador */}
                                                 {usuarioP.id === viaje.organizadorId && <span className="badge-role-sm">Org</span>}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : <p className="text-muted">No hay participantes.</p>}
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>Puntos de la Ruta</h4>
                        {puntosRutaDetalle.length > 0 ? (
                            <div className="points-summary">
                                <span>{puntosRutaDetalle.length} puntos definidos. (Ver mapa arriba)</span>
                            </div>
                        ) : (
                           <button className="btn-link" onClick={() => cargarPuntosRuta(viaje.ruta?.id ? viaje.ruta : null)}>
                               Cargar Puntos de Ruta
                           </button>
                        )}
                        {puntosRutaDetalle.length > 0 && (
                            <div className="points-timeline compact">
                                {puntosRutaDetalle.slice(0, 3).map((p, i) => (
                                    <div key={i} className="timeline-item"><div className="timeline-dot small"></div><span>{p.nombre}</span></div>
                                ))}
                                {puntosRutaDetalle.length > 3 && <div className="timeline-item"><span>... y {puntosRutaDetalle.length - 3} más</span></div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Lógica de Ordenamiento y Filtrado
    const ordenarPor = (columna) => {
        setOrdenamiento(prev => ({
            columna,
            direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
        }));
    };

    const usuariosFiltrados = usuarios
        .filter(u => {
            const termino = busqueda.toLowerCase();
            const nombreCompleto = `${u.nombre} ${u.apellido || ''}`.toLowerCase();
            return (
                nombreCompleto.includes(termino) ||
                (u.alias && u.alias.toLowerCase().includes(termino)) ||
                (u.email && u.email.toLowerCase().includes(termino))
            );
        })
        .sort((a, b) => {
            const { columna, direccion } = ordenamiento;
            let valA = a[columna];
            let valB = b[columna];

            // Manejo especial para combinación nombre+apellido si se ordena por nombre
            if (columna === 'nombre') {
                valA = `${a.nombre} ${a.apellido || ''}`;
                valB = `${b.nombre} ${b.apellido || ''}`;
            }

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return direccion === 'asc' ? -1 : 1;
            if (valA > valB) return direccion === 'asc' ? 1 : -1;
            return 0;
        });

    const IconoOrden = ({ columna }) => {
        const activo = ordenamiento.columna === columna;
        return (
            <span className={`sort-icon ${activo ? 'active' : ''}`}>
                <svg viewBox="0 0 10 10" fill="currentColor">
                    <path d="M5 0L10 5H0L5 0Z" opacity={activo && ordenamiento.direccion === 'asc' ? 1 : 0.3} />
                </svg>
                <svg viewBox="0 0 10 10" fill="currentColor">
                    <path d="M5 10L0 5H10L5 10Z" opacity={activo && ordenamiento.direccion === 'desc' ? 1 : 0.3} />
                </svg>
            </span>
        );
    };

    // Componente Shimmer para listas
    const ShimmerList = () => (
        <div style={{ width: '100%' }}>
            {[1, 2, 3].map(i => (
                <div key={i} className="shimmer-block"></div>
            ))}
        </div>
    );

    // Componente Shimmer para Tabla
    const TableShimmer = () => (
        <>
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <tr key={item} className="row-white">
                    <td><div className="shimmer-line" style={{ width: '20px' }}></div></td>
                    <td className="avatar-cell"><div className="shimmer-avatar"></div></td>
                    <td><div className="shimmer-line" style={{ width: '80%' }}></div></td>
                    <td><div className="shimmer-line" style={{ width: '80%' }}></div></td>
                    <td><div className="shimmer-line" style={{ width: '90%' }}></div></td>
                    <td style={{ textAlign: 'center' }}><div className="shimmer-line" style={{ width: '30px', margin: '0 auto' }}></div></td>
                    <td>
                        <div className="shimmer-line" style={{ width: '24px' }}></div>
                    </td>
                </tr>
            ))}
        </>
    );

    // Componente Skeleton para toda la página
    const SkeletonAdmin = () => (
        <div className="admin-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
            <div className="admin-main-card skeleton-card">
                 {/* Skeleton Header */}
                <div className="admin-actions-bar" style={{ borderBottom: '1px solid #eee' }}>
                    <div className="skeleton-line" style={{ width: '200px', height: '30px' }}></div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                         <div className="skeleton-line" style={{ width: '100px', height: '35px', borderRadius: '8px' }}></div>
                         <div className="skeleton-line" style={{ width: '200px', height: '35px', borderRadius: '8px' }}></div>
                    </div>
                </div>

                {/* Skeleton Table */}
                <div className="admin-table-card" style={{ boxShadow: 'none' }}>
                    <div className="skeleton-table-header"></div>
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className="skeleton-row"></div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (cargando) {
        return <SkeletonAdmin />;
    }

    return (
        <div className="admin-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
            <div className="admin-content-wrapper">
                {/* Left Column: Admin Main Card */}
                <div className="admin-main-card">
                    {/* Header Actions */}
                    <div className="admin-actions-bar">
                        <h2 style={{ margin: 0, color: '#FF6610' }}>Administración de Usuarios</h2>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-refrescar" onClick={cargarDatosIniciales} disabled={cargando}>
                                Refrescar
                            </button>
                            <div className="buscador-container">
                                <input 
                                    type="text" 
                                    className="input-busqueda" 
                                    placeholder="Buscar..." 
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                                {busqueda && <button onClick={() => setBusqueda('')}>X</button>}
                            </div>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="admin-table-card">
                        <div className="table-scroll-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th className="th-sortable" onClick={() => ordenarPor('id')}>ID <IconoOrden columna="id" /></th>
                                        <th>Perfil</th>
                                        <th className="th-sortable" onClick={() => ordenarPor('nombre')}>Nombre <IconoOrden columna="nombre" /></th>
                                        <th className="th-sortable" onClick={() => ordenarPor('apellido')}>Apellido <IconoOrden columna="apellido" /></th>
                                        <th className="th-sortable" onClick={() => ordenarPor('email')}>Email <IconoOrden columna="email" /></th>
                                        <th className="th-sortable" onClick={() => ordenarPor('viajesCount')}>Viajes <IconoOrden columna="viajesCount" /></th>
                                        <th>Detalles</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargando ? (
                                        <TableShimmer />
                                    ) : (
                                        usuariosFiltrados.map((usuario, index) => (
                                            <tr key={usuario.id} className={index % 2 === 0 ? 'row-light' : 'row-white'}>
                                                <td>{usuario.id}</td>
                                                <td className="avatar-cell">
                                                    {usuario.foto ? (
                                                        <TableImage 
                                                            src={usuario.foto} 
                                                            alt={usuario.alias} 
                                                            width="35px" 
                                                            height="35px" 
                                                            className="avatar-preview"
                                                            style={{ borderRadius: '50%' }}
                                                        />
                                                    ) : (
                                                        <div className="avatar-placeholder">{usuario.alias?.charAt(0)}</div>
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: '500' }}>{usuario.nombre}</td>
                                                <td>{usuario.apellido}</td>
                                                <td>{usuario.email}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ 
                                                        background: '#fff0e6', 
                                                        color: '#FF6610', 
                                                        padding: '4px 12px', 
                                                        borderRadius: '12px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {usuario.viajesCount}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="btn-editar" onClick={() => abrirModal(usuario)} title="Ver Detalles">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-footer">
                            Total: {usuarios.length} usuarios
                        </div>
                    </div>
                </div>

                {/* Right Column: Live Log Console */}
                <aside className="admin-sidebar-log">
                    <div className="admin-log-card full-height">
                        <div className="log-card-header">
                            <div className="log-title-row">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                                </svg>
                                <span>Actividad</span>
                            </div>
                            <div className="log-live-badge">
                                <span className="pulse-dot"></span>
                                LIVE
                            </div>
                        </div>
                        <div className="log-card-content">
                            {usuarios
                                .sort((a, b) => {
                                    const dateA = new Date(a.fecha_creacion || a.fechaCreacion || a.createdAt || a.created_at || a.fecha_registro || 0);
                                    const dateB = new Date(b.fecha_creacion || b.fechaCreacion || b.createdAt || b.created_at || b.fecha_registro || 0);
                                    return dateB - dateA;
                                })
                                .slice(0, 10) // Show more items since we have vertical space
                                .map((u) => {
                                    const fechaRaw = u.fecha_creacion || u.fechaCreacion || u.createdAt || u.created_at || u.fecha_registro;
                                    const fecha = fechaRaw ? new Date(fechaRaw).toLocaleString() : 'Fecha desconocida';
                                    
                                    return (
                                        <div key={u.id} className="log-item slide-in-row">
                                            <div className="log-icon-wrapper">
                                                <div className="log-avatar-small">
                                                    {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            </div>
                                            <div className="log-info">
                                                <span className="log-text">
                                                    <strong>{u.nombre} {u.apellido}</strong>
                                                </span>
                                                <span className="log-meta">
                                                    {fecha}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modal de Detalles */}
            {modalAbierto && usuarioSeleccionado && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content-large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-profile">
                            <button className="modal-close-white" onClick={cerrarModal}>×</button>
                            {usuarioSeleccionado.foto && !usuarioSeleccionado.imgError ? (
                                <img 
                                    src={usuarioSeleccionado.foto} 
                                    alt={usuarioSeleccionado.alias} 
                                    className="profile-avatar-large"
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        setUsuarioSeleccionado(prev => ({ ...prev, imgError: true }));
                                    }}
                                />
                            ) : (
                                <div className="profile-avatar-large placeholder-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <div className="avatar-letter" style={{ fontSize: '2.5rem', fontWeight: 'bold', stroke: 'none', fill: 'currentColor' }}>
                                            {usuarioSeleccionado.alias?.charAt(0).toUpperCase()}
                                        </div>
                                    </svg>
                                </div>
                            )}
                            <div className="profile-info">
                                <h2>{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</h2>
                                <span className="alias">@{usuarioSeleccionado.alias}</span>
                            </div>
                        </div>

                        <div className="modal-body-scroll">
                            <div className="profile-tabs">
                                <button 
                                    className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('info')}
                                >
                                    Información
                                </button>
                                <button 
                                    className={`tab-btn ${activeTab === 'fotos' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('fotos')}
                                >
                                    Fotos
                                </button>
        <button 
                                    className={`tab-btn ${activeTab === 'vehiculos' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('vehiculos')}
                                >
                                    Vehículos
                                </button>
                                <button 
                                    className={`tab-btn ${activeTab === 'rutas' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('rutas')}
                                >
                                    Rutas Creadas
                                </button>
                                <button 
                                    className={`tab-btn ${activeTab === 'viajes' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('viajes')}
                                >
                                    Viajes
                                </button>
                                <button 
                                    className={`tab-btn ${activeTab === 'comunidades' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('comunidades')}
                                >
                                    Comunidades
                                </button>
                            </div>

                            <div className="tab-content">
                                {activeTab === 'info' && (
                                    <div className="details-grid">
                                        <div className="detail-card">
                                            <h4>Nombre Completo</h4>
                                            <p>{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>Alias / Nickname</h4>
                                            <p>{usuarioSeleccionado.alias}</p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>Email</h4>
                                            <p>{usuarioSeleccionado.email}</p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>ID Usuario</h4>
                                            <p>{usuarioSeleccionado.id}</p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>Fecha Registro</h4>
                                            <p>
                                                {(usuarioSeleccionado.fecha_creacion || usuarioSeleccionado.fechaCreacion)
                                                    ? new Date(usuarioSeleccionado.fecha_creacion || usuarioSeleccionado.fechaCreacion).toLocaleDateString()
                                                    : 'No disponible'}
                                            </p>
                                        </div>
                                        <div className="detail-card">
                                            <h4>Rol</h4>
                                            <p>{usuarioSeleccionado.rol || 'Usuario'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Pestana Fotos - Galeria estilo red social */}
                                {activeTab === 'fotos' && (
                                    <div className="gallery-container">
                                        {cargandoFotos ? (
                                            <div className="gallery-loading">
                                                {[1, 2, 3, 4, 5, 6].map(i => (
                                                    <div key={i} className="gallery-skeleton"></div>
                                                ))}
                                            </div>
                                        ) : fotosUsuario.length > 0 ? (
                                            <>
                                                <div className="gallery-grid">
                                                    {fotosUsuario.map((foto, index) => (
                                                        <div 
                                                            key={foto.id} 
                                                            className="gallery-item"
                                                            style={{ animationDelay: `${index * 0.08}s` }}
                                                            onClick={() => setFotoLightbox(foto)}
                                                        >
                                                            <img src={foto.urlFoto} alt={`Foto ${index + 1}`} />
                                                            <div className="gallery-overlay">
                                                                <div className="gallery-date">
                                                                    {foto.fechaSubida ? new Date(foto.fechaSubida).toLocaleDateString() : ''}
                                                                </div>
                                                                <div className="gallery-zoom-icon">
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <circle cx="11" cy="11" r="8"/>
                                                                        <path d="M21 21l-4.35-4.35"/>
                                                                        <path d="M11 8v6M8 11h6"/>
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Lightbox Modal */}
                                                {fotoLightbox && (
                                                    <div className="photo-lightbox" onClick={() => setFotoLightbox(null)}>
                                                        <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                                                            <button className="lightbox-close" onClick={() => setFotoLightbox(null)}>
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M18 6L6 18M6 6l12 12"/>
                                                                </svg>
                                                            </button>
                                                            <img src={fotoLightbox.urlFoto} alt="Foto ampliada" className="lightbox-image" />
                                                            <div className="lightbox-info">
                                                                <span className="lightbox-user">
                                                                    {usuarioSeleccionado?.nombre} {usuarioSeleccionado?.apellido}
                                                                </span>
                                                                {fotoLightbox.fechaSubida && (
                                                                    <span className="lightbox-date">
                                                                        {new Date(fotoLightbox.fechaSubida).toLocaleDateString('es-ES', { 
                                                                            day: 'numeric', month: 'long', year: 'numeric' 
                                                                        })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="gallery-empty">
                                                <div className="gallery-empty-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                                        <path d="M21 15l-5-5L5 21"/>
                                                    </svg>
                                                </div>
                                                <p>Este usuario no ha subido fotos</p>
                                            </div>
                                        )}
                                    </div>
                                )}

    {activeTab === 'vehiculos' && (
                                    viewMode === 'detail_vehiculo' && selectedItem ? (
                                        <VehiculoDetailView 
                                            vehiculo={selectedItem} 
                                            onBack={handleBackToList}
                                        />
                                    ) : (
                                        <div className="list-container">
                                            {cargandoDetalles ? <ShimmerList /> : (
                                                detallesExtra.vehiculos && detallesExtra.vehiculos.length > 0 ? (
                                                    <div className="vehicles-grid-list">
                                                        {detallesExtra.vehiculos.map(v => (
                                                            <div 
                                                                key={v.id} 
                                                                className="vehicle-card-item clickable"
                                                                onClick={() => handleVehiculoClick(v)}
                                                            >
                                                                <div className="vehicle-card-bg">
                                                                    {v.url_foto ? (
                                                                        <img src={v.url_foto} alt={v.alias} className="vehicle-img-cover" />
                                                                    ) : (
                                                                        <div className="vehicle-placeholder-gradient">
                                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                                                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                                                                                <circle cx="7" cy="17" r="2" />
                                                                                <path d="M9 17h6" />
                                                                                <circle cx="17" cy="17" r="2" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                    <div className="vehicle-card-overlay">
                                                                        <div className="vehicle-content-wrapper">
                                                                            {v.anio_fabricacion && (
                                                                                <span className="badge-year">{v.anio_fabricacion}</span>
                                                                            )}
                                                                            <strong className="vehicle-title">{v.nombre}</strong>
                                                                            <span className="vehicle-subtitle">
                                                                                {(v.marca || '').toUpperCase()} {v.modelo !== 'Sin modelo' ? v.modelo : ''}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <div className="empty-state">No tiene vehículos registrados.</div>
                                            )}
                                        </div>
                                    )
                                )}

                                {activeTab === 'rutas' && (
                                    viewMode === 'detail_ruta' && selectedItem ? (
                                        <RutaDetailView 
                                            ruta={selectedItem} 
                                            puntos={puntosRutaDetalle} 
                                            loadingPuntos={cargandoPuntos} 
                                            onBack={handleBackToList}
                                        />
                                    ) : (
                                        <div className="list-container">
                                            {cargandoDetalles ? <ShimmerList /> : (
                                                detallesExtra.rutas.length > 0 ? (
                                                    <ul className="simple-list">
                                                        {detallesExtra.rutas.map(r => (
                                                            <li 
                                                                key={r.id} 
                                                                className="detail-list-item clickable"
                                                                onClick={() => handleRutaClick(r)}
                                                            >
                                                                <div className="detail-row-main">
                                                                    <strong>{r.nombre || 'Ruta sin nombre'}</strong>
                                                                    <span className={`badge-dificultad ${r.nivelDificultad?.toLowerCase()}`}>
                                                                        {r.nivelDificultad || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="detail-row-sub">
                                                                    <span>{r.distanciaEstimadaKm?.toFixed(1)} km</span>
                                                                    <span>•</span>
                                                                    <span>{r.duracionEstimadaMinutos} min</span>
                                                                </div>
                                                                <div className="click-hint">Ver detalle &gt;</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : <div className="empty-state">No ha creado rutas.</div>
                                            )}
                                        </div>
                                    )
                                )}

                                {activeTab === 'viajes' && (
                                    viewMode === 'detail_viaje' && selectedItem ? (
                                        <ViajeDetailView 
                                            viaje={selectedItem} 
                                            puntos={puntosRutaDetalle} 
                                            onBack={handleBackToList} 
                                        />
                                    ) : (
                                        <div className="list-container">
                                            {cargandoDetalles ? <ShimmerList /> : (
                                                detallesExtra.viajes.length > 0 ? (
                                                    <ul className="simple-list">
                                                        {detallesExtra.viajes.map(v => (
                                                            <li 
                                                                key={v.id} 
                                                                className="detail-list-item clickable"
                                                                onClick={() => handleViajeClick(v)}
                                                            >
                                                                <div className="detail-row-main">
                                                                    <strong>{v.ruta?.nombre || `Viaje #${v.id}`}</strong>
                                                                    <span className={`badge-estado ${v.estado?.toLowerCase()}`}>
                                                                        {v.estado || 'Desconocido'}
                                                                    </span>
                                                                </div>
                                                                <div className="detail-row-sub">
                                                                    <span>{v.fechaProgramada ? new Date(v.fechaProgramada).toLocaleString() : 'Por definir'}</span>
                                                                    {v.creadorId === usuarioSeleccionado.id && (
                                                                        <span className="badge-role">Organizador</span>
                                                                    )}
                                                                </div>
                                                                <div className="click-hint">Ver participantes &gt;</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : <div className="empty-state">No ha participado en viajes.</div>
                                            )}
                                        </div>
                                    )
                                )}

                                {activeTab === 'comunidades' && (
                                    <div className="list-container">
                                        {cargandoDetalles ? <ShimmerList /> : (
                                            detallesExtra.comunidades && detallesExtra.comunidades.length > 0 ? (
                                                <ul className="simple-list">
                                                    {detallesExtra.comunidades.map(c => (
                                                        <li key={c.id} className="detail-list-item" style={{ cursor: 'default' }}>
                                                            <div className="detail-row-main">
                                                                <strong>{c.nombre || 'Comunidad sin nombre'}</strong>
                                                                <span className={`badge-general ${c.privacidad === 'privada' ? 'privada' : 'publica'}`}>
                                                                    {c.privacidad ? c.privacidad.charAt(0).toUpperCase() + c.privacidad.slice(1) : 'Pública'}
                                                                </span>
                                                            </div>
                                                            <div className="detail-row-sub">
                                                                <span>Creador: {c.creador ? `${c.creador.nombre} ${c.creador.apellido}` : 'Desconocido'}</span>
                                                                {c.esCreador && <span className="badge-role-sm">Creador</span>}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <div className="empty-state">No pertenece a ninguna comunidad.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Updated Styles for Light Theme matching the specific dashboard design
const logStyles = `
/* Layout principal */
.admin-content-wrapper {
    display: flex;
    gap: 1.5rem;
    align-items: stretch;
    height: calc(100vh - 180px); /* Altura ajustada para llenar hasta abajo */
    max-width: 1600px;
    margin: 0 auto;
    margin-top: 1rem; /* Espacio superior para bajar las tarjetas */
}

.admin-main-card {
    flex: 3;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

/* Hacer que la tabla ocupe todo el espacio disponible */
.admin-main-card .admin-table-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    box-shadow: none;
    border-radius: 0;
}

.admin-main-card .table-scroll-container {
    flex: 1;
    overflow-y: auto;
}

.admin-sidebar-log {
    flex: 1;
    min-width: 320px;
    max-width: 380px;
    margin-top: 52px; /* Alinear con la tabla */
    height: calc(100% - 52px); /* Mismo alto que la tarjeta izquierda */
}

/* Modificar admin-log-card para que ocupe todo el sidebar */
.admin-log-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    border: 1px solid #eee;
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.log-card-content {
    flex: 1;
    overflow-y: auto;
}

/* Rest of styles remain same but ensuring no conflicts */
.log-card-header {
    background: #fff;
    padding: 1rem 1.5rem;
    border-bottom: 2px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}
.log-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #333;
    font-weight: 600;
    font-size: 1rem;
}
.log-title-row svg {
    color: #FF6610;
}
.log-live-badge {
    background: #e6f7ed;
    color: #0d9446;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    letter-spacing: 0.5px;
}
.pulse-dot {
    width: 8px;
    height: 8px;
    background: #0d9446;
    border-radius: 50%;
    box-shadow: 0 0 0 rgba(13, 148, 70, 0.4);
    animation: pulse 2s infinite;
}
.log-item {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid #f5f5f5;
    transition: background 0.2s;
}
.log-item:last-child {
    border-bottom: none;
}
.log-item:hover {
    background: #FFF9F5;
}
.log-avatar-small {
    width: 36px;
    height: 36px;
    background: #FF6610;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9rem;
}
.log-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.log-text {
    font-size: 0.95rem;
    color: #333;
}
.log-meta {
    font-size: 0.8rem;
    color: #888;
}
@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(13, 148, 70, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(13, 148, 70, 0); }
    100% { box-shadow: 0 0 0 0 rgba(13, 148, 70, 0); }
}
.slide-in-row {
    animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* Responsive adjustments */
@media (max-width: 1100px) {
    .admin-content-wrapper {
        flex-direction: column;
        height: auto;
    }
    .admin-sidebar-log {
        width: 100%;
        height: 400px; /* Fixed height when stacked */
    }
}
`;

// Inject styles
const styleTag = document.createElement('style');
styleTag.textContent = logStyles;
document.head.appendChild(styleTag);

export default AdminUsuarios;
