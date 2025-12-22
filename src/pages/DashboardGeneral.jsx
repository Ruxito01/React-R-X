import React, { useState, useEffect } from 'react';
import './DashboardGeneral.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const DashboardGeneral = () => {
  // Estados para datos
  const [usuarios, setUsuarios] = useState([]);
  const [comunidades, setComunidades] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para última actualización
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  // Scroll to top al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Función para cargar datos
  const fetchData = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading && usuarios.length === 0) {
        setLoading(true);
      }
      
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const [usuariosRes, comunidadesRes, tiposRes, viajesRes, vehiculosRes] = await Promise.all([
        fetch(`${apiUrl}/usuario`),
        fetch(`${apiUrl}/comunidad`),
        fetch(`${apiUrl}/tipovehiculo`),
        fetch(`${apiUrl}/viaje`),
        fetch(`${apiUrl}/vehiculo`)
      ]);

      if (!usuariosRes.ok || !comunidadesRes.ok || !tiposRes.ok || !viajesRes.ok || !vehiculosRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const [usuariosData, comunidadesData, tiposData, viajesData, vehiculosData] = await Promise.all([
        usuariosRes.json(),
        comunidadesRes.json(),
        tiposRes.json(),
        viajesRes.json(),
        vehiculosRes.json()
      ]);

      // Cargar miembros de cada comunidad
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

      setUsuarios(usuariosData);
      setComunidades(comunidadesConMiembros);
      setTiposVehiculo(tiposData);
      setViajes(viajesData);
      setVehiculos(vehiculosData);
      setUltimaActualizacion(new Date());
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos inicial y polling cada 5 segundos
  useEffect(() => {
    fetchData(true);

    // Polling cada 5 segundos
    const intervalo = setInterval(() => {
      fetchData(false);
    }, 5000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalo);
  }, []);

  // Calcular usuarios en linea (ultimaActividad en ultimos 5 minutos)
  const usuariosEnLinea = usuarios.filter(u => {
    if (!u.ultimaActividad) return false;
    const hace5Min = new Date(Date.now() - 5 * 60 * 1000);
    return new Date(u.ultimaActividad) > hace5Min;
  });

  // Filtrar viajes de los ultimos 7 dias
  const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const viajesRecientes = viajes.filter(v => {
    const fecha = new Date(v.fechaProgramada || v.fechaCreacion);
    return fecha > hace7Dias;
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

  // Calcular conteo de vehículos por tipo
  const getVehiculosCount = (tipoId) => {
    return vehiculos.filter(v => v.tipoVehiculo?.id === tipoId && v.estado === 'en_posesion').length;
  };

  // Calcular max para grafico de barras
  const maxTipoCount = Math.max(...tiposVehiculo.map(t => getVehiculosCount(t.id)), 1);

  // if (loading) removed to show skeleton UI

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
              {loading ? <span className="skeleton skeleton-card-value"></span> : viajesRecientes.length}
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
              {loading ? <span className="skeleton skeleton-card-value"></span> : vehiculos.length}
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

          {/* Rutas ultimos 7 dias */}
          <div className="dashboard-card rutas-recientes">
            <div className="card-header">
              <span className="card-icon">🗺</span>
              <h2>Rutas ultimos 7 dias</h2>
            </div>

            {loading ? (
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
                    {viajesRecientes.slice(0, 5).map(v => (
                      <tr key={v.id}>
                        <td className="ruta-nombre">{v.ruta?.nombre || 'Sin nombre'}</td>
                        <td className="ruta-codigo">{v.codigoInvitacion || `#${v.id}`}</td>
                        <td><span className="ruta-estado" data-estado={v.estado}>{v.estado}</span></td>
                        <td className="ruta-fecha">{new Date(v.fechaProgramada || v.fechaCreacion).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">Sin rutas recientes</p>
              )
            )}

            {/* Gráfico de picos - Viajes por día */}
            <div className="grafico-picos">
              <h3 className="grafico-titulo">Viajes por día</h3>
              <div className="grafico-container">
                <svg viewBox="0 0 300 100" className="picos-svg" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradientViajes" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF6610" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#FF6610" stopOpacity="0.05"/>
                    </linearGradient>
                  </defs>
                  {/* Área bajo la curva */}
                  <path
                    d={`M 0 100 ${viajesPorDia.map((d, i) => {
                      const x = (i / 6) * 300;
                      const y = 100 - (d.cantidad / maxViajesDia) * 80;
                      return `L ${x} ${y}`;
                    }).join(' ')} L 300 100 Z`}
                    fill="url(#areaGradientViajes)"
                  />
                  {/* Línea */}
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
                  {/* Puntos */}
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
                {/* Etiquetas */}
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

        {/* Fila inferior: Comunidades + Tipos de vehiculos */}
        <div className="dashboard-row">
          {/* Comunidades */}
          <div className="dashboard-card comunidades">
            <div className="card-header">
              <span className="card-icon">👥</span>
              <h2>Comunidades ({comunidades.length})</h2>
            </div>
            <div className="comunidades-lista">
              {comunidades.length > 0 ? (
                comunidades.slice(0, 4).map(c => (
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
                    {/* Fotos de miembros apiladas */}
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
              )}
            </div>
          </div>

          {/* Tipos de vehiculos (grafico de barras) */}
          <div className="dashboard-card tipos-vehiculos">
            <div className="card-header">
              <span className="card-icon">🚗</span>
              <h2>Tipos de Vehiculos</h2>
            </div>
            <div className="tipos-chart">
              {tiposVehiculo.length > 0 ? (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGeneral;
