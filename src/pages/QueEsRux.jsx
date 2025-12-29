import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import FloatingLines from '../components/FloatingLines';
import PlayStoreButton from '../components/PlayStoreButton';
import './QueEsRux.css';

// Importa imagenes
import mockupRuta from '../assets/mockup-ruta.png';
import mockupPois from '../assets/mockup-pois.png';
import mockupComunidad from '../assets/mockup-comunidad.png';
import mockupAsistente from '../assets/mockup-asistente.png';

const cardVariants = {
  offscreen: { 
    opacity: 0, 
    y: 50 
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 0.8,
      staggerChildren: 0.2
    }
  }
};

const textVariants = {
  offscreen: { 
    opacity: 0, 
    x: -20 
  },
  onscreen: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    }
  }
};

const imageVariants = (direction) => ({
  offscreen: {
    opacity: 0,
    x: direction === 'left' ? -50 : 50,
    rotate: direction === 'left' ? -5 : 5,
    scale: 0.9
  },
  onscreen: {
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 1
    }
  }
});

const QueEsRux = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div 
      className="que-es-rux-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* FONDO ANIMADO */}
      <div className="floating-lines-wrapper">
        <FloatingLines 
          linesGradient={['#ff6600', '#ff8800', '#ffaa00', '#ffcc00']}
          lineCount={[6, 8, 10]}
          header="RUX"
        />
      </div>

      {/* NAVBAR SIMPLE DE NAVEGACION */}
      <nav className={`simple-navbar ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/">Inicio</Link>
        <Link to="/que-es-rux" className="active">¿Qué es RÜX?</Link>
      </nav>

      <div className="info-section-page">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          ¿Qué es RÜX?
        </motion.h2>
        
        <div className="info-grid">
          {/* Articulo 1: Rutas Grupales (Imagen Derecha -> entra desde Derecha) */}
          <motion.div 
            className="info-card"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
          >
            <motion.div className="info-text" variants={textVariants}>
              <h3>Rutas Grupales Inteligentes</h3>
              <p>
                Organiza salidas épicas con tus amigos. Nuestra tecnología te permite crear rutas grupales en tiempo real, 
                monitorear la ubicación de todos los participantes y recibir <strong>asistencia mecánica con IA</strong> al instante si algo sale mal en el camino.
              </p>
            </motion.div>
            <div className="info-image">
              <motion.div className="mockup-img-container" variants={imageVariants('right')}>
                <img src={mockupRuta} alt="App Ruta Grupal" />
              </motion.div>
            </div>
          </motion.div>

          {/* Articulo 2: Puntos de Interés (Imagen Izquierda -> entra desde Izquierda) */}
          <motion.div 
            className="info-card reverse"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
          >
            <motion.div className="info-text" variants={textVariants}>
              <h3>Descubre y Disfruta</h3>
              <p>
                No solo se trata del viaje, sino de las paradas. Encuentra y agrega fácilmente 
                <strong> restaurantes, hoteles, mecanicas y gasolineras</strong> directamente en tu ruta. 
                RÜX te ayuda a planificar la experiencia completa.
              </p>
            </motion.div>
            <div className="info-image">
              <motion.div className="mockup-img-container" variants={imageVariants('left')}>
                <img src={mockupPois} alt="App Puntos de Interés" />
              </motion.div>
            </div>
          </motion.div>

          {/* Articulo 3: Comunidades (Imagen Derecha -> entra desde Derecha) */}
          <motion.div 
            className="info-card"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
          >
            <motion.div className="info-text" variants={textVariants}>
              <h3>Tu Comunidad Motorizada</h3>
              <p>
                Únete a comunidades de entusiastas como tú. Planifica eventos, comparte momentos de tus rodadas 
                y mantente conectado mediante nuestro <strong>chat integrado</strong>. La pasión por las ruedas se vive mejor acompañado.
              </p>
            </motion.div>
            <div className="info-image">
              <motion.div className="mockup-img-container" variants={imageVariants('right')}>
                <img src={mockupComunidad} alt="App Comunidades" />
              </motion.div>
            </div>
          </motion.div>

           {/* Articulo 4: Asistente IA (Imagen Izquierda -> entra desde Izquierda) */}
           <motion.div 
             className="info-card reverse"
             initial="offscreen"
             whileInView="onscreen"
             viewport={{ once: true, amount: 0.3 }}
             variants={cardVariants}
           >
            <motion.div className="info-text" variants={textVariants}>
              <h3>Mecánico Experto en tu Bolsillo</h3>
              <p>
                ¿Un ruido extraño? ¿Una luz en el tablero? Nuestro <strong>Asistente de IA</strong> especializado en mecánica 
                está disponible 24/7 para ayudarte a diagnosticar problemas y sugerir soluciones rápidas para que sigas rodando o vayas con un experto si es necesario.
              </p>
            </motion.div>
            <div className="info-image">
              <motion.div className="mockup-img-container" variants={imageVariants('left')}>
                <img src={mockupAsistente} alt="App Asistente IA" />
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      <motion.div 
        className="download-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h3 className="download-cta-text">¡Únete a la Revolución!</h3>
        <PlayStoreButton />
      </motion.div>

      <Footer />
    </motion.div>
  );
};

export default QueEsRux;
