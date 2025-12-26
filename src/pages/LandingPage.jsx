import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Detectar callback de Google OAuth y navegar inmediatamente al dashboard
  useEffect(() => {
    const hash = window.location.hash;
    
    // Si hay token en el hash, guardar y navegar inmediatamente al dashboard
    if (hash && hash.includes('access_token')) {
      // Guardar token para que el dashboard lo procese
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        sessionStorage.setItem('google_access_token', accessToken);
        sessionStorage.setItem('show_loading_screen', 'true');
        
        // Limpiar el hash de la URL y flag pendiente
        window.history.replaceState(null, '', window.location.pathname);
        sessionStorage.removeItem('google_auth_pending');
        
        // Navegar inmediatamente al dashboard (sin mostrar loading aqui)
        navigate('/general', { replace: true });
        return;
      }
    }
    
    // Limpiar flag pendiente si no hay token
    sessionStorage.removeItem('google_auth_pending');
  }, [navigate]);

  // Detecta que franja esta debajo del mouse
  const handleMouseMove = (e) => {
    const stripWidth = window.innerWidth / 5;
    const stripIndex = Math.floor(e.clientX / stripWidth);
    setActiveStrip(stripIndex);
  };

  // Cuando el mouse sale del contenedor
  const handleMouseLeave = () => {
    setActiveStrip(-1);
  };

  // Efecto para evitar que el scroll haga zoom en el modelo 3D
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

  // Efecto que observa los elementos para animaciones
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
    <div 
      className="landing-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* --- FONDO FIJO INTERACTIVO (COMPARTIDO ENTRE INTRO Y LOGIN) --- */}
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
        <Login /> 
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
             
             <div className="spline-watermark-cover">
                <span>RUX App</span>
             </div>
          </div>

        </div>
      </section>

      <Footer />

    </div>
  );
};

export default LandingPage;