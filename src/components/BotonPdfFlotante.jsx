import React, { useState, useRef, useEffect } from 'react';
import { getBaseURL } from '../config/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './BotonPdfFlotante.css';
import logoRux from '../assets/logo_rux.png';
import { GraficasUsuariosPdf, GraficasVehiculosPdf, GraficasRutasPdf, GraficasComunidadesPdf } from './GraficasPdf';



// Configuracion de dashboards
const DASHBOARDS_CONFIG = {
  general: { nombre: 'General', prefijo: 'grafica-general' },
  usuarios: { nombre: 'Usuarios', prefijo: 'pdf-grafica-usuarios' },
  vehiculos: { nombre: 'Vehiculos', prefijo: 'pdf-grafica-vehiculos' },
  comunidades: { nombre: 'Comunidades', prefijo: 'pdf-grafica-comunidades' },
  rutas: { nombre: 'Rutas', prefijo: 'pdf-grafica-rutas' }
};

const BotonPdfFlotante = () => {
  const API_URL = getBaseURL();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seleccionados, setSeleccionados] = useState({
    general: true,
    usuarios: false,
    vehiculos: false,
    comunidades: false,
    rutas: false
  });
  const [generando, setGenerando] = useState(false);
  const [mostrarPrevisualizacion, setMostrarPrevisualizacion] = useState(false);
  const [datosLisitos, setDatosLisitos] = useState(false);
  const [estadoGeneracion, setEstadoGeneracion] = useState('');
  
  // Datos para las graficas
  const [datos, setDatos] = useState({
    usuarios: [],
    vehiculos: [],
    rutas: [],
    viajes: [],
    tiposVehiculo: [],
    comunidades: []
  });

  const menuRef = useRef(null);
  const previsualizacionRef = useRef(null);

  // Cerrar menu al hacer clic fuera
  useEffect(() => {
    const manejarClickFuera = (evento) => {
      if (menuRef.current && !menuRef.current.contains(evento.target)) {
        setMenuAbierto(false);
      }
    };
    if (menuAbierto) {
      document.addEventListener('mousedown', manejarClickFuera);
    }
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, [menuAbierto]);

  const toggleSeleccion = (dashboard) => {
    setSeleccionados(prev => ({ ...prev, [dashboard]: !prev[dashboard] }));
  };

  const obtenerFechaActual = () => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Cargar datos de todos los dashboards
  const cargarDatos = async () => {
    setEstadoGeneracion('Cargando datos...');
    try {
      const [usuariosRes, vehiculosRes, rutasRes, viajesRes, tiposRes, comunidadesRes] = await Promise.all([
        fetch(`${API_URL}/usuario`),
        fetch(`${API_URL}/vehiculo`),
        fetch(`${API_URL}/ruta`),
        fetch(`${API_URL}/viaje`),
        fetch(`${API_URL}/tipovehiculo`),
        fetch(`${API_URL}/comunidad`)
      ]);

      const usuariosData = usuariosRes.ok ? await usuariosRes.json() : [];
      const vehiculosData = vehiculosRes.ok ? await vehiculosRes.json() : [];
      const rutasData = rutasRes.ok ? await rutasRes.json() : [];
      const viajesData = viajesRes.ok ? await viajesRes.json() : [];
      const tiposData = tiposRes.ok ? await tiposRes.json() : [];
      const comunidadesData = comunidadesRes.ok ? await comunidadesRes.json() : [];

      // Cargar miembros de cada comunidad
      const comunidadesConMiembros = await Promise.all(
        comunidadesData.map(async (c) => {
          try {
            const miembrosRes = await fetch(`${API_URL}/comunidad/${c.id}/miembros`);
            const miembros = miembrosRes.ok ? await miembrosRes.json() : [];
            return { ...c, miembros, cantidadMiembros: miembros.length };
          } catch {
            return { ...c, miembros: [], cantidadMiembros: 0 };
          }
        })
      );

      // Procesar usuarios con estadisticas
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);

      const usuariosProcesados = usuariosData.map(u => {
        let kmTotales = 0;
        let viajesParticipados = 0;

        viajesData.forEach(viaje => {
          if (viaje.participantes) {
            viaje.participantes.forEach(p => {
              if (p.usuario?.id === u.id) {
                viajesParticipados++;
                kmTotales += p.kmRecorridos ? parseFloat(p.kmRecorridos) : 0;
              }
            });
          }
        });

        return {
          id: u.id,
          nombre: `${u.nombre} ${u.apellido || ''}`,
          alias: u.alias || u.nombre,
          foto: u.foto,
          distancia: Math.round(kmTotales * 10) / 10,
          rutasMes: viajesParticipados,
          vehiculos: vehiculosData.filter(v => v.usuario?.id === u.id).length
        };
      });

      setDatos({
        usuarios: usuariosProcesados.sort((a, b) => b.distancia - a.distancia),
        vehiculos: vehiculosData,
        rutas: rutasData,
        viajes: viajesData,
        tiposVehiculo: tiposData,
        comunidades: comunidadesConMiembros
      });

      return true;
    } catch (err) {
      console.error('Error cargando datos:', err);
      setEstadoGeneracion('Error cargando datos');
      return false;
    }
  };

  // Iniciar generacion de PDF
  const iniciarGeneracion = async () => {
    const dashboardsSeleccionados = Object.entries(seleccionados)
      .filter(([_, sel]) => sel)
      .map(([key]) => key);

    if (dashboardsSeleccionados.length === 0) {
      alert('Selecciona al menos un dashboard para exportar');
      return;
    }

    setGenerando(true);
    setMenuAbierto(false);
    setMostrarPrevisualizacion(true);
    setDatosLisitos(false);

    // Cargar datos si se selecciono algo que no sea solo general
    const necesitaCargaDatos = dashboardsSeleccionados.some(d => d !== 'general');
    
    if (necesitaCargaDatos) {
      const exito = await cargarDatos();
      if (!exito) {
        setGenerando(false);
        setMostrarPrevisualizacion(false);
        return;
      }
    }

    setDatosLisitos(true);
    setEstadoGeneracion('Renderizando graficas...');

    // Esperar a que React renderice las graficas
    setTimeout(() => generarPdfDesdePreview(dashboardsSeleccionados), 1500);
  };

  // Generar PDF desde la previsualizacion
  const generarPdfDesdePreview = async (dashboardsSeleccionados) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const anchoA4 = 210;
      const altoA4 = 297;
      const margen = 15;
      const anchoContenido = anchoA4 - (margen * 2);
      let posicionY = margen;

      // Logo
      setEstadoGeneracion('Agregando logo...');
      const logoImg = new Image();
      logoImg.src = logoRux;
      await new Promise(resolve => { logoImg.onload = resolve; logoImg.onerror = resolve; });

      pdf.addImage(logoImg, 'PNG', (anchoA4 - 40) / 2, posicionY, 40, 40);
      posicionY += 50;

      // Titulo
      pdf.setFontSize(18);
      pdf.setTextColor(51, 51, 51);
      const titulo = 'Reportes RUX';
      pdf.text(titulo, (anchoA4 - pdf.getTextWidth(titulo)) / 2, posicionY);
      posicionY += 8;

      pdf.setFontSize(12);
      pdf.setTextColor(102, 102, 102);
      const subtitulo = `Dia ${obtenerFechaActual()}`;
      pdf.text(subtitulo, (anchoA4 - pdf.getTextWidth(subtitulo)) / 2, posicionY);
      posicionY += 15;

      pdf.setDrawColor(255, 102, 16);
      pdf.setLineWidth(0.5);
      pdf.line(margen, posicionY, anchoA4 - margen, posicionY);
      posicionY += 15;

      // Procesar cada dashboard
      for (const dashboardKey of dashboardsSeleccionados) {
        const config = DASHBOARDS_CONFIG[dashboardKey];
        setEstadoGeneracion(`Capturando ${config.nombre}...`);

        // Titulo de seccion
        if (posicionY > altoA4 - 80) {
          pdf.addPage();
          posicionY = margen;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(255, 102, 16);
        pdf.text(config.nombre, margen, posicionY);
        posicionY += 2;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(margen, posicionY, margen + 50, posicionY);
        posicionY += 10;

        // Buscar elementos con el prefijo correspondiente
        const elementos = document.querySelectorAll(`[id^="${config.prefijo}"]`);
        
        if (elementos.length === 0) {
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          pdf.text('Graficas no disponibles', margen, posicionY);
          posicionY += 15;
        } else {
          for (const elemento of elementos) {
            try {
              const canvas = await html2canvas(elemento, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
              });

              const imgData = canvas.toDataURL('image/png');
              const imgAncho = anchoContenido;
              const imgAlto = (canvas.height / canvas.width) * imgAncho;

              if (posicionY + imgAlto + 15 > altoA4 - margen) {
                pdf.addPage();
                posicionY = margen;
              }

              pdf.addImage(imgData, 'PNG', margen, posicionY, imgAncho, imgAlto);
              posicionY += imgAlto + 10;
            } catch (err) {
              console.error(`Error capturando ${elemento.id}:`, err);
            }
          }
        }
        posicionY += 5;
      }

      // Pie de pagina
      const totalPaginas = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        const pie = `Pagina ${i} de ${totalPaginas} - Generado el ${new Date().toLocaleString('es-ES')}`;
        pdf.text(pie, (anchoA4 - pdf.getTextWidth(pie)) / 2, altoA4 - 10);
      }

      // Abrir PDF
      setEstadoGeneracion('Abriendo PDF...');
      const nombreArchivo = `Reportes_RUX_${new Date().toISOString().split('T')[0]}.pdf`;
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const nuevaVentana = window.open(url, '_blank');
      if (nuevaVentana) {
        nuevaVentana.document.title = nombreArchivo;
      }

      setTimeout(() => URL.revokeObjectURL(url), 60000);

    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el PDF');
    } finally {
      setGenerando(false);
      setMostrarPrevisualizacion(false);
      setEstadoGeneracion('');
    }
  };

  const cerrarPrevisualizacion = () => {
    setMostrarPrevisualizacion(false);
    setGenerando(false);
    setEstadoGeneracion('');
  };

  return (
    <>
      {/* Modal de previsualizacion */}
      {mostrarPrevisualizacion && (
        <div className="pdf-preview-overlay">
          <div className="pdf-preview-modal">
            <div className="pdf-preview-header">
              <h3>Generando Reporte PDF</h3>
              <button className="pdf-preview-cerrar" onClick={cerrarPrevisualizacion}>X</button>
            </div>
            
            <div className="pdf-preview-estado">
              <div className="pdf-spinner-grande"></div>
              <p>{estadoGeneracion || 'Preparando...'}</p>
            </div>

            {/* Contenedor oculto para renderizar graficas */}
            <div ref={previsualizacionRef} className="pdf-preview-contenido">
              {datosLisitos && (
                <>
                  {seleccionados.usuarios && (
                    <GraficasUsuariosPdf 
                      usuarios={datos.usuarios} 
                    />
                  )}
                  {seleccionados.vehiculos && (
                    <GraficasVehiculosPdf 
                      vehiculos={datos.vehiculos} 
                      tiposVehiculo={datos.tiposVehiculo} 
                    />
                  )}
                  {seleccionados.comunidades && (
                    <GraficasComunidadesPdf 
                      comunidades={datos.comunidades} 
                    />
                  )}
                  {seleccionados.rutas && (
                    <GraficasRutasPdf 
                      rutas={datos.rutas} 
                      viajes={datos.viajes} 
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu y boton flotante */}
      <div className="boton-pdf-flotante-container" ref={menuRef}>
        {menuAbierto && (
          <div className="pdf-menu-flotante">
            <div className="pdf-menu-header">
              <span className="pdf-menu-titulo">Exportar a PDF</span>
              <button className="pdf-menu-cerrar" onClick={() => setMenuAbierto(false)}>x</button>
            </div>
            
            <div className="pdf-menu-opciones">
              {Object.entries(DASHBOARDS_CONFIG).map(([key, config]) => (
                <label key={key} className="pdf-opcion">
                  <input
                    type="checkbox"
                    checked={seleccionados[key]}
                    onChange={() => toggleSeleccion(key)}
                  />
                  <span className="pdf-opcion-check"></span>
                  <span className="pdf-opcion-texto">{config.nombre}</span>
                </label>
              ))}
            </div>

            <button className="pdf-btn-generar" onClick={iniciarGeneracion} disabled={generando}>
              {generando ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        )}

        <button
          className={`boton-pdf-flotante ${menuAbierto ? 'activo' : ''} ${generando ? 'generando' : ''}`}
          onClick={() => !generando && setMenuAbierto(!menuAbierto)}
          disabled={generando}
          title="Exportar graficas a PDF"
        >
          {generando ? (
            <div className="pdf-spinner"></div>
          ) : (
            <>
              <svg className="pdf-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M9 15h6" />
                <path d="M9 11h6" />
              </svg>
              <span className="pdf-texto">PDF</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default BotonPdfFlotante;
