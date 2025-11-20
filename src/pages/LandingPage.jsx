import React, { useEffect, useRef } from 'react'; // 1. Importamos useEffect y useRef
import './LandingPage.css'; // CSS para esta página

// ¡Importa el componente del cuadro de Login que ya hicimos!
import Login from './Login'; 

// Importa tus imágenes
import fondoIntro from '../assets/fondo-intro.jpg';
import ruxLogo from '../assets/rux-logo.png';
import btnRuxMovil from '../assets/btn-rux-movil.png';
import iconoIngresar from '../assets/icono-ingresar.svg';
// import fondoLoginBg from '../assets/fondo-login-bg.jpg'; // Ya no usamos el fondo estático
import fondoDescarga from '../assets/fondo-descarga.jpg';
import telefonosApp from '../assets/telefonos-app.png';

// --- AÑADIMOS LAS 5 IMÁGENES DEL LOGIN ---
import img1 from '../assets/login-bg-1.jpg';
import img2 from '../assets/login-bg-2.jpg';
import img3 from '../assets/login-bg-3.jpg';
import img4 from '../assets/login-bg-4.jpg';
import img5 from '../assets/login-bg-5.jpg';

// --- AÑADIMOS LOS ICONOS DEL FOOTER ---
import iconWhatsapp from '../assets/icon-whatsapp.svg';
import iconInstagram from '../assets/icon-instagram.svg';
import iconFacebook from '../assets/icon-correo.svg';
// ruxLogo ya está importado arriba

const loginImages = [img1, img2, img3, img4, img5];

const LandingPage = () => {

  // 2. Creamos "referencias" para los elementos que vamos a animar al scrollear
  const loginRef = useRef(null);
  const descargaRef = useRef(null);
  const footerRef = useRef(null);

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
    const currentFooterEl = footerRef.current;

    // Y ahora usamos esas variables locales para observar
    if (currentLoginEl) observer.observe(currentLoginEl);
    if (currentDescargaEl) observer.observe(currentDescargaEl);
    if (currentFooterEl) observer.observe(currentFooterEl);

    // 5. Limpiamos el observador al salir
    return () => {
      // Usamos las mismas variables locales en la limpieza
      // Esto elimina el warning porque estas variables no cambian
      if (currentLoginEl) observer.unobserve(currentLoginEl);
      if (currentDescargaEl) observer.unobserve(currentDescargaEl);
      if (currentFooterEl) observer.unobserve(currentFooterEl);
    };
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez

  return (
    <div className="landing-container">
      
      {/* --- SECCIÓN 1: INTRO --- */}
      <section id="intro" className="landing-section" style={{ backgroundImage: `url(${fondoIntro})` }}>
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
        <div className="descarga-content">
          <h2 className="descarga-title">¡Descarga la app!</h2>
          <img src={telefonosApp} alt="App RUX en teléfonos" className="telefonos-img" />
        </div>
      </section>

      {/* ===== INICIO DEL FOOTER ===== */}
      {/* 9. Asignamos la referencia 'footerRef' */}
      <footer className="footer" ref={footerRef}>
        <div className="footer-content">
          <div className="footer-logo">
            <img src={ruxLogo} alt="RUX Logo" />
          </div>
          <div className="footer-info">
            {/* Asegúrate de cambiar este texto por el de tu diseño */}
            <p>Copyright © 2024 RUX. Todos los derechos reservados.</p>
            <p>Cuenca, Ecuador</p> 
          </div>
          <div className="footer-social">
            <a href="https://wa.me/YOUR_NUMBER" target="_blank" rel="noopener noreferrer">
              <img src={iconWhatsapp} alt="WhatsApp" />
            </a>
            <a href="https://instagram.com/YOUR_PROFILE" target="_blank" rel="noopener noreferrer">
              <img src={iconInstagram} alt="Instagram" />
            </a>
            <a href="https://facebook.com/YOUR_PROFILE" target="_blank" rel="noopener noreferrer">
              <img src={iconFacebook} alt="Facebook" />
            </a>
          </div>
        </div>
      </footer>
      {/* ===== FIN DEL FOOTER ===== */}

    </div>
  );
};

export default LandingPage;