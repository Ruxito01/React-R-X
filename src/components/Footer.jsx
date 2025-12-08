import React from 'react';
import './Footer.css';
import ruxLogo from '../assets/rux-logo.png';
import iconWhatsapp from '../assets/icon-whatsapp.svg';
import iconInstagram from '../assets/icon-instagram.svg';
import iconCorreo from '../assets/icon-correo.svg';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-section footer-logo-section">
          <img src={ruxLogo} alt="RUX Logo" className="footer-logo-img" />
        </div>
        
        <div className="footer-section footer-info-section">
          <p><strong>Contáctanos</strong></p>
          <p>Av. Octavio Chacón Moscoso 1-98 y Primera Transversal (Parque industrial)</p>
          <p>Cuenca, Ecuador</p>
          <p>info@rux.com.ec | +593 99 328 9678</p>
        </div>

        <div className="footer-section footer-info-section">
          <p><strong>Síguenos</strong></p>
          <div className="footer-social-icons">
            <a 
              href="https://wa.me/593993289678" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
            >
              <img src={iconWhatsapp} alt="WhatsApp" />
            </a>
            <a 
              href="https://instagram.com/rux_ec" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
            >
              <img src={iconInstagram} alt="Instagram" />
            </a>
            <a 
              href="mailto:info@rux.com.ec"
              className="social-link"
            >
              <img src={iconCorreo} alt="Correo" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RUX. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
