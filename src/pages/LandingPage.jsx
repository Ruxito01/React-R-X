import React, { useEffect, useRef, useState } from 'react'; // 1. Importamos useEffect, useRef y useState
import Spline from '@splinetool/react-spline'; // Importamos Spline
import './LandingPage.css'; // CSS para esta página

// ¡Importa el componente del cuadro de Login que ya hicimos!
import Login from './Login'; 

// Importa el Footer completo
import Footer from '../components/Footer';

// Importa el componente Starfield
import Starfield from '../components/Starfield';

// Importa tus imágenes
import fondoIntro from '../assets/fondo-intro.jpg';
import ruxLogo from '../assets/rux-logo.png';
import btnRuxMovil from '../assets/btn-rux-movil.png';
import iconoIngresar from '../assets/icono-ingresar.svg';
import fondoDescarga from '../assets/fondo-descarga.jpg';

// --- AÑADIMOS LAS 5 IMÁGENES DEL LOGIN ---
import img1 from '../assets/login-bg-1.jpg';
import img2 from '../assets/login-bg-2.jpg';
import img3 from '../assets/login-bg-3.jpg';
import img4 from '../assets/login-bg-4.jpg';
import img5 from '../assets/login-bg-5.jpg';

const loginImages = [img1, img2, img3, img4, img5];

const LandingPage = () => {

  // 2. Creamos "referencias" para los elementos que vamos a animar al scrollear
  const loginRef = useRef(null);
  const descargaRef = useRef(null);
  const splineContainerRef = useRef(null); // Ref para el contenedor de Spline
  const introRef = useRef(null); // Ref para la sección intro
  
  // Estado para el efecto de paralaje 3D
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Efecto para el paralaje 3D en la sección intro
  useEffect(() => {
    const handleMouseMove = (e) => {
      const intro = introRef.current;
      if (!intro) return;

      // Obtener las dimensiones de la sección
      const rect = intro.getBoundingClientRect();
      
      // Calcular la posición del mouse relativa al centro de la sección
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      
      // Actualizar el estado con valores normalizados
      setMousePosition({ x, y });
    };

    const intro = introRef.current;
    if (intro) {
      intro.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        intro.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);

  // Efecto para evitar que el scroll haga zoom en el modelo 3D
  useEffect(() => {
    const container = splineContainerRef.current;
    if (container) {
      // Función para detener la propagación del evento wheel al canvas de Spline
      const stopWheelPropagation = (e) => {
        e.stopPropagation();
      };
      
      // Añadimos el listener en la fase de captura (true) para interceptar el evento antes de que llegue al canvas
      container.addEventListener('wheel', stopWheelPropagation, true);
      
      return () => {
        container.removeEventListener('wheel', stopWheelPropagation, true);
      };
    }
  }, []);

  // 3. Este es el efecto que "observa" los elementos
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Animamos solo una vez
          }
        });
      },
      {
        threshold: 0.1 // El elemento se considera visible si un 10% de él está en pantalla
      }
    );

    // --- 4. CORRECCIÓN PARA EL LINTER ---
    // Guardamos los elementos actuales en variables locales
    const currentLoginEl = loginRef.current;
    const currentDescargaEl = descargaRef.current;

    // Y ahora usamos esas variables locales para observar
    if (currentLoginEl) observer.observe(currentLoginEl);
    if (currentDescargaEl) observer.observe(currentDescargaEl);

    // 5. Limpiamos el observador al salir
    return () => {
      // Usamos las mismas variables locales en la limpieza
      // Esto elimina el warning porque estas variables no cambian
      if (currentLoginEl) observer.unobserve(currentLoginEl);
      if (currentDescargaEl) observer.unobserve(currentDescargaEl);
    };
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez

  return (
    <div className="landing-container">
      
      {/* --- SECCIÓN 1: INTRO --- */}
      <section 
        id="inicio" 
        className="landing-section" 
        ref={introRef}
        style={{ 
          backgroundImage: `url(${fondoIntro})`,
          backgroundPosition: `calc(50% + ${mousePosition.x * 30}px) calc(50% + ${mousePosition.y * 30}px)`,
          transition: 'background-position 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {/* 6. Añadimos la clase 'animate-on-load' a cada elemento */}
        <img src={ruxLogo} alt="RUX Logo" className="intro-logo animate-on-load" />
        <h1 className="intro-title animate-on-load">Nuestra comunidad,<br/>rutas y memorias</h1>
        
        <a href="#login" className="ingresar-button animate-on-load">
          <img src={iconoIngresar} alt="Ingresar" />
          <span>Ingresar</span>
        </a>
        
        <a href="#descarga" className="rux-movil-button animate-on-load">
          <img src={btnRuxMovil} alt="Descarga RÚX móvil" />
        </a>
      </section>

      {/* --- SECCIÓN 2: LOGIN --- */}
      {/* 7. Asignamos la referencia 'loginRef' */}
      <section id="login" className="landing-section" ref={loginRef}>
        
        {/* --- AÑADIMOS EL FONDO INTERACTIVO AQUÍ --- */}
        <div className="interactive-background">
          {loginImages.map((img, index) => (
            <div
              key={index}
              className="background-strip"
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
        
        {/* El componente Login ahora se muestra por encima */}
        <Login /> 
      
      </section>
      
      {/* --- SECCIÓN 3: DESCARGA --- */}
      {/* 8. Asignamos la referencia 'descargaRef' */}
      <section id="descarga" className="landing-section" style={{ backgroundImage: `url(${fondoDescarga})` }} ref={descargaRef}>
        {/* Componente Starfield como fondo */}
        <Starfield />
        
        <div className="descarga-content">
          <h2 className="descarga-title">¡Descarga la app!</h2>
          
          {/* INTEGRACIÓN DE SPLINE */}
          <div 
            ref={splineContainerRef}
            className="spline-container" 
            style={{ height: '500px', width: '100%', position: 'relative' }}
          >
             <Spline scene="https://prod.spline.design/6jtnp7KECFtDfGRb/scene.splinecode" />
             
             {/* Elemento para cubrir la marca de agua de Spline */}
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