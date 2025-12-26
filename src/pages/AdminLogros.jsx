import React, { useState, useEffect, useRef } from 'react';
import './AdminLogros.css';
import TableImage from '../components/TableImage';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';
import { subirImagenLogro } from '../services/supabaseStorageService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AdminLogros = () => {
  // Estados principales
  const [logros, setLogros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [logroEditando, setLogroEditando] = useState(null);
  const [formulario, setFormulario] = useState({ 
    nombre: '', 
    descripcion: '', 
    urlIcono: '', 
    criterioDesbloqueo: '' 
  });
  const [guardando, setGuardando] = useState(false);
  
  // Estados para upload de imagen
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState('');
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const inputFileRef = useRef(null);
  
  // Confirmacion de eliminacion
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(null);

  // Buscador
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

  // Cargar datos al montar
  useEffect(() => {
    cargarLogros();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cargarLogros = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_BASE_URL}/logro`);
      if (!response.ok) throw new Error('Error al cargar logros');
      const data = await response.json();
      setLogros(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    setLogroEditando(null);
    setFormulario({ nombre: '', descripcion: '', urlIcono: '', criterioDesbloqueo: '' });
    setArchivoImagen(null);
    setPreviewImagen('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (logro) => {
    setLogroEditando(logro);
    setFormulario({ 
      nombre: logro.nombre, 
      descripcion: logro.descripcion || '',
      urlIcono: logro.urlIcono || '',
      criterioDesbloqueo: logro.criterioDesbloqueo || ''
    });
    setArchivoImagen(null);
    setPreviewImagen(logro.urlIcono || '');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setLogroEditando(null);
    setFormulario({ nombre: '', descripcion: '', urlIcono: '', criterioDesbloqueo: '' });
    setArchivoImagen(null);
    setPreviewImagen('');
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar seleccion de archivo de imagen
  const manejarSeleccionImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB');
      return;
    }
    
    setArchivoImagen(file);
    
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImagen(e.target.result);
    reader.readAsDataURL(file);
  };
  
  const quitarImagen = () => {
    setArchivoImagen(null);
    setPreviewImagen('');
    setFormulario(prev => ({ ...prev, urlIcono: '' }));
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const guardarLogro = async (e) => {
    e.preventDefault();
    if (!formulario.nombre.trim()) return;

    setGuardando(true);
    try {
      let urlIcono = formulario.urlIcono;
      
      // Si hay un archivo de imagen nuevo, subirlo a Supabase
      if (archivoImagen) {
        setSubiendoImagen(true);
        const urlSubida = await subirImagenLogro(archivoImagen, formulario.nombre);
        setSubiendoImagen(false);
        
        if (!urlSubida) {
          setError('Error al subir la imagen');
          setGuardando(false);
          return;
        }
        urlIcono = urlSubida;
      }
      
      const url = logroEditando 
        ? `${API_BASE_URL}/logro/${logroEditando.id}`
        : `${API_BASE_URL}/logro`;
      
      const method = logroEditando ? 'PUT' : 'POST';
      
      const body = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim() || null,
        urlIcono: urlIcono || null,
        criterioDesbloqueo: formulario.criterioDesbloqueo.trim() || null
      };

      if (logroEditando) {
        body.id = logroEditando.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Error al guardar logro');
      
      await cargarLogros();
      cerrarModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
      setSubiendoImagen(false);
    }
  };

  const eliminarLogro = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/logro/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar logro');
      await cargarLogros();
      setConfirmandoEliminar(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Truncar texto largo
  const truncarTexto = (texto, maxLength = 50) => {
    if (!texto) return '-';
    return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
  };

  // Filtrar y ordenar por busqueda
  const logrosFiltrados = logros
    .filter(logro =>
      logro.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (logro.descripcion && logro.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    )
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
        case 'criterio':
          valorA = (a.criterioDesbloqueo || '').toLowerCase();
          valorB = (b.criterioDesbloqueo || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (typeof valorA === 'string') {
        return direccion === 'asc' ? valorA.localeCompare(valorB) : valorB.localeCompare(valorA);
      }
      return direccion === 'asc' ? valorA - valorB : valorB - valorA;
    });

  return (
    <div className="admin-container" style={{ backgroundImage: `url(${fondoDashboard})` }}>

      <div className="admin-main-card">
        {/* Barra de acciones */}
        <div className="admin-actions-bar">
          <button className="btn-agregar" onClick={abrirModalCrear}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Agregar Logro
          </button>
          <button className="btn-refrescar" onClick={cargarLogros} disabled={cargando}>
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
              placeholder="Buscar logro..."
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

        {/* Tabla de logros */}
        <div className="admin-table-card">
          {cargando ? (
            <div className="admin-loading">
              <div className="loading-spinner"></div>
              <span>Cargando logros...</span>
            </div>
          ) : logrosFiltrados.length === 0 ? (
            <div className="admin-empty">
              <span>{busqueda ? `No se encontraron logros con "${busqueda}"` : 'No hay logros registrados'}</span>
              {!busqueda && <button onClick={abrirModalCrear}>Crear primer logro</button>}
            </div>
          ) : (
            <div className="table-scroll-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="th-sortable" onClick={() => ordenarPor('id')}>
                      ID <IconoOrden columna="id" />
                    </th>
                    <th>Icono</th>
                    <th className="th-sortable" onClick={() => ordenarPor('nombre')}>
                      Nombre <IconoOrden columna="nombre" />
                    </th>
                    <th>Descripcion</th>
                    <th className="th-sortable" onClick={() => ordenarPor('criterio')}>
                      Criterio <IconoOrden columna="criterio" />
                    </th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {logrosFiltrados.map((logro, index) => (
                    <tr key={logro.id} className={index % 2 === 0 ? 'row-light' : 'row-white'}>
                      <td className="td-id">{logro.id}</td>
                      <td className="td-icono">
                        {logro.urlIcono ? (
                          <TableImage 
                            src={logro.urlIcono} 
                            alt={logro.nombre} 
                            className="icono-preview"
                            width="40px"
                            height="40px"
                          />
                        ) : (
                          <div className="icono-placeholder">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="8" r="6"/>
                              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="td-nombre">{logro.nombre}</td>
                      <td className="td-descripcion" title={logro.descripcion}>
                        {truncarTexto(logro.descripcion)}
                      </td>
                      <td className="td-criterio">
                        {logro.criterioDesbloqueo ? (
                          <code className="criterio-code">{logro.criterioDesbloqueo}</code>
                        ) : '-'}
                      </td>
                      <td className="td-acciones">
                        <button className="btn-editar" onClick={() => abrirModalEditar(logro)} title="Editar">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className="btn-eliminar" 
                          onClick={() => setConfirmandoEliminar(logro.id)}
                          title="Eliminar"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="table-footer">
            {busqueda && `Mostrando ${logrosFiltrados.length} de ${logros.length} | `}
            Total: {logros.length} logro{logros.length !== 1 ? 's' : ''} registrado{logros.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Modal de crear/editar */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-logro" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{logroEditando ? 'Editar Logro' : 'Nuevo Logro'}</h2>
              <button className="modal-close" onClick={cerrarModal}>X</button>
            </div>
            <form onSubmit={guardarLogro}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej: Primera Ruta, 100km Recorridos"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="descripcion">Descripcion</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  placeholder="Descripcion del logro para mostrar al usuario..."
                  rows="3"
                />
              </div>
              
              {/* Upload de imagen */}
              <div className="form-group">
                <label>Icono del Logro</label>
                <div className="upload-container">
                  <input
                    type="file"
                    ref={inputFileRef}
                    accept="image/*"
                    onChange={manejarSeleccionImagen}
                    style={{ display: 'none' }}
                    id="input-icono"
                  />
                  
                  {previewImagen ? (
                    <div className="preview-container">
                      <img src={previewImagen} alt="Preview" className="preview-image" />
                      <button type="button" className="btn-quitar-imagen" onClick={quitarImagen}>
                        X
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="input-icono" className="btn-seleccionar-imagen">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      Seleccionar icono
                    </label>
                  )}
                </div>
                {subiendoImagen && (
                  <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Subiendo imagen...
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="criterioDesbloqueo">Criterio de Desbloqueo (tecnico)</label>
                <input
                  type="text"
                  id="criterioDesbloqueo"
                  name="criterioDesbloqueo"
                  value={formulario.criterioDesbloqueo}
                  onChange={manejarCambio}
                  placeholder="Ej: DISTANCIA_100KM, PRIMER_VIAJE"
                />
                <small className="form-hint">Identificador tecnico para la logica del sistema</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={guardando}>
                  {guardando ? (subiendoImagen ? 'Subiendo...' : 'Guardando...') : (logroEditando ? 'Actualizar' : 'Crear')}
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
              <p>Esta seguro de eliminar este logro?</p>
              <p className="warning-text">Los usuarios que hayan desbloqueado este logro lo perderan.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setConfirmandoEliminar(null)}>
                Cancelar
              </button>
              <button className="btn-eliminar-confirm" onClick={() => eliminarLogro(confirmandoEliminar)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogros;
