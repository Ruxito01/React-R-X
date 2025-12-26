import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardGeneral.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';
import AuthLoadingScreen from '../components/AuthLoadingScreen';

const DashboardGeneral = () => {
  const navigate = useNavigate();
  
  // Estados para datos
  const [usuarios, setUsuarios] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [viajes, setViajes] = useState([]);
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

  // Funcion para cargar datos de forma progresiva
  // Carga rapida primero (usuarios, comunidades, tipos), luego datos lentos en background
  const fetchData = async (mostrarLoading = true) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    try {
      if (mostrarLoading) {
        if (usuarios.length === 0) setLoading(true);
        // Si vamos a cargar datos, asumimos que background también carga
        setLoadingBackground(true);
      }
      
      // FASE 1: Cargar datos rapidos primero (< 1 seg)
      const [usuariosRes, comunidadesRes, tiposRes] = await Promise.all([
        fetch(`${apiUrl}/usuario`),
        fetch(`${apiUrl}/comunidad`),
        fetch(`${apiUrl}/tipovehiculo`)
      ]);

      if (!usuariosRes.ok || !comunidadesRes.ok || !tiposRes.ok) {
        throw new Error('Error al cargar datos basicos');
      }

      const [usuariosData, comunidadesData, tiposData] = await Promise.all([
        usuariosRes.json(),
        comunidadesRes.json(),
        tiposRes.json()
      ]);

      // Mostrar datos basicos inmediatamente
      setUsuarios(usuariosData);
      setTiposVehiculo(tiposData);
      setLoading(false); // Quitar loading principal aqui
      
      // Ocultar pantalla de carga de autenticacion
      if (sessionStorage.getItem('show_loading_screen') === 'true') {
        sessionStorage.removeItem('show_loading_screen');
        setMostrarLoadingScreen(false);
      }

      // FASE 2: Cargar miembros de comunidades en paralelo
      const comunidadesConMiembros = await Promise.all(
        comunidadesData.map(async (comunidad) => {
          try {
            const miembrosRes = await fetch(`${apiUrl}/comunidad/${comunidad.id}/miembros`);
            if (miembrosRes.ok) {
              const miembrosData = await miembrosRes.json();
              return { ...comunidad, miembros: miembrosData };
            }
          } catch (e) {
            console.error(`Error cargando miembros de comunidad ${comunidad.id}:`, e);
          }
          return { ...comunidad, miembros: [] };
        })
      );
      setComunidades(comunidadesConMiembros);

      // FASE 3: Cargar datos lentos en background (viajes y vehiculos)
      // No bloqueamos la UI, se actualizan cuando esten listos
      Promise.all([
        fetch(`${apiUrl}/viaje`).then(res => res.ok ? res.json() : []),
        fetch(`${apiUrl}/vehiculo`).then(res => res.ok ? res.json() : [])
      ]).then(([viajesData, vehiculosData]) => {
        setViajes(viajesData);
        setVehiculos(vehiculosData);
        setUltimaActualizacion(new Date());
      }).catch(err => {
        console.error('Error cargando viajes/vehiculos:', err);
      }).finally(() => {
        setLoadingBackground(false); // Datos background listos
      });

      setError(null);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      // Ocultar pantalla de carga en caso de error tambien
      if (sessionStorage.getItem('show_loading_screen') === 'true') {
        sessionStorage.removeItem('show_loading_screen');
        setMostrarLoadingScreen(false);
      }
      setLoading(false);
      setLoadingBackground(false);
    }
  };

  // Cargar datos iniciales y configurar auto-refresh (solo cuando auth esta procesada)
  useEffect(() => {
    // No cargar datos hasta que la autenticacion se procese
    if (!authProcesada) return;
    
    fetchData(true); // Mostrar loading la primera vez

    // Auto-refresh cada 5 segundos
    const intervalId = setInterval(() => {
      fetchData(false); // background update
    }, 5000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [authProcesada]);

  // Calcular usuarios en linea (ultimaActividad en ultimos 30 segundos)
  const usuariosEnLinea = usuarios.filter(u => {
    if (!u.ultimaActividad) return false;
    const hace30Seg = new Date(Date.now() - 30 * 1000);
    return new Date(u.ultimaActividad) > hace30Seg;
  });

  // Filtrar y ordenar viajes de los ultimos 7 dias
  const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const viajesRecientes = viajes
    .filter(v => {
      const fecha = new Date(v.fechaProgramada || v.fechaCreacion);
      return fecha > hace7Dias;
    })
    .sort((a, b) => {
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

  // Calcular conteo de vehiculos por tipo
  const getVehiculosCount = (tipoId) => {
    return vehiculos.filter(v => v.tipoVehiculo?.id === tipoId && v.estado === 'en_posesion').length;
  };

  // Calcular max para grafico de barras
  const maxTipoCount = Math.max(...tiposVehiculo.map(t => getVehiculosCount(t.id)), 1);

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
              {(loading || loadingBackground) ? <span className="skeleton skeleton-card-value"></span> : vehiculos.length}
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
              <span className="card-icon">🟢</span>
              <h2>Usuarios en Linea</h2>
            </div>
            <div className="card-scroll-area">
              <div className="tacometro-container">
                {loading ? (
                  <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="skeleton skeleton-circle" style={{ width: '100px', height: '100px', borderRadius: '50%', borderBottom: 'transparent' }}></div>
                  </div>
                ) : (
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

              {/* Gráfico de picos - Viajes por día */}
              <div className="grafico-picos">
                <h3 className="grafico-titulo">Viajes por día</h3>
                <div className="grafico-container">
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
                  
                  <div className="grafico-labels">
                    {viajesPorDia.map((d, i) => (
                      <div key={i} className="grafico-label">
                        <span className="label-cantidad">{d.cantidad}</span>
                        <span className="label-dia">{d.dia}</span>
                        <span className="label-fecha">{d.fecha}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila inferior: Comunidades + Tipos de vehiculos */}
        <div className="dashboard-row">
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
                            {c.urlImagen ? (
                              <img src={c.urlImagen} alt={c.nombre} />
                            ) : (
                              <div className="foto-placeholder">👥</div>
                            )}
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
              <div className="tipos-chart">
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
                      const count = getVehiculosCount(tipo.id);
                      const percentage = maxTipoCount > 0 ? (count / maxTipoCount) * 100 : 0;
                      return (
                        <div key={tipo.id} className="tipo-bar-wrapper">
                          <span className="tipo-nombre">{tipo.nombre}</span>
                          <div className="tipo-bar-container">
                            <div 
                              className="tipo-bar" 
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            ></div>
                            <span className="tipo-count">{count}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-data">Sin tipos de vehiculos</p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGeneral;
