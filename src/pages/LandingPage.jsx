import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import './LandingPage.css';

// Componentes
import Login from './Login'; 
import Footer from '../components/Footer';
import Starfield from '../components/Starfield';

// Imagenes
import ruxLogo from '../assets/rux-logo.png';
import btnRuxMovil from '../assets/btn-rux-movil.png';

// Imagenes de fondo del login
import img1 from '../assets/login-bg-1.jpg';
import img2 from '../assets/login-bg-2.jpg';
import img3 from '../assets/login-bg-3.jpg';
import img4 from '../assets/login-bg-4.jpg';
import img5 from '../assets/login-bg-5.jpg';

const loginImages = [img1, img2, img3, img4, img5];

const LandingPage = () => {
  const navigate = useNavigate();

  // Referencias para animaciones
  const loginRef = useRef(null);
  const descargaRef = useRef(null);
  const splineContainerRef = useRef(null);
  const introRef = useRef(null);

  // Estado para la franja activa (basado en posicion del mouse)
  const [activeStrip, setActiveStrip] = useState(-1);
  
  // Estado para el selector de ambiente
  const [showEnvSelector, setShowEnvSelector] = useState(false);

  // Efecto para detectar scroll y cambiar estilo de navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detectar callback de Google OAuth
  useEffect(() => {
    const hash = window.location.hash;
    
    // Si hay token en el hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        sessionStorage.setItem('google_access_token', accessToken);
        sessionStorage.setItem('show_loading_screen', 'true');
        
        // Limpiar el hash de la URL
        window.history.replaceState(null, '', window.location.pathname);
        sessionStorage.removeItem('google_auth_pending');
        
        // En lugar de navegar directo, mostramos el selector de ambiente
        setShowEnvSelector(true);
        return;
      }
    }
    
    sessionStorage.removeItem('google_auth_pending');
  }, [navigate]);

  const handleEnvSelect = (env) => {
    localStorage.setItem('selected_env', env);
    // Pequeño delay para feedback visual
    setTimeout(() => {
        navigate('/general', { replace: true });
    }, 200);
  };

  // ... (mouse handlers remain same)
  const handleMouseMove = (e) => {
    const stripWidth = window.innerWidth / 5;
    const stripIndex = Math.floor(e.clientX / stripWidth);
    setActiveStrip(stripIndex);
  };

  const handleMouseLeave = () => {
    setActiveStrip(-1);
  };

  // ... (useEffect for smooth scroll / spline events remain same)
  useEffect(() => {
    const container = splineContainerRef.current;
    if (container) {
      const stopWheelPropagation = (e) => {
        e.stopPropagation();
      };
      container.addEventListener('wheel', stopWheelPropagation, true);
      return () => {
        container.removeEventListener('wheel', stopWheelPropagation, true);
      };
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentLoginEl = loginRef.current;
    const currentDescargaEl = descargaRef.current;

    if (currentLoginEl) observer.observe(currentLoginEl);
    if (currentDescargaEl) observer.observe(currentDescargaEl);

    return () => {
      if (currentLoginEl) observer.unobserve(currentLoginEl);
      if (currentDescargaEl) observer.unobserve(currentDescargaEl);
    };
  }, []);

  return (
    <motion.div 
      className="landing-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* --- NAVBAR SIMPLE --- */}
      <nav className={`simple-navbar ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/">Inicio</Link>
        <Link to="/que-es-rux">¿Qué es RÜX?</Link>
      </nav>

      {/* --- FONDO FIJO INTERACTIVO --- */}
      <div className="interactive-background">
        {loginImages.map((img, index) => (
          <div
            key={index}
            className={`background-strip ${activeStrip === index ? 'strip-active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>

      {/* --- SECCION 1: INTRO --- */}
      <section 
        id="inicio" 
        className="landing-section" 
        ref={introRef}
      >
        <img src={ruxLogo} alt="RUX Logo" className="intro-logo animate-on-load" />
        <h1 className="intro-title animate-on-load">Nuestra comunidad,<br/>rutas y memorias</h1>
        
        <a href="#descarga" className="rux-movil-button animate-on-load">
          <img src={btnRuxMovil} alt="Descarga RUX movil" />
        </a>
      </section>

      {/* --- SECCION 2: LOGIN --- */}
      <section id="login" className="landing-section" ref={loginRef}>
        {/* Pasamos onSuccess para mostrar el selector */}
        <Login onSuccess={() => setShowEnvSelector(true)} /> 
      </section>
      
      {/* --- SECCION 3: DESCARGA --- */}
      <section id="descarga" className="landing-section descarga-section" ref={descargaRef}>
        <Starfield />
        
        <div className="descarga-content">
          <h2 className="descarga-title">Descarga la app!</h2>
          
          <div 
            ref={splineContainerRef}
            className="spline-container" 
            style={{ height: '500px', width: '100%', position: 'relative' }}
          >
             <Spline scene="https://prod.spline.design/6jtnp7KECFtDfGRb/scene.splinecode" />
             
             <button 
               onClick={() => setMostrarModal(true)}
               className="play-store-button"
             >
               <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z"/>
               </svg>
               <div className="button-text-content">
                 <span className="small-text">Descargar en</span>
                 <span className="main-text">Play Store</span>
               </div>
               <div className="button-shine"></div>
               <div className="button-particles">
                 <span></span><span></span><span></span><span></span><span></span>
               </div>
             </button>
          </div>

        </div>
      </section>

      {/* Modal de Proximamente */}
      {mostrarModal && (
        <div className="proximamente-overlay" onClick={() => setMostrarModal(false)}>
          <div className="proximamente-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-glow"></div>
            <h3>Proximamente</h3>
            <p>Estamos trabajando para traerte la app muy pronto</p>
            <button className="modal-close-btn" onClick={() => setMostrarModal(false)}>
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL SELECTOR DE AMBIENTE --- */}
      {showEnvSelector && (
        <div className="proximamente-overlay" style={{zIndex: 9999}}>
          <div className="proximamente-modal" style={{maxWidth: '500px', width: '90%'}}>
             <div className="modal-glow" style={{background: 'linear-gradient(45deg, #00f2fe, #4facfe)'}}></div>
             
             <h2 style={{color: 'white', marginBottom: '10px'}}>Seleccione Entorno</h2>
             <p style={{color: '#ccc', marginBottom: '30px'}}>¿Qué sistema deseas administrar?</p>
             
             <div style={{display: 'flex', flexDirection: 'column', gap: '15px', width: '100%'}}>
                
                {/* Opcion PROD */}
                <button 
                  onClick={() => handleEnvSelect('PROD')}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #4facfe',
                    background: 'rgba(79, 172, 254, 0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(79, 172, 254, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(79, 172, 254, 0.1)'}
                >
                    <div style={{textAlign: 'left'}}>
                        <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Producción 🚀</div>
                        <div style={{fontSize: '0.9rem', color: '#aaa', marginTop: '5px'}}>Base de datos nueva (Limpia)</div>
                    </div>
                </button>

                {/* Opcion DEV */}
                <button 
                  onClick={() => handleEnvSelect('DEV')}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #666',
                    background: 'rgba(100, 100, 100, 0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(100, 100, 100, 0.2)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(100, 100, 100, 0.1)'}
                >
                    <div style={{textAlign: 'left'}}>
                         <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Desarrollo (Legacy) 🛠️</div>
                         <div style={{fontSize: '0.9rem', color: '#aaa', marginTop: '5px'}}>Base de datos antigua (Pruebas)</div>
                    </div>
                </button>

             </div>
          </div>
        </div>
      )}

      <Footer />
    
    </motion.div>
  );
};

export default LandingPage;