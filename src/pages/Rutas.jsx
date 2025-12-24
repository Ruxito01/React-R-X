import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import { GraficoTopRutas, GraficoTendencia, GraficoEstado } from '../components/EstadisticasRutas';
import './Rutas.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const GOOGLE_MAPS_API_KEY = 'AIzaSyD6DCBHsbUm6TcGBM6GoRt21utQQBrbOaQ';

const Rutas = () => {
  // Estados de datos
  const [rutas, setRutas] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [puntosRuta, setPuntosRuta] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para seleccion
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [mostrarTodosViajes, setMostrarTodosViajes] = useState(true);
  
  // Filtros de viajes
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busquedaRuta, setBusquedaRuta] = useState('');
  
  // Filtro de creador de rutas
  const [filtroCreador, setFiltroCreador] = useState('todos');

  // Estados del mapa
  const [mapRef, setMapRef] = useState(null);
  const [tipoMapa, setTipoMapa] = useState('roadmap');
  const [mostrarTrafico, setMostrarTrafico] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [expandirDetallesViaje, setExpandirDetallesViaje] = useState(false);
  const [mapaCargando, setMapaCargando] = useState(true);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Scroll al inicio
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Cargar datos iniciales y configurar auto-refresh
  useEffect(() => {
    cargarDatos();
    
    // Auto-refresh cada 5 segundos
    const intervalId = setInterval(() => {
      // Solo recargar si no hay una interacción activa que podría romperse
      // Por ejemplo, si el mapa está cargando, mejor esperar
      cargarDatos(false); // false indica que es background update (no mostrar spinner global)
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const cargarDatos = async (mostrarSpinner = true) => {
    try {
      if (mostrarSpinner) setCargando(true);
      const [rutasRes, viajesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/ruta`),
        fetch(`${API_BASE_URL}/viaje`)
      ]);
      
      if (!rutasRes.ok) throw new Error('Error al cargar rutas');
      if (!viajesRes.ok) throw new Error('Error al cargar viajes');
      
      const rutasData = await rutasRes.json();
      const viajesData = await viajesRes.json();
      
      setRutas(rutasData);
      setViajes(viajesData);
      setError(null);
      
      // Seleccionar primera ruta y viaje por defecto
      if (rutasData.length > 0) {
        const primeraRuta = rutasData[0];
        setRutaSeleccionada(primeraRuta);
        setMostrarTodosViajes(false);
        
        // Cargar puntos de la primera ruta
        try {
          const puntosRes = await fetch(`${API_BASE_URL}/puntoruta/ruta/${primeraRuta.id}`);
          if (puntosRes.ok) {
            const puntos = await puntosRes.json();
            const puntosOrdenados = puntos.sort((a, b) => a.ordenSecuencia - b.ordenSecuencia);
            setPuntosRuta(puntosOrdenados);
          }
        } catch (e) {
          console.error('Error al cargar puntos iniciales:', e);
        }
        
        // Seleccionar primer viaje de esa ruta
        const viajesDeLaRuta = viajesData.filter(v => v.ruta?.id === primeraRuta.id);
        if (viajesDeLaRuta.length > 0) {
          setViajeSeleccionado(viajesDeLaRuta[0]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Calcular ruta con Google Directions API
  const calcularRuta = useCallback((ruta, puntos) => {
    if (!window.google || !ruta.latitudInicio || !ruta.latitudFin) {
      setDirectionsResponse(null);
      setMapaCargando(false);
      return;
    }

    setMapaCargando(true);
    const directionsService = new window.google.maps.DirectionsService();
    
    const origin = { lat: parseFloat(ruta.latitudInicio), lng: parseFloat(ruta.longitudInicio) };
    const destination = { lat: parseFloat(ruta.latitudFin), lng: parseFloat(ruta.longitudFin) };
    
    // Crear waypoints con los puntos intermedios
    const waypoints = puntos
      .filter(p => p.latitud && p.longitud)
      .map(p => ({
        location: { lat: parseFloat(p.latitud), lng: parseFloat(p.longitud) },
        stopover: true
      }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false
      },
      (result, status) => {
        if (status === 'OK') {
          setDirectionsResponse(result);
        } else {
          console.error('Error al calcular ruta:', status);
          setDirectionsResponse(null);
        }
        setMapaCargando(false);
      }
    );
  }, []);

  const seleccionarRuta = async (ruta) => {
    setRutaSeleccionada(ruta);
    setMostrarTodosViajes(false);
    
    // Cargar puntos de la ruta
    try {
      const res = await fetch(`${API_BASE_URL}/puntoruta/ruta/${ruta.id}`);
      if (res.ok) {
        const puntos = await res.json();
        const puntosOrdenados = puntos.sort((a, b) => a.ordenSecuencia - b.ordenSecuencia);
        setPuntosRuta(puntosOrdenados);
        
        // Recalcular ruta en mapa si Google API está listo
        if (googleLoaded) {
          calcularRuta(ruta, puntosOrdenados);
        }
      }
    } catch (err) {
      console.error('Error al cargar puntos:', err);
    }
  };

  const seleccionarViaje = (viaje) => {
    setViajeSeleccionado(viaje);
    // Expandir detalles automáticamente al seleccionar
    setExpandirDetallesViaje(true);
  };
  
  const verTodosViajes = () => {
    setMostrarTodosViajes(true);
    setViajeSeleccionado(null);
  };

  // Filtrado de viajes
  const viajesFiltrados = viajes.filter(viaje => {
    // Filtro por ruta seleccionada
    if (!mostrarTodosViajes && rutaSeleccionada) {
      if ((viaje.ruta?.id || viaje.rutaId) !== rutaSeleccionada.id) return false;
    }
    
    // Filtro por estado
    if (filtroEstado !== 'todos' && viaje.estado !== filtroEstado) return false;
    
    // Filtro por busqueda de nombre
    if (busquedaRuta.trim()) {
      const nombreRuta = viaje.ruta?.nombre?.toLowerCase() || '';
      if (!nombreRuta.includes(busquedaRuta.toLowerCase())) return false;
    }
    
    return true;
  });

  // Lógica para filtro de creadores
  const creadoresUnicos = React.useMemo(() => {
    const creadores = new Set();
    rutas.forEach(ruta => {
      if (ruta.creador) {
        const nombreCompleto = `${ruta.creador.nombre || ''} ${ruta.creador.apellido || ''}`.trim();
        if (nombreCompleto) creadores.add(JSON.stringify({ id: ruta.creador.id, nombre: nombreCompleto }));
      }
    });
    return Array.from(creadores).map(c => JSON.parse(c));
  }, [rutas]);

  const rutasFiltradas = rutas.filter(ruta => {
    if (filtroCreador === 'todos') return true;
    if (!ruta.creador) return false;
    return ruta.creador.id === parseInt(filtroCreador);
  });

  // Calcular estadisticas
  const totalViajes = viajes.length;
  const viajesActivos = viajes.filter(v => v.estado === 'en_curso').length;
  const viajesProgramados = viajes.filter(v => v.estado === 'programado').length;
  const totalParticipantes = viajes.reduce((sum, v) => sum + (v.participantes?.length || 0), 0);
  const kmTotales = viajes.reduce((sum, v) => sum + (parseFloat(v.ruta?.distanciaEstimadaKm) || 0), 0);

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'Sin fecha';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-EC', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Badge de estado
  const getEstadoBadge = (estado) => {
    const estilos = {
      'en_curso': { bg: '#4CAF50', text: 'En Curso' },
      'programado': { bg: '#2196F3', text: 'Programado' },
      'finalizado': { bg: '#9E9E9E', text: 'Finalizado' },
      'cancelado': { bg: '#f44336', text: 'Cancelado' }
    };
    const estilo = estilos[estado] || { bg: '#666', text: estado };
    return (
      <span style={{ 
        background: estilo.bg, 
        color: 'white', 
        padding: '2px 8px', 
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600'
      }}>
        {estilo.text}
      </span>
    );
  };

  // Skeleton loading
  if (cargando) {
    return (
      <div className="rutas-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
        <div className="stats-summary rutas-animate-enter">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card skeleton-card">
              <div className="skeleton-stat-icon"></div>
              <div className="skeleton-stat-content">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="rutas-main-card rutas-animate-enter">
          <div className="rutas-grid-3col">
            <div className="rutas-column">
              <div className="routes-table-card skeleton-card" style={{height: '300px'}}></div>
            </div>
            <div className="rutas-column">
              <div className="routes-table-card skeleton-card" style={{height: '300px'}}></div>
            </div>
            <div className="rutas-column">
              <div className="mapa-card skeleton-card" style={{height: '300px'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rutas-container">
        <div className="error-container">
          <h2>Error al cargar datos</h2>
          <p>{error}</p>
          <button onClick={cargarDatos} className="retry-btn">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rutas-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
      
      {/* Tarjetas de Resumen */}
      <div className="stats-summary rutas-animate-enter">
        <div className="stat-card">
          <div className="stat-icon rutas-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{rutas.length}</span>
            <span className="stat-label">Total Rutas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon activos-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{viajesActivos}</span>
            <span className="stat-label">Viajes Activos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon programados-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalViajes}</span>
            <span className="stat-label">Total Viajes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon km-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-value">{kmTotales.toFixed(1)}</span>
            <span className="stat-label">Km Totales</span>
          </div>
        </div>
      </div>

      <div className="rutas-main-card rutas-animate-enter">
        <div className="rutas-grid-3col">
          
          {/* COLUMNA 1: Tabla de Rutas */}
          <div className="rutas-column">
            <div className="routes-table-card">
              <div className="table-header-bar">
                <span>RUTAS DISPONIBLES</span>
                <span className="badge-count">{rutas.length}</span>
              </div>

              {/* Filtro de Creador */}
              <div className="filtros-container">
                <select
                  className="filtro-select w-100"
                  value={filtroCreador}
                  onChange={(e) => setFiltroCreador(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="todos">Todos los creadores</option>
                  {creadoresUnicos.map(creador => (
                    <option key={creador.id} value={creador.id}>
                      {creador.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="table-scroll-container">
                <table className="routes-table">
                  <thead>
                    <tr>
                      <th className="header-orange">Nombre</th>
                      <th className="header-orange">Distancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rutasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>
                          No hay rutas registradas
                        </td>
                      </tr>
                    ) : (
                      rutasFiltradas.map((ruta, index) => (
                        <tr 
                          key={ruta.id} 
                          className={`${index % 2 === 0 ? 'route-row-light' : 'route-row-white'} ${rutaSeleccionada?.id === ruta.id ? 'selected-route-row' : ''}`}
                          onClick={() => seleccionarRuta(ruta)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="route-name-cell">
                            <div className="ruta-cell-content">
                              <span className="ruta-nombre">{ruta.nombre || 'Sin nombre'}</span>
                              {ruta.creador && (
                                <span className="ruta-creador-sub">
                                  por {ruta.creador.nombre} {ruta.creador.apellido}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{ruta.distanciaEstimadaKm ? `${ruta.distanciaEstimadaKm} km` : '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="route-table-footer">
                Click en una ruta para ver sus viajes
              </div>
            </div>
            {/* Gráfico 1: Top Rutas (Debajo de la tabla de Rutas) */}
            <GraficoTopRutas rutas={rutas} viajes={viajes} />
          </div>

          {/* COLUMNA 2: Tabla de Viajes */}
          <div className="rutas-column">
            <div className="routes-table-card">
              <div className="table-header-bar">
                <span>
                  {mostrarTodosViajes 
                    ? 'TODOS LOS VIAJES' 
                    : `VIAJES DE: ${rutaSeleccionada?.nombre || ''}`}
                </span>
                <span className="badge-count">{viajesFiltrados.length}</span>
              </div>
              
              {/* Filtros */}
              <div className="filtros-container">
                <button 
                  className={`filtro-btn ${mostrarTodosViajes ? 'active' : ''}`}
                  onClick={verTodosViajes}
                >
                  Ver Todos
                </button>
                <select 
                  className="filtro-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos estados</option>
                  <option value="en_curso">En Curso</option>
                  <option value="programado">Programados</option>
                  <option value="finalizado">Finalizados</option>
                  <option value="cancelado">Cancelados</option>
                </select>
                <input 
                  type="text"
                  className="filtro-input"
                  placeholder="Buscar ruta..."
                  value={busquedaRuta}
                  onChange={(e) => setBusquedaRuta(e.target.value)}
                />
              </div>
              
              <div className="table-scroll-container">
                <table className="routes-table">
                  <thead>
                    <tr>
                      <th className="header-orange">Ruta</th>
                      <th className="header-orange">Participantes</th>
                      <th className="header-orange">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viajesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                          No hay viajes {!mostrarTodosViajes ? 'para esta ruta' : 'con estos filtros'}
                        </td>
                      </tr>
                    ) : (
                      viajesFiltrados.map((viaje, index) => (
                        <tr 
                          key={viaje.id} 
                          className={`${index % 2 === 0 ? 'route-row-light' : 'route-row-white'} ${viajeSeleccionado?.id === viaje.id ? 'selected-route-row' : ''}`}
                          onClick={() => setViajeSeleccionado(viaje)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="route-name-cell">{viaje.ruta?.nombre || 'Sin nombre'}</td>
                          <td>{viaje.participantes?.length || 0}</td>
                          <td>{getEstadoBadge(viaje.estado)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="route-table-footer">
                {filtroEstado !== 'todos' && `Filtro: ${filtroEstado}`}
                {busquedaRuta && ` | Busqueda: "${busquedaRuta}"`}
              </div>
            </div>
            {/* Gráfico 2: Tendencia (Debajo de la tabla de Viajes) */}
            <GraficoTendencia viajes={viajes} />
          </div>

          {/* COLUMNA 3: Mapa y Detalles */}
          <div className="rutas-column">
            <div className="route-chart-card mapa-card">
              <div className="route-chart-title-bold">
                {rutaSeleccionada ? `MAPA: ${rutaSeleccionada.nombre}` : 'SELECCIONA UNA RUTA'}
              </div>
              
              {rutaSeleccionada ? (
                <div className="mapa-detalle-container-vertical">
                  {/* Info de la ruta y creador */}
                  <div className="ruta-info-mini">
                    <div className="info-item full-width">
                      <span className="info-label">Creador de la Ruta:</span>
                      <span className="info-value">
                        {rutaSeleccionada.creador 
                          ? `${rutaSeleccionada.creador.nombre || ''} ${rutaSeleccionada.creador.apellido || ''}`.trim() || rutaSeleccionada.creador.alias
                          : 'Desconocido'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Distancia:</span>
                      <span className="info-value">{rutaSeleccionada.distanciaEstimadaKm || 0} km</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Puntos:</span>
                      <span className="info-value">{puntosRuta.length}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Viajes:</span>
                      <span className="info-value">{viajes.filter(v => v.ruta?.id === rutaSeleccionada.id).length}</span>
                    </div>
                  </div>
                  
                  {/* Apartado expandible de detalles del viaje */}
                  {viajeSeleccionado && (
                    <div className="viaje-detalles-expandible">
                      <button 
                        className="expandible-header"
                        onClick={() => setExpandirDetallesViaje(!expandirDetallesViaje)}
                      >
                        <span>Detalles del Viaje</span>
                        <svg 
                          viewBox="0 0 24 24" 
                          width="18" 
                          height="18" 
                          fill="currentColor"
                          style={{ transform: expandirDetallesViaje ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                        >
                          <path d="M7 10l5 5 5-5z"/>
                        </svg>
                      </button>
                      
                      {expandirDetallesViaje && (
                        <div className="expandible-content">
                          {/* Organizador del viaje */}
                          <div className="viaje-organizador">
                            <span className="organizador-label">Organizador:</span>
                            <span className="organizador-value">
                              {viajeSeleccionado.organizador 
                                ? `${viajeSeleccionado.organizador.nombre || ''} ${viajeSeleccionado.organizador.apellido || ''}`.trim() || viajeSeleccionado.organizador.alias
                                : 'Desconocido'}
                            </span>
                          </div>
                          
                          {/* Fecha del viaje */}
                          <div className="viaje-fecha">
                            <span className="fecha-label">Fecha Programada:</span>
                            <span className="fecha-value">
                              {viajeSeleccionado.fechaProgramada 
                                ? new Date(viajeSeleccionado.fechaProgramada).toLocaleString('es-EC', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                  })
                                : 'No especificada'}
                            </span>
                          </div>
                          
                          {/* Lista de participantes */}
                          <div className="participantes-lista">
                            <span className="participantes-titulo">
                              Participantes ({viajeSeleccionado.participantes?.length || 0})
                            </span>
                            {viajeSeleccionado.participantes?.length > 0 ? (
                              <ul className="participantes-items">
                                {viajeSeleccionado.participantes.map((participante, idx) => (
                                  <li key={idx} className="participante-item">
                                    <div className="participante-avatar">
                                      {participante.usuario?.alias?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="participante-info">
                                      <span className="participante-nombre">
                                        {participante.usuario 
                                          ? `${participante.usuario.nombre || ''} ${participante.usuario.apellido || ''}`.trim() || participante.usuario.alias
                                          : 'Usuario'}
                                      </span>
                                      <span className={`participante-estado ${participante.estado?.toLowerCase() || ''}`}>
                                        {participante.estado || 'Sin estado'}
                                      </span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                              ) : (
                              <p className="sin-participantes">Sin participantes registrados</p>
                            )}
                          </div>
                          
                          {/* Lista de Puntos de Ruta */}
                          <div className="puntos-lista-expandible">
                            <span className="puntos-titulo">
                              Puntos de la Ruta ({puntosRuta.length + 2})
                            </span>
                            <div className="puntos-items-scroll">
                              {/* Punto de INICIO */}
                              <div className="punto-item-mini inicio">
                                <div className="punto-icono-mini inicio">
                                  <svg viewBox="0 0 24 24" fill="white" width="10" height="10">
                                    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
                                  </svg>
                                </div>
                                <span className="punto-texto">Inicio - Punto de partida</span>
                              </div>
                              
                              {/* Puntos intermedios */}
                              {puntosRuta.map((punto, i) => {
                                const isServicio = punto.tipoPunto === 'servicio' || punto.tipoPunto === 'SS';
                                return (
                                  <div key={punto.id} className={`punto-item-mini ${isServicio ? 'servicio' : 'paso'}`}>
                                    <div className={`punto-icono-mini ${isServicio ? 'servicio' : 'paso'}`}>
                                      {punto.ordenSecuencia || i + 1}
                                    </div>
                                    <span className="punto-texto">
                                      {punto.nombre || `Punto ${punto.ordenSecuencia || i + 1}`}
                                      <small> - {isServicio ? 'Servicio' : 'Paso'}</small>
                                    </span>
                                  </div>
                                );
                              })}
                              
                              {/* Punto de DESTINO */}
                              <div className="punto-item-mini destino">
                                <div className="punto-icono-mini destino">
                                  <svg viewBox="0 0 24 24" fill="white" width="10" height="10">
                                    <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                                  </svg>
                                </div>
                                <span className="punto-texto">Destino - Punto de llegada</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Mapa de Google Maps */}
                  <div className="google-mapa-container">
                    {/* Shimmer mientras carga */}
                    {(mapaCargando || !googleLoaded) && (
                      <div className="mapa-shimmer">
                        <div className="shimmer-animation"></div>
                        <div className="shimmer-text">Cargando mapa...</div>
                      </div>
                    )}
                    
                    <LoadScript 
                      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                      onLoad={() => {
                        setGoogleLoaded(true);
                        // Calcular ruta inicial si hay ruta seleccionada
                        if (rutaSeleccionada) {
                          calcularRuta(rutaSeleccionada, puntosRuta);
                        }
                      }}
                    >
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '220px', borderRadius: '8px' }}
                        center={{
                          lat: rutaSeleccionada.latitudInicio ? parseFloat(rutaSeleccionada.latitudInicio) : -2.1710,
                          lng: rutaSeleccionada.longitudInicio ? parseFloat(rutaSeleccionada.longitudInicio) : -79.9224
                        }}
                        zoom={12}
                        mapTypeId={tipoMapa}
                        options={{
                          zoomControl: true,
                          streetViewControl: false,
                          mapTypeControl: false,
                          fullscreenControl: true,
                          zoomControlOptions: {
                            position: window.google?.maps?.ControlPosition?.RIGHT_CENTER
                          }
                        }}
                        onLoad={(map) => setMapRef(map)}
                      >
                        {/* Marcador de INICIO */}
                        {rutaSeleccionada.latitudInicio && rutaSeleccionada.longitudInicio && (
                          <Marker
                            position={{
                              lat: parseFloat(rutaSeleccionada.latitudInicio),
                              lng: parseFloat(rutaSeleccionada.longitudInicio)
                            }}
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
                        
                        {/* Marcadores de puntos intermedios */}
                        {puntosRuta.map((punto, i) => {
                          const isServicio = punto.tipoPunto === 'servicio' || punto.tipoPunto === 'SS';
                          return punto.latitud && punto.longitud && (
                            <Marker
                              key={punto.id}
                              position={{
                                lat: parseFloat(punto.latitud),
                                lng: parseFloat(punto.longitud)
                              }}
                              icon={{
                                path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                                scale: 7,
                                fillColor: isServicio ? '#FF6610' : '#00BCD4',
                                fillOpacity: 1,
                                strokeColor: 'white',
                                strokeWeight: 2
                              }}
                              title={punto.nombre || `Punto ${i + 1}`}
                            />
                          );
                        })}
                        
                        {/* Marcador de FIN */}
                        {rutaSeleccionada.latitudFin && rutaSeleccionada.longitudFin && (
                          <Marker
                            position={{
                              lat: parseFloat(rutaSeleccionada.latitudFin),
                              lng: parseFloat(rutaSeleccionada.longitudFin)
                            }}
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
                        
                        {/* Ruta calculada por Google Directions */}
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
                    </LoadScript>
                    
                    {/* Controles del mapa */}
                    <div className="mapa-controles">
                      <span className="control-label">Vista:</span>
                      <select 
                        value={tipoMapa} 
                        onChange={(e) => setTipoMapa(e.target.value)}
                        className="mapa-control-select"
                      >
                        <option value="roadmap">Normal</option>
                        <option value="satellite">Satelite</option>
                        <option value="hybrid">Hibrido</option>
                        <option value="terrain">Terreno</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mapa-empty" style={{ minHeight: '250px' }}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                  <p>Selecciona una ruta para ver su mapa</p>
                </div>
              )}
              
            </div>
            {/* Gráfico 3: Estado (Debajo del Mapa) */}
            <GraficoEstado viajes={viajes} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rutas;
