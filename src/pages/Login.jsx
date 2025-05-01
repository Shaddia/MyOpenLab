import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import miOpenLabBackground from '../assets/miopenlab-background.jpg'; // Importa la imagen

export default function Login() {
  const { login, register } = useAuth(); // Asegúrate de que `register` esté disponible en tu contexto
  const [email, setEmail] = useState('');
  const [isOnLogin, setIsOnLogin] = useState(true);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Función para manejar el inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/home'); // Redirige al perfil si inicia sesión con éxito
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  // Función para manejar el registro
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(email, password); // Llama a la función de registro
      navigate('/perfil'); // Redirige al perfil después del registro
    } catch (error) {
      alert('Error al registrarse: ' + error.message);
    }
  };

  return (
    <div className="login-page">
      {/* Lado izquierdo */}
      <div className="login-left">
        <p className="login-left-overlay">MiOpenLab</p>
      </div>

      {/* Lado derecho */}
      <div className="login-right">
        <div className="login-container">
          {isOnLogin ? (
            <>
              <h2>Iniciar Sesión</h2>
              <p>Por favor ingresa tus credenciales abajo.</p>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit">Iniciar Sesión</button>
                <button type="button" className="google-btn">
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google icon"
                  />
                  Iniciar con Google
                </button>
              </form>
              <div className="register-link">
                ¿No tienes una cuenta?{' '}
                <a href="#" onClick={() => setIsOnLogin(false)}>
                  Registrarse
                </a>
              </div>
            </>
          ) : (
            <>
              <h2>Registrarse</h2>
              <p>Por favor completa el formulario para crear una cuenta.</p>
              <form onSubmit={handleRegister}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Crea una contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="submit">Registrarse</button>
              </form>
              <div className="register-link">
                ¿Ya tienes una cuenta?{' '}
                <a href="#" onClick={() => setIsOnLogin(true)}>
                  Iniciar Sesión
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

