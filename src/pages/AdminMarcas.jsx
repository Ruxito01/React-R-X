import React, { useState, useEffect } from 'react';
import './AdminMarcas.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AdminMarcas = () => {
  // Estados principales
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [marcaEditando, setMarcaEditando] = useState(null);
  const [formulario, setFormulario] = useState({ nombre: '' });
  const [guardando, setGuardando] = useState(false);
  
  // Estado para confirmacion de eliminacion
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(null);

  // Estado para busqueda
  const [busqueda, setBusqueda] = useState('');
  
  // Estado para ordenamiento
  const [ordenamiento, setOrdenamiento] = useState({ columna: 'nombre', direccion: 'asc' });
  
  // Funcion para cambiar ordenamiento
  const ordenarPor = (columna) => {
    setOrdenamiento(prev => ({
      columna,
      direccion: prev.columna === columna && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Componente icono de orden
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

  // Cargar marcas al montar
  useEffect(() => {
    cargarMarcas();
  }, []);

  // Scroll al inicio al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cargarMarcas = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_BASE_URL}/marca`);
      if (!response.ok) throw new Error('Error al cargar marcas');
      const data = await response.json();
      // Cargar conteo de modelos para cada marca
      const marcasConConteo = await Promise.all(
        data.map(async (marca) => {
          try {
            const countRes = await fetch(`${API_BASE_URL}/marca/${marca.id}/count-modelos`);
            const count = countRes.ok ? await countRes.json() : 0;
            return { ...marca, modelosCount: count };
          } catch {
            return { ...marca, modelosCount: 0 };
          }
        })
      );
      setMarcas(marcasConConteo);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar y ordenar marcas
  const marcasFiltradas = marcas
    .filter(marca => marca.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      const { columna, direccion } = ordenamiento;
      let valorA, valorB;
      
      switch (columna) {
        case 'id':
          valorA = a.id || 0;
          valorB = b.id || 0;
          break;
        case 'nombre':
          valorA = (a.nombre || '').toLowerCase();
          valorB = (b.nombre || '').toLowerCase();
          break;
        case 'modelos':
          valorA = a.modelosCount || 0;
          valorB = b.modelosCount || 0;
          break;
        default:
          return 0;
      }
      
      if (typeof valorA === 'string') {
        return direccion === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
      }
      return direccion === 'asc' ? valorA - valorB : valorB - valorA;
    });

  const abrirModalCrear = () => {
    setMarcaEditando(null);
    setFormulario({ nombre: '' });
    setModalAbierto(true);
  };

  const abrirModalEditar = (marca) => {
    setMarcaEditando(marca);
    setFormulario({ nombre: marca.nombre });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setMarcaEditando(null);
    setFormulario({ nombre: '' });
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const guardarMarca = async (e) => {
    e.preventDefault();
    if (!formulario.nombre.trim()) return;

    setGuardando(true);
    try {
      const url = marcaEditando 
        ? `${API_BASE_URL}/marca/${marcaEditando.id}`
        : `${API_BASE_URL}/marca`;
      
      const method = marcaEditando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formulario.nombre.trim()
        })
      });

      if (!response.ok) throw new Error('Error al guardar marca');
      
      await cargarMarcas();
      cerrarModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarMarca = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marca/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar marca');
      await cargarMarcas();
      setConfirmandoEliminar(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>

      <div className="admin-main-card">
        {/* Barra de acciones */}
        <div className="admin-actions-bar">
          <button className="btn-agregar" onClick={abrirModalCrear}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Agregar Marca
          </button>
          <button className="btn-refrescar" onClick={cargarMarcas} disabled={cargando}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refrescar
          </button>
          
          <div className="buscador-container">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar marca..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-busqueda"
            />
            {busqueda && (
              <button className="btn-limpiar-busqueda" onClick={() => setBusqueda('')}>
                X
              </button>
            )}
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="admin-error">
            <span>{error}</span>
            <button onClick={() => setError(null)}>X</button>
          </div>
        )}

        {/* Tabla de marcas */}
        <div className="admin-table-card">
          {cargando ? (
            <div className="skeleton-table">
              <div className="skeleton-row" style={{ background: '#FF6610', padding: '1rem' }}>
                <div className="skeleton-cell id" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell nombre" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell count" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell acciones" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-cell id"></div>
                  <div className="skeleton-cell nombre"></div>
                  <div className="skeleton-cell count"></div>
                  <div className="skeleton-cell acciones"></div>
                </div>
              ))}
            </div>
          ) : marcasFiltradas.length === 0 ? (
            <div className="admin-empty">
              <span>{busqueda ? `No se encontraron marcas con "${busqueda}"` : 'No hay marcas registradas'}</span>
              {!busqueda && <button onClick={abrirModalCrear}>Crear primera marca</button>}
            </div>
          ) : (
            <div className="table-scroll-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="th-sortable" onClick={() => ordenarPor('id')}>
                      ID <IconoOrden columna="id" />
                    </th>
                    <th className="th-sortable" onClick={() => ordenarPor('nombre')}>
                      Nombre <IconoOrden columna="nombre" />
                    </th>
                    <th className="th-sortable" onClick={() => ordenarPor('modelos')}>
                      Modelos <IconoOrden columna="modelos" />
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {marcasFiltradas.map((marca, index) => {
                    const tieneModelos = (marca.modelosCount || 0) > 0;
                    return (
                      <tr key={marca.id} className={index % 2 === 0 ? 'row-light' : 'row-white'}>
                        <td className="td-id">{marca.id}</td>
                        <td className="td-nombre">{marca.nombre}</td>
                        <td className="td-count">
                          <span className={tieneModelos ? 'count-badge active' : 'count-badge'}>
                            {marca.modelosCount || 0}
                          </span>
                        </td>
                        <td className="td-acciones">
                          <button 
                            className={`btn-editar ${tieneModelos ? 'btn-disabled' : ''}`}
                            onClick={() => !tieneModelos && abrirModalEditar(marca)} 
                            title={tieneModelos ? 'No se puede editar: tiene modelos asociados' : 'Editar'}
                            disabled={tieneModelos}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button 
                            className={`btn-eliminar ${tieneModelos ? 'btn-disabled' : ''}`}
                            onClick={() => !tieneModelos && setConfirmandoEliminar(marca.id)}
                            title={tieneModelos ? 'No se puede eliminar: tiene modelos asociados' : 'Eliminar'}
                            disabled={tieneModelos}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="table-footer">
            {busqueda && `Mostrando ${marcasFiltradas.length} de ${marcas.length} | `}
            Total: {marcas.length} marca{marcas.length !== 1 ? 's' : ''} registrada{marcas.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Modal de crear/editar */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{marcaEditando ? 'Editar Marca' : 'Nueva Marca'}</h2>
              <button className="modal-close" onClick={cerrarModal}>X</button>
            </div>
            <form onSubmit={guardarMarca}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej: Toyota, Yamaha, Hyundai"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando ? 'Guardando...' : (marcaEditando ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmacion de eliminacion */}
      {confirmandoEliminar && (
        <div className="modal-overlay" onClick={() => setConfirmandoEliminar(null)}>
          <div className="modal-content modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-header warning">
              <h2>Confirmar Eliminacion</h2>
            </div>
            <div className="modal-body">
              <p>Esta seguro de eliminar esta marca?</p>
              <p className="warning-text">Esta accion eliminara tambien todos los modelos asociados.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setConfirmandoEliminar(null)}>
                Cancelar
              </button>
              <button className="btn-eliminar-confirm" onClick={() => eliminarMarca(confirmandoEliminar)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarcas;
