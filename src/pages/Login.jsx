import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import miOpenLabBackground from '../assets/miopenlab-background.jpg'; // Importa la imagen

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/perfil'); // redirige al perfil si inicia sesión con éxito
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  return (
    <div className="login-page">
      {/* Lado izquierdo */}
      <div className="login-left">
        MiOpenLab
        <img
          src={miOpenLabBackground}
          alt="MiOpenLab Background"
          className="login-left-image"
        />
      </div>

      {/* Lado derecho */}
      <div className="login-right">
        <div className="login-container">
          <h2>Iniciar Sesión</h2>
          <p>Por favor ingresa tus credenciales abajo.</p>

          <form onSubmit={handleSubmit}>
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
            ¿No tienes una cuenta? <a href="/register">Registrarse</a>
          </div>
        </div>
      </div>
    </div>
  );
}

