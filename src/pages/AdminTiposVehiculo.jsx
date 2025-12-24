import React, { useState, useEffect } from 'react';
import './AdminMarcas.css';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AdminTiposVehiculo = () => {
  // Estados principales
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null);
  const [formulario, setFormulario] = useState({ nombre: '', foto: '' });
  const [guardando, setGuardando] = useState(false);
  
  // Estado para confirmacion de eliminacion
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(null);

  // Buscador
  const [busqueda, setBusqueda] = useState('');

  // Cargar tipos al montar
  useEffect(() => {
    cargarTiposVehiculo();
  }, []);

  // Scroll al inicio al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cargarTiposVehiculo = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_BASE_URL}/tipovehiculo`);
      if (!response.ok) throw new Error('Error al cargar tipos de vehiculo');
      const data = await response.json();
      // Cargar conteo de vehiculos para cada tipo
      const tiposConConteo = await Promise.all(
        data.map(async (tipo) => {
          try {
            const countRes = await fetch(`${API_BASE_URL}/tipovehiculo/${tipo.id}/count-vehiculos`);
            const count = countRes.ok ? await countRes.json() : 0;
            return { ...tipo, vehiculosCount: count };
          } catch {
            return { ...tipo, vehiculosCount: 0 };
          }
        })
      );
      setTiposVehiculo(tiposConConteo);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar por busqueda
  const tiposFiltrados = tiposVehiculo.filter(tipo =>
    tipo.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModalCrear = () => {
    setTipoEditando(null);
    setFormulario({ nombre: '', foto: '' });
    setModalAbierto(true);
  };

  const abrirModalEditar = (tipo) => {
    setTipoEditando(tipo);
    setFormulario({ nombre: tipo.nombre, foto: tipo.foto || '' });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setTipoEditando(null);
    setFormulario({ nombre: '', foto: '' });
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const guardarTipo = async (e) => {
    e.preventDefault();
    if (!formulario.nombre.trim()) return;

    setGuardando(true);
    try {
      const url = tipoEditando 
        ? `${API_BASE_URL}/tipovehiculo/${tipoEditando.id}`
        : `${API_BASE_URL}/tipovehiculo`;
      
      const method = tipoEditando ? 'PUT' : 'POST';
      
      const body = {
        nombre: formulario.nombre.trim(),
        foto: formulario.foto.trim() || null
      };
      
      // Si es edicion, incluir el ID
      if (tipoEditando) {
        body.id = tipoEditando.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Error al guardar tipo de vehiculo');
      
      await cargarTiposVehiculo();
      cerrarModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarTipo = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tipovehiculo/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar tipo de vehiculo');
      await cargarTiposVehiculo();
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
            Agregar Tipo
          </button>
          <button className="btn-refrescar" onClick={cargarTiposVehiculo} disabled={cargando}>
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
              placeholder="Buscar tipo..."
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

        {/* Tabla de tipos */}
        <div className="admin-table-card">
          {cargando ? (
            <div className="skeleton-table">
              <div className="skeleton-row" style={{ background: '#FF6610', padding: '1rem' }}>
                <div className="skeleton-cell id" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell nombre" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell logo" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell count" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
                <div className="skeleton-cell acciones" style={{ background: 'rgba(255,255,255,0.3)' }}></div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-cell id"></div>
                  <div className="skeleton-cell nombre"></div>
                  <div className="skeleton-cell logo"></div>
                  <div className="skeleton-cell count"></div>
                  <div className="skeleton-cell acciones"></div>
                </div>
              ))}
            </div>
          ) : tiposFiltrados.length === 0 ? (
            <div className="admin-empty">
              <span>{busqueda ? `No se encontraron tipos con "${busqueda}"` : 'No hay tipos de vehiculo registrados'}</span>
              {!busqueda && <button onClick={abrirModalCrear}>Crear primer tipo</button>}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Foto</th>
                  <th>Vehiculos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tiposFiltrados.map((tipo, index) => {
                  const tieneVehiculos = (tipo.vehiculosCount || 0) > 0;
                  return (
                    <tr key={tipo.id} className={index % 2 === 0 ? 'row-light' : 'row-white'}>
                      <td className="td-id">{tipo.id}</td>
                      <td className="td-nombre">{tipo.nombre}</td>
                      <td className="td-logo">
                        {tipo.foto ? (
                          <img src={tipo.foto} alt={tipo.nombre} className="logo-preview" />
                        ) : (
                          <span className="no-logo">Sin foto</span>
                        )}
                      </td>
                      <td className="td-count">
                        <span className={tieneVehiculos ? 'count-badge active' : 'count-badge'}>
                          {tipo.vehiculosCount || 0}
                        </span>
                      </td>
                      <td className="td-acciones">
                        <button 
                          className={`btn-editar ${tieneVehiculos ? 'btn-disabled' : ''}`}
                          onClick={() => !tieneVehiculos && abrirModalEditar(tipo)} 
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
                          onClick={() => !tieneVehiculos && setConfirmandoEliminar(tipo.id)}
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
            {busqueda && `Mostrando ${tiposFiltrados.length} de ${tiposVehiculo.length} | `}
            Total: {tiposVehiculo.length} tipo{tiposVehiculo.length !== 1 ? 's' : ''} registrado{tiposVehiculo.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Modal de crear/editar */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{tipoEditando ? 'Editar Tipo' : 'Nuevo Tipo de Vehiculo'}</h2>
              <button className="modal-close" onClick={cerrarModal}>X</button>
            </div>
            <form onSubmit={guardarTipo}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej: SUV, Sedan, Pickup, Moto"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="foto">URL de Foto (opcional)</label>
                <input
                  type="url"
                  id="foto"
                  name="foto"
                  value={formulario.foto}
                  onChange={manejarCambio}
                  placeholder="https://ejemplo.com/foto.png"
                />
                {formulario.foto && (
                  <div className="logo-preview-container">
                    <img src={formulario.foto} alt="Vista previa" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando ? 'Guardando...' : (tipoEditando ? 'Actualizar' : 'Crear')}
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
              <p>Esta seguro de eliminar este tipo de vehiculo?</p>
              <p className="warning-text">Esta accion puede afectar vehiculos asociados a este tipo.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setConfirmandoEliminar(null)}>
                Cancelar
              </button>
              <button className="btn-eliminar-confirm" onClick={() => eliminarTipo(confirmandoEliminar)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTiposVehiculo;
