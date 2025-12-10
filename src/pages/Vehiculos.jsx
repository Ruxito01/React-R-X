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

      {/* Contenedor principal tipo tarjeta */}
      <div className="vehiculos-main-card">
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
          {/* Gráfico de Barras Horizontales */}
          <div className="chart-card">
            <div className="chart-title">Distribución de terreno</div>
            <div className="horizontal-bars-chart" style={{ position: 'relative', padding: '20px 15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Barra Urbano */}
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#333', 
                    marginBottom: '5px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Urbano</span>
                    <span style={{ color: '#FF6610' }}>{selectedVehicle.categorias.urbano}%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '28px', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div 
                      style={{ 
                        width: `${selectedVehicle.categorias.urbano}%`, 
                        height: '100%',
                        background: 'linear-gradient(90deg, #FF6610 0%, #FF8844 100%)',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1.1)';
                        setHoveredPoint('urbano');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1)';
                        setHoveredPoint(null);
                      }}
                    />
                  </div>
                </div>
                
                {/* Barra Rural */}
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#333', 
                    marginBottom: '5px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Rural</span>
                    <span style={{ color: '#FFB380' }}>{selectedVehicle.categorias.rural}%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '28px', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div 
                      style={{ 
                        width: `${selectedVehicle.categorias.rural}%`, 
                        height: '100%',
                        background: 'linear-gradient(90deg, #FFB380 0%, #FFC999 100%)',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1.1)';
                        setHoveredPoint('rural');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1)';
                        setHoveredPoint(null);
                      }}
                    />
                  </div>
                </div>
                
                {/* Barra Montaña */}
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#333', 
                    marginBottom: '5px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Montaña</span>
                    <span style={{ color: '#FFD4B8' }}>{selectedVehicle.categorias.montaña}%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '28px', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div 
                      style={{ 
                        width: `${selectedVehicle.categorias.montaña}%`, 
                        height: '100%',
                        background: 'linear-gradient(90deg, #FFD4B8 0%, #FFE5D4 100%)',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1.1)';
                        setHoveredPoint('montaña');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scaleY(1)';
                        setHoveredPoint(null);
                      }}
                    />
                  </div>
                </div>
              </div>
              {hoveredPoint && (
                <div className="chart-tooltip">
                  {hoveredPoint === 'urbano' && `Urbano: ${selectedVehicle.categorias.urbano}%`}
                  {hoveredPoint === 'rural' && `Rural: ${selectedVehicle.categorias.rural}%`}
                  {hoveredPoint === 'montaña' && `Montaña: ${selectedVehicle.categorias.montaña}%`}
                </div>
              )}
            </div>
          </div>

          {/* Gráfico Radial - Distancia Semanal */}
          <div className="chart-card">
            <div className="chart-title-bold">DISTANCIA SEMANAL (KM)</div>
            <div className="radial-chart" style={{ position: 'relative', padding: '10px' }}>
              <svg viewBox="0 0 200 200" style={{ width: '100%', height: 'auto' }}>
                <defs>
                  <linearGradient id="radialGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF6610" stopOpacity="0.5"/>
                    <stop offset="100%" stopColor="#FFD4B8" stopOpacity="0.2"/>
                  </linearGradient>
                </defs>
                
                {/* Círculos de fondo (guías) */}
                {[20, 40, 60, 80, 100].map((percent) => (
                  <circle
                    key={percent}
                    cx="100"
                    cy="100"
                    r={percent * 0.6}
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Polígono del área de datos */}
                <path
                  d={(() => {
                    // Calcular los puntos del polígono hexagonal
                    const points = distanciaSemanal.map((dato, i) => {
                      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                      const radius = (dato.valor / maxValorBarras) * 60;
                      const x = 100 + radius * Math.cos(angle);
                      const y = 100 + radius * Math.sin(angle);
                      return `${x},${y}`;
                    });
                    return `M ${points.join(' L ')} Z`;
                  })()}
                  fill="url(#radialGradient)"
                  stroke="#FF6610"
                  strokeWidth="2"
                />
                
                {/* Puntos de datos */}
                {distanciaSemanal.map((dato, i) => {
                  const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                  const radius = (dato.valor / maxValorBarras) * 60;
                  const x = 100 + radius * Math.cos(angle);
                  const y = 100 + radius * Math.sin(angle);
                  
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#FF6610"
                        stroke="#fff"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredBar(i)}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    </g>
                  );
                })}
                
                {/* Labels de días */}
                {distanciaSemanal.map((dato, i) => {
                  const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                  const labelRadius = 75;
                  const x = 100 + labelRadius * Math.cos(angle);
                  const y = 100 + labelRadius * Math.sin(angle);
                  
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dy=".3em"
                      fontSize="11"
                      fontWeight="700"
                      fill="#333"
                    >
                      {dato.dia}
                    </text>
                  );
                })}
              </svg>
              {hoveredBar !== null && (
                <div className="chart-tooltip">
                  {distanciaSemanal[hoveredBar].dia}: {distanciaSemanal[hoveredBar].valor} km
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Barras Agrupadas - Uso Mensual */}
        <div className="chart-card chart-card-full-width">
          <div className="chart-title-bold">USO DEL VEHÍCULO ESTE MES</div>
          <div className="grouped-bar-chart" style={{ position: 'relative', padding: '20px 10px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-end', 
              justifyContent: 'space-around',
              height: '250px',
              borderBottom: '2px solid #e0e0e0',
              gap: '8px',
              paddingBottom: '10px'
            }}>
              {usoMensual.map((dato, i) => {
                const heightPercent = (dato.valor / maxValorLineas) * 100;
                const minHeight = 20; // Altura mínima en píxeles para que siempre sean visibles
                const calculatedHeight = Math.max((heightPercent / 100) * 240, minHeight); // 240px es el 100% del contenedor (250 - 10 de padding)
                return (
                  <div 
                    key={i} 
                    style={{ 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '30px',
                        height: `${calculatedHeight}px`,
                        background: `linear-gradient(180deg, #FF6610 0%, #FFB380 100%)`,
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        boxShadow: '0 2px 4px rgba(255, 102, 16, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 102, 16, 0.4)';
                        setHoveredPoint(`bar-${i}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 102, 16, 0.2)';
                        setHoveredPoint(null);
                      }}
                    >
                      {/* Barra de acento superior */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: '#FF4400',
                        borderRadius: '4px 4px 0 0'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Labels de días */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around',
              marginTop: '10px',
              gap: '8px'
            }}>
              {usoMensual.map((dato, i) => (
                <div 
                  key={i}
                  style={{ 
                    flex: 1,
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#666'
                  }}
                >
                  {dato.dia}
                </div>
              ))}
            </div>
            {hoveredPoint && hoveredPoint.startsWith('bar-') && (
              <div className="chart-tooltip">
                Día {usoMensual[parseInt(hoveredPoint.split('-')[1])].dia}: {usoMensual[parseInt(hoveredPoint.split('-')[1])].valor} viajes
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
