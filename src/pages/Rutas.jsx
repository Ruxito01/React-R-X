import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import { GraficoTopRutas, GraficoTendencia, GraficoEstado } from '../components/EstadisticasRutas';
import { useTheme } from '../context/ThemeContext';
import './Rutas.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Rutas = () => {
  const { theme } = useTheme();

  // Estilos de mapa oscuro
  const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ];
  // Estados de datos
  // Estados de datos - TABLAS Y MAPA (Se congelan al seleccionar)
  const [rutas, setRutas] = useState([]);
  const [viajes, setViajes] = useState([]);

  // Estados de datos - ESTADISTICAS (Siempre vivas)
  const [rutasReal, setRutasReal] = useState([]);
  const [viajesReal, setViajesReal] = useState([]);
  
  const [puntosRuta, setPuntosRuta] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para seleccion
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [viajeSeleccionado, setViajeSeleccionado] = useState(null);
  const [mostrarTodosViajes, setMostrarTodosViajes] = useState(true);
  const [isUserSelection, setIsUserSelection] = useState(false); // Nuevo: controla si el usuario intervino
  
  // Filtros de viajes
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busquedaRuta, setBusquedaRuta] = useState('');
  
  // Filtro de creador de rutas
  const [filtroCreador, setFiltroCreador] = useState('todos');
  const [busquedaNombreRuta, setBusquedaNombreRuta] = useState('');

  // Filtros de fecha para viajes
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  
  // Filtro de organizador de viajes
  const [filtroOrganizador, setFiltroOrganizador] = useState('todos');

  // Tipo de filtro activo (radio buttons)
  const [tipoFiltro, setTipoFiltro] = useState('todos');

  // Estados para ordenamiento
  const [ordenRutas, setOrdenRutas] = useState({ columna: 'nombre', direccion: 'asc' });
  const [ordenViajes, setOrdenViajes] = useState({ columna: 'fecha', direccion: 'desc' });
  
  // Funciones de ordenamiento
  const ordenarRutasPor = (columna) => {
    setOrdenRutas(prev => ({
      columna,
      direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const ordenarViajesPor = (columna) => {
    setOrdenViajes(prev => ({
      columna,
      direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Componente IconoOrden
  const IconoOrden = ({ activo, direccion }) => {
    return (
      <span className={`sort-icon ${activo ? 'active' : ''}`}>
        <svg viewBox="0 0 10 10" fill="currentColor">
          <path d="M5 0L10 5H0L5 0Z" opacity={activo && direccion === 'asc' ? 1 : 0.3} />
        </svg>
        <svg viewBox="0 0 10 10" fill="currentColor">
          <path d="M5 10L0 5H10L5 10Z" opacity={activo && direccion === 'desc' ? 1 : 0.3} />
        </svg>
      </span>
    );
  };

  // Estados del mapa
  const [mapRef, setMapRef] = useState(null);
  const [tipoMapa, setTipoMapa] = useState('roadmap');
  const [mostrarTrafico, setMostrarTrafico] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [expandirDetallesViaje, setExpandirDetallesViaje] = useState(false);
  const [mapaCargando, setMapaCargando] = useState(true);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  
  // Estado para el centro del mapa (controlado manualmente para evitar recentrados automaticos)
  const [mapCenter, setMapCenter] = useState(null);
  
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Scroll al inicio
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  const cargarDatos = useCallback(async (mostrarSpinner = true) => {
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
      
      // 1. Siempre actualizar datos "Reales" para estadisticas
      setRutasReal(rutasData);
      setViajesReal(viajesData);
      
      // 2. ACTUALIZAR TABLA DE VIAJES (Siempre, para reflejar cambios de estado rapido)
      setViajes(viajesData);
      
      // Si hay un viaje seleccionado, actualizar su informacion (para que el panel de detalles muestre estado nuevo)
      if (viajeSeleccionado) {
        const viajeActualizado = viajesData.find(v => v.id === viajeSeleccionado.id);
        if (viajeActualizado) {
          setViajeSeleccionado(viajeActualizado);
        }
      }

      // 3. Logica de actualizacion de TABLA DE RUTAS y MAPA
      // Esta la mantenemos mas "quieta" si el usuario esta interactuando para evitar saltos en la tabla de rutas
      const debeActualizarRutas = mostrarSpinner || !isUserSelection || mostrarTodosViajes;

      if (debeActualizarRutas) {
         setRutas(rutasData);

         // Logica de seleccion por defecto (Solo si no hay nada seleccionado aun)
         if (!rutaSeleccionada && rutasData.length > 0) {
            const primeraRuta = rutasData[0];
            setRutaSeleccionada(primeraRuta);
            setMostrarTodosViajes(true); // Mostrar todos los viajes por defecto
            
            // Establecer centro inicial
            if (primeraRuta.latitudInicio && primeraRuta.longitudInicio) {
              setMapCenter({
                lat: parseFloat(primeraRuta.latitudInicio),
                lng: parseFloat(primeraRuta.longitudInicio)
              });
            }
            
            // Cargar puntos
            cargarPuntos(primeraRuta.id);
            
            // Seleccionar primer viaje
            const viajesDeLaRuta = viajesData.filter(v => v.ruta?.id === primeraRuta.id);
            if (viajesDeLaRuta.length > 0) {
              setViajeSeleccionado(viajesDeLaRuta[0]);
            }
         } else if (rutaSeleccionada) {
            // Actualizar objeto de ruta seleccionada si cambio algo (distancia, etc)
            const rutaActualizada = rutasData.find(r => r.id === rutaSeleccionada.id);
            if (rutaActualizada) {
               setRutaSeleccionada(rutaActualizada); 
            }
         }
      } 
      
      setError(null);
    } catch (err) {
      console.error(err);
      if (mostrarSpinner) setError(err.message);
    } finally {
      if (mostrarSpinner) setCargando(false);
    }
  }, [isUserSelection, mostrarTodosViajes, rutaSeleccionada, viajeSeleccionado]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Configurar auto-refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      cargarDatos(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [cargarDatos]);

  const cargarPuntos = async (rutaId) => {
    try {
      const puntosRes = await fetch(`${API_BASE_URL}/puntoruta/ruta/${rutaId}`);
      if (puntosRes.ok) {
        const puntos = await puntosRes.json();
        const puntosOrdenados = puntos.sort((a, b) => a.ordenSecuencia - b.ordenSecuencia);
        setPuntosRuta(puntosOrdenados);
      }
    } catch (e) {
      console.error('Error al cargar puntos:', e);
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
    setIsUserSelection(true); // Marcar como seleccion manual
    setRutaSeleccionada(ruta);
    setMostrarTodosViajes(false);
    
    // Centrar mapa
    if (ruta.latitudInicio && ruta.longitudInicio) {
       setMapCenter({
         lat: parseFloat(ruta.latitudInicio),
         lng: parseFloat(ruta.longitudInicio)
       });
    }
    
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

  const seleccionarViaje = async (viaje) => {
    setIsUserSelection(true); // Marcar como seleccion manual
    setViajeSeleccionado(viaje);
    // Expandir detalles automaticamente al seleccionar
    setExpandirDetallesViaje(true);
    
    // Si el viaje tiene ruta, SIEMPRE actualizar el mapa (incluso si es la misma ruta)
    // Si el viaje tiene ruta, SIEMPRE actualizar el mapa e intentar sincronizar con tabla de rutas
    if (viaje.ruta) {
        let rutaParaSeleccionar = viaje.ruta;

        // Intentar encontrar la ruta en la lista cargada para tener la referencia correcta y hacer scroll
        const rutaEnLista = rutas.find(r => r.id === viaje.ruta.id);
        
        if (rutaEnLista) {
            rutaParaSeleccionar = rutaEnLista;
            
            // Auto-scroll visual a la ruta en la tabla de la izquierda
            setTimeout(() => {
                const element = document.getElementById(`ruta-row-${viaje.ruta.id}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    // Opcional: Destello visual o borde momentaneo
                }
            }, 100);
        }

       setRutaSeleccionada(rutaParaSeleccionar);
       
       // Centrar mapa
       if (viaje.ruta.latitudInicio && viaje.ruta.longitudInicio) {
          setMapCenter({
            lat: parseFloat(viaje.ruta.latitudInicio),
            lng: parseFloat(viaje.ruta.longitudInicio)
          });
       }
       
       // Cargar puntos de la ruta del viaje
       try {
         const res = await fetch(`${API_BASE_URL}/puntoruta/ruta/${viaje.ruta.id}`);
         if (res.ok) {
           const puntos = await res.json();
           const puntosOrdenados = puntos.sort((a, b) => a.ordenSecuencia - b.ordenSecuencia);
           setPuntosRuta(puntosOrdenados);
           
           // Recalcular ruta en mapa
           if (googleLoaded) {
             calcularRuta(viaje.ruta, puntosOrdenados);
           }
         }
       } catch (err) {
         console.error('Error al cargar puntos de ruta del viaje:', err);
       }
    }
  };
  
  const verTodosViajes = () => {
    setIsUserSelection(false); // Volver a modo "ver todo" (permite updates)
    setMostrarTodosViajes(true);
    setViajeSeleccionado(null);
    // Al volver a "ver todos", forzamos una recarga inmediata para tener datos frescos
    cargarDatos(false);
  };

  // Validar si las fechas son invalidas (debe estar antes del filtrado)
  const fechasInvalidas = fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta);

  // Filtrado de viajes
  const viajesFiltrados = viajes.filter(viaje => {
    // Filtro por ruta seleccionada
    if (!mostrarTodosViajes && rutaSeleccionada) {
      if ((viaje.ruta?.id || viaje.rutaId) !== rutaSeleccionada.id) return false;
    }
    
    // Filtro por estado (solo si tipoFiltro es 'estado')
    if (tipoFiltro === 'estado' && filtroEstado !== 'todos' && viaje.estado !== filtroEstado) return false;
    
    // Filtro por busqueda de nombre (siempre activo)
    if (busquedaRuta.trim()) {
      const nombreRuta = viaje.ruta?.nombre?.toLowerCase() || '';
      if (!nombreRuta.includes(busquedaRuta.toLowerCase())) return false;
    }
    
    // Filtro por fecha (solo si tipoFiltro es 'fechas')
    if (tipoFiltro === 'fechas' && !fechasInvalidas) {
      if (fechaDesde) {
        const fechaViaje = new Date(viaje.fechaProgramada || viaje.fechaCreacion);
        const fechaDesdeDate = new Date(fechaDesde);
        fechaDesdeDate.setHours(0, 0, 0, 0);
        if (fechaViaje < fechaDesdeDate) return false;
      }
      if (fechaHasta) {
        const fechaViaje = new Date(viaje.fechaProgramada || viaje.fechaCreacion);
        const fechaHastaDate = new Date(fechaHasta);
        fechaHastaDate.setHours(23, 59, 59, 999);
        if (fechaViaje > fechaHastaDate) return false;
      }
    }
    
    // Filtro por organizador (solo si tipoFiltro es 'organizador')
    if (tipoFiltro === 'organizador' && filtroOrganizador !== 'todos') {
      if (!viaje.organizador || viaje.organizador.id !== parseInt(filtroOrganizador)) return false;
    }
    
    return true;
  }).sort((a, b) => {
    const { columna, direccion } = ordenViajes;
    let valorA, valorB;
    
    switch (columna) {
      case 'ruta':
        valorA = (a.ruta?.nombre || 'Sin nombre').toLowerCase();
        valorB = (b.ruta?.nombre || 'Sin nombre').toLowerCase();
        break;
      case 'participantes':
        valorA = a.participantes?.length || 0;
        valorB = b.participantes?.length || 0;
        break;
      case 'estado':
        valorA = (a.estado || '').toLowerCase();
        valorB = (b.estado || '').toLowerCase();
        break;
      case 'fecha': // Opcional, aunque no esta en la tabla visible, util para orden default
        valorA = new Date(a.fechaProgramada || a.fechaCreacion).getTime();
        valorB = new Date(b.fechaProgramada || b.fechaCreacion).getTime();
        break;
      default:
        return 0;
    }
    
    if (typeof valorA === 'string') {
      return direccion === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    }
    return direccion === 'asc' ? valorA - valorB : valorB - valorA;
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

  // Lógica para filtro de organizadores de viajes
  const organizadoresUnicos = React.useMemo(() => {
    const organizadores = new Set();
    viajes.forEach(viaje => {
      if (viaje.organizador) {
        const nombreCompleto = `${viaje.organizador.nombre || ''} ${viaje.organizador.apellido || ''}`.trim();
        if (nombreCompleto) organizadores.add(JSON.stringify({ id: viaje.organizador.id, nombre: nombreCompleto }));
      }
    });
    return Array.from(organizadores).map(o => JSON.parse(o));
  }, [viajes]);

  // Función para limpiar filtros de fecha
  const limpiarFiltrosFecha = () => {
    setFechaDesde('');
    setFechaHasta('');
  };

  const rutasFiltradas = rutas.filter(ruta => {
    // Filtro por creador
    if (filtroCreador !== 'todos') {
      if (!ruta.creador) return false;
      if (ruta.creador.id !== parseInt(filtroCreador)) return false;
    }
    // Filtro por nombre
    if (busquedaNombreRuta.trim()) {
      const nombreRuta = ruta.nombre?.toLowerCase() || '';
      if (!nombreRuta.includes(busquedaNombreRuta.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => {
    const { columna, direccion } = ordenRutas;
    let valorA, valorB;
    
    switch (columna) {
      case 'nombre':
        valorA = (a.nombre || 'Sin nombre').toLowerCase();
        valorB = (b.nombre || 'Sin nombre').toLowerCase();
        break;
      case 'distancia':
        valorA = parseFloat(a.distanciaEstimadaKm || 0);
        valorB = parseFloat(b.distanciaEstimadaKm || 0);
        break;
      default:
        return 0;
    }
    
    if (typeof valorA === 'string') {
      return direccion === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    }
    return direccion === 'asc' ? valorA - valorB : valorB - valorA;
  });

  // Calcular estadisticas
  // Calcular estadisticas (USAR DATOS 'REAL' PARA QUE SIEMPRE SE ACTUALICEN)
  const totalViajes = viajesReal.length > 0 ? viajesReal.length : viajes.length;
  const viajesActivos = (viajesReal.length > 0 ? viajesReal : viajes).filter(v => v.estado === 'en_curso').length;
  const viajesProgramados = (viajesReal.length > 0 ? viajesReal : viajes).filter(v => v.estado === 'programado').length;
  const totalParticipantes = (viajesReal.length > 0 ? viajesReal : viajes).reduce((sum, v) => sum + (v.participantes?.length || 0), 0);
  const kmTotales = (rutasReal.length > 0 ? rutasReal : rutas).reduce((sum, r) => sum + (parseFloat(r.distanciaEstimadaKm) || 0), 0);

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
            <span className="stat-value">{rutasReal.length > 0 ? rutasReal.length : rutas.length}</span>
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

              {/* Filtro de Creador y Busqueda */}
              <div className="filtros-container">
                <select
                  className="filtro-select"
                  value={filtroCreador}
                  onChange={(e) => setFiltroCreador(e.target.value)}
                >
                  <option value="todos">Todos los creadores</option>
                  {creadoresUnicos.map(creador => (
                    <option key={creador.id} value={creador.id}>
                      {creador.nombre}
                    </option>
                  ))}
                </select>
                <input 
                  type="text"
                  className="filtro-input"
                  placeholder="Buscar por nombre..."
                  value={busquedaNombreRuta}
                  onChange={(e) => setBusquedaNombreRuta(e.target.value)}
                />
              </div>
              
              <div className="table-scroll-container table-scroll-rutas">
                <table className="routes-table">
                  <thead>
                    <tr>
                      <th className="th-sortable header-orange" onClick={() => ordenarRutasPor('nombre')}>
                        Nombre <IconoOrden activo={ordenRutas.columna === 'nombre'} direccion={ordenRutas.direccion} />
                      </th>
                      <th className="th-sortable header-orange" onClick={() => ordenarRutasPor('distancia')}>
                        Distancia <IconoOrden activo={ordenRutas.columna === 'distancia'} direccion={ordenRutas.direccion} />
                      </th>
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
                          id={`ruta-row-${ruta.id}`}
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
            <GraficoTopRutas rutas={rutasReal.length > 0 ? rutasReal : rutas} viajes={viajesReal.length > 0 ? viajesReal : viajes} />
          </div>

          {/* COLUMNA 2: Mapa y Detalles (Centro) */}
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
                        <span>{expandirDetallesViaje ? 'Cerrar Detalles (Ver Mapa)' : 'Detalles del Viaje'}</span>
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
                              <div 
                                className="punto-item-mini inicio"
                                onClick={() => {
                                  if (rutaSeleccionada?.latitudInicio) {
                                    setMapCenter({
                                      lat: parseFloat(rutaSeleccionada.latitudInicio),
                                      lng: parseFloat(rutaSeleccionada.longitudInicio)
                                    });
                                    setExpandirDetallesViaje(false);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
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
                                  <div 
                                    key={punto.id} 
                                    className={`punto-item-mini ${isServicio ? 'servicio' : 'paso'}`}
                                    onClick={() => {
                                      if (punto.latitud) {
                                        setMapCenter({
                                          lat: parseFloat(punto.latitud),
                                          lng: parseFloat(punto.longitud)
                                        });
                                        setExpandirDetallesViaje(false);
                                      }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
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
                              <div 
                                className="punto-item-mini destino"
                                onClick={() => {
                                  if (rutaSeleccionada?.latitudFin) {
                                    setMapCenter({
                                      lat: parseFloat(rutaSeleccionada.latitudFin),
                                      lng: parseFloat(rutaSeleccionada.longitudFin)
                                    });
                                    setExpandirDetallesViaje(false);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
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
                  <div className="google-mapa-container" style={{ display: expandirDetallesViaje ? 'none' : 'block' }}>
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
                        center={mapCenter || {
                          lat: rutaSeleccionada?.latitudInicio ? parseFloat(rutaSeleccionada.latitudInicio) : -2.1710,
                          lng: rutaSeleccionada?.longitudInicio ? parseFloat(rutaSeleccionada.longitudInicio) : -79.9224
                        }}
                        zoom={12}
                        mapTypeId={tipoMapa}
                        options={{
                          zoomControl: false,
                          streetViewControl: false,
                          mapTypeControl: false,
                          fullscreenControl: false,
                          styles: theme === 'dark' ? darkMapStyles : []
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
                            onClick={() => setMapCenter({
                              lat: parseFloat(rutaSeleccionada.latitudInicio),
                              lng: parseFloat(rutaSeleccionada.longitudInicio)
                            })}
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
                              onClick={() => setMapCenter({
                                lat: parseFloat(punto.latitud),
                                lng: parseFloat(punto.longitud)
                              })}
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
                            onClick={() => setMapCenter({
                              lat: parseFloat(rutaSeleccionada.latitudFin),
                              lng: parseFloat(rutaSeleccionada.longitudFin)
                            })}
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

                    {/* Custom Map Controls Overlay */}
                    <div className="custom-map-controls">
                      <button 
                        className="custom-control-btn"
                        onClick={() => {
                           if (mapRef) {
                             const currentZoom = mapRef.getZoom();
                             mapRef.setZoom(currentZoom + 1);
                           }
                        }}
                        title="Acercar"
                      >
                        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                      </button>
                      <button 
                        className="custom-control-btn"
                        onClick={() => {
                          if (mapRef) {
                            const currentZoom = mapRef.getZoom();
                            mapRef.setZoom(currentZoom - 1);
                          }
                        }}
                        title="Alejar"
                      >
                         <svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                      </button>
                      <button 
                        className="custom-control-btn"
                        onClick={() => {
                          const mapContainer = document.querySelector('.google-mapa-container');
                          if (mapContainer) {
                            if (!document.fullscreenElement) {
                              mapContainer.requestFullscreen().catch(err => {
                                console.error(`Error attempting to enable fullscreen: ${err.message}`);
                              });
                            } else {
                              document.exitFullscreen();
                            }
                          }
                        }}
                        title="Pantalla Completa"
                      >
                         <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                      </button>
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
            {/* Grafico 2: Tendencia (Debajo del Mapa) */}
            <GraficoTendencia viajes={viajesReal.length > 0 ? viajesReal : viajes} />
          </div>

          {/* COLUMNA 3: Tabla de Viajes (Derecha) */}
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
                <input 
                  type="text"
                  className="filtro-input"
                  placeholder="Buscar ruta..."
                  value={busquedaRuta}
                  onChange={(e) => setBusquedaRuta(e.target.value)}
                />
              </div>
              
              {/* Radio buttons para tipo de filtro */}
              <div className="filtros-container filtros-radio">
                <span className="filtro-radio-label">Filtrar por:</span>
                <label className="filtro-radio-option">
                  <input
                    type="radio"
                    name="tipoFiltro"
                    value="todos"
                    checked={tipoFiltro === 'todos'}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                  />
                  <span>Todos</span>
                </label>
                <label className="filtro-radio-option">
                  <input
                    type="radio"
                    name="tipoFiltro"
                    value="estado"
                    checked={tipoFiltro === 'estado'}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                  />
                  <span>Estado</span>
                </label>
                <label className="filtro-radio-option">
                  <input
                    type="radio"
                    name="tipoFiltro"
                    value="fechas"
                    checked={tipoFiltro === 'fechas'}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                  />
                  <span>Rango Fechas</span>
                </label>
                <label className="filtro-radio-option">
                  <input
                    type="radio"
                    name="tipoFiltro"
                    value="organizador"
                    checked={tipoFiltro === 'organizador'}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                  />
                  <span>Organizador</span>
                </label>
              </div>
              
              {/* Filtro de Estado */}
              {tipoFiltro === 'estado' && (
                <div className="filtros-container filtros-dinamico">
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
                </div>
              )}
              
              {/* Filtro de Fechas */}
              {tipoFiltro === 'fechas' && (
                <div className="filtros-container filtros-dinamico filtros-fecha">
                  <div className="filtro-fecha-grupo">
                    <label className="filtro-fecha-label">Desde:</label>
                    <input
                      type="date"
                      className={`filtro-fecha-input ${fechasInvalidas ? 'fecha-invalida' : ''}`}
                      value={fechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      max={fechaHasta || undefined}
                    />
                  </div>
                  <div className="filtro-fecha-grupo">
                    <label className="filtro-fecha-label">Hasta:</label>
                    <input
                      type="date"
                      className={`filtro-fecha-input ${fechasInvalidas ? 'fecha-invalida' : ''}`}
                      value={fechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
                      min={fechaDesde || undefined}
                    />
                  </div>
                  {(fechaDesde || fechaHasta) && (
                    <button 
                      className="filtro-btn filtro-btn-limpiar"
                      onClick={limpiarFiltrosFecha}
                    >
                      Limpiar
                    </button>
                  )}
                  {fechasInvalidas && (
                    <span className="filtro-fecha-error">
                      Rango invalido
                    </span>
                  )}
                </div>
              )}
              
              {/* Filtro de Organizador */}
              {tipoFiltro === 'organizador' && (
                <div className="filtros-container filtros-dinamico">
                  <select
                    className="filtro-select"
                    value={filtroOrganizador}
                    onChange={(e) => setFiltroOrganizador(e.target.value)}
                  >
                    <option value="todos">Todos organizadores</option>
                    {organizadoresUnicos.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="table-scroll-container table-scroll-viajes">
                <table className="routes-table">
                  <thead>
                    <tr>
                      <th className="th-sortable header-orange" onClick={() => ordenarViajesPor('ruta')}>
                        Ruta <IconoOrden activo={ordenViajes.columna === 'ruta'} direccion={ordenViajes.direccion} />
                      </th>
                      <th className="th-sortable header-orange" onClick={() => ordenarViajesPor('participantes')}>
                         Part. <IconoOrden activo={ordenViajes.columna === 'participantes'} direccion={ordenViajes.direccion} />
                      </th>
                      <th className="th-sortable header-orange" onClick={() => ordenarViajesPor('estado')}>
                        Estado <IconoOrden activo={ordenViajes.columna === 'estado'} direccion={ordenViajes.direccion} />
                      </th>
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
                          onClick={() => seleccionarViaje(viaje)}
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
            {/* Grafico 3: Estado (Debajo de la tabla de Viajes) */}
            <GraficoEstado viajes={viajes} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rutas;
