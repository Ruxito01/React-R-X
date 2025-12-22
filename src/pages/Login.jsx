import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
        navigate('/dashboard');
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
   * Manejar click en el botón de Google - Implementación manual con popup centrado
   */
  const handleGoogleLoginClick = () => {
    setError('');
    setLoading(true);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/google-callback.html`;

    // Crear URL de autorización de Google
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('prompt', 'select_account');

    // Abrir popup centrado (500x600) - directamente sin async/await
    const popup = openCenteredPopup(authUrl.toString(), 'Login con Google', 500, 600);

    if (!popup || popup.closed) {
      setError('No se pudo abrir el popup. Verifica que los popups no estén bloqueados.');
      setLoading(false);
      return;
    }

    // Escuchar el mensaje del popup
      const handleMessage = async (event) => {
        // Verificar origen
        if (event.origin !== window.location.origin) return;

        // Cerrar popup
        if (popup && !popup.closed) {
          popup.close();
        }

        const { access_token, error: authError } = event.data;

        if (authError) {
          setError('Error al autenticar con Google. Intenta de nuevo.');
          setLoading(false);
          window.removeEventListener('message', handleMessage);
          return;
        }

        if (!access_token) {
          setLoading(false);
          window.removeEventListener('message', handleMessage);
          return;
        }

        try {
          console.log('🔵 Token de Google recibido');

          // Obtener información del usuario usando el access token
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          });

          const userInfo = await userInfoResponse.json();
          console.log('✅ Información del usuario obtenida:', userInfo.email);

          // Verificar usuario en el backend
          const url = `${import.meta.env.VITE_API_URL}/usuario/email/${userInfo.email}`;
          const response = await fetch(url);

          if (response.status === 404) {
            setError('Esta cuenta de Google no está registrada. Contacta al administrador.');
            setLoading(false);
            window.removeEventListener('message', handleMessage);
            return;
          }

          if (!response.ok) {
            setError('Error al conectar con el servidor. Intenta de nuevo.');
            setLoading(false);
            window.removeEventListener('message', handleMessage);
            return;
          }

          const usuario = await response.json();
          console.log('✅ Usuario encontrado:', usuario.nombre, '- Rol:', usuario.rol);

          // Verificar rol ADMIN
          if (usuario.rol !== 'ADMIN') {
            setError('Acceso denegado. Solo administradores pueden acceder a esta plataforma.');
            setLoading(false);
            window.removeEventListener('message', handleMessage);
            return;
          }

          // Guardar usuario y navegar
          const authService = (await import('../services/authService')).default;
          authService.saveUser(usuario);
          console.log('✅ Login con Google exitoso, redirigiendo al dashboard');
          navigate('/dashboard');

        } catch (err) {
          console.error('❌ Error inesperado:', err);
          setError('Error inesperado al autenticar con Google.');
        } finally {
          setLoading(false);
          window.removeEventListener('message', handleMessage);
          clearTimeout(window._googleLoginTimeout); // Clear timeout in finally block
        }
      };

      window.addEventListener('message', handleMessage);

      // Usar timeout en lugar de verificar popup.closed (evita error COOP)
      // Si después de 2 minutos no hay respuesta, limpiar el estado
      const timeoutId = setTimeout(() => {
        setLoading(false);
        window.removeEventListener('message', handleMessage);
      }, 120000);

      // Guardar el timeout ID para limpiarlo cuando llegue el mensaje
      window._googleLoginTimeout = timeoutId;
  };

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