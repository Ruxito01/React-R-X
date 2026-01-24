import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './DashboardGeneral.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';
import AuthLoadingScreen from '../components/AuthLoadingScreen';
import BotonPdfFlotante from '../components/BotonPdfFlotante';

import { GoogleMap, useJsApiLoader, HeatmapLayerF } from '@react-google-maps/api';

// Componente para manejar avatar de comunidad con fallback
const CommunityAvatar = ({ url, nombre }) => {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div className="foto-placeholder" style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
        {nombre ? nombre.charAt(0).toUpperCase() : '👥'}
      </div>
    );
  }

  return (
    <img 
      src={url} 
      alt={nombre} 
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};

const DashboardGeneral = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Mover libraries fuera del componente o usar useMemo para evitar re-renders infinitos
  const [libraries] = useState(['places', 'visualization']);
  
  // Referencias para controlar el mapa
  const mapRef = React.useRef(null);
  const hasCentered = React.useRef(false);

  // Hook para cargar la API de Google Maps de forma global y segura
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries
  });

  // Estilos de mapa oscuro (reutilizado simplificado)
  const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
  ];

  // Estilos de mapa claro (Silver/Gris suave para dashboard)
  const lightMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
  ];

  // Estados para datos
  const [usuarios, setUsuarios] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [rutas, setRutas] = useState([]); // Para heatmap
  const [loading, setLoading] = useState(true);
  // Nuevo estado para datos de carga lenta (viajes y vehículos)
  const [loadingBackground, setLoadingBackground] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para pantalla de carga inicial (login con Google)
  const [mostrarLoadingScreen, setMostrarLoadingScreen] = useState(
    sessionStorage.getItem('show_loading_screen') === 'true'
  );
  
  // Estado para autenticacion pendiente
  // Si hay token pendiente, esperar a procesarlo; si no, ya estamos listos
  const [authProcesada, setAuthProcesada] = useState(
    !sessionStorage.getItem('google_access_token')
  );

  // Estado para ultima actualizacion
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Estado para ordenamiento de rutas
  const [ordenamiento, setOrdenamiento] = useState({ columna: 'fecha', direccion: 'desc' });

  // Estados para tooltips de graficas
  const [tooltipTacometro, setTooltipTacometro] = useState(false);
  const [tooltipViaje, setTooltipViaje] = useState({ visible: false, index: null, x: 0, y: 0 });
  const [tooltipVehiculo, setTooltipVehiculo] = useState({ visible: false, tipoId: null });
  
  // Funcion para cambiar ordenamiento
  const ordenarPor = (columna) => {
    setOrdenamiento(prev => ({
      columna,
      direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Componente icono de orden
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

  // Scroll to top al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Timeout de seguridad: ocultar pantalla de carga despues de 10 segundos
  useEffect(() => {
    if (mostrarLoadingScreen) {
      const timeout = setTimeout(() => {
        console.warn('Timeout: ocultando pantalla de carga por seguridad');
        sessionStorage.removeItem('show_loading_screen');
        setMostrarLoadingScreen(false);
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [mostrarLoadingScreen]);
  
  // Procesar token de Google si existe
  useEffect(() => {
    const procesarAuthGoogle = async () => {
      const accessToken = sessionStorage.getItem('google_access_token');
      
      if (!accessToken) {
        setAuthProcesada(true);
        return;
      }
      
      try {
        // Obtener info del usuario desde Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const userInfo = await userInfoResponse.json();
        console.log('Usuario de Google:', userInfo.email);

        // Verificar usuario en el backend
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/usuario/email/${userInfo.email}`);

        if (response.status === 404) {
          console.error('Cuenta no registrada');
          sessionStorage.removeItem('google_access_token');
          sessionStorage.removeItem('show_loading_screen');
          navigate('/', { replace: true });
          return;
        }

        if (!response.ok) {
          console.error('Error de servidor');
          sessionStorage.removeItem('google_access_token');
          sessionStorage.removeItem('show_loading_screen');
          navigate('/', { replace: true });
          return;
        }

        const usuario = await response.json();
        console.log('Usuario verificado:', usuario.nombre, '- Rol:', usuario.rol);

        // Verificar rol ADMIN
        if (usuario.rol !== 'ADMIN') {
          console.error('Acceso denegado - No es admin');
          sessionStorage.removeItem('google_access_token');
          sessionStorage.removeItem('show_loading_screen');
          navigate('/', { replace: true });
          return;
        }

        // Guardar usuario
        const authService = (await import('../services/authService')).default;
        authService.saveUser(usuario);
        
        // Limpiar token temporal
        sessionStorage.removeItem('google_access_token');
        
        console.log('Autenticacion exitosa');
        setAuthProcesada(true);
        
      } catch (err) {
        console.error('Error procesando autenticacion:', err);
        sessionStorage.removeItem('google_access_token');
        sessionStorage.removeItem('show_loading_screen');
        setMostrarLoadingScreen(false);
        navigate('/', { replace: true });
      }
    };
    
    procesarAuthGoogle();
  }, [navigate]);

  // Funcion para cargar datos optimizada (Paralelismo Total)
  const fetchData = async (mostrarLoading = true) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Si es carga inicial o manual, mostrar estados de carga
    if (mostrarLoading) {
      if (usuarios.length === 0) setLoading(true);
      setLoadingBackground(true);
    }

    try {
      // Definir promesas Base (Criticas para UI principal)
      const pUsuarios = fetch(`${apiUrl}/usuario`).then(res => res.ok ? res.json() : []);
      const pComunidades = fetch(`${apiUrl}/comunidad`).then(res => res.ok ? res.json() : []);
      const pTipos = fetch(`${apiUrl}/tipovehiculo`).then(res => res.ok ? res.json() : []);

      // Definir promesas Background (Datos pesados o secundarios)
      // AHORA OPTIMIZADOS: Solo traemos lo necesario del backend
      const pViajes = fetch(`${apiUrl}/viaje/recientes?dias=7`).then(res => res.ok ? res.json() : []);
      const pVehiculos = fetch(`${apiUrl}/vehiculo/conteo-tipos`).then(res => res.ok ? res.json() : []);

      // --- GRUPO 1: Datos Base (Usuarios, Tipos, Lista Comunidades) ---
      // Se ejecutan y desbloquean setLoading lo antes posible
      const promesaBase = Promise.all([pUsuarios, pComunidades, pTipos])
        .then(([usuariosData, comunidadesData, tiposData]) => {
          setUsuarios(usuariosData);
          setTiposVehiculo(tiposData);
          
          // EVITAR PARPADEO: Solo actualizar la lista base parcial si es carga inicial.
          // Si es un refresh automatico, esperamos a tener los miembros para no mostrar "0 miembros" momentaneamente.
          if (mostrarLoading) {
            setComunidades(comunidadesData);
          }
           
          setLoading(false); // Desbloquear UI principal

          // Ocultar pantalla de carga auth si sigue activa
          if (sessionStorage.getItem('show_loading_screen') === 'true') {
            sessionStorage.removeItem('show_loading_screen');
            setMostrarLoadingScreen(false);
          }

          // Iniciar carga de detalles de comunidad (miembros) en background
          // NO bloquea setLoading ni setLoadingBackground
          if (comunidadesData.length > 0) {
            Promise.all(comunidadesData.map(async (c) => {
              try {
                const res = await fetch(`${apiUrl}/comunidad/${c.id}/miembros`);
                const miembros = res.ok ? await res.json() : [];
                return { ...c, miembros };
              } catch {
                return { ...c, miembros: [] };
              }
            })).then(comunidadesCompletas => {
              setComunidades(comunidadesCompletas);
            });
          }
        })
        .catch(err => {
          console.error('Error en datos base:', err);
          setError('Error cargando datos principales');
          setLoading(false);
        });

      // --- GRUPO 2: Datos Background (Viajes, Vehiculos, Rutas para Heatmap) ---
      // Se ejecutan en paralelo al Grupo 1, no esperan a nadie
      // Agregamos fetch de TODAS las rutas para el heatmap
      const pRutas = fetch(`${apiUrl}/ruta`).then(res => res.ok ? res.json() : []);

      const promesaBackground = Promise.all([pViajes, pVehiculos, pRutas])
        .then(([viajesData, vehiculosData, rutasData]) => {
          setViajes(viajesData);
          setVehiculos(vehiculosData); // Ahora es [{tipo: "Sedan", cantidad: 10}, ...]
          setRutas(rutasData); // Guardamos rutas para el heatmap
          setUltimaActualizacion(new Date());
        })
        .catch(err => console.error('Error viajes/vehiculos/rutas:', err))
        .finally(() => {
          setLoadingBackground(false); // Desbloquear UI secundaria
        });

      // Esperar a que ambas ramas principales inicien (await aqui espera a que los .then internos terminen)
      await Promise.all([promesaBase, promesaBackground]);
      
    } catch (err) {
      console.error('Error global fetchData:', err);
      // Fallback para quitar loadings en caso de error catastrofico
      setLoading(false);
      setLoadingBackground(false);
    }
  };

  // Funcion para actualizar solo usuarios (rapida, cada 2 segundos)
  const fetchUsuariosRapido = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${apiUrl}/usuario`);
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (err) {
      console.error('Error actualizando usuarios:', err);
    }
  };

  // Cargar datos iniciales y configurar auto-refresh (solo cuando auth esta procesada)
  useEffect(() => {
    // No cargar datos hasta que la autenticacion se procese
    if (!authProcesada) return;
    
    fetchData(true); // Mostrar loading la primera vez

    // Auto-refresh rapido para usuarios (cada 2 segundos)
    const intervalUsuarios = setInterval(() => {
      fetchUsuariosRapido();
    }, 2000);

    // Auto-refresh completo cada 5 segundos (rutas, comunidades, vehiculos)
    const intervalCompleto = setInterval(() => {
      fetchData(false); // background update
    }, 5000);

    // Limpiar intervalos al desmontar
    return () => {
      clearInterval(intervalUsuarios);
      clearInterval(intervalCompleto);
    };
  }, [authProcesada]);

  // Calcular usuarios en linea (ultimaActividad en ultimos 15 segundos para mayor reactividad)
  const usuariosEnLinea = usuarios.filter(u => {
    if (!u.ultimaActividad) return false;
    const hace15Seg = new Date(Date.now() - 15 * 1000);
    return new Date(u.ultimaActividad) > hace15Seg;
  });

  // Filtrar y ordenar viajes (AHORA SOLO ORDENAMOS, YA VIENEN FILTRADOS DEL BACKEND)
  const viajesRecientes = [...viajes].sort((a, b) => { // Clonar para no mutar estado
      const { columna, direccion } = ordenamiento;
      let valorA, valorB;
      
      switch (columna) {
        case 'nombre':
          valorA = (a.ruta?.nombre || 'Sin nombre').toLowerCase();
          valorB = (b.ruta?.nombre || 'Sin nombre').toLowerCase();
          break;
        case 'codigo':
          valorA = (a.codigoInvitacion || '').toLowerCase();
          valorB = (b.codigoInvitacion || '').toLowerCase();
          break;
        case 'estado':
          valorA = (a.estado || '').toLowerCase();
          valorB = (b.estado || '').toLowerCase();
          break;
        case 'fecha':
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

  // Calcular viajes por día para el gráfico de picos
  const obtenerViajesPorDia = () => {
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const datos = [];
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      fecha.setHours(0, 0, 0, 0);
      
      const siguienteDia = new Date(fecha);
      siguienteDia.setDate(siguienteDia.getDate() + 1);
      
      const cantidad = viajes.filter(v => {
        const fechaViaje = new Date(v.fechaProgramada || v.fechaCreacion);
        return fechaViaje >= fecha && fechaViaje < siguienteDia;
      }).length;
      
      datos.push({
        dia: diasSemana[fecha.getDay()],
        fecha: `${fecha.getDate()}/${fecha.getMonth() + 1}`,
        cantidad
      });
    }
    return datos;
  };

  const viajesPorDia = obtenerViajesPorDia();
  const maxViajesDia = Math.max(...viajesPorDia.map(d => d.cantidad), 1);

  // Calcular conteo de vehiculos por tipo (AHORA BUSCAMOS EN EL MAPA DE CONTEOS)
  const getVehiculosCount = (nombreTipo) => {
    // vehiculos es ahora [{tipo: 'Sedan', cantidad: 5}, ...]
    const encontrado = vehiculos.find(v => v.tipo === nombreTipo);
    return encontrado ? encontrado.cantidad : 0;
  };
  
  // Calcular total de vehiculos desde los conteos
  const totalVehiculos = vehiculos.reduce((acc, curr) => acc + (parseInt(curr.cantidad) || 0), 0);

  // Calcular max para grafico de barras
  const maxTipoCount = Math.max(...tiposVehiculo.map(t => getVehiculosCount(t.nombre)), 1);


  // Guardar referencia del mapa al cargar
  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  // Efecto para centrar el mapa UNA sola vez cuando lleguen las rutas
  useEffect(() => {
    if (rutas.length > 0 && mapRef.current && !hasCentered.current) {
      // Calcular centro
      let latSum = 0;
      let lngSum = 0;
      let count = 0;
  
      rutas.forEach(r => {
        if (r.latitudInicio && r.longitudInicio) {
          latSum += parseFloat(r.latitudInicio);
          lngSum += parseFloat(r.longitudInicio);
          count++;
        }
      });
  
      if (count > 0) {
        const newCenter = { lat: latSum / count, lng: lngSum / count };
        mapRef.current.panTo(newCenter);
        hasCentered.current = true; // Marcar como centrado para no volver a moverlo
      }
    }
  }, [rutas]);


  const heatmapData = React.useMemo(() => {
    // Verificar que la API de Google Maps esté completamente cargada
    if (!window.google || !window.google.maps || !rutas.length) return [];

    return rutas
      .filter(r => r.latitudInicio && r.longitudInicio)
      .map(r => {
        // Usar la clase LatLng directamente es lo más seguro para HeatmapLayer
        return new window.google.maps.LatLng(
          parseFloat(r.latitudInicio), 
          parseFloat(r.longitudInicio)
        );
      });
  }, [rutas, window.google]); // Recalcular si cambian rutas o se carga google

  // Mostrar pantalla de carga si viene de login con Google
  if (mostrarLoadingScreen) {
    return <AuthLoadingScreen />;
  }

  if (error) {
    return (
      <div className="dashboard-general-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
        <div className="dashboard-general-header">
          <h1>DASHBOARD GENERAL</h1>
        </div>
        <div className="dashboard-general-error">
          <div className="error-icon">⚠</div>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-general-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>



      {/* Tarjetas Resumen */}
      {/* Tarjetas Resumen */}
      <div className="stats-summary dashboard-animate-enter">
        <div className="stat-card">
          <div className="stat-icon icon-users">👥</div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : usuariosEnLinea.length}
            </span>
            <span className="stat-label">Usuarios en línea</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-routes">📍</div>
          <div className="stat-info">
            <span className="stat-value">
              {(loading || loadingBackground) ? <span className="skeleton skeleton-card-value"></span> : viajesRecientes.length}
            </span>
            <span className="stat-label">Rutas (7 días)</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-communities">🏘️</div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : comunidades.length}
            </span>
            <span className="stat-label">Comunidades</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-vehicles">🚗</div>
          <div className="stat-info">
            <span className="stat-value">
              {(loading || loadingBackground) ? <span className="skeleton skeleton-card-value"></span> : totalVehiculos}
            </span>
            <span className="stat-label">Vehículos</span>
          </div>
        </div>
      </div>

      <div className="dashboard-general-content dashboard-animate-enter">
        {/* Fila superior: Usuarios en linea + Rutas recientes */}
        <div className="dashboard-row">
          {/* Usuarios en linea */}
          <div className="dashboard-card usuarios-online">
            <div className="card-header">
              <span className="card-icon">👥</span>
              <h2>Usuarios en Linea</h2>
            </div>
            <div className="card-scroll-area">
              <div 
                className="tacometro-container" 
                id="grafica-general-tacometro"
                onMouseEnter={() => setTooltipTacometro(true)}
                onMouseLeave={() => setTooltipTacometro(false)}
              >
                {loading ? (
                  <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="skeleton skeleton-circle" style={{ width: '100px', height: '100px', borderRadius: '50%', borderBottom: 'transparent' }}></div>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 200 120" className="tacometro-svg">
                      {/* Arco de fondo */}
                      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e0e0e0" strokeWidth="12" strokeLinecap="round" />
                      {/* Arco de progreso */}
                      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#tacometroGradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(usuariosEnLinea.length / Math.max(usuarios.length, 1)) * 251} 251`} className="tacometro-progress" />
                      <defs>
                        <linearGradient id="tacometroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#FFB380" />
                          <stop offset="100%" stopColor="#FF6610" />
                        </linearGradient>
                      </defs>
                      <line x1="20" y1="100" x2="30" y2="100" stroke="#999" strokeWidth="2" />
                      <line x1="180" y1="100" x2="170" y2="100" stroke="#999" strokeWidth="2" />
                      <line x1="100" y1="20" x2="100" y2="30" stroke="#999" strokeWidth="2" />
                      <text x="100" y="85" textAnchor="middle" className="tacometro-numero">
                        {usuariosEnLinea.length}/{usuarios.length}
                      </text>
                      <text x="100" y="105" textAnchor="middle" className="tacometro-label">
                        usuarios activos
                      </text>
                    </svg>
                    {/* Tooltip tacometro */}
                    {tooltipTacometro && (
                      <div className="grafico-tooltip tacometro-tooltip">
                        <div className="tooltip-header">Usuarios en Linea</div>
                        <div className="tooltip-row">
                          <span>Activos:</span>
                          <strong>{usuariosEnLinea.length}</strong>
                        </div>
                        <div className="tooltip-row">
                          <span>Total registrados:</span>
                          <strong>{usuarios.length}</strong>
                        </div>
                        <div className="tooltip-row">
                          <span>Porcentaje:</span>
                          <strong>{usuarios.length > 0 ? ((usuariosEnLinea.length / usuarios.length) * 100).toFixed(1) : 0}%</strong>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="usuarios-lista">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="usuario-item">
                      <div className="skeleton skeleton-circle"></div>
                      <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                    </div>
                  ))
                ) : (
                  usuariosEnLinea.length > 0 ? (
                    usuariosEnLinea.slice(0, 5).map(u => (
                      <div key={u.id} className="usuario-item">
                        <div className="usuario-avatar">
                          {u.foto ? <img src={u.foto} alt={u.nombre} /> : <div className="avatar-placeholder">{u.nombre?.charAt(0)}</div>}
                          <span className="online-dot"></span>
                        </div>
                        <span className="usuario-nombre">{u.nombre} {u.apellido}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">Sin usuarios en linea</p>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Rutas ultimos 7 dias */}
          <div className="dashboard-card rutas-recientes">
            <div className="card-header">
              <span className="card-icon">🗺</span>
              <h2>Rutas ultimos 7 dias</h2>
            </div>

            <div className="card-scroll-area">
              {(loading || loadingBackground) ? (
                <table className="rutas-tabla">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Código</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map(i => (
                      <tr key={i}>
                        <td><div className="skeleton skeleton-text" style={{ width: '80%' }}></div></td>
                        <td><div className="skeleton skeleton-text" style={{ width: '50%' }}></div></td>
                        <td><div className="skeleton skeleton-text" style={{ width: '60%' }}></div></td>
                        <td><div className="skeleton skeleton-text" style={{ width: '70%' }}></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                viajesRecientes.length > 0 ? (
                  <div className="table-scroll-container">
                    <table className="rutas-tabla">
                      <thead>
                        <tr>
                          <th className="th-sortable" onClick={() => ordenarPor('nombre')}>
                            Nombre <IconoOrden columna="nombre" />
                          </th>
                          <th className="th-sortable" onClick={() => ordenarPor('codigo')}>
                            Código <IconoOrden columna="codigo" />
                          </th>
                          <th className="th-sortable" onClick={() => ordenarPor('estado')}>
                            Estado <IconoOrden columna="estado" />
                          </th>
                          <th className="th-sortable" onClick={() => ordenarPor('fecha')}>
                            Fecha <IconoOrden columna="fecha" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {viajesRecientes.map(v => (
                          <tr key={v.id}>
                            <td className="ruta-nombre">{v.ruta?.nombre || 'Sin nombre'}</td>
                            <td className="ruta-codigo">{v.codigoInvitacion || `#${v.id}`}</td>
                            <td><span className="ruta-estado" data-estado={v.estado}>{v.estado}</span></td>
                            <td className="ruta-fecha">{new Date(v.fechaProgramada || v.fechaCreacion).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="no-data">Sin rutas recientes</p>
                )
              )}

              {/* Grafico de picos - Viajes por dia */}
              <div className="grafico-picos" id="grafica-general-viajes">
                <h3 className="grafico-titulo">Viajes por dia</h3>
                <div className="grafico-container grafico-interactivo">
                  {(loading || loadingBackground) ? (
                    <div className="skeleton" style={{ width: '100%', height: '100px' }}></div>
                  ) : (
                    <svg viewBox="0 0 300 100" className="picos-svg" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGradientViajes" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FF6610" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="#FF6610" stopOpacity="0.05"/>
                        </linearGradient>
                      </defs>
                      <path
                        d={`M 0 100 ${viajesPorDia.map((d, i) => {
                          const x = (i / 6) * 300;
                          const y = 100 - (d.cantidad / maxViajesDia) * 80;
                          return `L ${x} ${y}`;
                        }).join(' ')} L 300 100 Z`}
                        fill="url(#areaGradientViajes)"
                      />
                      <path
                        d={`M ${viajesPorDia.map((d, i) => {
                          const x = (i / 6) * 300;
                          const y = 100 - (d.cantidad / maxViajesDia) * 80;
                          return `${i === 0 ? '' : 'L '}${x} ${y}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke="#FF6610"
                        strokeWidth="2"
                      />
                      {viajesPorDia.map((d, i) => {
                        const x = (i / 6) * 300;
                        const y = 100 - (d.cantidad / maxViajesDia) * 80;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="4" fill="#FF6610" />
                            <circle cx={x} cy={y} r="6" fill="none" stroke="#FF6610" strokeWidth="1" opacity="0.5" />
                          </g>
                        );
                      })}
                    </svg>
                  )}
                  
                  {/* Labels con hover para tooltip */}
                  <div className="grafico-labels">
                    {viajesPorDia.map((d, i) => (
                      <div 
                        key={i} 
                        className={`grafico-label label-interactivo ${tooltipViaje.index === i ? 'label-activo' : ''}`}
                        onMouseEnter={() => setTooltipViaje({ visible: true, index: i })}
                        onMouseLeave={() => setTooltipViaje({ visible: false, index: null })}
                      >
                        <span className="label-cantidad">{d.cantidad}</span>
                        <span className="label-dia">{d.dia}</span>
                        <span className="label-fecha">{d.fecha}</span>
                        {/* Tooltip individual */}
                        {tooltipViaje.visible && tooltipViaje.index === i && (
                          <div className="grafico-tooltip viaje-tooltip">
                            <div className="tooltip-header">{d.dia} {d.fecha}</div>
                            <div className="tooltip-row">
                              <span>Viajes:</span>
                              <strong>{d.cantidad}</strong>
                            </div>
                            <div className="tooltip-row">
                              <span>Promedio diario:</span>
                              <strong>{(viajesPorDia.reduce((a, b) => a + b.cantidad, 0) / 7).toFixed(1)}</strong>
                            </div>
                            {d.cantidad === Math.max(...viajesPorDia.map(x => x.cantidad)) && d.cantidad > 0 && (
                              <div className="tooltip-badge">Dia mas activo</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila inferior: Comunidades + Tipos de vehiculos + Mapa Calor */}
        <div className="dashboard-row three-col">
          {/* Comunidades */}
          <div className="dashboard-card comunidades">
            <div className="card-header">
              <span className="card-icon">👥</span>
              <h2>Comunidades ({comunidades.length})</h2>
            </div>
            <div className="card-scroll-area">
              <div className="comunidades-lista">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="comunidad-card">
                      <div className="comunidad-header">
                        <div className="skeleton skeleton-circle" style={{ width: '70px', height: '70px', borderRadius: '50%' }}></div>
                        <div className="comunidad-info" style={{ flex: 1, gap: '8px' }}>
                          <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                          <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  comunidades.length > 0 ? (
                    comunidades.map(c => (
                      <div key={c.id} className="comunidad-card">
                        <div className="comunidad-header">
                          <div className="comunidad-foto">
                            <CommunityAvatar url={c.urlImagen} nombre={c.nombre} />
                          </div>
                          <div className="comunidad-info">
                            <span className="comunidad-nombre">{c.nombre}</span>
                            <span className="comunidad-miembros-count">{c.miembros?.length || 0} miembros</span>
                          </div>
                        </div>
                        <div className="miembros-stack">
                          {c.miembros && c.miembros.length > 0 ? (
                            <>
                              {c.miembros.slice(0, 5).map((m, idx) => (
                                <div 
                                  key={m.id || idx} 
                                  className="miembro-avatar"
                                  style={{ zIndex: 5 - idx }}
                                  title={m.nombre ? `${m.nombre} ${m.apellido || ''}` : 'Miembro'}
                                >
                                  {m.foto ? (
                                    <img 
                                      src={m.foto} 
                                      alt={m.nombre}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <span style={{ display: m.foto ? 'none' : 'flex' }}>
                                    {m.nombre?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              ))}
                              {c.miembros.length > 5 && (
                                <div className="miembro-avatar miembro-more">
                                  +{c.miembros.length - 5}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="sin-miembros">Sin miembros</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">Sin comunidades</p>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Tipos de vehiculos (grafico de barras) */}
          <div className="dashboard-card tipos-vehiculos">
            <div className="card-header">
              <span className="card-icon">🚗</span>
              <h2>Tipos de Vehiculos</h2>
            </div>
            <div className="card-scroll-area">
              <div className="tipos-chart" id="grafica-general-vehiculos">
                {(loading || loadingBackground) ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="tipo-bar-wrapper">
                      <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
                      <div className="skeleton" style={{ width: '100%', height: '28px', borderRadius: '14px' }}></div>
                    </div>
                  ))
                ) : (
                  tiposVehiculo.length > 0 ? (
                    tiposVehiculo.map(tipo => {
                      const count = getVehiculosCount(tipo.nombre);
                      const percentage = maxTipoCount > 0 ? (count / maxTipoCount) * 100 : 0;
                      // const porcentajeTotal = totalVehiculos > 0 ? ((count / totalVehiculos) * 100).toFixed(1) : 0; // Unused
                      return (
                        <div 
                          key={tipo.id} 
                          className={`tipo-bar-wrapper tipo-interactivo ${tooltipVehiculo.tipoId === tipo.id ? 'tipo-activo' : ''}`}
                          onMouseEnter={() => setTooltipVehiculo({ visible: true, tipoId: tipo.id })}
                          onMouseLeave={() => setTooltipVehiculo({ visible: false, tipoId: null })}
                        >
                          <span className="tipo-nombre">{tipo.nombre}</span>
                          <div className="tipo-bar-container">
                            <div 
                              className="tipo-bar" 
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            ></div>
                            <span className="tipo-count">{count}</span>
                          </div>
                          {/* Tooltip vehiculo */}
                          {tooltipVehiculo.visible && tooltipVehiculo.tipoId === tipo.id && (
                            <div className="grafico-tooltip vehiculo-tooltip">
                              <div className="tooltip-header">{tipo.nombre}</div>
                              <div className="tooltip-row">
                                <span>Cantidad:</span>
                                <strong>{count} vehiculos</strong>
                              </div>
                              <div className="tooltip-row">
                                <span>Del total:</span>
                                <strong>{totalVehiculos > 0 ? ((count / totalVehiculos) * 100).toFixed(1) : 0}%</strong>
                              </div>
                              {count === Math.max(...tiposVehiculo.map(t => getVehiculosCount(t.nombre))) && count > 0 && (
                                <div className="tooltip-badge">Tipo mas popular</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-data">Sin tipos de vehiculo</p>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Mapa de Calor - Zonas de Rutas (NUEVO) */}
          <div className="dashboard-card mapa-calor">
              <div className="card-header">
                  <span className="card-icon">🔥</span>
                  <h2>Zonas de Rutas</h2>
              </div>
              <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden', position:'relative' }}>
                  {(loading || loadingBackground || !isLoaded) ? (
                      <div className="skeleton" style={{width:'100%', height:'100%'}}></div>
                  ) : (
                      <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '100%' }}
                          defaultCenter={{ lat: -0.180653, lng: -78.467834 }} // Centro inicial (Quito)
                          zoom={10}
                          onLoad={onMapLoad}
                          options={{
                              disableDefaultUI: true,
                              styles: theme === 'dark' ? darkMapStyles : lightMapStyles,
                              zoomControl: true,
                          }}
                      >
                          {heatmapData.length > 0 && (
                              <HeatmapLayerF
                                  data={heatmapData}
                                  options={{
                                      radius: 40, // Radio aumentado para mejor visibilidad
                                      opacity: 0.9,
                                      gradient: [
                                          'rgba(255, 165, 0, 0)',   // Transparente Naranja
                                          'rgba(255, 200, 50, 0.8)', // Amarillo Naranja
                                          'rgba(255, 140, 0, 1)',   // Naranja Oscuro
                                          'rgba(255, 69, 0, 1)',    // Rojo Naranja
                                          'rgba(255, 0, 0, 1)'      // Rojo intenso
                                      ]
                                  }}
                              />
                          )}
                      </GoogleMap>
                  )}
              </div>
          </div>
        </div>

      </div>

      {/* Boton flotante para exportar PDF */}
      <BotonPdfFlotante />
    </div>
  );
};
export default DashboardGeneral;
