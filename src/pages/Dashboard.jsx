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

  // Función para cargar usuarios
  const fetchUsuarios = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading && usuarios.length === 0) {
        setLoading(true);
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuario`);
      if (!response.ok) throw new Error('Error al cargar usuarios');
      const data = await response.json();
      
      // Mapear datos del backend al formato del dashboard
      const usuariosMapeados = data.map((u, index) => ({
        id: u.id,
        nombre: `${u.nombre} ${u.apellido}`,
        email: u.email,
        distancia: Math.floor(Math.random() * 500) + 100, // Mock
        rutasMes: Math.floor(Math.random() * 20) + 5, // Mock
        vehiculos: 0,
        categorias: { 
          urbano: 30 + Math.floor(Math.random() * 40), 
          rural: 20 + Math.floor(Math.random() * 30), 
          montaña: 10 + Math.floor(Math.random() * 20) 
        },
        rutasPorDia: datosMockGraficos.rutasPorDia.map(d => ({
          ...d, 
          valor: d.valor + Math.floor(Math.random() * 5)
        })),
        distanciaSemanal: datosMockGraficos.distanciaSemanal.map(d => ({
          ...d, 
          valor: d.valor + Math.floor(Math.random() * 10)
        }))
      }));
      
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

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="dashboard-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
        <div className="dashboard-header">
          <h1>DASHBOARD DE USUARIOS</h1>
        </div>
        <div className="dashboard-main-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <p>Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay error, mostrarlo
  if (error) {
    return (
      <div className="dashboard-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
        <div className="dashboard-header">
          <h1>DASHBOARD DE USUARIOS</h1>
        </div>
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

  // Si no hay usuarios
  if (usuarios.length === 0) {
    return (
      <div className="dashboard-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
        <div className="dashboard-header">
          <h1>DASHBOARD DE USUARIOS</h1>
        </div>
        <div className="dashboard-main-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
            <p>No hay usuarios registrados</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedUser = usuarios[selectedUserIndex] || usuarios[0];
  const rutasporDia = selectedUser.rutasPorDia;
  const distanciaSemanal = selectedUser.distanciaSemanal;

  const maxValorLineas = Math.max(...rutasporDia.map(d => d.valor));
  const maxValorBarras = Math.max(...distanciaSemanal.map(d => d.valor));

  // Generar puntos para el path del gráfico de área
  const generateAreaPath = () => {
    const width = 200;
    const height = 60;
    const points = rutasporDia.map((d, i) => {
      const x = (i / (rutasporDia.length - 1)) * width;
      const y = height - (d.valor / maxValorLineas) * height;
      return `${x},${y}`;
    });
    
    const linePath = points.join(' L ');
    const areaPath = `M 0,${height} L ${points[0]} L ${linePath} L ${width},${height} Z`;
    return { linePath: `M ${points[0]} L ${linePath}`, areaPath };
  };

  const { linePath, areaPath } = generateAreaPath();

  // Calcular el porcentaje del donut
  const circumference = 2 * Math.PI * 70;
  const ruralOffset = (selectedUser.categorias.urbano / 100) * circumference;
  const montañaOffset = ((selectedUser.categorias.urbano + selectedUser.categorias.rural) / 100) * circumference;

  // Función para obtener la fecha actual en español
  const getFechaActual = () => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    return `al ${dia} de ${mes}`;
  };

  return (
    <div className="dashboard-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
      <div className="dashboard-header">
        <h1>DASHBOARD DE USUARIOS</h1>
      </div>

      {/* Contenedor principal tipo tarjeta */}
      <div className="dashboard-main-card">
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
                  <div className="distance-number">{selectedUser.distancia} km</div>
                  <div className="vertical-bars-group">
                    <div className="v-bar medium"></div>
                    <div className="v-bar tall"></div>
                  </div>
                </div>
                <div className="participation-label">Rutas Participadas</div>
              </div>

              {/* Número de rutas con mini barras */}
              <div className="number-fifteen-section">
                <div className="fifteen-number">{selectedUser.rutasMes}</div>
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
                  <th className="header-orange">LISTA DE USUARIOS</th>
                  <th className="header-orange">Distancia (Km)</th>
                  <th className="header-orange">Rutas (Mes)</th>
                  <th className="header-orange">Vehiculos</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, index) => (
                  <tr 
                    key={index} 
                    className={`${index % 2 === 0 ? 'row-light' : 'row-white'} ${selectedUserIndex === index ? 'selected-row' : ''}`}
                    onClick={() => setSelectedUserIndex(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="user-name">{usuario.nombre}</td>
                    <td>{usuario.distancia}</td>
                    <td>{usuario.rutasMes}</td>
                    <td>{usuario.vehiculos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-footer">
              Datos actuales {getFechaActual()} - Click para ver detalles
            </div>
          </div>
        </div>

        {/* SECCIÓN DERECHA: Gráficos */}
        <div className="right-section">
          {/* Gráfico Donut */}
          <div className="chart-card">
            <div className="chart-title">Categorias rutas recorridas</div>
            <div className="donut-chart" style={{ position: 'relative' }}>
              <svg viewBox="0 0 200 200" className="donut-svg">
                {/* Urbano - Naranja */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#FF6610"
                  strokeWidth="40"
                  strokeDasharray={`${(selectedUser.categorias.urbano / 100) * circumference} ${circumference}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                  className="donut-segment"
                  onMouseEnter={() => setHoveredPoint('urbano')}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Rural - Naranja claro */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#FFB380"
                  strokeWidth="40"
                  strokeDasharray={`${(selectedUser.categorias.rural / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-ruralOffset}
                  transform="rotate(-90 100 100)"
                  className="donut-segment"
                  onMouseEnter={() => setHoveredPoint('rural')}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Montaña - Naranja muy claro */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#FFD4B8"
                  strokeWidth="40"
                  strokeDasharray={`${(selectedUser.categorias.montaña / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-montañaOffset}
                  transform="rotate(-90 100 100)"
                  className="donut-segment"
                  onMouseEnter={() => setHoveredPoint('montaña')}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                />
                <text x="100" y="100" textAnchor="middle" dy=".3em" fontSize="20" fontWeight="700" fill="#333">
                  {selectedUser.nombre.split(' ')[0]}
                </text>
              </svg>
              {hoveredPoint && (
                <div className="chart-tooltip">
                  {hoveredPoint === 'urbano' && `Urbano: ${selectedUser.categorias.urbano}%`}
                  {hoveredPoint === 'rural' && `Rural: ${selectedUser.categorias.rural}%`}
                  {hoveredPoint === 'montaña' && `Montaña: ${selectedUser.categorias.montaña}%`}
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Barras - Distancia Semanal */}
          <div className="chart-card">
            <div className="chart-title-bold">DISTANCIA SEMANAL (KM)</div>
            <div className="bar-chart-horizontal" style={{ position: 'relative' }}>
              <div className="bars-container">
                {distanciaSemanal.map((dato, index) => {
                  const height = (dato.valor / maxValorBarras) * 100;
                  return (
                    <div key={index} className="bar-wrapper">
                      <div 
                        className="bar-vertical" 
                        style={{ height: `${height}%` }}
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                      ></div>
                      <div className="bar-label-bottom">{dato.dia}</div>
                    </div>
                  );
                })}
              </div>
              {hoveredBar !== null && (
                <div className="chart-tooltip">
                  {distanciaSemanal[hoveredBar].dia}: {distanciaSemanal[hoveredBar].valor} km
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Líneas con Área - Ahora ocupa todo el ancho */}
        <div className="chart-card chart-card-full-width">
          <div className="chart-title-bold">USUARIOS EN RUTAS ESTE MES</div>
          <div className="line-area-chart" style={{ position: 'relative' }}>
            <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="area-svg">
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF6610" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#FFD4B8" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#areaGradient)" />
              <path d={linePath} fill="none" stroke="#FF6610" strokeWidth="0.5" />
              {rutasporDia.map((d, i) => {
                const x = (i / (rutasporDia.length - 1)) * 200;
                const y = 60 - (d.valor / maxValorLineas) * 60;
                return (
                  <circle 
                    key={i} 
                    cx={x} 
                    cy={y} 
                    r="2" 
                    fill="#FF6610"
                    className="chart-point"
                    onMouseEnter={() => setHoveredPoint(`line-${i}`)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}
            </svg>
            <div className="chart-x-labels">
              {rutasporDia.map((d, i) => (
                <span key={i}>{d.dia}</span>
              ))}
            </div>
            {hoveredPoint && hoveredPoint.startsWith('line-') && (
              <div className="chart-tooltip">
                Día {rutasporDia[parseInt(hoveredPoint.split('-')[1])].dia}: {rutasporDia[parseInt(hoveredPoint.split('-')[1])].valor} usuarios
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;