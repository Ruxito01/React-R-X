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

  // Datos mock para la tabla de usuarios con datos específicos de gráficos
  const usuarios = [
    { 
      id: 0,
      nombre: 'Sofía García', 
      distancia: 520, 
      rutasMes: 15, 
      vehiculos: 2,
      categorias: { urbano: 60, rural: 25, montaña: 15 },
      rutasPorDia: [
        { dia: '1', valor: 5 },
        { dia: '5', valor: 8 },
        { dia: '10', valor: 12 },
        { dia: '15', valor: 15 },
        { dia: '20', valor: 20 },
        { dia: '25', valor: 25 },
        { dia: '30', valor: 30 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 15 },
        { dia: 'M', valor: 25 },
        { dia: 'X', valor: 12 },
        { dia: 'J', valor: 8 },
        { dia: 'V', valor: 18 },
        { dia: 'S', valor: 35 },
      ]
    },
    { 
      id: 1,
      nombre: 'Carlos Méndez', 
      distancia: 480, 
      rutasMes: 12, 
      vehiculos: 1,
      categorias: { urbano: 40, rural: 35, montaña: 25 },
      rutasPorDia: [
        { dia: '1', valor: 3 },
        { dia: '5', valor: 6 },
        { dia: '10', valor: 9 },
        { dia: '15', valor: 12 },
        { dia: '20', valor: 15 },
        { dia: '25', valor: 18 },
        { dia: '30', valor: 22 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 12 },
        { dia: 'M', valor: 18 },
        { dia: 'X', valor: 20 },
        { dia: 'J', valor: 15 },
        { dia: 'V', valor: 22 },
        { dia: 'S', valor: 28 },
      ]
    },
    { 
      id: 2,
      nombre: 'María Torres', 
      distancia: 450, 
      rutasMes: 14, 
      vehiculos: 3,
      categorias: { urbano: 50, rural: 30, montaña: 20 },
      rutasPorDia: [
        { dia: '1', valor: 4 },
        { dia: '5', valor: 7 },
        { dia: '10', valor: 11 },
        { dia: '15', valor: 14 },
        { dia: '20', valor: 18 },
        { dia: '25', valor: 22 },
        { dia: '30', valor: 26 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 18 },
        { dia: 'M', valor: 22 },
        { dia: 'X', valor: 15 },
        { dia: 'J', valor: 12 },
        { dia: 'V', valor: 20 },
        { dia: 'S', valor: 30 },
      ]
    },
    { 
      id: 3,
      nombre: 'Ricardo Rodríguez', 
      distancia: 420, 
      rutasMes: 11, 
      vehiculos: 2,
      categorias: { urbano: 45, rural: 40, montaña: 15 },
      rutasPorDia: [
        { dia: '1', valor: 2 },
        { dia: '5', valor: 5 },
        { dia: '10', valor: 8 },
        { dia: '15', valor: 11 },
        { dia: '20', valor: 14 },
        { dia: '25', valor: 17 },
        { dia: '30', valor: 20 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 10 },
        { dia: 'M', valor: 15 },
        { dia: 'X', valor: 18 },
        { dia: 'J', valor: 14 },
        { dia: 'V', valor: 16 },
        { dia: 'S', valor: 25 },
      ]
    },
    { 
      id: 4,
      nombre: 'Ana Jiménez', 
      distancia: 380, 
      rutasMes: 10, 
      vehiculos: 1,
      categorias: { urbano: 55, rural: 25, montaña: 20 },
      rutasPorDia: [
        { dia: '1', valor: 3 },
        { dia: '5', valor: 5 },
        { dia: '10', valor: 7 },
        { dia: '15', valor: 10 },
        { dia: '20', valor: 13 },
        { dia: '25', valor: 16 },
        { dia: '30', valor: 19 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 14 },
        { dia: 'M', valor: 16 },
        { dia: 'X', valor: 12 },
        { dia: 'J', valor: 10 },
        { dia: 'V', valor: 15 },
        { dia: 'S', valor: 20 },
      ]
    },
    { 
      id: 5,
      nombre: 'Pedro Sánchez', 
      distancia: 350, 
      rutasMes: 9, 
      vehiculos: 2,
      categorias: { urbano: 35, rural: 45, montaña: 20 },
      rutasPorDia: [
        { dia: '1', valor: 2 },
        { dia: '5', valor: 4 },
        { dia: '10', valor: 6 },
        { dia: '15', valor: 9 },
        { dia: '20', valor: 11 },
        { dia: '25', valor: 14 },
        { dia: '30', valor: 17 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 11 },
        { dia: 'M', valor: 13 },
        { dia: 'X', valor: 10 },
        { dia: 'J', valor: 9 },
        { dia: 'V', valor: 12 },
        { dia: 'S', valor: 18 },
      ]
    },
    { 
      id: 6,
      nombre: 'Laura Ramírez', 
      distancia: 320, 
      rutasMes: 8, 
      vehiculos: 1,
      categorias: { urbano: 48, rural: 32, montaña: 20 },
      rutasPorDia: [
        { dia: '1', valor: 1 },
        { dia: '5', valor: 3 },
        { dia: '10', valor: 5 },
        { dia: '15', valor: 8 },
        { dia: '20', valor: 10 },
        { dia: '25', valor: 12 },
        { dia: '30', valor: 15 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 9 },
        { dia: 'M', valor: 12 },
        { dia: 'X', valor: 8 },
        { dia: 'J', valor: 7 },
        { dia: 'V', valor: 11 },
        { dia: 'S', valor: 16 },
      ]
    },
  ];

  const selectedUser = usuarios[selectedUserIndex];
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