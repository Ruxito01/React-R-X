import React, { useState, useEffect } from 'react';
import './Vehiculos.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Vehiculos = () => {
  // Estados para datos del backend
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculosRaw, setVehiculosRaw] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el vehiculo seleccionado
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);

  // Estado para ordenamiento
  const [ordenamiento, setOrdenamiento] = useState({ columna: 'nombre', direccion: 'asc' });

  // Estados para filtrado
  const [tipoFiltro, setTipoFiltro] = useState('todos'); // todos, alias, tipo, propietario
  const [valorFiltro, setValorFiltro] = useState('');

  // Estados para tooltips de graficas
  const [tooltipTipo, setTooltipTipo] = useState({ visible: false, index: null });
  const [tooltipMarca, setTooltipMarca] = useState({ visible: false, index: null });
  const [tooltipPodio, setTooltipPodio] = useState({ visible: false, posicion: null });

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
      if (mostrarLoading && vehiculos.length === 0) {
        setLoading(true);
      }

      const [vehiculosRes, tiposRes, marcasRes, modelosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/vehiculo`),
        fetch(`${API_BASE_URL}/tipovehiculo`),
        fetch(`${API_BASE_URL}/marca`),
        fetch(`${API_BASE_URL}/modelo`)
      ]);

      if (!vehiculosRes.ok) throw new Error('Error al cargar vehiculos');

      const vehiculosData = await vehiculosRes.json();
      const tiposData = tiposRes.ok ? await tiposRes.json() : [];
      const marcasData = marcasRes.ok ? await marcasRes.json() : [];
      const modelosData = modelosRes.ok ? await modelosRes.json() : [];

      // Guardar datos raw para estadisticas
      setVehiculosRaw(vehiculosData);
      setMarcas(marcasData);
      setModelos(modelosData);

      // Mapear vehiculos - marca y modelo vienen como strings directos
      const vehiculosMapeados = vehiculosData.map(v => ({
        id: v.id,
        nombre: v.alias || `${v.marca || ''} ${v.modelo || ''}`.trim() || 'Sin nombre',
        tipo: v.tipoVehiculo?.nombre || 'Sin tipo',
        tipoId: v.tipoVehiculo?.id || v.tipo_vehiculo_id,
        marca: v.marca || 'Sin marca',
        modelo: v.modelo || 'Sin modelo',
        modeloId: v.modelo_id,
        estado: v.estado,
        propietario: v.usuario ? `${v.usuario.nombre} ${v.usuario.apellido || ''}`.trim() : 'Sin propietario',
        propietarioId: v.usuario?.id || v.usuario_id,
        foto: v.url_foto || v.urlImagen
      }));

      setVehiculos(vehiculosMapeados);
      setTiposVehiculo(tiposData);
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
  const totalVehiculos = vehiculos.length;
  const vehiculosActivos = vehiculos.filter(v => v.estado === 'en_posesion').length;
  const totalTipos = tiposVehiculo.length;
  const totalMarcas = marcas.length;

  // Obtener listas unicas para los selectores
  const tiposUnicos = [...new Set(vehiculos.map(v => v.tipo))].filter(Boolean).sort();
  const propietariosUnicos = [...new Set(vehiculos.map(v => v.propietario))].filter(Boolean).sort();

  // Filtrar vehiculos segun el filtro seleccionado
  const vehiculosFiltrados = vehiculos.filter(v => {
    if (tipoFiltro === 'todos' || !valorFiltro) return true;
    
    const busqueda = valorFiltro.toLowerCase();
    switch (tipoFiltro) {
      case 'alias':
        return v.nombre.toLowerCase().includes(busqueda);
      case 'tipo':
        return v.tipo.toLowerCase().includes(busqueda);
      case 'propietario':
        return v.propietario.toLowerCase().includes(busqueda);
      default:
        return true;
    }
  });

  // Ordenar vehiculos filtrados
  const vehiculosOrdenados = [...vehiculosFiltrados].sort((a, b) => {
    const { columna, direccion } = ordenamiento;
    let valorA, valorB;
    
    switch (columna) {
      case 'nombre':
        valorA = a.nombre.toLowerCase();
        valorB = b.nombre.toLowerCase();
        break;
      case 'tipo':
        valorA = a.tipo.toLowerCase();
        valorB = b.tipo.toLowerCase();
        break;
      case 'propietario':
        valorA = a.propietario.toLowerCase();
        valorB = b.propietario.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (typeof valorA === 'string') {
      return direccion === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
    }
    return direccion === 'asc' ? valorA - valorB : valorB - valorA;
  });

  // Limpiar filtro al cambiar tipo
  const handleTipoFiltroChange = (nuevoTipo) => {
    setTipoFiltro(nuevoTipo);
    setValorFiltro('');
  };

  const selectedVehicle = vehiculos[selectedVehicleIndex] || vehiculos[0];

  // Calcular distribucion por tipo para graficos
  const getDistribucionTipos = () => {
    const distribucion = {};
    vehiculos.forEach(v => {
      if (v.tipo) {
        distribucion[v.tipo] = (distribucion[v.tipo] || 0) + 1;
      }
    });
    return distribucion;
  };

  const distribucionTipos = getDistribucionTipos();
  const totalParaDistribucion = vehiculos.length || 1;

  // Calcular usuarios con mas vehiculos (para el podio)
  const getUsuariosConMasVehiculos = () => {
    const usuarioCount = {};
    vehiculosRaw.forEach(v => {
      if (v.usuario) {
        const userId = v.usuario.id;
        if (!usuarioCount[userId]) {
          usuarioCount[userId] = {
            id: userId,
            nombre: v.usuario.nombre || 'Usuario',
            apellido: v.usuario.apellido || '',
            alias: v.usuario.alias || '',
            foto: v.usuario.foto,
            cantidad: 0
          };
        }
        usuarioCount[userId].cantidad++;
      }
    });
    return Object.values(usuarioCount)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3);
  };

  const top3Usuarios = getUsuariosConMasVehiculos();

  // Calcular relacion marca-modelo-tipo
  const getRelacionMarcaModeloTipo = () => {
    const relacion = {};
    vehiculosRaw.forEach(v => {
      const marca = v.marca || 'Sin marca';
      const modelo = v.modelo || 'Sin modelo';
      const tipo = v.tipoVehiculo?.nombre || 'Sin tipo';
      
      if (!relacion[marca]) {
        relacion[marca] = { total: 0, modelos: {}, tipos: {} };
      }
      relacion[marca].total++;
      relacion[marca].modelos[modelo] = (relacion[marca].modelos[modelo] || 0) + 1;
      relacion[marca].tipos[tipo] = (relacion[marca].tipos[tipo] || 0) + 1;
    });
    return Object.entries(relacion)
      .map(([marca, data]) => ({
        marca,
        total: data.total,
        cantidadModelos: Object.keys(data.modelos).length,
        cantidadTipos: Object.keys(data.tipos).length,
        modelos: data.modelos,
        tipos: data.tipos
      }))
      .sort((a, b) => b.total - a.total);
  };

  const relacionMarcaModeloTipo = getRelacionMarcaModeloTipo();
  const maxTotalMarca = Math.max(...relacionMarcaModeloTipo.map(m => m.total), 1);

  if (error) {
    return (
      <div className="vehiculos-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
        <div className="vehiculos-main-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
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
    <div className="vehiculos-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>
      
      {/* Tarjetas Resumen */}
      <div className="stats-summary dashboard-animate-enter">
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
            <span className="stat-label">Total Vehiculos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#388E3C" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : vehiculosActivos}
            </span>
            <span className="stat-label">Vehiculos Activos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-types">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976D2" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : totalTipos}
            </span>
            <span className="stat-label">Tipos de Vehiculo</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-km">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6610" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {loading ? <span className="skeleton skeleton-card-value"></span> : totalMarcas}
            </span>
            <span className="stat-label">Marcas</span>
          </div>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="vehiculos-main-card dashboard-animate-enter">
        <div className="vehiculos-grid">
          {/* SECCION IZQUIERDA: Vehiculo destacado + Tabla */}
          <div className="left-section">
            {/* Vehiculo Destacado */}
            <div className="featured-vehicle-card">
              <div className="card-title">VEHICULO SELECCIONADO</div>
              <div className="featured-content-horizontal">
                {/* Icono del vehiculo */}
                <div className="vehicle-icon-circle">
                  {loading ? (
                    <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '50%' }}></div>
                  ) : (
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="47" stroke="#FF6610" strokeWidth="4" fill="none"/>
                      <circle cx="35" cy="65" r="8" stroke="#FF6610" strokeWidth="3" fill="none"/>
                      <circle cx="65" cy="65" r="8" stroke="#FF6610" strokeWidth="3" fill="none"/>
                      <path d="M35 65 L45 45 L55 45 L65 65" stroke="#FF6610" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M45 45 L50 35 L58 35" stroke="#FF6610" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M50 45 L50 55" stroke="#FF6610" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>

                {/* Seccion central: nombre y tipo */}
                <div className="center-stats-section">
                  <div className="distance-with-bars">
                    {loading ? (
                      <div className="skeleton" style={{ height: '30px', width: '180px' }}></div>
                    ) : (
                      <div className="distance-number" style={{ fontSize: '1.8rem' }}>{selectedVehicle?.nombre || 'Sin nombre'}</div>
                    )}
                    <div className="vertical-bars-group">
                      <div className="v-bar medium"></div>
                      <div className="v-bar tall"></div>
                    </div>
                  </div>
                  <div className="participation-label">{selectedVehicle?.tipo || 'Sin tipo'} - {selectedVehicle?.marca || ''}</div>
                </div>

                {/* Propietario */}
                <div className="number-fifteen-section" style={{ flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div className="vehicle-propietario-label">Propietario</div>
                  {loading ? (
                    <div className="skeleton" style={{ height: '24px', width: '100px' }}></div>
                  ) : (
                    <div className="vehicle-propietario-value">
                      {selectedVehicle?.propietario || 'Sin propietario'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de Vehiculos con Filtros */}
            <div className="vehicles-table-card">
              {/* Contenedor de Filtros */}
              <div className="filtros-vehiculos-container">
                <div className="filtro-tipo-selector">
                  <label className="filtro-label">Filtrar por:</label>
                  <div className="filtro-radio-group">
                    <label className={`filtro-radio-option ${tipoFiltro === 'todos' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="tipoFiltro" 
                        value="todos"
                        checked={tipoFiltro === 'todos'}
                        onChange={() => handleTipoFiltroChange('todos')}
                      />
                      Todos
                    </label>
                    <label className={`filtro-radio-option ${tipoFiltro === 'alias' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="tipoFiltro" 
                        value="alias"
                        checked={tipoFiltro === 'alias'}
                        onChange={() => handleTipoFiltroChange('alias')}
                      />
                      Alias
                    </label>
                    <label className={`filtro-radio-option ${tipoFiltro === 'tipo' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="tipoFiltro" 
                        value="tipo"
                        checked={tipoFiltro === 'tipo'}
                        onChange={() => handleTipoFiltroChange('tipo')}
                      />
                      Tipo
                    </label>
                    <label className={`filtro-radio-option ${tipoFiltro === 'propietario' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="tipoFiltro" 
                        value="propietario"
                        checked={tipoFiltro === 'propietario'}
                        onChange={() => handleTipoFiltroChange('propietario')}
                      />
                      Propietario
                    </label>
                  </div>
                </div>
                
                {/* Campo de busqueda segun el tipo seleccionado */}
                {tipoFiltro !== 'todos' && (
                  <div className="filtro-valor-container">
                    {tipoFiltro === 'alias' && (
                      <input
                        type="text"
                        className="filtro-input"
                        placeholder="Buscar por alias del vehiculo..."
                        value={valorFiltro}
                        onChange={(e) => setValorFiltro(e.target.value)}
                      />
                    )}
                    
                    {tipoFiltro === 'tipo' && (
                      <div className="filtro-combo-container">
                        <input
                          type="text"
                          className="filtro-input"
                          placeholder="Escribir o seleccionar tipo..."
                          value={valorFiltro}
                          onChange={(e) => setValorFiltro(e.target.value)}
                          list="tipos-list"
                        />
                        <datalist id="tipos-list">
                          {tiposUnicos.map(tipo => (
                            <option key={tipo} value={tipo} />
                          ))}
                        </datalist>
                        <select 
                          className="filtro-select-combo"
                          value={valorFiltro}
                          onChange={(e) => setValorFiltro(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {tiposUnicos.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {tipoFiltro === 'propietario' && (
                      <div className="filtro-combo-container">
                        <input
                          type="text"
                          className="filtro-input"
                          placeholder="Escribir o seleccionar propietario..."
                          value={valorFiltro}
                          onChange={(e) => setValorFiltro(e.target.value)}
                          list="propietarios-list"
                        />
                        <datalist id="propietarios-list">
                          {propietariosUnicos.map(prop => (
                            <option key={prop} value={prop} />
                          ))}
                        </datalist>
                        <select 
                          className="filtro-select-combo"
                          value={valorFiltro}
                          onChange={(e) => setValorFiltro(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {propietariosUnicos.map(prop => (
                            <option key={prop} value={prop}>{prop}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {valorFiltro && (
                      <button 
                        className="filtro-limpiar-btn"
                        onClick={() => setValorFiltro('')}
                        title="Limpiar filtro"
                      >
                        X
                      </button>
                    )}
                  </div>
                )}
                
                {/* Contador de resultados */}
                <div className="filtro-contador">
                  {vehiculosFiltrados.length} de {vehiculos.length} vehiculos
                </div>
              </div>
              
              <div className="table-scroll-container">
                <table className="vehicles-table">
                  <thead>
                    <tr>
                      <th className="th-sortable header-orange" onClick={() => ordenarPor('nombre')}>
                        VEHICULO <IconoOrden columna="nombre" />
                      </th>
                      <th className="th-sortable header-orange" onClick={() => ordenarPor('tipo')}>
                        Tipo <IconoOrden columna="tipo" />
                      </th>
                      <th className="th-sortable header-orange" onClick={() => ordenarPor('propietario')}>
                        Propietario <IconoOrden columna="propietario" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(6)].map((_, index) => (
                        <tr key={`skeleton-${index}`} className={index % 2 === 0 ? 'row-light' : 'row-white'}>
                          <td><div className="skeleton" style={{ height: '16px', width: '80%' }}></div></td>
                          <td><div className="skeleton" style={{ height: '16px', width: '60px' }}></div></td>
                          <td><div className="skeleton" style={{ height: '16px', width: '100px' }}></div></td>
                        </tr>
                      ))
                    ) : (
                      vehiculosOrdenados.map((vehiculo) => {
                        const originalIndex = vehiculos.findIndex(v => v.id === vehiculo.id);
                        return (
                          <tr 
                            key={vehiculo.id} 
                            className={`${originalIndex % 2 === 0 ? 'row-light' : 'row-white'} ${selectedVehicleIndex === originalIndex ? 'selected-row' : ''}`}
                            onClick={() => setSelectedVehicleIndex(originalIndex)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td className="vehicle-name">{vehiculo.nombre}</td>
                            <td>{vehiculo.tipo}</td>
                            <td>{vehiculo.propietario}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                Datos actuales {getFechaActual()} - Click para ver detalles
              </div>
            </div>
          </div>

          {/* SECCION DERECHA: Graficos */}
          <div className="right-section">
            {/* Grafico de Barras - Distribucion por Tipo */}
            <div className="chart-card" id="grafica-vehiculos-distribucion">
              <div className="chart-title">Distribucion por Tipo de Vehiculo</div>
              <div className="horizontal-bars-chart" style={{ position: 'relative', padding: '20px 15px' }}>
                {loading ? (
                  <div className="skeleton" style={{ height: '150px', width: '100%' }}></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '180px', overflowY: 'auto', paddingRight: '8px' }}>
                    {Object.entries(distribucionTipos).map(([tipo, cantidad], index) => {
                      const porcentaje = (cantidad / totalParaDistribucion) * 100;
                      const colores = ['#FF6610', '#FF8844', '#FFB380', '#FFD4B8', '#FFE8D6'];
                      return (
                        <div 
                          key={tipo} 
                          style={{ position: 'relative' }}
                          className={`tipo-bar-hover ${tooltipTipo.index === index ? 'tipo-bar-activo' : ''}`}
                          onMouseEnter={() => setTooltipTipo({ visible: true, index })}
                          onMouseLeave={() => setTooltipTipo({ visible: false, index: null })}
                        >
                          <div className="distribution-chart-label">
                            <span>{tipo}</span>
                            <span style={{ color: colores[index % colores.length] }}>{cantidad} ({porcentaje.toFixed(0)}%)</span>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '28px', 
                            backgroundColor: '#f5f5f5', 
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${porcentaje}%`, 
                              height: '100%',
                              background: `linear-gradient(90deg, ${colores[index % colores.length]} 0%, ${colores[index % colores.length]}cc 100%)`,
                              borderRadius: '8px',
                              transition: 'all 0.3s ease'
                            }} />
                          </div>
                          {/* Tooltip tipo */}
                          {tooltipTipo.visible && tooltipTipo.index === index && (
                            <div className="grafico-tooltip tipo-tooltip">
                              <div className="tooltip-header">{tipo}</div>
                              <div className="tooltip-row">
                                <span>Cantidad:</span>
                                <strong>{cantidad} vehiculos</strong>
                              </div>
                              <div className="tooltip-row">
                                <span>Porcentaje:</span>
                                <strong>{porcentaje.toFixed(1)}%</strong>
                              </div>
                              {index === 0 && (
                                <div className="tooltip-badge">Tipo mas comun</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Grafico: Vehiculos por Marca - Barras simples */}
            <div className="chart-card" id="grafica-vehiculos-podio">
              <div className="chart-title-bold">VEHICULOS POR MARCA</div>
              <div style={{ padding: '1rem', maxHeight: '290px', overflowY: 'auto' }}>
                {loading ? (
                  <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
                ) : relacionMarcaModeloTipo.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(() => {
                      const maxTotal = Math.max(...relacionMarcaModeloTipo.map(m => m.total), 1);
                      const colores = ['#FF6610', '#FF8C42', '#FFA366', '#FFB88C', '#FFCEB3', '#E65100', '#EF6C00', '#F57C00', '#FB8C00', '#FF9800'];
                      
                      return relacionMarcaModeloTipo.map((item, i) => {
                        const porcentaje = (item.total / maxTotal) * 100;
                        return (
                          <div 
                            key={i} 
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', padding: '4px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                            className={`marca-bar-hover ${tooltipMarca.index === i ? 'marca-bar-activo' : ''}`}
                            onMouseLeave={() => setTooltipMarca({ visible: false, index: null })}
                          >
                            {/* Nombre de marca */}
                            <div className="brand-chart-label">
                              {item.marca}
                            </div>
                            
                            {/* Barra */}
                            <div style={{ flex: 1, height: '24px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${porcentaje}%`,
                                height: '100%',
                                background: colores[i % colores.length],
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                paddingRight: '8px',
                                minWidth: '40px',
                                transition: 'width 0.4s ease'
                              }}>
                                <span style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: '700', 
                                  color: '#fff',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }}>
                                  {item.total}
                                </span>
                              </div>
                            </div>
                            {/* Tooltip marca */}
                            {tooltipMarca.visible && tooltipMarca.index === i && (
                              <div className="grafico-tooltip marca-tooltip">
                                <div className="tooltip-header">{item.marca}</div>
                                <div className="tooltip-row">
                                  <span>Vehiculos:</span>
                                  <strong>{item.total}</strong>
                                </div>
                                <div className="tooltip-row">
                                  <span>Modelos:</span>
                                  <strong>{item.cantidadModelos}</strong>
                                </div>
                                <div className="tooltip-row">
                                  <span>Tipos:</span>
                                  <strong>{item.cantidadTipos}</strong>
                                </div>
                                {i === 0 && (
                                  <div className="tooltip-badge">Marca mas popular</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    Sin datos
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Usuarios con mas vehiculos - Podio */}
        <div className="chart-card chart-card-full-width" style={{ marginTop: '1rem', overflow: 'hidden' }}>
          <div className="chart-title-bold">TOP 3 USUARIOS CON MAS VEHICULOS</div>
          <div style={{ padding: '1rem' }}>
            {loading ? (
              <div className="skeleton" style={{ height: '180px', width: '100%' }}></div>
            ) : top3Usuarios.length > 0 ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-end',
                gap: '16px',
                height: '180px',
                paddingTop: '10px'
              }}>
                {/* Segundo lugar */}
                {top3Usuarios[1] && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    order: 1
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: '#C0C0C0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                      border: '2px solid #A8A8A8',
                      overflow: 'hidden'
                    }}>
                      {top3Usuarios[1].foto ? (
                        <img src={top3Usuarios[1].foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>
                          {top3Usuarios[1].nombre.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      background: 'linear-gradient(180deg, #C0C0C0 0%, #A8A8A8 100%)',
                      width: '70px',
                      height: '60px',
                      borderRadius: '6px 6px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '700'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>2</span>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '4px' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.75rem' }}>@{top3Usuarios[1].alias || top3Usuarios[1].nombre}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#C0C0C0' }}>{top3Usuarios[1].cantidad} vehiculos</div>
                    </div>
                  </div>
                )}

                {/* Primer lugar */}
                {top3Usuarios[0] && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    order: 2
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#FFD700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                      border: '3px solid #FFA500',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)'
                    }}>
                      {top3Usuarios[0].foto ? (
                        <img src={top3Usuarios[0].foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
                          {top3Usuarios[0].nombre.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                      width: '80px',
                      height: '80px',
                      borderRadius: '6px 6px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '700',
                      boxShadow: '0 2px 8px rgba(255, 165, 0, 0.3)'
                    }}>
                      <span style={{ fontSize: '1.8rem' }}>1</span>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '4px' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.8rem' }}>@{top3Usuarios[0].alias || top3Usuarios[0].nombre}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FF6610' }}>{top3Usuarios[0].cantidad} vehiculos</div>
                    </div>
                  </div>
                )}

                {/* Tercer lugar */}
                {top3Usuarios[2] && (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    order: 3
                  }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      background: '#CD7F32',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                      border: '2px solid #A0522D',
                      overflow: 'hidden'
                    }}>
                      {top3Usuarios[2].foto ? (
                        <img src={top3Usuarios[2].foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                          {top3Usuarios[2].nombre.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      background: 'linear-gradient(180deg, #CD7F32 0%, #A0522D 100%)',
                      width: '60px',
                      height: '45px',
                      borderRadius: '6px 6px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '700'
                    }}>
                      <span style={{ fontSize: '1.3rem' }}>3</span>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '4px' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.7rem' }}>@{top3Usuarios[2].alias || top3Usuarios[2].nombre}</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#CD7F32' }}>{top3Usuarios[2].cantidad} vehiculos</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                Sin datos de usuarios
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vehiculos;
