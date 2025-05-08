import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../services/firebase';
import { doc, deleteDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { getAuth, deleteUser, signOut, updatePassword, sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Layout from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  es: {
    accountSettings: "Configuración de Cuenta",
    accountWarning: "Aquí puedes administrar la configuración de tu cuenta. <strong>Advertencia:</strong> si eliminas tu cuenta, se eliminarán permanentemente todos tus datos, publicaciones y archivos multimedia, y no se podrán recuperar.",
    password: "Contraseña:",
    language: "Idioma:",
    changePassword: "Cambiar Contraseña",
    deleteAccount: "Eliminar Cuenta"
  },
  en: {
    accountSettings: "Account Settings",
    accountWarning: "Here you can manage your account settings. <strong>Warning:</strong> if you delete your account, all your data, posts, and multimedia files will be permanently removed and cannot be recovered.",
    password: "Password:",
    language: "Language:",
    changePassword: "Change Password",
    deleteAccount: "Delete Account"
  }
};

const Configuración = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();
  const { language, setLanguage } = useLanguage();

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      language === 'es'
        ? "Advertencia: Esta acción eliminará permanentemente tu cuenta, todos tus datos, tus publicaciones en proyectos y eventos, y tus archivos multimedia. No se podrá recuperar nada. ¿Estás seguro de eliminar tu cuenta?"
        : "Warning: This action will permanently delete your account, all your data, your posts in projects and events, and your multimedia files. Nothing can be recovered. Are you sure you want to delete your account?"
    );
    if (!confirmDelete) return;

    try {
      const photoRef = ref(storage, `profilePictures/${user.uid}`);
      await deleteObject(photoRef).catch((error) => {
        console.error("Error eliminando la foto de perfil:", error);
      });
      await deleteDoc(doc(db, 'users', user.uid));

      const proyectosQuery = query(
        collection(db, 'proyectos'),
        where('autorId', '==', user.uid)
      );
      const proyectosSnap = await getDocs(proyectosQuery);
      proyectosSnap.forEach(async (proyectoDoc) => {
        await deleteDoc(doc(db, 'proyectos', proyectoDoc.id));
      });
      
      const eventosQuery = query(
        collection(db, 'eventos'),
        where('autorId', '==', user.uid)
      );
      const eventosSnap = await getDocs(eventosQuery);
      eventosSnap.forEach(async (eventoDoc) => {
        await deleteDoc(doc(db, 'eventos', eventoDoc.id));
      });

      await deleteUser(user);
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error eliminando la cuenta:", error);
      alert((language === 'es' ? "Error eliminando la cuenta: " : "Error deleting account: ") + error.message);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = window.prompt(language === 'es'
      ? "Ingresa tu contraseña actual:"
      : "Enter your current password:");
    if (!currentPassword) return;
  
    const newPassword = window.prompt(language === 'es'
      ? "Ingrese su nueva contraseña (mínimo 6 caracteres):"
      : "Enter your new password (at least 6 characters):");
    if (!newPassword || newPassword.length < 6) {
      alert(language === 'es'
        ? "La nueva contraseña debe tener al menos 6 caracteres."
        : "The new password must be at least 6 characters.");
      return;
    }
    
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      await updateDoc(doc(db, 'users', user.uid), { password: newPassword });
      await sendEmailVerification(user);
      alert(language === 'es'
        ? "La contraseña se actualizó exitosamente. Se ha enviado un correo de verificación a tu correo."
        : "Password updated successfully. A verification email has been sent to your account.");
    } catch (error) {
      console.error("Error cambiando la contraseña:", error);
      alert((language === 'es' ? "Error cambiando la contraseña: " : "Error changing password: ") + error.message);
    }
  };

  const handleIdiomaChange = (e) => {
    setLanguage(e.target.value);
  };

  return (
    <Layout>
      <div style={{ display: 'flex', padding: '2rem', maxWidth: '100%', margin: '0 auto' }}>
        {/* Contenido principal */}
        <div style={{ flex: '1 1 70%', paddingRight: '1rem' }}>
          <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {translations[language].accountSettings}
          </h2>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#fff'
          }}>
            <p style={{ marginBottom: '1.5rem', color: '#333' }}
               dangerouslySetInnerHTML={{ __html: translations[language].accountWarning }}>
            </p>
            {/* Bloque para mostrar contraseña enmascarada con ícono de lápiz */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <strong>{translations[language].password}</strong>
              <span style={{
                marginLeft: '1rem',
                fontFamily: 'monospace',
                letterSpacing: '0.3rem',
                userSelect: 'none'
              }}>
                ********
              </span>
              <FontAwesomeIcon 
                icon={faPencilAlt} 
                style={{ marginLeft: 'auto', cursor: 'pointer' }} 
                onClick={handleChangePassword} 
              />
            </div>
            {/* Bloque para selección de Idioma */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <strong>{translations[language].language}</strong>
              <select 
                value={language} 
                onChange={handleIdiomaChange} 
                style={{ marginLeft: '1rem', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            </div>
            {/* Área de botones */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              {/* Se remueve el botón de cambiar contraseña ya que se usa el ícono */}
              <button
                onClick={handleDeleteAccount}
                style={{
                  backgroundColor: '#922b21',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  flex: '1 0 45%'
                }}
              >
                {translations[language].deleteAccount}
              </button>
            </div>
          </div>
        </div>
        {/* Menú lateral a la derecha */}
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ flex: 1, paddingRight: '1rem' }}>
            {/* Aquí puede ir otro contenido */}
          </div>
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
            <span className="menu-option">
              {language === 'es' ? "Datos de Cuenta" : "Account Details"}
              <span style={{
                display: 'block',
                fontSize: '0.7rem',
                color: '#aaa',
                marginTop: '0.2rem'
              }}>
                {language === 'es' ? "Administración de cuenta" : "Account management"}
              </span>
            </span>
            <hr style={{ borderTop: '0.5px solid #aaa', width: '80%', transform: 'scaleY(0.5)' }} />
            <span className="menu-option">
              {language === 'es' ? "Escritorio" : "Dashboard"}
              <span style={{
                display: 'block',
                fontSize: '0.7rem',
                color: '#aaa',
                marginTop: '0.2rem'
              }}>
                {language === 'es' ? "Apariencia y personalización" : "Look and customization"}
              </span>
            </span>
            <hr style={{ borderTop: '0.5px solid #aaa', width: '80%', transform: 'scaleY(0.5)' }} />
            <span className="menu-option">
              {language === 'es' ? "Notificaciones" : "Notifications"}
              <span style={{
                display: 'block',
                fontSize: '0.7rem',
                color: '#aaa',
                marginTop: '0.2rem'
              }}>
                {language === 'es' ? "Interacción con la comunidad" : "Community interaction"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Configuración;