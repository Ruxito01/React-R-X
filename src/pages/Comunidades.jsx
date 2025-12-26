import { useState, useEffect } from 'react';
import './Comunidades.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

function Comunidades() {
  const [selectedCommunityIndex, setSelectedCommunityIndex] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Estado para ordenamiento
  const [ordenamiento, setOrdenamiento] = useState({ columna: 'nombre', direccion: 'asc' });

  // Función de ordenamiento
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Datos mock de comunidades
  const comunidades = [
    {
      id: 0,
      nombre: 'Ciclistas Urbanos MX',
      miembros: 245,
      actividad: 'Alta',
      estado: 'Activa',
      fechaCreacion: '15 Ene 2023',
      engagement: 78,
      roles: { admins: 3, moderadores: 8, miembros: 220, invitados: 14 },
      crecimientoMensual: [
        { dia: 5, valor: 180 },
        { dia: 10, valor: 195 },
        { dia: 15, valor: 210 },
        { dia: 20, valor: 225 },
        { dia: 25, valor: 238 },
        { dia: 30, valor: 245 }
      ],
      actividadSemanal: [
        { dia: 'L', valor: 45 },
        { dia: 'M', valor: 52 },
        { dia: 'X', valor: 48 },
        { dia: 'J', valor: 50 },
        { dia: 'V', valor: 65 },
        { dia: 'S', valor: 78 },
        { dia: 'D', valor: 58 }
      ]
    },
    {
      id: 1,
      nombre: 'Aventureros de Montaña',
      miembros: 189,
      actividad: 'Media',
      estado: 'Activa',
      fechaCreacion: '22 Mar 2023',
      engagement: 62,
      roles: { admins: 2, moderadores: 5, miembros: 170, invitados: 12 },
      crecimientoMensual: [
        { dia: 5, valor: 150 },
        { dia: 10, valor: 160 },
        { dia: 15, valor: 170 },
        { dia: 20, valor: 178 },
        { dia: 25, valor: 184 },
        { dia: 30, valor: 189 }
      ],
      actividadSemanal: [
        { dia: 'L', valor: 35 },
        { dia: 'M', valor: 40 },
        { dia: 'X', valor: 38 },
        { dia: 'J', valor: 42 },
        { dia: 'V', valor: 50 },
        { dia: 'S', valor: 62 },
        { dia: 'D', valor: 45 }
      ]
    },
    {
      id: 2,
      nombre: 'Rutas Costeras',
      miembros: 312,
      actividad: 'Alta',
      estado: 'Activa',
      fechaCreacion: '10 Feb 2023',
      engagement: 85,
      roles: { admins: 4, moderadores: 10, miembros: 285, invitados: 13 },
      crecimientoMensual: [
        { dia: 5, valor: 260 },
        { dia: 10, valor: 275 },
        { dia: 15, valor: 288 },
        { dia: 20, valor: 295 },
        { dia: 25, valor: 304 },
        { dia: 30, valor: 312 }
      ],
      actividadSemanal: [
        { dia: 'L', valor: 55 },
        { dia: 'M', valor: 60 },
        { dia: 'X', valor: 58 },
        { dia: 'J', valor: 62 },
        { dia: 'V', valor: 75 },
        { dia: 'S', valor: 85 },
        { dia: 'D', valor: 68 }
      ]
    },
    {
      id: 3,
      nombre: 'Principiantes en Bici',
      miembros: 428,
      actividad: 'Alta',
      estado: 'Activa',
      fechaCreacion: '05 Abr 2023',
      engagement: 71,
      roles: { admins: 5, moderadores: 12, miembros: 395, invitados: 16 },
      crecimientoMensual: [
        { dia: 5, valor: 350 },
        { dia: 10, valor: 375 },
        { dia: 15, valor: 395 },
        { dia: 20, valor: 408 },
        { dia: 25, valor: 418 },
        { dia: 30, valor: 428 }
      ],
      actividadSemanal: [
        { dia: 'L', valor: 60 },
        { dia: 'M', valor: 68 },
        { dia: 'X', valor: 65 },
        { dia: 'J', valor: 70 },
        { dia: 'V', valor: 80 },
        { dia: 'S', valor: 90 },
        { dia: 'D', valor: 72 }
      ]
    },
    {
      id: 4,
      nombre: 'Ciclismo Nocturno',
      miembros: 156,
      actividad: 'Media',
      estado: 'Activa',
      fechaCreacion: '18 May 2023',
      engagement: 55,
      roles: { admins: 2, moderadores: 4, miembros: 140, invitados: 10 },
      crecimientoMensual: [
        { dia: 5, valor: 120 },
        { dia: 10, valor: 130 },
        { dia: 15, valor: 138 },
        { dia: 20, valor: 145 },
        { dia: 25, valor: 151 },
        { dia: 30, valor: 156 }
      ],
      actividadSemanal: [
        { dia: 'L', valor: 25 },
        { dia: 'M', valor: 30 },
        { dia: 'X', valor: 28 },
        { dia: 'J', valor: 32 },
        { dia: 'V', valor: 40 },
        { dia: 'S', valor: 48 },
        { dia: 'D', valor: 35 }
      ]
    }
  ];

  const selectedCommunity = comunidades[selectedCommunityIndex];

  return (
    <div className="comunidades-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
      <div className="comunidades-main-card">
        <div className="comunidades-grid">
          {/* SECCIÓN IZQUIERDA */}
          <div className="comunidades-left-section">
            {/* Comunidad Destacada */}
            <div className="featured-community-card">
              <div className="community-card-title">COMUNIDAD DESTACADA</div>
              <div className="community-featured-content-horizontal">
                {/* Icono circular */}
                <div className="community-icon-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="url(#communityGradient)" />
                    <defs>
                      <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF6610" />
                        <stop offset="100%" stopColor="#FF8844" />
                      </linearGradient>
                    </defs>
                    <text x="50" y="58" textAnchor="middle" fontSize="35" fontWeight="700" fill="#fff">
                      {selectedCommunity.nombre.charAt(0)}
                    </text>
                  </svg>
                </div>

                {/* Información central */}
                <div className="community-center-stats-section">
                  <div className="community-name-with-bars">
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1a1a1a', margin: 0 }}>
                      {selectedCommunity.nombre}
                    </h2>
                    <div className="community-vertical-bars-group">
                      <div className="community-v-bar medium"></div>
                      <div className="community-v-bar tall"></div>
                      <div className="community-v-bar medium"></div>
                    </div>
                  </div>
                  <div className="community-status-label">
                    Creada: {selectedCommunity.fechaCreacion}
                  </div>
                </div>

                {/* Número de miembros */}
                <div className="community-number-section">
                  <div className="community-number">{selectedCommunity.miembros}</div>
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
                      <th className="th-sortable" onClick={() => ordenarPor('actividad')}>
                        Actividad <IconoOrden columna="actividad" />
                      </th>
                      <th className="th-sortable" onClick={() => ordenarPor('estado')}>
                        Estado <IconoOrden columna="estado" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...comunidades].sort((a, b) => {
                      const { columna, direccion } = ordenamiento;
                      let valorA, valorB;
                      
                      switch (columna) {
                        case 'nombre':
                          valorA = a.nombre.toLowerCase();
                          valorB = b.nombre.toLowerCase();
                          break;
                        case 'miembros':
                          valorA = a.miembros;
                          valorB = b.miembros;
                          break;
                        case 'actividad':
                          valorA = a.actividad.toLowerCase();
                          valorB = b.actividad.toLowerCase();
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
                    }).map((comunidad) => {
                      // Mantener el indice original para la seleccion correcta
                      const originalIndex = comunidades.findIndex(c => c.id === comunidad.id);
                      return (
                        <tr
                          key={comunidad.id}
                          className={`${originalIndex % 2 === 0 ? 'community-row-light' : 'community-row-white'} ${originalIndex === selectedCommunityIndex ? 'selected-community-row' : ''}`}
                          onClick={() => setSelectedCommunityIndex(originalIndex)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="community-name-cell">{comunidad.nombre}</td>
                          <td>{comunidad.miembros}</td>
                          <td>{comunidad.actividad}</td>
                          <td>{comunidad.estado}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="community-table-footer">
                Datos actuales al 9 de diciembre - Click para ver detalles
              </div>
            </div>
          </div>

          {/* SECCIÓN DERECHA: Gráficos */}
          <div className="comunidades-right-section">
            {/* Gráfico 1: Área - Crecimiento de Miembros */}
            <div className="community-chart-card">
              <div className="community-chart-title-bold">CRECIMIENTO DE MIEMBROS</div>
              <div style={{ position: 'relative', padding: '10px 5px' }}>
                <svg viewBox="0 0 320 140" style={{ width: '100%', height: 'auto' }}>
                  <defs>
                    <linearGradient id="areaGradientCommunity" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF6610" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#FF6610" stopOpacity="0.05"/>
                    </linearGradient>
                  </defs>

                  {/* Líneas de guía */}
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <line
                      key={percent}
                      x1="30"
                      y1={100 - (percent * 0.7)}
                      x2="290"
                      y2={100 - (percent * 0.7)}
                      stroke="#f0f0f0"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Área sombreada */}
                  <path
                    d={(() => {
                      const maxValue = Math.max(...selectedCommunity.crecimientoMensual.map(d => d.valor));
                      const points = selectedCommunity.crecimientoMensual.map((dato, i) => {
                        const x = 30 + (i * (260 / (selectedCommunity.crecimientoMensual.length - 1)));
                        const y = 100 - ((dato.valor / maxValue) * 70);
                        return `${x},${y}`;
                      });
                      return `M 30,100 L ${points.join(' L ')} L 290,100 Z`;
                    })()}
                    fill="url(#areaGradientCommunity)"
                  />

                  {/* Línea principal */}
                  <path
                    d={(() => {
                      const maxValue = Math.max(...selectedCommunity.crecimientoMensual.map(d => d.valor));
                      const points = selectedCommunity.crecimientoMensual.map((dato, i) => {
                        const x = 30 + (i * (260 / (selectedCommunity.crecimientoMensual.length - 1)));
                        const y = 100 - ((dato.valor / maxValue) * 70);
                        return `${x},${y}`;
                      });
                      return `M ${points.join(' L ')}`;
                    })()}
                    stroke="#FF6610"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Puntos interactivos */}
                  {selectedCommunity.crecimientoMensual.map((dato, i) => {
                    const maxValue = Math.max(...selectedCommunity.crecimientoMensual.map(d => d.valor));
                    const x = 30 + (i * (260 / (selectedCommunity.crecimientoMensual.length - 1)));
                    const y = 100 - ((dato.valor / maxValue) * 70);
                    
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#FF6610"
                        stroke="#fff"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredPoint(`growth-${i}`)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}

                  {/* Labels del eje X */}
                  {selectedCommunity.crecimientoMensual.map((dato, i) => {
                    const x = 30 + (i * (260 / (selectedCommunity.crecimientoMensual.length - 1)));
                    return (
                      <text
                        key={i}
                        x={x}
                        y="120"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill="#666"
                      >
                        {dato.dia}
                      </text>
                    );
                  })}
                </svg>

                {hoveredPoint && hoveredPoint.startsWith('growth-') && (
                  <div className="community-chart-tooltip">
                    Día {selectedCommunity.crecimientoMensual[parseInt(hoveredPoint.split('-')[1])].dia}: 
                    {selectedCommunity.crecimientoMensual[parseInt(hoveredPoint.split('-')[1])].valor} miembros
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico 2: Barras Radiales - Actividad Semanal */}
            <div className="community-chart-card">
              <div className="community-chart-title-bold">ACTIVIDAD SEMANAL</div>
              <div style={{ position: 'relative', padding: '10px 5px' }}>
                <svg viewBox="0 0 180 180" style={{ width: '100%', height: 'auto', maxWidth: '200px', margin: '0 auto', display: 'block' }}>
                  {selectedCommunity.actividadSemanal.map((dato, i) => {
                    const maxActividad = Math.max(...selectedCommunity.actividadSemanal.map(d => d.valor));
                    const angle = (360 / 7) * i - 90;
                    const angleRad = (angle * Math.PI) / 180;
                    const innerRadius = 20;
                    const barLength = (dato.valor / maxActividad) * 50;
                    
                    const x1 = 90 + innerRadius * Math.cos(angleRad);
                    const y1 = 90 + innerRadius * Math.sin(angleRad);
                    const x2 = 90 + (innerRadius + barLength) * Math.cos(angleRad);
                    const y2 = 90 + (innerRadius + barLength) * Math.sin(angleRad);
                    const labelX = 90 + (innerRadius + barLength + 12) * Math.cos(angleRad);
                    const labelY = 90 + (innerRadius + barLength + 12) * Math.sin(angleRad);
                    
                    return (
                      <g key={i}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={`hsl(${25 - i * 3}, 100%, ${55 + i * 2}%)`}
                          strokeWidth="7"
                          strokeLinecap="round"
                          style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.setAttribute('stroke-width', '9');
                            setHoveredPoint(`activity-${i}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.setAttribute('stroke-width', '7');
                            setHoveredPoint(null);
                          }}
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="11"
                          fontWeight="700"
                          fill="#666"
                        >
                          {dato.dia}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="90" cy="90" r="18" fill="#f8f8f8" stroke="#FF6610" strokeWidth="2" />
                </svg>

                {hoveredPoint && hoveredPoint.startsWith('activity-') && (
                  <div className="community-chart-tooltip">
                    {selectedCommunity.actividadSemanal[parseInt(hoveredPoint.split('-')[1])].dia}: 
                    {selectedCommunity.actividadSemanal[parseInt(hoveredPoint.split('-')[1])].valor}% actividad
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico 3: Gauge - Nivel de Participación */}
            <div className="community-chart-card">
              <div className="community-chart-title-bold">NIVEL DE PARTICIPACIÓN</div>
              <div style={{ position: 'relative', padding: '10px 5px' }}>
                <svg viewBox="0 0 240 160" style={{ width: '100%', height: 'auto', maxWidth: '280px', margin: '0 auto', display: 'block' }}>
                  <defs>
                    <linearGradient id="gaugeLow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFD4B8" />
                      <stop offset="100%" stopColor="#FFB380" />
                    </linearGradient>
                    <linearGradient id="gaugeMid" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFB380" />
                      <stop offset="100%" stopColor="#FF8844" />
                    </linearGradient>
                    <linearGradient id="gaugeHigh" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF8844" />
                      <stop offset="100%" stopColor="#FF6610" />
                    </linearGradient>
                  </defs>

                  {/* Fondo del gauge */}
                  <path
                    d="M 40 120 A 80 80 0 0 1 200 120"
                    fill="none"
                    stroke="#e8e8e8"
                    strokeWidth="20"
                    strokeLinecap="round"
                  />

                  {(() => {
                    const percentage = selectedCommunity.engagement;
                    const centerX = 120;
                    const centerY = 120;
                    const radius = 80;
                    const startAngle = 180;
                    const endAngle = 180 + (percentage / 100) * 180;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const x1 = centerX + radius * Math.cos(startRad);
                    const y1 = centerY + radius * Math.sin(startRad);
                    const x2 = centerX + radius * Math.cos(endRad);
                    const y2 = centerY + radius * Math.sin(endRad);
                    const largeArcFlag = (endAngle - startAngle) > 180 ? 1 : 0;
                    
                    let strokeColor = 'url(#gaugeLow)';
                    if (percentage >= 66) strokeColor = 'url(#gaugeHigh)';
                    else if (percentage >= 33) strokeColor = 'url(#gaugeMid)';
                    
                    const needleAngle = 180 + (percentage / 100) * 180;
                    const needleRad = (needleAngle * Math.PI) / 180;
                    const needleLength = 65;
                    const needleX = centerX + needleLength * Math.cos(needleRad);
                    const needleY = centerY + needleLength * Math.sin(needleRad);

                    return (
                      <>
                        <path
                          d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="20"
                          strokeLinecap="round"
                        />
                        <line
                          x1={centerX}
                          y1={centerY}
                          x2={needleX}
                          y2={needleY}
                          stroke="#333"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx={centerX} cy={centerY} r="5" fill="#333" />
                      </>
                    );
                  })()}

                  <text x="120" y="135" textAnchor="middle" fontSize="32" fontWeight="700" fill="#FF6610">
                    {selectedCommunity.engagement}%
                  </text>
                  <text x="40" y="145" textAnchor="start" fontSize="10" fontWeight="600" fill="#666">0%</text>
                  <text x="200" y="145" textAnchor="end" fontSize="10" fontWeight="600" fill="#666">100%</text>
                </svg>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  fontSize: '9px',
                  fontWeight: '600',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '16px', height: '3px', background: 'linear-gradient(90deg, #FFD4B8, #FFB380)', borderRadius: '2px' }}></div>
                    <span>Bajo</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '16px', height: '3px', background: 'linear-gradient(90deg, #FFB380, #FF8844)', borderRadius: '2px' }}></div>
                    <span>Medio</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '16px', height: '3px', background: 'linear-gradient(90deg, #FF8844, #FF6610)', borderRadius: '2px' }}></div>
                    <span>Alto</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Comunidades;
