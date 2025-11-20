import React, { useState, useRef, useEffect } from 'react'; // 1. Importa useRef y useEffect
import './Login.css'; 
import logo from '../assets/rux-logo.png';
import loginCardImage from '../assets/login-card-image.jpg'; // <-- 1. Importa tu nueva imagen

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const cardRef = useRef(null); // 2. Crea una referencia para la tarjeta

  // 3. Este efecto añade la lógica del mouse
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const { width, height, top, left } = card.getBoundingClientRect();
      const mouseX = e.clientX - left;
      const mouseY = e.clientY - top;

      // Calcula el centro
      const centerX = width / 2;
      const centerY = height / 2;

      // Calcula la rotación (de -1 a 1, multiplicado por la intensidad)
      const maxTilt = 1.5; // Máximos grados de inclinación (sutil)
      const rotateX = ((centerY - mouseY) / centerY) * maxTilt;
      const rotateY = ((mouseX - centerX) / centerX) * maxTilt;

      // Aplica el estilo 3D
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.005)`; // (scale sutil)
      card.style.boxShadow = "0 7px 25px rgba(0, 0, 0, 0.12)"; // (sombra sutil)
    };

    const handleMouseLeave = () => {
      // Resetea el estilo suavemente
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
      card.style.boxShadow = "0 5px 20px rgba(0, 0, 0, 0.1)";
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    // Limpia los listeners cuando el componente se desmonta
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []); // El array vacío [] significa que esto se ejecuta solo una vez

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    alert('Simulando inicio de sesión con: ' + email);
  };

  return (
    <div className="login-container"> 
      {/* 4. Asigna la referencia a tu login-box */}
      <div className="login-box" ref={cardRef}>
        
        {/* --- COLUMNA 1: IMAGEN --- */}
        <div 
          className="login-image-side" 
          style={{ backgroundImage: `url(${loginCardImage})` }}
        >
          {/* Esta columna es solo la imagen de fondo */}
        </div>

        {/* --- COLUMNA 2: FORMULARIO --- */}
        <div className="login-form-side">
          {/* 3. Todo tu formulario antiguo va dentro de esta columna */}
          <div className="login-header">
            <img src={logo} alt="RUX Logo" className="rux-logo" />
            <h2>Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="login-options">
              <div className="remember-me">
                <input type="checkbox" id="rememberMe" />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          <div className="signup-link">
            Don't have an account? <a href="#">Sign up</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;