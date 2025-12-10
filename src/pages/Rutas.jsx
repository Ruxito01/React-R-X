import React, { useState, useEffect } from 'react';
import './Rutas.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const Rutas = () => {
  // Scroll to top cuando el componente se monta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Estado para la ruta seleccionada
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Datos mock para rutas
  const rutas = [
    { 
      id: 0,
      nombre: 'Ruta Urbana Centro',
      distancia: 25,
      participantes: 12,
      estado: 'Completada',
      duracion: 2.5,
      terreno: { urbano: 80, rural: 15, montaña: 5 },
      rutasSemanales: [
        { dia: 'L', valor: 3 },
        { dia: 'M', valor: 5 },
        { dia: 'X', valor: 4 },
        { dia: 'J', valor: 2 },
        { dia: 'V', valor: 6 },
        { dia: 'S', valor: 8 },
        { dia: 'D', valor: 4 },
      ],
      distanciaMensual: [
        { dia: '1', valor: 15 },
        { dia: '5', valor: 25 },
        { dia: '10', valor: 40 },
        { dia: '15', valor: 58 },
        { dia: '20', valor: 75 },
        { dia: '25', valor: 95 },
        { dia: '30', valor: 120 },
      ],
      promedioParticipantes: 12,
      participantesMensuales: [
        { dia: 5, valor: 8 },
        { dia: 10, valor: 10 },
        { dia: 15, valor: 12 },
        { dia: 20, valor: 11 },
        { dia: 25, valor: 14 },
        { dia: 30, valor: 12 },
      ]
    },
    { 
      id: 1,
      nombre: 'Sendero Montaña Norte',
      distancia: 45,
      participantes: 8,
      estado: 'Activa',
      duracion: 5.2,
      terreno: { urbano: 10, rural: 30, montaña: 60 },
      rutasSemanales: [
        { dia: 'L', valor: 2 },
        { dia: 'M', valor: 3 },
        { dia: 'X', valor: 2 },
        { dia: 'J', valor: 1 },
        { dia: 'V', valor: 4 },
        { dia: 'S', valor: 6 },
        { dia: 'D', valor: 5 },
      ],
      distanciaMensual: [
        { dia: '1', valor: 20 },
        { dia: '5', valor: 35 },
        { dia: '10', valor: 55 },
        { dia: '15', valor: 78 },
        { dia: '20', valor: 100 },
        { dia: '25', valor: 125 },
        { dia: '30', valor: 150 },
      ],
      promedioParticipantes: 8,
      participantesMensuales: [
        { dia: 5, valor: 6 },
        { dia: 10, valor: 7 },
        { dia: 15, valor: 9 },
        { dia: 20, valor: 8 },
        { dia: 25, valor: 10 },
        { dia: 30, valor: 8 },
      ]
    },
    { 
      id: 2,
      nombre: 'Circuito Rural Este',
      distancia: 32,
      participantes: 10,
      estado: 'Completada',
      duracion: 3.8,
      terreno: { urbano: 25, rural: 60, montaña: 15 },
      rutasSemanales: [
        { dia: 'L', valor: 4 },
        { dia: 'M', valor: 4 },
        { dia: 'X', valor: 3 },
        { dia: 'J', valor: 3 },
        { dia: 'V', valor: 5 },
        { dia: 'S', valor: 7 },
        { dia: 'D', valor: 3 },
      ],
      distanciaMensual: [
        { dia: '1', valor: 18 },
        { dia: '5', valor: 30 },
        { dia: '10', valor: 48 },
        { dia: '15', valor: 68 },
        { dia: '20', valor: 88 },
        { dia: '25', valor: 110 },
        { dia: '30', valor: 135 },
      ],
      promedioParticipantes: 10,
      participantesMensuales: [
        { dia: 5, valor: 9 },
        { dia: 10, valor: 10 },
        { dia: 15, valor: 11 },
        { dia: 20, valor: 10 },
        { dia: 25, valor: 12 },
        { dia: 30, valor: 10 },
      ]
    },
    { 
      id: 3,
      nombre: 'Paseo Costero',
      distancia: 18,
      participantes: 15,
      estado: 'Completada',
      duracion: 2.0,
      terreno: { urbano: 50, rural: 40, montaña: 10 },
      rutasSemanales: [
        { dia: 'L', valor: 5 },
        { dia: 'M', valor: 6 },
        { dia: 'X', valor: 5 },
        { dia: 'J', valor: 4 },
        { dia: 'V', valor: 7 },
        { dia: 'S', valor: 10 },
        { dia: 'D', valor: 8 },
      ],
      distanciaMensual: [
        { dia: '1', valor: 12 },
        { dia: '5', valor: 22 },
        { dia: '10', valor: 35 },
        { dia: '15', valor: 50 },
        { dia: '20', valor: 68 },
        { dia: '25', valor: 88 },
        { dia: '30', valor: 110 },
      ],
      promedioParticipantes: 15,
      participantesMensuales: [
        { dia: 5, valor: 12 },
        { dia: 10, valor: 14 },
        { dia: 15, valor: 16 },
        { dia: 20, valor: 15 },
        { dia: 25, valor: 18 },
        { dia: 30, valor: 15 },
      ]
    },
    { 
      id: 4,
      nombre: 'Travesía Valle Sur',
      distancia: 58,
      participantes: 6,
      estado: 'Activa',
      duracion: 6.5,
      terreno: { urbano: 5, rural: 45, montaña: 50 },
      rutasSemanales: [
        { dia: 'L', valor: 1 },
        { dia: 'M', valor: 2 },
        { dia: 'X', valor: 2 },
        { dia: 'J', valor: 1 },
        { dia: 'V', valor: 3 },
        { dia: 'S', valor: 5 },
        { dia: 'D', valor: 4 },
      ],
      distanciaMensual: [
        { dia: '1', valor: 25 },
        { dia: '5', valor: 42 },
        { dia: '10', valor: 65 },
        { dia: '15', valor: 90 },
        { dia: '20', valor: 115 },
        { dia: '25', valor: 142 },
        { dia: '30', valor: 170 },
      ],
      promedioParticipantes: 6,
      participantesMensuales: [
        { dia: 5, valor: 5 },
        { dia: 10, valor: 6 },
        { dia: 15, valor: 7 },
        { dia: 20, valor: 6 },
        { dia: 25, valor: 7 },
        { dia: 30, valor: 6 },
      ]
    },
    { 
      id: 5,
      nombre: 'Ruta Histórica Centro',
      distancia: 22,
      participantes: 14,
      estado: 'Completada',
      duracion: 2.8,
      terreno: { urbano: 90, rural: 8, montaña: 2 },
      rutasSemanales: [
        { dia: 'L', valor: 4 },
        { dia: 'M', valor: 5 },
        { dia: 'X', valor: 6 },
        { dia: 'J', valor: 3 },
        { dia: 'V', valor: 6 },
        { dia: 'S', valor: 9 },
        { dia: 'D', valor: 6 },
      ],
      distanciaMensual: [
        { dia: '1', valor: 14 },
        { dia: '5', valor: 24 },
        { dia: '10', valor: 38 },
        { dia: '15', valor: 55 },
        { dia: '20', valor: 72 },
        { dia: '25', valor: 92 },
        { dia: '30', valor: 115 },
      ],
      promedioParticipantes: 14,
      participantesMensuales: [
        { dia: 5, valor: 11 },
        { dia: 10, valor: 13 },
        { dia: 15, valor: 15 },
        { dia: 20, valor: 14 },
        { dia: 25, valor: 16 },
        { dia: 30, valor: 14 },
      ]
    },
  ];

  const selectedRoute = rutas[selectedRouteIndex];
  const rutasSemanales = selectedRoute.rutasSemanales;
  const distanciaMensual = selectedRoute.distanciaMensual;

  const maxValorRadial = Math.max(...rutasSemanales.map(d => d.valor));
  const maxValorDistancia = Math.max(...distanciaMensual.map(d => d.valor));

  // Función para obtener la fecha actual en español
  const getFechaActual = () => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    return `al ${dia} de ${mes}`;
  };

  return (
    <div className="rutas-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
      <div className="rutas-header">
        <h1>DASHBOARD DE RUTAS</h1>
      </div>

      {/* Contenedor principal tipo tarjeta */}
      <div className="rutas-main-card">
        <div className="rutas-grid">
        {/* SECCIÓN IZQUIERDA: Ruta destacada + Tabla */}
        <div className="rutas-left-section">
          {/* Ruta Destacada - Diseño Horizontal */}
          <div className="featured-route-card">
            <div className="route-card-title">RUTA SELECCIONADA</div>
            <div className="route-featured-content-horizontal">
              {/* Icono de la ruta */}
              <div className="route-icon-circle">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="47" stroke="#FF6610" strokeWidth="4" fill="none"/>
                  {/* Icono de ruta/camino */}
                  <path d="M30 70 Q40 45 50 50 T70 30" stroke="#FF6610" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <circle cx="30" cy="70" r="5" fill="#FF6610"/>
                  <circle cx="70" cy="30" r="5" fill="#FF6610"/>
                  <circle cx="50" cy="50" r="3" fill="#FF6610"/>
                  {/* Marcador de ubicación */}
                  <path d="M50 25 L50 35 M45 30 L50 25 L55 30" stroke="#FF6610" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Sección central: distancia + barras + label */}
              <div className="route-center-stats-section">
                <div className="route-distance-with-bars">
                  <div className="route-distance-number">{selectedRoute.distancia} km</div>
                  <div className="route-vertical-bars-group">
                    <div className="route-v-bar medium"></div>
                    <div className="route-v-bar tall"></div>
                  </div>
                </div>
                <div className="route-participation-label">Distancia Total</div>
              </div>

              {/* Número de participantes con mini barras */}
              <div className="route-number-section">
                <div className="route-number">{selectedRoute.participantes}</div>
                <div className="route-mini-bars-group">
                  <div className="route-mini-bar short"></div>
                  <div className="route-mini-bar tall"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Rutas */}
          <div className="routes-table-card">
            <table className="routes-table">
              <thead>
                <tr>
                  <th className="header-orange">LISTA DE RUTAS</th>
                  <th className="header-orange">Distancia (Km)</th>
                  <th className="header-orange">Participantes</th>
                  <th className="header-orange">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rutas.map((ruta, index) => (
                  <tr 
                    key={index} 
                    className={`${index % 2 === 0 ? 'route-row-light' : 'route-row-white'} ${selectedRouteIndex === index ? 'selected-route-row' : ''}`}
                    onClick={() => setSelectedRouteIndex(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="route-name-cell">{ruta.nombre}</td>
                    <td>{ruta.distancia}</td>
                    <td>{ruta.participantes}</td>
                    <td>{ruta.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="route-table-footer">
              Datos actuales {getFechaActual()} - Click para ver detalles
            </div>
          </div>
        </div>

        {/* SECCIÓN DERECHA: Gráficos */}
        <div className="rutas-right-section">
          {/* Gráfico 1: Líneas - Evolución de Participantes TOP 3 */}
          <div className="route-chart-card">
            <div className="route-chart-title-bold">PARTICIPANTES DE RUTAS POPULARES</div>
            <div style={{ position: 'relative', padding: '15px 10px' }}>
              <svg viewBox="0 0 320 180" style={{ width: '100%', height: 'auto' }}>
                <defs>
                  <linearGradient id="line1Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6610" />
                    <stop offset="100%" stopColor="#FF8844" />
                  </linearGradient>
                  <linearGradient id="line2Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF8844" />
                    <stop offset="100%" stopColor="#FFB380" />
                  </linearGradient>
                  <linearGradient id="line3Gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFB380" />
                    <stop offset="100%" stopColor="#FFD4B8" />
                  </linearGradient>
                </defs>

                {/* Líneas de guía horizontales */}
                {[0, 25, 50, 75, 100].map((percent) => (
                  <line
                    key={percent}
                    x1="30"
                    y1={140 - (percent * 1.0)}
                    x2="290"
                    y2={140 - (percent * 1.0)}
                    stroke="#f0f0f0"
                    strokeWidth="1"
                  />
                ))}

                {/* Dibujar las 3 líneas del TOP 3 */}
                {rutas
                  .sort((a, b) => b.participantes - a.participantes)
                  .slice(0, 3)
                  .map((ruta, lineIndex) => {
                    const maxParticipantes = Math.max(...rutas.flatMap(r => r.participantesMensuales.map(p => p.valor)));
                    const colors = ['url(#line1Gradient)', 'url(#line2Gradient)', 'url(#line3Gradient)'];
                    const strokeColors = ['#FF6610', '#FF8844', '#FFB380'];

                    // Crear path para la línea
                    const points = ruta.participantesMensuales.map((dato, i) => {
                      const x = 30 + (i * (260 / (ruta.participantesMensuales.length - 1)));
                      const y = 140 - ((dato.valor / maxParticipantes) * 100);
                      return { x, y };
                    });

                    const pathData = points.map((p, i) => 
                      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                    ).join(' ');

                    return (
                      <g key={lineIndex}>
                        {/* Línea */}
                        <path
                          d={pathData}
                          stroke={strokeColors[lineIndex]}
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Puntos en la línea */}
                        {points.map((p, i) => (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill={strokeColors[lineIndex]}
                            stroke="#fff"
                            strokeWidth="2"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredPoint(`line${lineIndex}-${i}`)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        ))}
                      </g>
                    );
                  })}

                {/* Labels del eje X (días) */}
                {rutas[0].participantesMensuales.map((dato, i) => {
                  const x = 30 + (i * (260 / (rutas[0].participantesMensuales.length - 1)));
                  return (
                    <text
                      key={i}
                      x={x}
                      y="160"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#666"
                    >
                      {dato.dia}
                    </text>
                  );
                })}
              </svg>

              {/* Leyenda */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '4px',
                marginTop: '10px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                {rutas
                  .sort((a, b) => b.participantes - a.participantes)
                  .slice(0, 3)
                  .map((ruta, i) => {
                    const colors = ['#FF6610', '#FF8844', '#FFB380'];
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '3px', 
                          background: colors[i], 
                          borderRadius: '2px' 
                        }}></div>
                        <span style={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {ruta.nombre}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {hoveredPoint && hoveredPoint.startsWith('line') && (
                <div className="route-chart-tooltip">
                  {(() => {
                    const [linePart, idx] = hoveredPoint.split('-');
                    const lineIndex = parseInt(linePart.replace('line', ''));
                    const pointIndex = parseInt(idx);
                    const topRutas = rutas.sort((a, b) => b.participantes - a.participantes).slice(0, 3);
                    const ruta = topRutas[lineIndex];
                    const dato = ruta.participantesMensuales[pointIndex];
                    return `${ruta.nombre} - Día ${dato.dia}: ${dato.valor} participantes`;
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Gráfico 2: Barras Horizontales - Top 3 Rutas Populares */}
          <div className="route-chart-card">
            <div className="route-chart-title-bold">TOP 3 RUTAS MÁS POPULARES</div>
            <div style={{ position: 'relative', padding: '20px 15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {rutas
                  .sort((a, b) => b.participantes - a.participantes)
                  .slice(0, 3)
                  .map((ruta, i) => {
                    const maxParticipantes = Math.max(...rutas.map(r => r.participantes));
                    const widthPercent = (ruta.participantes / maxParticipantes) * 100;
                    
                    return (
                      <div key={i} style={{ position: 'relative' }}>
                        {/* Número de posición y nombre */}
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '700', 
                          color: '#333', 
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {i + 1}
                          </span>
                          <span style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}>
                            {ruta.nombre}
                          </span>
                          <span style={{ color: '#FF6610', fontWeight: '700', fontSize: '14px' }}>
                            {ruta.participantes}
                          </span>
                        </div>

                        {/* Barra de participantes */}
                        <div style={{ 
                          width: '100%', 
                          height: '24px', 
                          backgroundColor: '#f5f5f5', 
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          <div 
                            style={{ 
                              width: `${widthPercent}%`, 
                              height: '100%',
                              background: i === 0 
                                ? 'linear-gradient(90deg, #FF6610 0%, #FF8844 100%)'
                                : i === 1
                                ? 'linear-gradient(90deg, #FF8844 0%, #FFB380 100%)'
                                : 'linear-gradient(90deg, #FFB380 0%, #FFD4B8 100%)',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              minWidth: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: '10px',
                              boxShadow: '0 2px 4px rgba(255, 102, 16, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scaleY(1.1)';
                              setHoveredPoint(`pop-${i}`);
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scaleY(1)';
                              setHoveredPoint(null);
                            }}
                          >
                            <span style={{ 
                              color: 'white', 
                              fontSize: '10px', 
                              fontWeight: '600',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                              {ruta.distancia} km · {ruta.duracion}h
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {hoveredPoint && hoveredPoint.startsWith('pop-') && (
                <div className="route-chart-tooltip">
                  {(() => {
                    const topRutas = rutas.sort((a, b) => b.participantes - a.participantes).slice(0, 3);
                    const ruta = topRutas[parseInt(hoveredPoint.split('-')[1])];
                    return `${ruta.nombre}: ${ruta.participantes} participantes - ${ruta.distancia}km en ${ruta.duracion}h`;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico 3: Círculos de Progreso - Distribución de Terreno */}
        <div className="route-chart-card route-chart-card-full-width">
          <div className="route-chart-title-bold">DISTRIBUCIÓN POR TIPO DE TERRENO</div>
          <div style={{ position: 'relative', padding: '30px 20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around',
              alignItems: 'center',
              gap: '30px'
            }}>
              {/* Círculo Urbano */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="urbanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6610" />
                      <stop offset="100%" stopColor="#FF8844" />
                    </linearGradient>
                  </defs>
                  {/* Círculo de fondo */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="12"
                  />
                  {/* Círculo de progreso */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#urbanGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(selectedRoute.terreno.urbano / 100) * 314} 314`}
                    transform="rotate(-90 60 60)"
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.5s ease'
                    }}
                    onMouseEnter={() => setHoveredPoint('urbano')}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Texto central */}
                  <text
                    x="60"
                    y="60"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="24"
                    fontWeight="700"
                    fill="#FF6610"
                  >
                    {selectedRoute.terreno.urbano}%
                  </text>
                </svg>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#666' }}>
                  Urbano
                </div>
              </div>

              {/* Círculo Rural */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="ruralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFB380" />
                      <stop offset="100%" stopColor="#FFC999" />
                    </linearGradient>
                  </defs>
                  {/* Círculo de fondo */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="12"
                  />
                  {/* Círculo de progreso */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#ruralGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(selectedRoute.terreno.rural / 100) * 314} 314`}
                    transform="rotate(-90 60 60)"
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.5s ease'
                    }}
                    onMouseEnter={() => setHoveredPoint('rural')}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Texto central */}
                  <text
                    x="60"
                    y="60"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="24"
                    fontWeight="700"
                    fill="#FFB380"
                  >
                    {selectedRoute.terreno.rural}%
                  </text>
                </svg>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#666' }}>
                  Rural
                </div>
              </div>

              {/* Círculo Montaña */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD4B8" />
                      <stop offset="100%" stopColor="#FFE5D4" />
                    </linearGradient>
                  </defs>
                  {/* Círculo de fondo */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#f0f0f0"
                    strokeWidth="12"
                  />
                  {/* Círculo de progreso */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#mountainGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(selectedRoute.terreno.montaña / 100) * 314} 314`}
                    transform="rotate(-90 60 60)"
                    style={{ 
                      cursor: 'pointer',
                      transition: 'all 0.5s ease'
                    }}
                    onMouseEnter={() => setHoveredPoint('montaña')}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Texto central */}
                  <text
                    x="60"
                    y="60"
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="24"
                    fontWeight="700"
                    fill="#FFD4B8"
                  >
                    {selectedRoute.terreno.montaña}%
                  </text>
                </svg>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#666' }}>
                  Montaña
                </div>
              </div>
            </div>

            {hoveredPoint && ['urbano', 'rural', 'montaña'].includes(hoveredPoint) && (
              <div className="route-chart-tooltip">
                {hoveredPoint === 'urbano' && `Urbano: ${selectedRoute.terreno.urbano}%`}
                {hoveredPoint === 'rural' && `Rural: ${selectedRoute.terreno.rural}%`}
                {hoveredPoint === 'montaña' && `Montaña: ${selectedRoute.terreno.montaña}%`}
              </div>
            )}
          </div>
        </div>

                </div>
      </div>
    </div>
  );
};

export default Rutas;
