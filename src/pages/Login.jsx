// Login.jsx
import { useState } from 'react'; 
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { getAuth, onAuthStateChanged, sendEmailVerification, reload } from 'firebase/auth';

export default function Login() {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Nuevo estado para el nombre
  const [phone, setPhone] = useState(''); // Nuevo estado para el teléfono
  const [isOnLogin, setIsOnLogin] = useState(true);
  const navigate = useNavigate();

  const auth = getAuth();

  // Verificar si el usuario está autenticado
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
      // Registrar al usuario con Firebase Authentication
      const userCredential = await register(email, password);
      const { user } = userCredential;

      console.log('Usuario registrado:', user);
      console.log('UID del usuario registrado:', user.uid);

      // Enviar correo de verificación
      await sendEmailVerification(user);
      alert('Se ha enviado un correo de verificación. Por favor revisa tu bandeja de entrada y haz clic en el enlace.');

      // Esperar a que el usuario confirme que ha verificado su correo
      alert('Después de verificar tu correo, haz clic en "Aceptar" para continuar.');

      // Recargar el usuario para obtener el estado actualizado
      await reload(user);
      console.log('Estado de emailVerified después de recargar:', user.emailVerified);

      // Verificar si el correo ha sido confirmado
      if (!user.emailVerified) {
        alert('Tu correo aún no ha sido verificado. Por favor verifica tu correo antes de continuar.');
        return;
      }

      // Subir foto de perfil (opcional)
      const fileInput = document.getElementById('profile-photo');
      const file = fileInput?.files[0];
      let photoURL = '';

      if (file) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, file);
        photoURL = await getDownloadURL(storageRef);
        console.log('Foto subida, URL:', photoURL);
      }

      // Guardar datos del usuario en Firestore
      if (user && user.uid) {
        try {
          console.log('Guardando datos en Firestore para UID:', user.uid);
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            name: name, // Guardar el nombre ingresado
            phone: phone, // Guardar el teléfono ingresado
            photoURL: photoURL,
            emailVerified: user.emailVerified,
          });
          console.log('Datos enviados a Firestore correctamente.');
        } catch (error) {
          console.error('Error al guardar en Firestore:', error);
        }

        console.log('Datos enviados a Firestore:', {
          email: user.email,
          uid: user.uid,
          photoURL: photoURL,
          name: name,
          phone: phone,
          emailVerified: user.emailVerified, 
        });

        navigate('/perfil');
      } else {
        console.error('El usuario no está autenticado o no tiene UID.');
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
        </div>
      </div>
    </div>
  );
}
