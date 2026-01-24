import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import './AdminAlertas.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries = ['places', 'visualization'];

// Iconos para tipos de alerta
const ALERT_ICONS = {
    mecanica: { icon: '', color: '#e74c3c', label: 'Mecanica' },
    medica: { icon: '', color: '#9b59b6', label: 'Medica' },
    combustible: { icon: '', color: '#f39c12', label: 'Combustible' },
    policia: { icon: '', color: '#3498db', label: 'Policia' },
    informativa: { icon: '', color: '#1abc9c', label: 'Informativa' },
    comida: { icon: '', color: '#e67e22', label: 'Comida' },
    default: { icon: '', color: '#95a5a6', label: 'Otro' }
};

// Estilo oscuro para Google Maps
const DARK_MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
];

const AdminAlertas = () => {
    const { isLoaded: googleLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    // Estados
    const [alertas, setAlertas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroOrigen, setFiltroOrigen] = useState('todos');
    
    // Modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: -2.9, lng: -79.0 });
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Detectar modo oscuro
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
        };
        checkDarkMode();
        
        // Observar cambios en el tema
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    // Polling para actualizacion automatica
    const INTERVALO_POLLING = 5000; // 5 segundos

    useEffect(() => {
        cargarAlertas();
        
        // Configurar polling para actualización automática
        const intervalo = setInterval(() => {
            cargarAlertasSilencioso();
        }, INTERVALO_POLLING);

        return () => clearInterval(intervalo);
    }, []);

    // Carga inicial con indicador de carga
    const cargarAlertas = async () => {
        setCargando(true);
        try {
            const res = await fetch(`${API_BASE_URL}/alertaviaje`);
            if (res.ok) {
                const data = await res.json();
                // Ordenar por fecha mas reciente
                const ordenadas = data.sort((a, b) => 
                    new Date(b.fechaReporte || b.fecha_reporte) - new Date(a.fechaReporte || a.fecha_reporte)
                );
                setAlertas(ordenadas);
                setUltimaActualizacion(new Date());
            }
        } catch (err) {
            console.error('Error cargando alertas:', err);
        } finally {
            setCargando(false);
        }
    };

    // Recarga silenciosa sin mostrar indicador de carga
    const cargarAlertasSilencioso = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/alertaviaje`);
            if (res.ok) {
                const data = await res.json();
                const ordenadas = data.sort((a, b) => 
                    new Date(b.fechaReporte || b.fecha_reporte) - new Date(a.fechaReporte || a.fecha_reporte)
                );
                setAlertas(ordenadas);
                setUltimaActualizacion(new Date());
            }
        } catch (err) {
            console.error('Error en polling de alertas:', err);
        }
    };

    const abrirModal = async (alerta) => {
        setAlertaSeleccionada(alerta);
        setModalAbierto(true);
        setDirectionsResponse(null);
        
        // Centrar mapa en la ubicacion de la alerta
        const lat = parseFloat(alerta.latitud);
        const lng = parseFloat(alerta.longitud);
        if (!isNaN(lat) && !isNaN(lng)) {
            setMapCenter({ lat, lng });
        }

        // Calcular ruta si es chatbot y tiene coordenadas de inicio
        const origen = (alerta.origenAlerta || alerta.origen_alerta || '').toLowerCase();
        if (origen === 'chatbot' && alerta.latitudInicio && alerta.longitudInicio && window.google) {
            const directionsService = new window.google.maps.DirectionsService();
            try {
                const result = await directionsService.route({
                    origin: { lat: parseFloat(alerta.latitudInicio), lng: parseFloat(alerta.longitudInicio) },
                    destination: { lat: parseFloat(alerta.latitud), lng: parseFloat(alerta.longitud) },
                    travelMode: window.google.maps.TravelMode.DRIVING
                });
                setDirectionsResponse(result);
            } catch (err) {
                console.error('Error calculando ruta:', err);
            }
        }
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setAlertaSeleccionada(null);
        setDirectionsResponse(null);
    };

    // Obtener info del tipo de alerta
    const getTipoInfo = (tipo) => {
        return ALERT_ICONS[tipo?.toLowerCase()] || ALERT_ICONS.default;
    };

    // Filtrar alertas
    const alertasFiltradas = alertas.filter(a => {
        const tipo = (a.tipoAlerta || a.tipo_alerta || '').toLowerCase();
        const origen = (a.origenAlerta || a.origen_alerta || 'sos').toLowerCase();
        const usuario = a.usuarioReporta || a.usuario_reporta;
        const nombreUsuario = usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.toLowerCase() : '';
        
        const matchBusqueda = nombreUsuario.includes(busqueda.toLowerCase()) || 
                              tipo.includes(busqueda.toLowerCase());
        const matchTipo = filtroTipo === 'todos' || tipo === filtroTipo;
        const matchOrigen = filtroOrigen === 'todos' || origen === filtroOrigen;
        
        return matchBusqueda && matchTipo && matchOrigen;
    });

    // Extraer tipos únicos de las alertas cargadas
    const tiposUnicos = useMemo(() => {
        const tipos = alertas.map(a => (a.tipoAlerta || a.tipo_alerta || '').toLowerCase()).filter(t => t);
        return [...new Set(tipos)];
    }, [alertas]);

    // Formatear fecha
    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleString('es-EC', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="admin-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
            <div className="admin-main-card admin-alertas-card">
                
                {/* Barra de acciones */}
                <div className="admin-actions-bar">
                    {/* Indicador de actualización en vivo */}
                    <div className="live-indicator">
                        <span className="live-dot"></span>
                        <span className="live-text">EN VIVO</span>
                        <span className="alertas-count">{alertasFiltradas.length} alertas</span>
                    </div>

                    <div className="buscador-container">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'#666'}}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Buscar por usuario o tipo..." 
                            className="input-busqueda" 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="filtros-container">
                        <select 
                            className="filtro-select"
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                        >
                            <option value="todos">Todos los tipos</option>
                            {tiposUnicos.map(tipo => {
                                const tipoInfo = getTipoInfo(tipo);
                                return (
                                    <option key={tipo} value={tipo}>
                                        {tipoInfo.label}
                                    </option>
                                );
                            })}
                        </select>
                        
                        <select 
                            className="filtro-select"
                            value={filtroOrigen}
                            onChange={(e) => setFiltroOrigen(e.target.value)}
                        >
                            <option value="todos">Todos los origenes</option>
                            <option value="sos">EnRuta</option>
                            <option value="chatbot">Chatbot</option>
                        </select>

                        <button className="btn-refrescar" onClick={cargarAlertas} disabled={cargando}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 4v6h-6"></path>
                                <path d="M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Refrescar
                        </button>
                    </div>
                </div>

                {/* Tabla */}
                <div className="admin-table-card">
                    <div className="table-scroll-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuario</th>
                                    <th>Tipo</th>
                                    <th>Origen</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr><td colSpan="6" style={{textAlign:'center', padding:'40px'}}>Cargando alertas...</td></tr>
                                ) : alertasFiltradas.length === 0 ? (
                                    <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#999'}}>No hay alertas que coincidan</td></tr>
                                ) : (
                                    alertasFiltradas.map(alerta => {
                                        const tipo = alerta.tipoAlerta || alerta.tipo_alerta || 'default';
                                        const tipoInfo = getTipoInfo(tipo);
                                        const origen = alerta.origenAlerta || alerta.origen_alerta || 'sos';
                                        const usuario = alerta.usuarioReporta || alerta.usuario_reporta;

                                        
                                        return (
                                            <tr key={alerta.id} className="seleccionable" onClick={() => abrirModal(alerta)}>
                                                <td>#{alerta.id}</td>
                                                <td>
                                                    <div className="usuario-cell">
                                                        {usuario?.foto ? (
                                                            <img src={usuario.foto} alt="" className="avatar-mini" />
                                                        ) : (
                                                            <div className="avatar-placeholder-mini">
                                                                {usuario?.nombre?.charAt(0) || '?'}
                                                            </div>
                                                        )}
                                                        <span>{usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Desconocido'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge-tipo" style={{backgroundColor: tipoInfo.color + '20', color: tipoInfo.color}}>
                                                        {tipoInfo.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge-origen ${origen.toLowerCase()}`}>
                                                        {origen === 'chatbot' ? 'Chatbot' : 'EnRuta'}
                                                    </span>
                                                </td>
                                                <td>{formatFecha(alerta.fechaReporte || alerta.fecha_reporte)}</td>
                                                <td>
                                                    <button className="btn-ver-detalle" onClick={(e) => { e.stopPropagation(); abrirModal(alerta); }}>
                                                        Ver Mapa
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Detalles */}
            {modalAbierto && alertaSeleccionada && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content-alerta" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-alerta">
                            <div className="modal-title-row">
                                <span className="badge-tipo-grande" style={{
                                    backgroundColor: getTipoInfo(alertaSeleccionada.tipoAlerta || alertaSeleccionada.tipo_alerta).color + '20',
                                    color: getTipoInfo(alertaSeleccionada.tipoAlerta || alertaSeleccionada.tipo_alerta).color
                                }}>
                                    {getTipoInfo(alertaSeleccionada.tipoAlerta || alertaSeleccionada.tipo_alerta).label}
                                </span>
                                <h2>Alerta #{alertaSeleccionada.id}</h2>
                            </div>
                            <button className="modal-close-white" onClick={cerrarModal}>×</button>
                        </div>
                        
                        <div className="modal-body-alerta">
                            {/* Info del usuario */}
                            <div className="alerta-info-grid">
                                <div className="info-card">
                                    <h4>Usuario</h4>
                                    <p>{alertaSeleccionada.usuarioReporta ? 
                                        `${alertaSeleccionada.usuarioReporta.nombre} ${alertaSeleccionada.usuarioReporta.apellido}` : 
                                        'Desconocido'}</p>
                                </div>
                                <div className="info-card">
                                    <h4>Origen</h4>
                                    <p>{(alertaSeleccionada.origenAlerta || alertaSeleccionada.origen_alerta) === 'chatbot' ? 'Chatbot' : 'En ruta'}</p>
                                </div>
                                <div className="info-card">
                                    <h4>Fecha</h4>
                                    <p>{formatFecha(alertaSeleccionada.fechaReporte || alertaSeleccionada.fecha_reporte)}</p>
                                </div>
                                {alertaSeleccionada.mensaje && (
                                    <div className="info-card full-width">
                                        <h4>Mensaje</h4>
                                        <p>{alertaSeleccionada.mensaje}</p>
                                    </div>
                                )}
                            </div>

                            {/* Mapa */}
                            <div className="mapa-alerta-container">
                                {googleLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '350px', borderRadius: '12px' }}
                                        center={mapCenter}
                                        zoom={15}
                                        options={{
                                            disableDefaultUI: false,
                                            zoomControl: true,
                                            streetViewControl: false,
                                            mapTypeControl: false,
                                            styles: isDarkMode ? DARK_MAP_STYLE : []
                                        }}
                                    >
                                        {/* Punto de alerta (destino/busqueda) */}
                                        <Marker
                                            position={{
                                                lat: parseFloat(alertaSeleccionada.latitud),
                                                lng: parseFloat(alertaSeleccionada.longitud)
                                            }}
                                            icon={{
                                                path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                                                scale: 12,
                                                fillColor: getTipoInfo(alertaSeleccionada.tipoAlerta || alertaSeleccionada.tipo_alerta).color,
                                                fillOpacity: 1,
                                                strokeColor: 'white',
                                                strokeWeight: 3
                                            }}
                                            title="Punto de Alerta/Busqueda"
                                        />

                                        {/* Si es chatbot, mostrar punto de inicio y ruta */}
                                        {(alertaSeleccionada.origenAlerta || alertaSeleccionada.origen_alerta) === 'chatbot' && 
                                         alertaSeleccionada.latitudInicio && alertaSeleccionada.longitudInicio && (
                                            <>
                                                <Marker
                                                    position={{
                                                        lat: parseFloat(alertaSeleccionada.latitudInicio),
                                                        lng: parseFloat(alertaSeleccionada.longitudInicio)
                                                    }}
                                                    icon={{
                                                        path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                                                        scale: 10,
                                                        fillColor: '#4CAF50',
                                                        fillOpacity: 1,
                                                        strokeColor: 'white',
                                                        strokeWeight: 2
                                                    }}
                                                    title="Ubicacion del Usuario"
                                                />
                                                {/* Ruta siguiendo las calles */}
                                                {directionsResponse && (
                                                    <DirectionsRenderer
                                                        directions={directionsResponse}
                                                        options={{
                                                            suppressMarkers: true,
                                                            polylineOptions: {
                                                                strokeColor: '#FF6610',
                                                                strokeOpacity: 0.8,
                                                                strokeWeight: 4
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </GoogleMap>
                                ) : (
                                    <div className="mapa-loading">Cargando mapa...</div>
                                )}
                            </div>

                            {/* Leyenda del mapa */}
                            <div className="mapa-leyenda">
                                <div className="leyenda-item">
                                    <span className="leyenda-dot" style={{backgroundColor: getTipoInfo(alertaSeleccionada.tipoAlerta || alertaSeleccionada.tipo_alerta).color}}></span>
                                    <span>Punto de Alerta/Busqueda</span>
                                </div>
                                {(alertaSeleccionada.origenAlerta || alertaSeleccionada.origen_alerta) === 'chatbot' && 
                                 alertaSeleccionada.latitudInicio && (
                                    <div className="leyenda-item">
                                        <span className="leyenda-dot" style={{backgroundColor: '#4CAF50'}}></span>
                                        <span>Ubicacion del Usuario</span>
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

export default AdminAlertas;
