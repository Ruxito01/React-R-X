import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Login.css';
import logo from '../assets/rux-logo.png';
import loginCardImage from '../assets/login-card-image.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const { width, height, top, left } = card.getBoundingClientRect();
      const mouseX = e.clientX - left;
      const mouseY = e.clientY - top;

      const centerX = width / 2;
      const centerY = height / 2;

      const maxTilt = 1.5;
      const rotateX = ((centerY - mouseY) / centerY) * maxTilt;
      const rotateY = ((mouseX - centerX) / centerX) * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.005)`;
      card.style.boxShadow = "0 7px 25px rgba(0, 0, 0, 0.12)";
    };

    const handleMouseLeave = () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
      card.style.boxShadow = "0 5px 20px rgba(0, 0, 0, 0.1)";
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  /**
   * Manejar submit del formulario de login
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔵 Intentando login con email:', email);
      const result = await loginWithEmail(email, password);

      if (result.success) {
        console.log('✅ Login exitoso, redirigiendo al dashboard');
        navigate('/general');
      } else {
        console.log('❌ Login fallido:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err);
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función helper para abrir popup centrado de Google
   */
  const openCenteredPopup = (url, title, w, h) => {
    // Calcular la posición central
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth
      ? window.innerWidth
      : document.documentElement.clientWidth
        ? document.documentElement.clientWidth
        : window.screen.width;

    const height = window.innerHeight
      ? window.innerHeight
      : document.documentElement.clientHeight
        ? document.documentElement.clientHeight
        : window.screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - w) / 2 / systemZoom + dualScreenLeft;
    const top = (height - h) / 2 / systemZoom + dualScreenTop;

    const newWindow = window.open(
      url,
      title,
      `scrollbars=yes,width=${w / systemZoom},height=${h / systemZoom},top=${top},left=${left}`
    );

    if (window.focus && newWindow) newWindow.focus();
    return newWindow;
  };

  /**
   * Manejar click en el botón de Google - Redirección directa (más compatible)
   */
  const handleGoogleLoginClick = () => {
    setError('');
    setLoading(true);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    // Usar la página principal como callback en lugar de un archivo separado
    const redirectUri = `${window.location.origin}/`;

    // Guardar que estamos esperando el callback de Google
    sessionStorage.setItem('google_auth_pending', 'true');

    // Crear URL de autorización de Google
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('prompt', 'select_account');

    // Redirección directa en lugar de popup
    window.location.href = authUrl.toString();
  };

  // El procesamiento del callback de Google OAuth se hace en LandingPage.jsx

  return (
    <div className="login-container">
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
          <div className="login-header">
            <img src={logo} alt="RUX Logo" className="rux-logo" />
            <h2>Login</h2>
          </div>

          {/* Boton para alternar tema */}
          <button 
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
              </svg>
            )}
          </button>

          {/* Mensaje de error */}
          {error && (
            <div className="error-message" style={{
              backgroundColor: '#ff4444',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div className="login-options">
              <div className="remember-me">
                <input type="checkbox" id="rememberMe" />
                <label htmlFor="rememberMe">Remember me</label>
              </div>
              <a href="#" className="forgot-password"> </a>
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Login'}
            </button>
          </form>

          {/* Botón de Google personalizado - mismo estilo que el botón Login */}
          <button onClick={handleGoogleLoginClick} className="google-login-button" disabled={loading}>
            <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Iniciar con Google</span>
          </button>

          <div className="signup-link">
            <a href="#"> </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;