import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getAuth, onAuthStateChanged, sendEmailVerification, reload, signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Asegúrate de importar getDoc
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import defaultAvatar from '../assets/default-avatar.png';
import { FaGoogle } from 'react-icons/fa';
import '../styles/Login.css';

export default function Login() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isOnLogin, setIsOnLogin] = useState(true);
  const [userDataState, setUserDataState] = useState(null); // Nuevo estado para userData
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

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
      
      // Asigna el username basado en el email (parte anterior al @)
      const username = email.slice(0, email.indexOf('@'));

      if (user && user.uid) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name,
          phone: phone,
          photoURL: photoURL,
          emailVerified: user.emailVerified,
          username: username // nuevo campo asignado
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

  // Función para ingresar con Google
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let finalPhotoURL = defaultAvatar;
      if (user.photoURL) {
        finalPhotoURL = user.photoURL; // usa la URL original sin modificar
      } else if (
        user.providerData &&
        user.providerData.length > 0 &&
        user.providerData[0].photoURL
      ) {
        finalPhotoURL = user.providerData[0].photoURL;
      }
      
      console.log("Final photo URL:", finalPhotoURL);

      // Calcula el username derivado del email
      const username = user.email.slice(0, user.email.indexOf('@'));

      const userData = {
        email: user.email,
        name: user.displayName || (user.providerData[0] && user.providerData[0].displayName) || '',
        phone: user.phoneNumber || (user.providerData[0] && user.providerData[0].phoneNumber) || '',
        photoURL: finalPhotoURL,
        emailVerified: user.emailVerified,
        username: username  // nuevo campo asignado
      };

      // Guarda data en estado para utilizarla en el render
      setUserDataState(userData);

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, userData);
      } else {
        await setDoc(userDocRef, userData, { merge: true });
      }
      navigate('/home');
    } catch (error) {
      console.error("Error al ingresar con Google", error);
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
              {isOnLogin && (
                <>
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
                    <button type="submit" className="login-button">
                      Iniciar Sesión
                    </button>
                  </form>
                  {/* Botón para ingresar con Google */}
                  <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="login-button"
                    style={{
                      marginTop: '1rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #8a2be2',
                      color: '#8a2be2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '53.7rem', // Ajusta aquí el ancho (puedes probar 'auto' o un valor fijo)
                      padding: '0.5rem 1rem'
                    }}
                  >
                    <FaGoogle style={{ fontSize: '24px', marginRight: '0.5rem' }} />
                    Ingresar con Google
                  </button>
                </>
              )}
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
          <span
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
          {userDataState && (
            <img 
              src={userDataState.photoURL} 
              alt="Foto de perfil" 
              crossOrigin="anonymous"
              style={{ width: '150px', height: '150px', borderRadius: '50%' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
