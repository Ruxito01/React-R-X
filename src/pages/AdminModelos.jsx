import React, { useState, useEffect } from 'react';
import './AdminModelos.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AdminModelos = () => {
  // Estados principales
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtro por marca
  const [filtroMarca, setFiltroMarca] = useState('todas');
  
  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modeloEditando, setModeloEditando] = useState(null);
  const [formulario, setFormulario] = useState({ nombre: '', marcaId: '' });
  const [guardando, setGuardando] = useState(false);
  
  // Confirmacion de eliminacion
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(null);

  // Buscador
  const [busqueda, setBusqueda] = useState('');

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [modelosRes, marcasRes] = await Promise.all([
        fetch(`${API_BASE_URL}/modelo`),
        fetch(`${API_BASE_URL}/marca`)
      ]);
      
      if (!modelosRes.ok || !marcasRes.ok) throw new Error('Error al cargar datos');
      
      const [modelosData, marcasData] = await Promise.all([
        modelosRes.json(),
        marcasRes.json()
      ]);
      
      // Cargar conteo de vehiculos para cada modelo
      const modelosConConteo = await Promise.all(
        modelosData.map(async (modelo) => {
          try {
            const countRes = await fetch(`${API_BASE_URL}/modelo/${modelo.id}/count-vehiculos`);
            const count = countRes.ok ? await countRes.json() : 0;
            return { ...modelo, vehiculosCount: count };
          } catch {
            return { ...modelo, vehiculosCount: 0 };
          }
        })
      );
      
      setModelos(modelosConConteo);
      setMarcas(marcasData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar modelos por marca y busqueda
  const modelosFiltrados = modelos
    .filter(m => filtroMarca === 'todas' || m.marcaId === parseInt(filtroMarca))
    .filter(m => m.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const abrirModalCrear = () => {
    setModeloEditando(null);
    setFormulario({ nombre: '', marcaId: marcas[0]?.id || '' });
    setModalAbierto(true);
  };

  const abrirModalEditar = (modelo) => {
    setModeloEditando(modelo);
    setFormulario({ nombre: modelo.nombre, marcaId: modelo.marcaId });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModeloEditando(null);
    setFormulario({ nombre: '', marcaId: '' });
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const guardarModelo = async (e) => {
    e.preventDefault();
    if (!formulario.nombre.trim() || !formulario.marcaId) return;

    setGuardando(true);
    try {
      const url = modeloEditando 
        ? `${API_BASE_URL}/modelo/${modeloEditando.id}`
        : `${API_BASE_URL}/modelo`;
      
      const method = modeloEditando ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          marcaId: parseInt(formulario.marcaId)
        })
      });

      if (!response.ok) throw new Error('Error al guardar modelo');
      
      await cargarDatos();
      cerrarModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarModelo = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/modelo/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar modelo');
      await cargarDatos();
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
          <button className="btn-agregar" onClick={abrirModalCrear} disabled={marcas.length === 0}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Agregar Modelo
          </button>
          
          <div className="filtro-container">
            <label>Filtrar por marca:</label>
            <select value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)}>
              <option value="todas">Todas las marcas</option>
              {marcas.map(marca => (
                <option key={marca.id} value={marca.id}>{marca.nombre}</option>
              ))}
            </select>
          </div>
          
          <button className="btn-refrescar" onClick={cargarDatos} disabled={cargando}>
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
              placeholder="Buscar modelo..."
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

        {/* Aviso si no hay marcas */}
        {marcas.length === 0 && !cargando && (
          <div className="admin-warning">
            Debe crear al menos una marca antes de agregar modelos.
          </div>
        )}

        {/* Tabla de modelos */}
        <div className="admin-table-card">
          {cargando ? (
            <div className="skeleton-table">
              <div className="skeleton-row" style={{ background: '#FF6610', padding: '1rem' }}>
                <div className="skeleton-cell id" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell nombre" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell nombre" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell count" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell acciones" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-cell id"></div>
                  <div className="skeleton-cell nombre"></div>
                  <div className="skeleton-cell nombre"></div>
                  <div className="skeleton-cell count"></div>
                  <div className="skeleton-cell acciones"></div>
                </div>
              ))}
            </div>
          ) : modelosFiltrados.length === 0 ? (
            <div className="admin-empty">
              <span>{busqueda ? `No se encontraron modelos con "${busqueda}"` : (filtroMarca === 'todas' ? 'No hay modelos registrados' : 'No hay modelos para esta marca')}</span>
              {marcas.length > 0 && !busqueda && <button onClick={abrirModalCrear}>Crear primer modelo</button>}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Vehiculos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {modelosFiltrados.map((modelo, index) => {
                  const tieneVehiculos = (modelo.vehiculosCount || 0) > 0;
                  return (
                    <tr key={modelo.id} className={index % 2 === 0 ? 'row-light' : 'row-white'}>
                      <td className="td-id">{modelo.id}</td>
                      <td className="td-nombre">{modelo.nombre}</td>
                      <td className="td-marca">
                        <span className="marca-badge">{modelo.marcaNombre}</span>
                      </td>
                      <td className="td-count">
                        <span className={tieneVehiculos ? 'count-badge active' : 'count-badge'}>
                          {modelo.vehiculosCount || 0}
                        </span>
                      </td>
                      <td className="td-acciones">
                        <button 
                          className={`btn-editar ${tieneVehiculos ? 'btn-disabled' : ''}`}
                          onClick={() => !tieneVehiculos && abrirModalEditar(modelo)} 
                          title={tieneVehiculos ? 'No se puede editar: tiene vehiculos asociados' : 'Editar'}
                          disabled={tieneVehiculos}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className={`btn-eliminar ${tieneVehiculos ? 'btn-disabled' : ''}`}
                          onClick={() => !tieneVehiculos && setConfirmandoEliminar(modelo.id)}
                          title={tieneVehiculos ? 'No se puede eliminar: tiene vehiculos asociados' : 'Eliminar'}
                          disabled={tieneVehiculos}
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
          )}
          <div className="table-footer">
            {busqueda && `Buscando "${busqueda}" | `}
            {filtroMarca !== 'todas' && `Filtrando por: ${marcas.find(m => m.id === parseInt(filtroMarca))?.nombre} | `}
            Mostrando: {modelosFiltrados.length} de {modelos.length} modelos
          </div>
        </div>
      </div>

      {/* Modal de crear/editar */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modeloEditando ? 'Editar Modelo' : 'Nuevo Modelo'}</h2>
              <button className="modal-close" onClick={cerrarModal}>X</button>
            </div>
            <form onSubmit={guardarModelo}>
              <div className="form-group">
                <label htmlFor="marcaId">Marca *</label>
                <select
                  id="marcaId"
                  name="marcaId"
                  value={formulario.marcaId}
                  onChange={manejarCambio}
                  required
                >
                  <option value="">Seleccionar marca...</option>
                  {marcas.map(marca => (
                    <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Modelo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej: Corolla, i10, Wrangler"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando ? 'Guardando...' : (modeloEditando ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmacion */}
      {confirmandoEliminar && (
        <div className="modal-overlay" onClick={() => setConfirmandoEliminar(null)}>
          <div className="modal-content modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-header warning">
              <h2>Confirmar Eliminacion</h2>
            </div>
            <div className="modal-body">
              <p>Esta seguro de eliminar este modelo?</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setConfirmandoEliminar(null)}>
                Cancelar
              </button>
              <button className="btn-eliminar-confirm" onClick={() => eliminarModelo(confirmandoEliminar)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModelos;
