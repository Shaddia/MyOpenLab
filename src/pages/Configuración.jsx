import React from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../services/firebase';
import { doc, deleteDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { getAuth, deleteUser, signOut, updatePassword, sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Layout from '../components/Layout';

const Configuración = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Advertencia: Esta acción eliminará permanentemente tu cuenta, todos tus datos, tus publicaciones en proyectos y eventos, y tus archivos multimedia. No se podrá recuperar nada. ¿Estás seguro de eliminar tu cuenta?"
    );
    if (!confirmDelete) return;

    try {
      // Eliminar la foto de perfil en Storage (si existe)
      const photoRef = ref(storage, `profilePictures/${user.uid}`);
      await deleteObject(photoRef).catch((error) => {
        console.error("Error eliminando la foto de perfil:", error);
      });

      // Eliminar el documento del usuario en la colección "users"
      await deleteDoc(doc(db, 'users', user.uid));

      // Eliminar los proyectos publicados por el usuario
      const proyectosQuery = query(
        collection(db, 'proyectos'),
        where('autorId', '==', user.uid)
      );
      const proyectosSnap = await getDocs(proyectosQuery);
      proyectosSnap.forEach(async (proyectoDoc) => {
        await deleteDoc(doc(db, 'proyectos', proyectoDoc.id));
      });

      // Eliminar los eventos publicados por el usuario
      const eventosQuery = query(
        collection(db, 'eventos'),
        where('autorId', '==', user.uid)
      );
      const eventosSnap = await getDocs(eventosQuery);
      eventosSnap.forEach(async (eventoDoc) => {
        await deleteDoc(doc(db, 'eventos', eventoDoc.id));
      });

      // Eliminar el usuario en Firebase Auth (requiere reautenticación reciente)
      await deleteUser(user);

      // Cerrar sesión y redirigir a la pantalla de login
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error eliminando la cuenta:", error);
      alert("Error eliminando la cuenta: " + error.message);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = window.prompt("Ingresa tu contraseña actual:");
    if (!currentPassword) return;

    const newPassword = window.prompt("Ingrese su nueva contraseña (mínimo 6 caracteres):");
    if (!newPassword || newPassword.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    try {
      // Reautenticar al usuario con email y contraseña actual
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Actualizar la contraseña en Firebase Auth
      await updatePassword(user, newPassword);
      
      // Actualizar la contraseña en la base de datos si se almacena (no se recomienda guardar contraseñas en texto plano)
      await updateDoc(doc(db, 'users', user.uid), { password: newPassword });
      
      // Enviar correo de verificación
      await sendEmailVerification(user);
      alert("Se ha enviado un correo de verificación a tu gmail. Revisa tu correo para confirmar el cambio.");
    } catch (error) {
      console.error("Error cambiando la contraseña:", error);
      alert("Error cambiando la contraseña: " + error.message);
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', padding: '2rem', maxWidth: '100%', margin: '0 auto', marginLeft:'0', marginRight: '0' }}>
        {/* Contenido principal */}
        <div style={{ flex: '1 1 70%', paddingRight: '1rem' }}>
          <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Configuración de Cuenta</h2>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#fff'
          }}>
            <p style={{ marginBottom: '1.5rem', color: '#333' }}>
              Aquí puedes administrar la configuración de tu cuenta. <strong>Advertencia:</strong> si eliminas tu cuenta, se eliminarán permanentemente todos tus datos, publicaciones y archivos multimedia, y no se podrán recuperar.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <button
                onClick={handleChangePassword}
                style={{
                  backgroundColor: 'blue',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  flex: '1 0 45%',
                  marginRight: '1rem'
                }}
              >
                Cambiar Contraseña
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  flex: '1 0 45%'
                }}
              >
                Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>
        {/* Menú lateral con etiquetas de fondo morado claro */}
        <div style={{ display: 'flex', width: '100%' }}>
          {/* Contenido principal (izquierda) */}
          <div style={{ flex: 1, paddingRight: '1rem' }}>
            {/* ... contenido principal de configuración ... */}
          </div>

          {/* Menú lateral a la derecha fijado al borde */}
<div style={{
  position: 'fixed',
  top: 0,
  right: 0,
  backgroundColor: '#1c2833',
  width: '350px',
  minHeight: '100vh',
  padding: '1rem',
  paddingTop: '100px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  zIndex: 1000
}}>
  <span className="menu-option">Datos de Cuenta
  <span style={{
      display: 'block',
      fontSize: '0.7rem',
      color: '#aaa',
      marginTop: '0.2rem'
    }}>
      Administración de cuenta
    </span>
  </span>
  <hr style={{ borderTop: '0.5px solid #aaa', width: '80%', transform: 'scaleY(0.5)'  }} />
  <span className="menu-option">Escritorio
  <span style={{
      display: 'block',
      fontSize: '0.7rem',
      color: '#aaa',
      marginTop: '0.2rem'
    }}>
      Apariencia y personalización
    </span>
  </span>
  <hr style={{ borderTop: '0.5px solid #aaa', width: '80%', transform: 'scaleY(0.5)'  }} />
  <span className="menu-option">Notificaciones
  <span style={{
      display: 'block',
      fontSize: '0.7rem',
      color: '#aaa',
      marginTop: '0.2rem'
    }}>
      Interacción con la comunidad
    </span>
  </span>

</div>
        </div>
      </div>
    </Layout>
  );
};

export default Configuración;