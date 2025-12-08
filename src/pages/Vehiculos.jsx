import React, { useState, useEffect } from 'react';
import './Vehiculos.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const Vehiculos = () => {
  // Scroll to top cuando el componente se monta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Estado para el vehículo seleccionado
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Datos mock para vehículos
  const vehiculos = [
    { 
      id: 0,
      nombre: 'Mountain Bike Pro',
      tipo: 'Bicicleta',
      distancia: 850,
      viajesMes: 28,
      categorias: { urbano: 45, rural: 30, montaña: 25 },
      usoMensual: [
        { dia: '1', valor: 10 },
        { dia: '5', valor: 15 },
        { dia: '10', valor: 22 },
        { dia: '15', valor: 28 },
        { dia: '20', valor: 35 },
        { dia: '25', valor: 42 },
        { dia: '30', valor: 50 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 25 },
        { dia: 'M', valor: 32 },
        { dia: 'X', valor: 28 },
        { dia: 'J', valor: 22 },
        { dia: 'V', valor: 30 },
        { dia: 'S', valor: 45 },
      ]
    },
    { 
      id: 1,
      nombre: 'Toyota Corolla 2022',
      tipo: 'Automóvil',
      distancia: 1250,
      viajesMes: 35,
      categorias: { urbano: 60, rural: 25, montaña: 15 },
      usoMensual: [
        { dia: '1', valor: 8 },
        { dia: '5', valor: 14 },
        { dia: '10', valor: 20 },
        { dia: '15', valor: 26 },
        { dia: '20', valor: 32 },
        { dia: '25', valor: 38 },
        { dia: '30', valor: 45 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 35 },
        { dia: 'M', valor: 40 },
        { dia: 'X', valor: 38 },
        { dia: 'J', valor: 32 },
        { dia: 'V', valor: 42 },
        { dia: 'S', valor: 50 },
      ]
    },
    { 
      id: 2,
      nombre: 'Urban E-Bike',
      tipo: 'Bicicleta Eléctrica',
      distancia: 720,
      viajesMes: 32,
      categorias: { urbano: 75, rural: 15, montaña: 10 },
      usoMensual: [
        { dia: '1', valor: 12 },
        { dia: '5', valor: 18 },
        { dia: '10', valor: 25 },
        { dia: '15', valor: 32 },
        { dia: '20', valor: 38 },
        { dia: '25', valor: 44 },
        { dia: '30', valor: 52 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 28 },
        { dia: 'M', valor: 35 },
        { dia: 'X', valor: 30 },
        { dia: 'J', valor: 25 },
        { dia: 'V', valor: 32 },
        { dia: 'S', valor: 40 },
      ]
    },
    { 
      id: 3,
      nombre: 'Honda CRV 2023',
      tipo: 'SUV',
      distancia: 980,
      viajesMes: 25,
      categorias: { urbano: 50, rural: 35, montaña: 15 },
      usoMensual: [
        { dia: '1', valor: 6 },
        { dia: '5', valor: 10 },
        { dia: '10', valor: 15 },
        { dia: '15', valor: 20 },
        { dia: '20', valor: 25 },
        { dia: '25', valor: 30 },
        { dia: '30', valor: 35 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 30 },
        { dia: 'M', valor: 35 },
        { dia: 'X', valor: 32 },
        { dia: 'J', valor: 28 },
        { dia: 'V', valor: 38 },
        { dia: 'S', valor: 45 },
      ]
    },
    { 
      id: 4,
      nombre: 'City Scooter 150',
      tipo: 'Motocicleta',
      distancia: 650,
      viajesMes: 30,
      categorias: { urbano: 70, rural: 20, montaña: 10 },
      usoMensual: [
        { dia: '1', valor: 9 },
        { dia: '5', valor: 14 },
        { dia: '10', valor: 19 },
        { dia: '15', valor: 24 },
        { dia: '20', valor: 29 },
        { dia: '25', valor: 34 },
        { dia: '30', valor: 40 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 22 },
        { dia: 'M', valor: 28 },
        { dia: 'X', valor: 25 },
        { dia: 'J', valor: 20 },
        { dia: 'V', valor: 26 },
        { dia: 'S', valor: 35 },
      ]
    },
    { 
      id: 5,
      nombre: 'Road Bike Elite',
      tipo: 'Bicicleta',
      distancia: 920,
      viajesMes: 26,
      categorias: { urbano: 40, rural: 45, montaña: 15 },
      usoMensual: [
        { dia: '1', valor: 7 },
        { dia: '5', valor: 12 },
        { dia: '10', valor: 17 },
        { dia: '15', valor: 22 },
        { dia: '20', valor: 27 },
        { dia: '25', valor: 32 },
        { dia: '30', valor: 38 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 26 },
        { dia: 'M', valor: 32 },
        { dia: 'X', valor: 28 },
        { dia: 'J', valor: 24 },
        { dia: 'V', valor: 30 },
        { dia: 'S', valor: 42 },
      ]
    },
    { 
      id: 6,
      nombre: 'Mazda 3 Sedan',
      tipo: 'Automóvil',
      distancia: 1100,
      viajesMes: 22,
      categorias: { urbano: 65, rural: 25, montaña: 10 },
      usoMensual: [
        { dia: '1', valor: 5 },
        { dia: '5', valor: 9 },
        { dia: '10', valor: 13 },
        { dia: '15', valor: 17 },
        { dia: '20', valor: 21 },
        { dia: '25', valor: 25 },
        { dia: '30', valor: 30 },
      ],
      distanciaSemanal: [
        { dia: 'L', valor: 32 },
        { dia: 'M', valor: 38 },
        { dia: 'X', valor: 35 },
        { dia: 'J', valor: 30 },
        { dia: 'V', valor: 40 },
        { dia: 'S', valor: 48 },
      ]
    },
  ];

  const selectedVehicle = vehiculos[selectedVehicleIndex];
  const usoMensual = selectedVehicle.usoMensual;
  const distanciaSemanal = selectedVehicle.distanciaSemanal;

  const maxValorLineas = Math.max(...usoMensual.map(d => d.valor));
  const maxValorBarras = Math.max(...distanciaSemanal.map(d => d.valor));

  // Generar puntos para el path del gráfico de área
  const generateAreaPath = () => {
    const width = 100;
    const height = 100;
    const points = usoMensual.map((d, i) => {
      const x = (i / (usoMensual.length - 1)) * width;
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
  const ruralOffset = (selectedVehicle.categorias.urbano / 100) * circumference;
  const montañaOffset = ((selectedVehicle.categorias.urbano + selectedVehicle.categorias.rural) / 100) * circumference;

  // Función para obtener la fecha actual en español
  const getFechaActual = () => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    return `al ${dia} de ${mes}`;
  };

  return (
    <div className="vehiculos-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
      <div className="vehiculos-header">
        <h1>DASHBOARD DE VEHÍCULOS</h1>
      </div>

      <div className="vehiculos-grid">
        {/* SECCIÓN IZQUIERDA: Vehículo destacado + Tabla */}
        <div className="left-section">
          {/* Vehículo Destacado - Diseño Horizontal */}
          <div className="featured-vehicle-card">
            <div className="card-title">VEHÍCULO SELECCIONADO</div>
            <div className="featured-content-horizontal">
              {/* Icono del vehículo */}
              <div className="vehicle-icon-circle">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="47" stroke="#FF6610" strokeWidth="4" fill="none"/>
                  <text x="70" y="56" fontSize="9" fill="#FF6610" fontWeight="600">km</text>
                  {/* Bicicleta/Vehículo genérico */}
                  <circle cx="35" cy="65" r="8" stroke="#FF6610" strokeWidth="3" fill="none"/>
                  <circle cx="65" cy="65" r="8" stroke="#FF6610" strokeWidth="3" fill="none"/>
                  <path d="M35 65 L45 45 L55 45 L65 65" stroke="#FF6610" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M45 45 L50 35 L58 35" stroke="#FF6610" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M50 45 L50 55" stroke="#FF6610" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Sección central: distancia + barras + label */}
              <div className="center-stats-section">
                <div className="distance-with-bars">
                  <div className="distance-number">{selectedVehicle.distancia} km</div>
                  <div className="vertical-bars-group">
                    <div className="v-bar medium"></div>
                    <div className="v-bar tall"></div>
                  </div>
                </div>
                <div className="participation-label">Viajes Realizados</div>
              </div>

              {/* Número de viajes con mini barras */}
              <div className="number-fifteen-section">
                <div className="fifteen-number">{selectedVehicle.viajesMes}</div>
                <div className="mini-bars-group">
                  <div className="mini-bar short"></div>
                  <div className="mini-bar tall"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Vehículos */}
          <div className="vehicles-table-card">
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th className="header-orange">LISTA DE VEHÍCULOS</th>
                  <th className="header-orange">Distancia (Km)</th>
                  <th className="header-orange">Viajes (Mes)</th>
                  <th className="header-orange">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map((vehiculo, index) => (
                  <tr 
                    key={index} 
                    className={`${index % 2 === 0 ? 'row-light' : 'row-white'} ${selectedVehicleIndex === index ? 'selected-row' : ''}`}
                    onClick={() => setSelectedVehicleIndex(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="vehicle-name">{vehiculo.nombre}</td>
                    <td>{vehiculo.distancia}</td>
                    <td>{vehiculo.viajesMes}</td>
                    <td>{vehiculo.tipo}</td>
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
            <div className="chart-title">Distribución de terreno</div>
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
                  strokeDasharray={`${(selectedVehicle.categorias.urbano / 100) * circumference} ${circumference}`}
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
                  strokeDasharray={`${(selectedVehicle.categorias.rural / 100) * circumference} ${circumference}`}
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
                  strokeDasharray={`${(selectedVehicle.categorias.montaña / 100) * circumference} ${circumference}`}
                  strokeDashoffset={-montañaOffset}
                  transform="rotate(-90 100 100)"
                  className="donut-segment"
                  onMouseEnter={() => setHoveredPoint('montaña')}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                />
                <text x="100" y="100" textAnchor="middle" dy=".3em" fontSize="16" fontWeight="700" fill="#333">
                  {selectedVehicle.nombre.split(' ')[0]}
                </text>
              </svg>
              {hoveredPoint && (
                <div className="chart-tooltip">
                  {hoveredPoint === 'urbano' && `Urbano: ${selectedVehicle.categorias.urbano}%`}
                  {hoveredPoint === 'rural' && `Rural: ${selectedVehicle.categorias.rural}%`}
                  {hoveredPoint === 'montaña' && `Montaña: ${selectedVehicle.categorias.montaña}%`}
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Líneas con Área */}
          <div className="chart-card">
            <div className="chart-title-bold">USO DEL VEHÍCULO ESTE MES</div>
            <div className="line-area-chart" style={{ position: 'relative' }}>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="area-svg">
                <defs>
                  <linearGradient id="areaGradientVehicle" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF6610" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#FFD4B8" stopOpacity="0.2"/>
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#areaGradientVehicle)" />
                <path d={linePath} fill="none" stroke="#FF6610" strokeWidth="0.5" />
                {usoMensual.map((d, i) => {
                  const x = (i / (usoMensual.length - 1)) * 100;
                  const y = 100 - (d.valor / maxValorLineas) * 100;
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
                {usoMensual.map((d, i) => (
                  <span key={i}>{d.dia}</span>
                ))}
              </div>
              {hoveredPoint && hoveredPoint.startsWith('line-') && (
                <div className="chart-tooltip">
                  Día {usoMensual[parseInt(hoveredPoint.split('-')[1])].dia}: {usoMensual[parseInt(hoveredPoint.split('-')[1])].valor} viajes
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
      </div>
    </div>
  );
};

export default Vehiculos;
