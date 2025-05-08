import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getAuth, onAuthStateChanged, sendEmailVerification, reload, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import defaultAvatar from '../assets/default-avatar.png';
import '../styles/Login.css';

export default function Login() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // Por defecto inicia en inicio de sesión
  const [isOnLogin, setIsOnLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  // Si en la URL viene register=true, activa el modo registro
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('register') === 'true') {
      setIsOnLogin(false);
    }
  }, [location.search]);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Usuario autenticado:', user.uid);
    } else {
      console.log('No hay usuario autenticado.');
    }
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert('Sesión iniciada correctamente');
      navigate('/home');
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await register(email, password);
      const { user } = userCredential;
  
      await sendEmailVerification(user);
      alert('Se ha enviado un correo de verificación. Por favor revisa tu bandeja de entrada y haz clic en el enlace.');
      alert('Después de verificar tu correo, haz clic en "Aceptar" para continuar.');
  
      await reload(user);
  
      if (!user.emailVerified) {
        alert('Tu correo aún no ha sido verificado. Por favor verifica tu correo antes de continuar.');
        return;
      }
  
      const fileInput = document.getElementById('profile-photo');
      const file = fileInput?.files[0];
      let photoURL = '';
  
      if (file) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
      } else {
        photoURL = defaultAvatar;
      }
  
      if (user && user.uid) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name,
          phone: phone,
          photoURL: photoURL,
          emailVerified: user.emailVerified,
        });
  
        navigate('/perfil');
      } else {
        alert('Error: El usuario no está autenticado o no tiene UID.');
      }
    } catch (error) {
      console.error('🔥 Error en registro:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('Este correo ya está en uso. Por favor inicia sesión o usa otro.');
      } else {
        alert('Error al registrarse: ' + error.message);
      }
    }
  };  

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      navigate('/home');
    } catch (error) {
      console.error("Error al ingresar anónimamente", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <p className="login-left-overlay">MiOpenLab</p>
      </div>

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
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="Número de teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
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
                <input
                  type="file"
                  id="profile-photo"
                  accept="image/*"
                  style={{ marginTop: '1rem' }}
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
          <span  //BOTON DE ACCEDER COMO ANONIMO
            onClick={handleAnonymousLogin}
            style={{ 
              color: '#8a2be2', 
              cursor: 'pointer', 
              display: 'block', 
              marginTop: '1rem' 
            }}
          >
            Ingresar como Anónimo
          </span>
        </div>
      </div>
    </div>
  );
}
