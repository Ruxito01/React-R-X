import { useState, useEffect } from 'react';
import './Comunidades.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Componente interno para manejar avatar con fallback en caso de error
const MemberAvatar = ({ miembro }) => {
  const [imgError, setImgError] = useState(false);

  // Si no hay foto o si hubo error al cargar la imagen
  if (!miembro.foto || imgError) {
    return (
      <div 
        className="member-avatar-circle"
        style={{ background: '#FFAB91', color: '#fff' }}
        title={miembro.nombre}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(255, 102, 16, 0.3)';
        }}
        onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'scale(1)';
             e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 102, 16, 0.2)';
        }}
      >
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {miembro.nombre?.charAt(0).toUpperCase()}
        </div>
      </div>
    );
  }

  // Si hay foto y aun no ha dado error
  return (
    <div 
      className="member-avatar-circle"
      title={miembro.nombre}
      onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(255, 102, 16, 0.3)';
      }}
      onMouseLeave={(e) => {
           e.currentTarget.style.transform = 'scale(1)';
           e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 102, 16, 0.2)';
      }}
    >
      <img 
        src={miembro.foto} 
        alt="" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        onError={() => setImgError(true)}
      />
    </div>
  );
}; // Add semicolon here as it's a const assignment

function Comunidades() {
  // Estados para datos del backend
  const [comunidades, setComunidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para la comunidad seleccionada
  const [selectedCommunityIndex, setSelectedCommunityIndex] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Estados para tooltips de graficas
  const [tooltipDonut, setTooltipDonut] = useState({ visible: false, tipo: null });
  const [tooltipRanking, setTooltipRanking] = useState({ visible: false, index: null });

  // Estado para ordenamiento
  const [ordenamiento, setOrdenamiento] = useState({ columna: 'miembros', direccion: 'desc' });

  // Scroll to top al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Funcion de ordenamiento
  const ordenarPor = (columna) => {
    setOrdenamiento(prev => ({
      columna,
      direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Componente IconoOrden
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

  // Cargar datos del backend
  const fetchData = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading && comunidades.length === 0) {
        setLoading(true);
      }

      const comunidadesRes = await fetch(`${API_BASE_URL}/comunidad`);
      if (!comunidadesRes.ok) throw new Error('Error al cargar comunidades');
      
      const comunidadesData = await comunidadesRes.json();

      // Cargar miembros de cada comunidad
      const comunidadesConMiembros = await Promise.all(
        comunidadesData.map(async (comunidad) => {
          try {
            const miembrosRes = await fetch(`${API_BASE_URL}/comunidad/${comunidad.id}/miembros`);
            if (miembrosRes.ok) {
              const miembrosData = await miembrosRes.json();
              return {
                id: comunidad.id,
                nombre: comunidad.nombre || 'Sin nombre',
                descripcion: comunidad.descripcion || '',
                urlImagen: comunidad.urlImagen,
                fechaCreacion: comunidad.fechaCreacion,
                creador: comunidad.creador,
                miembros: miembrosData || [],
                cantidadMiembros: miembrosData?.length || 0,
                estado: 'Activa'
              };
            }
          } catch (e) {
            console.error(`Error cargando miembros de comunidad ${comunidad.id}:`, e);
          }
          return {
            id: comunidad.id,
            nombre: comunidad.nombre || 'Sin nombre',
            descripcion: comunidad.descripcion || '',
            urlImagen: comunidad.urlImagen,
            fechaCreacion: comunidad.fechaCreacion,
            creador: comunidad.creador,
            miembros: [],
            cantidadMiembros: 0,
            estado: 'Activa'
          };
        })
      );

      setComunidades(comunidadesConMiembros);
      setError(null);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales y auto-refresh
  useEffect(() => {
    fetchData(true);
    
    const intervalo = setInterval(() => {
      fetchData(false);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  // Funcion para obtener la fecha actual en español
  const getFechaActual = () => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    return `al ${dia} de ${mes}`;
  };

  // Calcular estadisticas para tarjetas resumen
  const totalComunidades = comunidades.length;
  const totalMiembros = comunidades.reduce((sum, c) => sum + c.cantidadMiembros, 0);
  const comunidadMasGrande = comunidades.reduce((max, c) => c.cantidadMiembros > (max?.cantidadMiembros || 0) ? c : max, null);
  const promedioMiembros = totalComunidades > 0 ? Math.round(totalMiembros / totalComunidades) : 0;

  // Ordenar comunidades
  const comunidadesOrdenadas = [...comunidades].sort((a, b) => {
    const { columna, direccion } = ordenamiento;
    let valorA, valorB;
    
    switch (columna) {
      case 'nombre':
        valorA = a.nombre.toLowerCase();
        valorB = b.nombre.toLowerCase();
        break;
      case 'miembros':
        valorA = a.cantidadMiembros;
        valorB = b.cantidadMiembros;
        break;
      case 'estado':
        valorA = a.estado.toLowerCase();
        valorB = b.estado.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (typeof valorA === 'string') {
      return direccion === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    }
    return direccion === 'asc' ? valorA - valorB : valorB - valorA;
  });

  // Estado para el filtro de busqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar comunidades
  const comunidadesFiltradas = comunidadesOrdenadas.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCommunity = comunidades[selectedCommunityIndex] || comunidades[0];

  // Calcular distribucion de miembros por comunidad para graficos
  const getDistribucionMiembros = () => {
    return comunidades
      .map(c => ({ nombre: c.nombre, miembros: c.cantidadMiembros }))
      .sort((a, b) => b.miembros - a.miembros)
      .slice(0, 5);
  };

  const distribucionMiembros = getDistribucionMiembros();
  const maxMiembros = Math.max(...distribucionMiembros.map(c => c.miembros), 1);

  if (error) {
    return (
      <div className="comunidades-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
        <div className="comunidades-main-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: '#e53935' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠</div>
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comunidades-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
      
      {/* Tarjetas Resumen */}
      <div className="stats-summary dashboard-animate-enter">
        <div className="stat-card">
          <div className="stat-icon icon-communities">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : totalComunidades}
            </span>
            <span className="stat-label">Total Comunidades</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-members">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#388E3C" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : totalMiembros}
            </span>
            <span className="stat-label">Total Miembros</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-top">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976D2" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value" style={{ fontSize: '1.1rem' }}>
              {loading ? <span className="skeleton skeleton-card-value"></span> : (comunidadMasGrande?.nombre?.substring(0, 15) || 'N/A')}
            </span>
            <span className="stat-label">Comunidad Principal</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-average">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6610" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : promedioMiembros}
            </span>
            <span className="stat-label">Promedio Miembros</span>
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="comunidades-main-card dashboard-animate-enter">
        <div className="comunidades-grid">
          {/* SECCION IZQUIERDA */}
          <div className="comunidades-left-section">
            {/* Comunidad Destacada */}
            <div className="featured-community-card">
              <div className="community-card-title">COMUNIDAD SELECCIONADA</div>
              <div className="community-featured-content-horizontal">
                {/* Icono circular */}
                <div className="community-icon-circle">
                  {loading ? (
                    <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '50%' }}></div>
                  ) : (
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="url(#communityGradient)" />
                      <defs>
                        <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FF6610" />
                          <stop offset="100%" stopColor="#FF8844" />
                        </linearGradient>
                      </defs>
                      <text x="50" y="58" textAnchor="middle" fontSize="35" fontWeight="700" fill="#fff">
                        {selectedCommunity?.nombre?.charAt(0) || 'C'}
                      </text>
                    </svg>
                  )}
                </div>

                {/* Informacion central */}
                <div className="community-center-stats-section">
                  <div className="community-name-with-bars">
                    {loading ? (
                      <div className="skeleton" style={{ height: '28px', width: '200px' }}></div>
                    ) : (
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
                        {selectedCommunity?.nombre || 'Sin seleccionar'}
                      </h2>
                    )}
                    <div className="community-vertical-bars-group">
                      <div className="community-v-bar medium"></div>
                      <div className="community-v-bar tall"></div>
                      <div className="community-v-bar medium"></div>
                    </div>
                  </div>
                  <div className="community-status-label">
                    {selectedCommunity?.descripcion?.substring(0, 50) || 'Sin descripcion'}
                  </div>
                </div>

                {/* Numero de miembros */}
                <div className="community-number-section">
                  {loading ? (
                    <div className="skeleton" style={{ height: '50px', width: '60px' }}></div>
                  ) : (
                    <div className="community-number">{selectedCommunity?.cantidadMiembros || 0}</div>
                  )}
                  <div className="community-mini-bars-group">
                    <div className="community-mini-bar short"></div>
                    <div className="community-mini-bar tall"></div>
                    <div className="community-mini-bar short"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Comunidades */}
            <div className="communities-table-card">
              {/* Barra de busqueda */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', pointerEvents: 'none' }}
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Buscar comunidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="community-search-input"
                  />
                </div>
              </div>

              <div className="table-scroll-container">
                <table className="communities-table">
                  <thead>
                    <tr>
                      <th className="th-sortable" onClick={() => ordenarPor('nombre')}>
                        Nombre <IconoOrden columna="nombre" />
                      </th>
                      <th className="th-sortable" onClick={() => ordenarPor('miembros')}>
                        Miembros <IconoOrden columna="miembros" />
                      </th>
                      <th className="th-sortable" onClick={() => ordenarPor('estado')}>
                        Estado <IconoOrden columna="estado" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, index) => (
                        <tr key={`skeleton-${index}`} className={index % 2 === 0 ? 'community-row-light' : 'community-row-white'}>
                          <td><div className="skeleton" style={{ height: '16px', width: '80%' }}></div></td>
                          <td><div className="skeleton" style={{ height: '16px', width: '40px' }}></div></td>
                          <td><div className="skeleton" style={{ height: '16px', width: '60px' }}></div></td>
                        </tr>
                      ))
                    ) : comunidadesFiltradas.length > 0 ? (
                      comunidadesFiltradas.map((comunidad) => {
                        const originalIndex = comunidades.findIndex(c => c.id === comunidad.id);
                        return (
                          <tr
                            key={comunidad.id}
                            className={`${originalIndex % 2 === 0 ? 'community-row-light' : 'community-row-white'} ${originalIndex === selectedCommunityIndex ? 'selected-community-row' : ''}`}
                            onClick={() => setSelectedCommunityIndex(originalIndex)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td className="community-name-cell">{comunidad.nombre}</td>
                            <td>{comunidad.cantidadMiembros}</td>
                            <td>{comunidad.estado}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                          No se encontraron comunidades
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="community-table-footer">
                Datos actuales {getFechaActual()} - Click para ver detalles
              </div>
            </div>

            {/* GRAFICO EXTRA DEBAJO DE LA TABLA: DISTRIBUCION POR TAMAÑO */}
            <div className="community-chart-card" style={{ flex: 1, minHeight: '160px' }}>
              <div className="community-chart-title-bold">DISTRIBUCIÓN POR TAMAÑO</div>
              <div style={{ padding: '5px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading ? (
                    <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
                ) : (
                    (() => {
                        const peq = comunidades.filter(c => c.cantidadMiembros < 5).length;
                        const med = comunidades.filter(c => c.cantidadMiembros >= 5 && c.cantidadMiembros <= 20).length;
                        const gra = comunidades.filter(c => c.cantidadMiembros > 20).length;
                        const total = comunidades.length || 1;
                        
                        // Calculos para Donut Chart
                        const r = 42; // Radio un poco mas grande
                        const c = 50;
                        const circumference = 2 * Math.PI * r;
                        
                        const p1 = (peq / total) * circumference;
                        const p2 = (med / total) * circumference;
                        const p3 = (gra / total) * circumference;
                        
                        return (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', width: '100%', padding: '0 10px' }}>
                                {/* Donut SVG */}
                                <div style={{ width: '140px', height: '140px', position: 'relative', flexShrink: 0 }}>
                                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                                        {/* Background Circle */}
                                        <circle cx={c} cy={c} r={r} fill="transparent" stroke="#f5f5f5" strokeWidth="16" />
                                        
                                        {/* Segmentos */}
                                        {gra > 0 && <circle cx={c} cy={c} r={r} fill="transparent" stroke="#E65100" strokeWidth="16" 
                                            strokeDasharray={`${p3} ${circumference}`} strokeDashoffset="0" strokeLinecap="round" />}
                                        
                                        {med > 0 && <circle cx={c} cy={c} r={r} fill="transparent" stroke="#FB8C00" strokeWidth="16" 
                                            strokeDasharray={`${p2} ${circumference}`} strokeDashoffset={`-${p3}`} strokeLinecap="round" />}
                                            
                                        {peq > 0 && <circle cx={c} cy={c} r={r} fill="transparent" stroke="#FFB74D" strokeWidth="16" 
                                            strokeDasharray={`${p1} ${circumference}`} strokeDashoffset={`-${p3 + p2}`} strokeLinecap="round" />}
                                    </svg>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '2rem', fontWeight: '800', color: '#333', lineHeight: 1 }}>{total}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase' }}>Total</span>
                                    </div>
                                </div>
                                
                                {/* Leyenda Derecha con interactividad */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                                <div 
                                  className={`community-legend-item legend-interactivo ${tooltipDonut.tipo === 'pequenas' ? 'legend-activo' : ''}`}
                                  onMouseEnter={() => setTooltipDonut({ visible: true, tipo: 'pequenas' })}
                                  onMouseLeave={() => setTooltipDonut({ visible: false, tipo: null })}
                                  style={{ cursor: 'pointer', position: 'relative', padding: '6px', borderRadius: '8px', transition: 'background 0.2s' }}
                                >
                                    <div style={{ width: '14px', height: '14px', background: '#FFB74D', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="community-legend-title">Pequeñas</span>
                                        <span className="community-legend-subtitle">&lt; 5 miembros ({peq})</span>
                                    </div>
                                    {tooltipDonut.visible && tooltipDonut.tipo === 'pequenas' && (
                                      <div className="grafico-tooltip donut-tooltip">
                                        <div className="tooltip-header">Comunidades Pequeñas</div>
                                        <div className="tooltip-row">
                                          <span>Cantidad:</span>
                                          <strong>{peq}</strong>
                                        </div>
                                        <div className="tooltip-row">
                                          <span>Porcentaje:</span>
                                          <strong>{((peq / total) * 100).toFixed(1)}%</strong>
                                        </div>
                                        <div className="tooltip-row">
                                          <span>Rango:</span>
                                          <strong>&lt; 5 miembros</strong>
                                        </div>
                                      </div>
                                    )}
                                </div>
                                <div 
                                  className={`community-legend-item legend-interactivo ${tooltipDonut.tipo === 'medianas' ? 'legend-activo' : ''}`}
                                  onMouseEnter={() => setTooltipDonut({ visible: true, tipo: 'medianas' })}
                                  onMouseLeave={() => setTooltipDonut({ visible: false, tipo: null })}
                                  style={{ cursor: 'pointer', position: 'relative', padding: '6px', borderRadius: '8px', transition: 'background 0.2s' }}
                                >
                                    <div style={{ width: '14px', height: '14px', background: '#FB8C00', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="community-legend-title">Medianas</span>
                                        <span className="community-legend-subtitle">5-20 miembros ({med})</span>
                                    </div>
                                    {tooltipDonut.visible && tooltipDonut.tipo === 'medianas' && (
                                      <div className="grafico-tooltip donut-tooltip">
                                        <div className="tooltip-header">Comunidades Medianas</div>
                                        <div className="tooltip-row">
                                          <span>Cantidad:</span>
                                          <strong>{med}</strong>
                                        </div>
                                        <div className="tooltip-row">
                                          <span>Porcentaje:</span>
                                          <strong>{((med / total) * 100).toFixed(1)}%</strong>
                                        </div>
                                        <div className="tooltip-row">
                                          <span>Rango:</span>
                                          <strong>5-20 miembros</strong>
                                        </div>
                                        {med === Math.max(peq, med, gra) && (
                                          <div className="tooltip-badge">Tamaño mas comun</div>
                                        )}
                                      </div>
                                    )}
                                </div>
                                <div 
                                  className={`community-legend-item legend-interactivo ${tooltipDonut.tipo === 'grandes' ? 'legend-activo' : ''}`}
                                  onMouseEnter={() => setTooltipDonut({ visible: true, tipo: 'grandes' })}
                                  onMouseLeave={() => setTooltipDonut({ visible: false, tipo: null })}
                                  style={{ cursor: 'pointer', position: 'relative', padding: '6px', borderRadius: '8px', transition: 'background 0.2s' }}
                                >
                                    <div style={{ width: '14px', height: '14px', background: '#E65100', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="community-legend-title">Grandes</span>
                                        <span className="community-legend-subtitle">&gt; 20 miembros ({gra})</span>
                                    </div>
                                    {tooltipDonut.visible && tooltipDonut.tipo === 'grandes' && (
                                      <div className="grafico-tooltip donut-tooltip">
                                        <div className="tooltip-header">Comunidades Grandes</div>
                                        <div className="tooltip-row">
                                          <span>Cantidad:</span>
                                          <strong>{gra}</strong>
                                        </div>
                                        <div className="tooltip-row">
                                          <span>Porcentaje:</span>
                                          <strong>{((gra / total) * 100).toFixed(1)}%</strong>
                                        </div>
                                        <div className="tooltip-row">
                                          <span>Rango:</span>
                                          <strong>&gt; 20 miembros</strong>
                                        </div>
                                        {gra > 0 && (
                                          <div className="tooltip-badge">Mayor alcance</div>
                                        )}
                                      </div>
                                    )}
                                </div>
                                </div>
                            </div>
                        );
                    })()
                )}
              </div>
            </div>
          </div>

          {/* SECCION DERECHA: Estadisticas Avanzadas */}
          <div className="comunidades-right-section">
            
            {/* GRAFICO 1: CRECIMIENTO DE COMUNIDADES (PICOS / AREA) */}
            <div className="community-chart-card">
              <div className="community-chart-title-bold">CRECIMIENTO DE COMUNIDADES</div>
              <div style={{ padding: '1rem', height: '175px', position: 'relative' }}>
                {loading ? (
                  <div className="skeleton" style={{ height: '100%', width: '100%' }}></div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: '5px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                    {(() => {
                      // Simular o calcular datos historicos basados en fechaCreacion
                      // Nota: Si la fecha no es valida, usamos indices simulados para el efecto visual solicitado
                      const datosOrdenadosPorFecha = [...comunidades].sort((a, b) => 
                        new Date(a.fechaCreacion || 0) - new Date(b.fechaCreacion || 0)
                      );

                      // Generar puntos para el grafico de area (Picos)
                      // Si hay pocos datos, generamos algunos puntos intermedios simulados para que se vea como un grafico real
                      const puntos = datosOrdenadosPorFecha.length > 0 ? datosOrdenadosPorFecha : Array(6).fill({ fechaCreacion: new Date() });
                      
                      const altoMaximo = 160; // pixels disponbles
                      const cantidadTotal = puntos.length;
                      
                      return (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          {/* Linea y Area SVG */}
                          <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            <defs>
                              <linearGradient id="gradienteArea" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#FF6610" stopOpacity="0.4"/>
                                <stop offset="100%" stopColor="#FF6610" stopOpacity="0.05"/>
                              </linearGradient>
                            </defs>
                            
                            {/* Path del Area */}
                            <path 
                              d={`
                                M 0,100 
                                ${puntos.map((_, i) => {
                                  // Crear una curva de crecimiento acumulativo simulada o real
                                  const x = (i / (cantidadTotal - 1 || 1)) * 100;
                                  // Usamos i+1 como valor acumulativo
                                  const y = 100 - ((i + 1) / cantidadTotal) * 100; 
                                  return `L ${x},${y}`;
                                }).join(' ')} 
                                L 100,100 Z
                              `} 
                              fill="url(#gradienteArea)"
                            />
                            
                            {/* Linea Principal */}
                            <polyline
                              points={puntos.map((_, i) => {
                                const x = (i / (cantidadTotal - 1 || 1)) * 100;
                                const y = 100 - ((i + 1) / cantidadTotal) * 100;
                                return `${x},${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#FF6610"
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                            />
                            
                            {/* Puntos en la linea e Interactividad */}
                            {puntos.map((comunidad, i) => {
                              const x = (i / (cantidadTotal - 1 || 1)) * 100;
                              const y = 100 - ((i + 1) / cantidadTotal) * 100;
                              const isHovered = hoveredPoint === i;
                              
                              return (
                                <g key={i}>
                                  {/* Punto visual */}
                                  <circle 
                                    cx={x} 
                                    cy={y} 
                                    r={isHovered ? 2.5 : 1.5} 
                                    fill={isHovered ? "#FF6610" : "#fff"}
                                    stroke="#FF6610" 
                                    strokeWidth={isHovered ? 1 : 0.5}
                                    vectorEffect="non-scaling-stroke" 
                                    style={{ transition: 'all 0.2s ease' }}
                                  />
                                  
                                  {/* Area de interaccion invisible (mas grande) */}
                                  <circle 
                                    cx={x} 
                                    cy={y} 
                                    r="5" 
                                    fill="transparent" 
                                    stroke="none"
                                    vectorEffect="non-scaling-stroke"
                                    onMouseEnter={() => setHoveredPoint(i)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </g>
                              );
                            })}
                          </svg>
                          
                          {/* Tooltip Dinamico */}
                          {hoveredPoint !== null && (() => {
                            const i = hoveredPoint;
                            const comunidad = puntos[i];
                            const x = (i / (cantidadTotal - 1 || 1)) * 100;
                            const y = 100 - ((i + 1) / cantidadTotal) * 100;
                            
                            // Ajustar posicion X para que no se salga
                            const leftPos = x < 20 ? '0%' : x > 80 ? 'auto' : `${x}%`;
                            const rightPos = x > 80 ? '0%' : 'auto';
                            const transformX = x < 20 ? '0' : x > 80 ? '0' : '-50%';
                            
                            return (
                              <div style={{
                                position: 'absolute',
                                left: leftPos,
                                right: rightPos,
                                top: `${y}%`,
                                transform: `translate(${transformX}, -130%)`,
                                background: 'rgba(0, 0, 0, 0.8)',
                                color: '#fff',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                zIndex: 10,
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              }}>
                                <div style={{ fontWeight: '700', marginBottom: '2px' }}>
                                  {comunidad.nombre || 'Comunidad'}
                                </div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                                  {(i + 1)}º creada
                                </div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                                  {comunidad.fechaCreacion ? new Date(comunidad.fechaCreacion).toLocaleDateString() : 'Fecha desc.'}
                                </div>
                                {/* Flechita abajo */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '-5px',
                                  left: x < 20 ? '10px' : x > 80 ? 'auto' : '50%',
                                  right: x > 80 ? '10px' : 'auto',
                                  transform: x < 20 || x > 80 ? 'none' : 'translateX(-50%)',
                                  borderLeft: '5px solid transparent',
                                  borderRight: '5px solid transparent',
                                  borderTop: '5px solid rgba(0, 0, 0, 0.8)'
                                }}></div>
                              </div>
                            );
                          })()}
                          
                          {/* Etiquetas Eje X (Fechas simplificadas) */}
                          <div style={{ position: 'absolute', bottom: '-25px', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#999' }}>
                            <span>Inicio</span>
                            <span>Actualidad</span>
                          </div>
                          
                          {/* Etiqueta Flotante Total */}
                          <div style={{ 
                            position: 'absolute', 
                            top: '10px', 
                            right: '10px', 
                            background: 'rgba(255, 102, 16, 0.1)', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            color: '#FF6610',
                            fontWeight: '700',
                            fontSize: '0.8rem'
                          }}>
                            +{cantidadTotal} Creadas
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* GRAFICO 2: RANKING MIEMBROS - BARRAS VERTICALES */}
            <div className="community-chart-card">
              <div className="community-chart-title-bold">RANKING DE MIEMBROS (TOP 5)</div>
              <div style={{ padding: '1rem', height: '175px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '8px' }}>
                {loading ? (
                  <div className="skeleton" style={{ height: '100%', width: '100%' }}></div>
                ) : comunidades.length > 0 ? (
                  (() => {
                    const top5 = [...comunidades].sort((a, b) => b.cantidadMiembros - a.cantidadMiembros).slice(0, 5);
                    const maxMiembros = Math.max(...top5.map(c => c.cantidadMiembros), 1);
                    
                    return top5.map((comunidad, i) => {
                      const altura = (comunidad.cantidadMiembros / maxMiembros) * 100;
                      return (
                        <div 
                          key={i} 
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '18%', justifyContent: 'flex-end', position: 'relative' }}
                          className={`ranking-bar-hover ${tooltipRanking.index === i ? 'ranking-bar-activo' : ''}`}
                          onMouseEnter={() => setTooltipRanking({ visible: true, index: i })}
                          onMouseLeave={() => setTooltipRanking({ visible: false, index: null })}
                        >
                          {/* Valor encima de la barra */}
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                            {comunidad.cantidadMiembros}
                          </span>
                          
                          {/* Barra Vertical */}
                          <div style={{ 
                            width: '100%', 
                            height: `${altura}%`, 
                            background: 'linear-gradient(180deg, #FF8C42 0%, #E65100 100%)',
                            borderRadius: '6px 6px 0 0',
                            position: 'relative',
                            transition: 'height 0.5s ease, transform 0.2s',
                            minHeight: '4px',
                            cursor: 'pointer'
                          }}>
                            {/* Efecto brillo */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '6px 6px 0 0' }}></div>
                          </div>
                          
                          {/* Nombre abajo */}
                          <span style={{ 
                            fontSize: '0.65rem', 
                            color: '#666', 
                            marginTop: '6px', 
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            fontWeight: '600'
                          }}>
                            {comunidad.nombre.substring(0, 8)}
                          </span>
                          
                          {/* Tooltip Ranking */}
                          {tooltipRanking.visible && tooltipRanking.index === i && (
                            <div className="grafico-tooltip ranking-tooltip">
                              <div className="tooltip-header">{comunidad.nombre}</div>
                              <div className="tooltip-row">
                                <span>Posicion:</span>
                                <strong>#{i + 1}</strong>
                              </div>
                              <div className="tooltip-row">
                                <span>Miembros:</span>
                                <strong>{comunidad.cantidadMiembros}</strong>
                              </div>
                              <div className="tooltip-row">
                                <span>Estado:</span>
                                <strong>{comunidad.estado}</strong>
                              </div>
                              {i === 0 && (
                                <div className="tooltip-badge">Comunidad lider</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', color: '#999' }}>Sin datos</div>
                )}
              </div>
            </div>

            {/* Grafico 3: Miembros de Comunidad Seleccionada - Grid Compacto y Visual */}
            <div className="community-chart-card" style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
              <div className="community-chart-title-bold" style={{ flexShrink: 0 }}>
                MIEMBROS: {selectedCommunity?.nombre?.toUpperCase().substring(0,25) || ''}
              </div>
              <div className="members-grid-container">
                {loading ? (
                   <div className="skeleton" style={{ height: '100%', width: '100%' }}></div>
                ) : selectedCommunity?.miembros?.length > 0 ? (
                  <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                      gap: '16px', 
                      alignItems: 'start',
                      height: 'auto',
                      height: '100%',
                      padding: '10px 5px',
                      overflowY: 'auto',
                      width: '100%'
                    }} className="members-catalog-scroll">
                    {selectedCommunity.miembros.map((miembro, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px', flexShrink: 0 }} title={miembro.nombre}>
                        <MemberAvatar miembro={miembro} />
                        <div className="member-name-tag">
                            {miembro.alias || miembro.nombre.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#bbb', gap: '15px' }}>
                      <div style={{ fontSize: '3rem', opacity: 0.3 }}>👥</div>
                      <div style={{ fontWeight: '600' }}>Sin miembros registrados</div>
                  </div>
                )}
              </div>
            </div>



          </div>
        </div>
      </div>
    </div>
  );
}

// End of component

export default Comunidades;

