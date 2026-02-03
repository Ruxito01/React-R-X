import React, { useState, useEffect, useRef } from 'react';
import { getBaseURL } from '../config/api';
import './AdminLogros.css';
import TableImage from '../components/TableImage';
import fondoDashboard from '../assets/fondo_dashboard_usuarios.png';
import { subirImagenLogro, eliminarImagenLogro } from '../services/supabaseStorageService';
import { compressImage } from '../utils/imageCompressor';



const AdminLogros = () => {
  const API_BASE_URL = getBaseURL();
  // Estados principales
  const [logros, setLogros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [logroEditando, setLogroEditando] = useState(null);
  
  // LOGICA MECANICA: Separamos el string "TIPO:VALOR" en dos estados para la UI
  const [tipoCriterio, setTipoCriterio] = useState('VIAJES'); // Default
  const [valorMeta, setValorMeta] = useState('');
  
  const [formulario, setFormulario] = useState({ 
    nombre: '', 
    descripcion: '', 
    urlIcono: ''
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
      const response = await fetch(`${API_BASE_URL}/logro/stats`);
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
    setFormulario({ nombre: '', descripcion: '', urlIcono: '' });
    // Resetear mecanica
    setTipoCriterio('VIAJES');
    setValorMeta('');
    
    setArchivoImagen(null);
    setPreviewImagen('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (logro) => {
    setLogroEditando(logro);
    setFormulario({ 
      nombre: logro.nombre, 
      descripcion: logro.descripcion || '',
      urlIcono: logro.urlIcono || ''
    });
    
    // Parsear criterioDesbloqueo (EJ: "VIAJES:5")
    if (logro.criterioDesbloqueo && logro.criterioDesbloqueo.includes(':')) {
      const partes = logro.criterioDesbloqueo.split(':');
      if (partes.length === 2) {
        setTipoCriterio(partes[0].toUpperCase());
        setValorMeta(partes[1]);
      } else {
        // Fallback si el formato es raro
        setTipoCriterio('MANUAL');
        setValorMeta(logro.criterioDesbloqueo);
      }
    } else if (logro.criterioDesbloqueo) {
         setTipoCriterio('MANUAL');
         setValorMeta(logro.criterioDesbloqueo);
    } else {
      setTipoCriterio('VIAJES');
      setValorMeta('');
    }

    setArchivoImagen(null);
    setPreviewImagen(logro.urlIcono || '');
    setModalAbierto(true);
  };

  // Determinar si el criterio seleccionado requiere valor numerico
  const requiereValor = !['PRIMER_PERFIL', 'SUBIR_FOTO_PERFIL', 'INVITAR_AMIGO'].includes(tipoCriterio);

  const cerrarModal = () => {
    setModalAbierto(false);
    setLogroEditando(null);
    setFormulario({ nombre: '', descripcion: '', urlIcono: '' });
    setTipoCriterio('VIAJES');
    setValorMeta('');
    setArchivoImagen(null);
    setPreviewImagen('');
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar seleccion de archivo de imagen
  const manejarSeleccionImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'image/gif') {
      setError('Solo se permiten archivos GIF animados');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB');
      return;
    }
    
    // Intentar comprimir (la utilidad ya excluye GIFs internamente, pero aqui forzamos check por si acaso)
    try {
        let fileToUse = file;
        // Solo comprimimos si NO es gif (aunque compressImage ya lo maneja, doble check)
        if (file.type !== 'image/gif') {
             fileToUse = await compressImage(file);
        }
        
        setArchivoImagen(fileToUse);
        
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImagen(e.target.result);
        reader.readAsDataURL(fileToUse);
        
    } catch (err) {
        console.error("Error compresion:", err);
        // Fallback
        setArchivoImagen(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImagen(e.target.result);
        reader.readAsDataURL(file);
    }
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
        // Si estamos editando y había una imagen anterior, borrarla
        if (logroEditando && logroEditando.urlIcono) {
            try {
                // No bloqueamos si falla el borrado, solo logueamos
                await eliminarImagenLogro(logroEditando.urlIcono); 
            } catch (elimErr) {
                console.warn("No se pudo eliminar la imagen anterior:", elimErr);
            }
        }

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
      
      // CONSTRUIR EL CRITERIO FINAL
      let criterioFinal = null;
      
      // Casos sin valor requerido (Flags)
      if (['PRIMER_PERFIL', 'SUBIR_FOTO_PERFIL', 'INVITAR_AMIGO'].includes(tipoCriterio)) {
          criterioFinal = tipoCriterio;
      } 
      // Casos con valor requerido
      else if (valorMeta) {
        criterioFinal = `${tipoCriterio}:${valorMeta}`;
      }

      const body = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim() || null,
        urlIcono: urlIcono || null,
        criterioDesbloqueo: criterioFinal
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
      // 1. Encontrar el logro para ver si tiene imagen
      const logroAEliminar = logros.find(l => l.id === id);
      
      // 2. Si tiene imagen, eliminarla de Supabase
      if (logroAEliminar && logroAEliminar.urlIcono) {
        await eliminarImagenLogro(logroAEliminar.urlIcono);
      }

      // 3. Eliminar registro del backend
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
                    <th className="th-center">Desbloqueos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {logrosFiltrados.map((logro, index) => {
                    const tieneDesbloqueos = logro.cantidadDesbloqueos > 0;
                    return (
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
                        <td className="td-center">
                          <span className={`badge-count ${tieneDesbloqueos ? 'has-unlocks' : 'no-unlocks'}`}>
                            {logro.cantidadDesbloqueos || 0}
                          </span>
                        </td>
                        <td className="td-acciones">
                          <button 
                            className={`btn-editar ${tieneDesbloqueos ? 'disabled' : ''}`}
                            onClick={() => !tieneDesbloqueos && abrirModalEditar(logro)} 
                            title={tieneDesbloqueos ? "No se puede editar un logro ya desbloqueado" : "Editar"}
                            disabled={tieneDesbloqueos}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button 
                            className={`btn-eliminar ${tieneDesbloqueos ? 'disabled' : ''}`}
                            onClick={() => !tieneDesbloqueos && setConfirmandoEliminar(logro.id)}
                            title={tieneDesbloqueos ? "No se puede eliminar un logro ya desbloqueado" : "Eliminar"}
                            disabled={tieneDesbloqueos}
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
                <label>Icono del Logro (Solo GIFs)</label>
                <div className="upload-container">
                  <input
                    type="file"
                    ref={inputFileRef}
                    accept="image/gif"
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <label htmlFor="input-icono" className="btn-seleccionar-imagen">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <path d="M8 12h8"/> {/* Simple representing frame */}
                            </svg>
                            Seleccionar GIF
                        </label>
                        <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#666' }}>
                            Recomendamos descargar iconos animados en formato GIF desde{' '}
                            <a href="https://www.flaticon.com/animated-icons" target="_blank" rel="noopener noreferrer" style={{ color: '#e67e22', textDecoration: 'underline' }}>
                                Flaticon Animated Icons
                            </a>.
                        </p>
                    </div>
                  )}
                </div>
                {subiendoImagen && (
                  <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Subiendo imagen...
                  </p>
                )}
              </div>
              
              <div className="mechanics-container">
                <label className="mechanics-title">Mecánica de Desbloqueo</label>
                
                <div className="mechanics-grid">
                  <div>
                    <label htmlFor="tipoCriterio">Condición</label>
                    <select
                      id="tipoCriterio"
                      value={tipoCriterio}
                      onChange={(e) => setTipoCriterio(e.target.value)}
                    >
                      <option value="VIAJES">Cantidad de Viajes</option>
                      <option value="DISTANCIA">Distancia (Km)</option>
                      <option value="RUTAS_CREADAS">Rutas Creadas</option>
                      <option value="VEHICULOS">Vehículos Registrados</option>
                      <option value="COMUNIDADES">Comunidades</option>
                      <option value="PRIMER_PERFIL">Registro en RUX</option>
                      <option value="SUBIR_FOTO_PERFIL">Foto de Perfil</option>
                      <option value="INVITAR_AMIGO">Invitar Amigos</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="valorMeta">
                      {requiereValor ? 'Cantidad Requerida' : 'No requiere valor'}
                    </label>
                    <input
                      type="number"
                      id="valorMeta"
                      value={valorMeta}
                      onChange={(e) => setValorMeta(e.target.value)}
                      placeholder={requiereValor ? 'Ej: 5' : '-'}
                      min="1"
                      disabled={!requiereValor}
                    />
                  </div>
                </div>
                
                <div className="mechanics-help">
                  {tipoCriterio === 'VIAJES' && `El usuario debe completar ${valorMeta || 'N'} viajes.`}
                  {tipoCriterio === 'DISTANCIA' && `El usuario debe acumular ${valorMeta || 'N'} km recorridos.`}
                  {tipoCriterio === 'RUTAS_CREADAS' && `El usuario debe crear ${valorMeta || 'N'} rutas públicas.`}
                  {tipoCriterio === 'VEHICULOS' && `El usuario debe registrar ${valorMeta || 'N'} vehículos.`}
                  {tipoCriterio === 'COMUNIDADES' && `El usuario debe unirse a ${valorMeta || 'N'} comunidades.`}
                  {tipoCriterio === 'PRIMER_PERFIL' && `Se otorga al registrarse por primera vez.`}
                  {tipoCriterio === 'SUBIR_FOTO_PERFIL' && `Se otorga al subir una foto de perfil.`}
                  {tipoCriterio === 'INVITAR_AMIGO' && `Se otorga al invitar a un amigo.`}
                </div>
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
