import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const Dashboard = () => {
  // Scroll to top cuando el componente se monta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Estado para el usuario seleccionado
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Estados para la carga de usuarios desde el backend
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos mock para gráficos (no disponibles en backend)
  const datosMockGraficos = {
    categorias: { urbano: 50, rural: 30, montaña: 20 },
    rutasPorDia: [
      { dia: '1', valor: 3 },
      { dia: '5', valor: 6 },
      { dia: '10', valor: 9 },
      { dia: '15', valor: 12 },
      { dia: '20', valor: 16 },
      { dia: '25', valor: 20 },
      { dia: '30', valor: 24 },
    ],
    distanciaSemanal: [
      { dia: 'L', valor: 12 },
      { dia: 'M', valor: 18 },
      { dia: 'X', valor: 15 },
      { dia: 'J', valor: 10 },
      { dia: 'V', valor: 20 },
      { dia: 'S', valor: 25 },
    ]
  };

  // Cargar usuarios inicial y polling cada 5 segundos
  useEffect(() => {
    fetchUsuarios();
    
    // Auto-refresh cada 5 segundos
    const intervalId = setInterval(() => {
        fetchUsuarios(false); // false para evitar mostrar el loader cada vez
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Función para cargar usuarios con datos reales
  const fetchUsuarios = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading && usuarios.length === 0) {
        setLoading(true);
      }
      
      // Cargar usuarios, vehículos y viajes en paralelo
      const [usuariosRes, vehiculosRes, viajesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/usuario`),
        fetch(`${import.meta.env.VITE_API_URL}/vehiculo`),
        fetch(`${import.meta.env.VITE_API_URL}/viaje`),
      ]);
      
      if (!usuariosRes.ok) throw new Error('Error al cargar usuarios');
      
      const usuariosData = await usuariosRes.json();
      const vehiculosData = vehiculosRes.ok ? await vehiculosRes.json() : [];
      const viajesData = viajesRes.ok ? await viajesRes.json() : [];
      
      // Mapear datos del backend al formato del dashboard
      const usuariosMapeados = usuariosData.map((u) => {
        // Contar vehículos del usuario (estado en_posesion)
        const vehiculosUsuario = vehiculosData.filter(
          v => v.usuario?.id === u.id && v.estado === 'en_posesion'
        ).length;
        
        // Calcular km recorridos: suma de kmRecorridos de todos los ParticipanteViaje
        let kmTotales = 0;
        let viajesParticipados = 0;
        const viajesUltimoMes = [];
        
        // Fecha hace 30 días y hace 7 días
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);
        hace7Dias.setHours(0, 0, 0, 0);
        
        // Mapa para agrupar km por día de la semana (últimos 7 días)
        const kmPorDia = {};
        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        
        // Inicializar últimos 7 días con 0
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const key = d.toDateString();
          kmPorDia[key] = { fecha: new Date(d), km: 0, diaNombre: diasSemana[d.getDay()] };
        }
        
        viajesData.forEach(viaje => {
          if (viaje.participantes) {
            viaje.participantes.forEach(p => {
              if (p.usuario?.id === u.id) {
                viajesParticipados++;
                const kmViaje = p.kmRecorridos ? parseFloat(p.kmRecorridos) : 0;
                kmTotales += kmViaje;
                
                const fechaViaje = viaje.fechaInicioReal || viaje.fechaProgramada;
                if (fechaViaje) {
                  const fecha = new Date(fechaViaje);
                  
                  // Agregar a viajes del último mes
                  if (fecha >= hace30Dias) {
                    viajesUltimoMes.push({
                      fecha: fecha,
                      km: kmViaje,
                      nombre: viaje.ruta?.nombre || 'Viaje',
                      estado: viaje.estado
                    });
                  }
                  
                  // Agregar a km por día si está en la última semana
                  const fechaSinHora = new Date(fecha);
                  fechaSinHora.setHours(0, 0, 0, 0);
                  if (fechaSinHora >= hace7Dias) {
                    const key = fechaSinHora.toDateString();
                    if (kmPorDia[key]) {
                      kmPorDia[key].km += kmViaje;
                    }
                  }
                }
              }
            });
          }
        });
        
        // Ordenar viajes por fecha
        viajesUltimoMes.sort((a, b) => a.fecha - b.fecha);
        
        // Convertir mapa a array ordenado
        const distanciaSemanalReal = Object.values(kmPorDia)
          .sort((a, b) => a.fecha - b.fecha)
          .map(d => ({ dia: d.diaNombre, valor: Math.round(d.km * 10) / 10 }));
        
        return {
          id: u.id,
          nombre: `${u.nombre} ${u.apellido}`,
          alias: (u.alias && u.alias.trim() !== '') ? u.alias : u.nombre,
          email: u.email,
          foto: u.foto,
          distancia: Math.round(kmTotales * 10) / 10,
          rutasMes: viajesParticipados,
          vehiculos: vehiculosUsuario,
          viajesUltimoMes: viajesUltimoMes,
          distanciaSemanal: distanciaSemanalReal
        };
      });
      
      // Ordenar por kilómetros descendente
      usuariosMapeados.sort((a, b) => (b.distancia || 0) - (a.distancia || 0));
      
      setUsuarios(usuariosMapeados);
      setError(null);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios inicial y polling cada 5 segundos
  useEffect(() => {
    fetchUsuarios(true);

    // Polling cada 5 segundos
    const intervalo = setInterval(() => {
      fetchUsuarios(false);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  // Ya no bloqueamos la UI durante la carga - mostramos skeleton en la estructura principal

  // Si hay error, mostrarlo
  if (error) {
    return (
      <div className="dashboard-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
        <div className="dashboard-main-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: '#e53935' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠</div>
            <p>Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }


  // Variables del usuario seleccionado (con fallback a valores por defecto)

  const selectedUser = usuarios[selectedUserIndex] || usuarios[0];
  const distanciaSemanal = selectedUser?.distanciaSemanal || [];
  const maxValorBarras = distanciaSemanal.length > 0 ? Math.max(...distanciaSemanal.map(d => d.valor)) : 1;

  // Función para obtener la fecha actual en español
  const getFechaActual = () => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    return `al ${dia} de ${mes}`;
  };

  // Calcular totales generales para las tarjetas
  const totalUsuarios = usuarios.length;
  const totalKmRecorridos = usuarios.reduce((sum, u) => sum + (u.distancia || 0), 0);
  const totalViajes = usuarios.reduce((sum, u) => sum + (u.rutasMes || 0), 0);
  const totalVehiculos = usuarios.reduce((sum, u) => sum + (u.vehiculos || 0), 0);

  return (
    <div className="dashboard-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
      {/* Tarjetas Resumen */}
      <div className="stats-summary dashboard-animate-enter">
        <div className="stat-card">
          <div className="stat-icon icon-users">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : totalUsuarios}
            </span>
            <span className="stat-label">Usuarios Totales</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-km">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6610" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : `${totalKmRecorridos.toFixed(1)}`}
            </span>
            <span className="stat-label">Km Totales</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-routes">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#388E3C" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : totalViajes}
            </span>
            <span className="stat-label">Viajes Totales</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-vehicles">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : totalVehiculos}
            </span>
            <span className="stat-label">Vehículos Totales</span>
          </div>
        </div>
      </div>

      {/* Contenedor principal tipo tarjeta */}
      <div className="dashboard-main-card dashboard-animate-enter">
        <div className="dashboard-grid">
        {/* SECCIÓN IZQUIERDA: Usuario destacado + Tabla */}
        <div className="left-section">
          {/* Usuario Destacado del Mes - Diseño Horizontal */}
          <div className="featured-user-card">
            <div className="card-title">USUARIO SELECCIONADO</div>
            <div className="featured-content-horizontal">
              {/* Icono del corredor */}
              <div className="runner-icon-circle">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="47" stroke="#FF6610" strokeWidth="4" fill="none"/>
                  <text x="70" y="56" fontSize="9" fill="#FF6610" fontWeight="600">km</text>
                  {/* Cabeza */}
                  <circle cx="46" cy="28" r="6" fill="#FF6610"/>
                  {/* Cuerpo */}
                  <path d="M46 34 L46 50" stroke="#FF6610" strokeWidth="4" strokeLinecap="round"/>
                  {/* Brazo derecho */}
                  <path d="M46 38 L55 42" stroke="#FF6610" strokeWidth="3.5" strokeLinecap="round"/>
                  {/* Brazo izquierdo */}
                  <path d="M46 40 L37 44" stroke="#FF6610" strokeWidth="3.5" strokeLinecap="round"/>
                  {/* Pierna derecha */}
                  <path d="M46 50 L52 65 L54 73" stroke="#FF6610" strokeWidth="4" strokeLinecap="round"/>
                  {/* Pierna izquierda */}
                  <path d="M46 50 L40 62 L36 70" stroke="#FF6610" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Sección central: distancia + barras + label */}
              <div className="center-stats-section">
                <div className="distance-with-bars">
                  {loading ? (
                    <div className="skeleton" style={{ height: '40px', width: '120px' }}></div>
                  ) : (
                    <div className="distance-number">{selectedUser?.distancia || 0} km</div>
                  )}
                  <div className="vertical-bars-group">
                    <div className="v-bar medium"></div>
                    <div className="v-bar tall"></div>
                  </div>
                </div>
                <div className="participation-label">Km Recorridos</div>
              </div>

              {/* Número de rutas con mini barras */}
              <div className="number-fifteen-section">
                {loading ? (
                  <div className="skeleton" style={{ height: '50px', width: '60px' }}></div>
                ) : (
                  <div className="fifteen-number">{selectedUser?.rutasMes || 0}</div>
                )}
                <div className="mini-bars-group">
                  <div className="mini-bar short"></div>
                  <div className="mini-bar tall"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="users-table-card">
            <table className="users-table">
              <thead>
                <tr>
                  <th className="header-orange">USUARIO</th>
                  <th className="header-orange">Alias</th>
                  <th className="header-orange">Km</th>
                  <th className="header-orange">Rutas</th>
                  <th className="header-orange">Vehiculos</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton rows durante la carga
                  [...Array(8)].map((_, index) => (
                    <tr key={`skeleton-${index}`} className={index % 2 === 0 ? 'row-light' : 'row-white'}>
                      <td><div className="skeleton" style={{ height: '16px', width: '80%' }}></div></td>
                      <td><div className="skeleton" style={{ height: '16px', width: '60px' }}></div></td>
                      <td><div className="skeleton" style={{ height: '16px', width: '40px' }}></div></td>
                      <td><div className="skeleton" style={{ height: '16px', width: '30px' }}></div></td>
                      <td><div className="skeleton" style={{ height: '16px', width: '30px' }}></div></td>
                    </tr>
                  ))
                ) : (
                  usuarios.map((usuario, index) => (
                    <tr 
                      key={index} 
                      className={`${index % 2 === 0 ? 'row-light' : 'row-white'} ${selectedUserIndex === index ? 'selected-row' : ''}`}
                      onClick={() => setSelectedUserIndex(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="user-name">{usuario.nombre}</td>
                      <td style={{ color: '#FF6610', fontWeight: '600' }}>@{usuario.alias}</td>
                      <td>{usuario.distancia}</td>
                      <td>{usuario.rutasMes}</td>
                      <td>{usuario.vehiculos}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="table-footer">
              Datos actuales {getFechaActual()} - Click para ver detalles
            </div>
          </div>
        </div>

        {/* SECCIÓN DERECHA: Gráficos */}
        <div className="right-section">
          {/* Gráfico de Picos - Distancias por Viaje del Último Mes */}
          <div className="chart-card">
            <div className="chart-title">Km por viaje (último mes)</div>
            <div className="peaks-chart" style={{ position: 'relative', padding: '1rem' }}>
              {loading ? (
                <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
              ) : selectedUser?.viajesUltimoMes?.length > 0 ? (
                <>
                  <div style={{ display: 'flex', height: '180px' }}>
                    {/* Eje Y con etiquetas */}
                    {(() => {
                      const viajes = selectedUser.viajesUltimoMes;
                      const maxKm = Math.max(...viajes.map(v => v.km), 1);
                      return (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between', 
                          paddingRight: '8px',
                          fontSize: '0.65rem',
                          color: '#888',
                          minWidth: '35px',
                          textAlign: 'right'
                        }}>
                          <span>{maxKm.toFixed(0)} km</span>
                          <span>{(maxKm / 2).toFixed(0)} km</span>
                          <span>0 km</span>
                        </div>
                      );
                    })()}
                    {/* SVG del gráfico */}
                    <svg viewBox="0 0 200 80" preserveAspectRatio="none" style={{ flex: 1, height: '100%' }}>
                      <defs>
                        <linearGradient id="peaksGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FF6610" stopOpacity="0.7"/>
                          <stop offset="100%" stopColor="#FFD4B8" stopOpacity="0.2"/>
                        </linearGradient>
                      </defs>
                      {/* Líneas de guía horizontales */}
                      <line x1="0" y1="0" x2="200" y2="0" stroke="#eee" strokeWidth="0.5"/>
                      <line x1="0" y1="35" x2="200" y2="35" stroke="#eee" strokeWidth="0.5" strokeDasharray="2,2"/>
                      <line x1="0" y1="70" x2="200" y2="70" stroke="#eee" strokeWidth="0.5"/>
                      {(() => {
                        const viajes = selectedUser.viajesUltimoMes;
                        const maxKm = Math.max(...viajes.map(v => v.km), 1);
                        const width = 200;
                        const height = 70;
                        
                        const points = viajes.map((v, i) => {
                          const x = viajes.length === 1 ? width / 2 : (i / (viajes.length - 1)) * width;
                          const y = height - (v.km / maxKm) * height;
                          return `${x},${y}`;
                        });
                        
                        const linePath = `M ${points.join(' L ')}`;
                        const areaPath = `M 0,${height} L ${points[0]} L ${points.join(' L ')} L ${width},${height} Z`;
                        
                        return (
                          <>
                            <path d={areaPath} fill="url(#peaksGradient)" />
                            <path d={linePath} fill="none" stroke="#FF6610" strokeWidth="1.5" />
                            {viajes.map((v, i) => {
                              const x = viajes.length === 1 ? width / 2 : (i / (viajes.length - 1)) * width;
                              const y = height - (v.km / maxKm) * height;
                              return (
                                <g key={i}>
                                  <circle 
                                    cx={x} 
                                    cy={y} 
                                    r="3" 
                                    fill="#FF6610"
                                    onMouseEnter={() => setHoveredPoint(`viaje-${i}`)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    style={{ cursor: 'pointer' }}
                                  />
                                  {/* Etiqueta del km sobre el punto */}
                                  <text 
                                    x={x} 
                                    y={y - 5} 
                                    fontSize="5" 
                                    fill="#666" 
                                    textAnchor="middle"
                                  >
                                    {v.km.toFixed(0)}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  {/* Eje X con fechas */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666', marginTop: '0.5rem', marginLeft: '35px' }}>
                    {selectedUser.viajesUltimoMes.map((v, i) => (
                      <span key={i} style={{ flex: 1, textAlign: 'center' }}>
                        {v.fecha.toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                      </span>
                    ))}
                  </div>
                  {hoveredPoint && hoveredPoint.startsWith('viaje-') && (
                    <div className="chart-tooltip">
                      {(() => {
                        const idx = parseInt(hoveredPoint.split('-')[1]);
                        const v = selectedUser.viajesUltimoMes[idx];
                        return `${v.nombre}: ${v.km.toFixed(1)} km`;
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ 
                  height: '180px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '0.9rem'
                }}>
                  Sin viajes este mes
                </div>
              )}
            </div>
          </div>

          {/* Top 3 Usuarios con Más Viajes */}
          <div className="chart-card">
            <div className="chart-title-bold">TOP 3 USUARIOS</div>
            <div style={{ padding: '1rem', position: 'relative' }}>
              {loading ? (
                <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
              ) : usuarios.length > 0 ? (
                (() => {
                  // Ordenar usuarios por viajes y tomar top 3
                  const top3 = [...usuarios]
                    .sort((a, b) => (b.rutasMes || 0) - (a.rutasMes || 0))
                    .slice(0, 3);
                  
                  const maxViajes = Math.max(...top3.map(u => u.rutasMes || 0), 1);
                  
                  // Orden del podio: 2do, 1ro, 3ro
                  const ordenPodio = top3.length >= 3 
                    ? [top3[1], top3[0], top3[2]] 
                    : top3;
                  const alturas = [70, 100, 50]; // Porcentajes de altura
                  const colores = ['#C0C0C0', '#FFD700', '#CD7F32']; // Plata, Oro, Bronce
                  const posiciones = ['2', '1', '3'];
                  
                  return (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '200px', gap: '12px' }}>
                      {ordenPodio.map((usuario, i) => {
                        if (!usuario) return null;
                        const altura = alturas[i] || 50;
                        return (
                          <div key={i} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            width: '85px'
                          }}>
                            {/* Foto de perfil */}
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '50%',
                              border: `3px solid ${colores[i]}`,
                              overflow: 'hidden',
                              marginBottom: '4px',
                              background: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {usuario.foto ? (
                                <img 
                                  src={usuario.foto} 
                                  alt={usuario.alias}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                              ) : null}
                              <div style={{ 
                                display: usuario.foto ? 'none' : 'flex',
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: colores[i],
                                color: '#fff',
                                fontWeight: '700',
                                fontSize: '1rem'
                              }}>
                                {usuario.alias?.charAt(0).toUpperCase() || usuario.nombre?.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            {/* Alias del usuario */}
                            <div style={{ 
                              fontSize: '0.7rem', 
                              color: '#333', 
                              fontWeight: '600',
                              textAlign: 'center',
                              marginBottom: '2px',
                              maxWidth: '85px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              @{usuario.alias || usuario.nombre.split(' ')[0]}
                            </div>
                            {/* Cantidad de viajes */}
                            <div style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: '700', 
                              color: '#FF6610',
                              marginBottom: '4px'
                            }}>
                              {usuario.rutasMes} viajes
                            </div>
                            {/* Barra del podio */}
                            <div style={{
                              width: '55px',
                              height: `${altura}px`,
                              background: `linear-gradient(180deg, ${colores[i]} 0%, ${colores[i]}99 100%)`,
                              borderRadius: '8px 8px 0 0',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'center',
                              paddingTop: '6px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}>
                              <span style={{ 
                                fontSize: '1.3rem', 
                                fontWeight: '800', 
                                color: '#fff',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                              }}>
                                {posiciones[i]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  Sin usuarios
                </div>
              )}
            </div>
          </div>

          {/* Top 5 Usuarios por Kilómetros */}
          <div className="chart-card">
            <div className="chart-title-bold">TOP 5 POR KILOMETROS</div>
            <div style={{ padding: '1rem' }}>
              {loading ? (
                <div className="skeleton" style={{ height: '150px', width: '100%' }}></div>
              ) : usuarios.length > 0 ? (
                (() => {
                  const top5Km = [...usuarios]
                    .sort((a, b) => (b.distancia || 0) - (a.distancia || 0))
                    .slice(0, 5);
                  
                  const maxKm = Math.max(...top5Km.map(u => u.distancia || 0), 1);
                  
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {top5Km.map((usuario, i) => {
                        const porcentaje = (usuario.distancia / maxKm) * 100;
                        const colores = ['#FF6610', '#FF8C42', '#FFA366', '#FFB88C', '#FFCEB3'];
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Posición */}
                            <div style={{ 
                              width: '20px', 
                              height: '20px', 
                              borderRadius: '50%', 
                              background: colores[i],
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: '700'
                            }}>
                              {i + 1}
                            </div>
                            {/* Alias */}
                            <div style={{ 
                              width: '70px', 
                              fontSize: '0.7rem', 
                              fontWeight: '600',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              @{usuario.alias}
                            </div>
                            {/* Barra */}
                            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '4px', height: '18px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${porcentaje}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${colores[i]} 0%, ${colores[i]}cc 100%)`,
                                borderRadius: '4px',
                                transition: 'width 0.5s ease'
                              }}></div>
                            </div>
                            {/* Valor */}
                            <div style={{ width: '45px', fontSize: '0.75rem', fontWeight: '700', color: '#333', textAlign: 'right' }}>
                              {usuario.distancia} km
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  Sin datos
                </div>
              )}
            </div>
          </div>
        </div>
        
        </div>
      </div>
    </div>
  );
};

export default Dashboard;