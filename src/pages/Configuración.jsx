import React, { useState } from 'react';
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
    deleteAccount: "Eliminar Cuenta",
    toggleDark: "Cambiar a Dark Mode"
  },
  en: {
    accountSettings: "Account Settings",
    accountWarning: "Here you can manage your account settings. <strong>Warning:</strong> if you delete your account, all your data, posts, and multimedia files will be permanently removed and cannot be recovered.",
    password: "Password:",
    language: "Language:",
    changePassword: "Change Password",
    deleteAccount: "Delete Account",
    toggleDark: "Switch to Dark Mode"
  }
};

const Configuración = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();
  const { language, setLanguage } = useLanguage();
  
  // Estado local para paneles y dark mode
  const [selectedPanel, setSelectedPanel] = useState('datos');
  const [darkMode, setDarkMode] = useState(false);

  // Al hacer toggle, actualizamos el estado
  const handleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Estilos que se aplicarán según el valor de darkMode
  const containerStyle = {
    backgroundColor: darkMode ? darkModeColors.background : "#fff",
    color: darkMode ? darkModeColors.text : "#000"
  };

  // Ejemplo: actualizar estilos para botones (puedes extenderlo al resto de componentes)
  const buttonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: darkMode ? darkModeColors.button.background : '#444',
    color: darkMode ? darkModeColors.button.text : 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

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
      <div style={{ ...containerStyle, display: 'flex', padding: '2rem', maxWidth: '100%', margin: '0 auto', position: 'relative' }}>
        {/* Contenedor principal para el contenido de configuración */}
        <div style={{ flex: '1', marginRight: '370px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            {selectedPanel === 'datos' && (
              <>
                <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
                  {translations[language].accountSettings}
                </h2>
                <div style={{
                  border: darkMode ? `1px solid ${darkModeColors.border}` : '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: darkMode ? darkModeColors.sidebar.background : '#fff'
                }}>
                  {/* Contenido de configuración de cuenta */}
                  <p style={{ marginBottom: '1.5rem', color: darkMode ? darkModeColors.text : '#333' }}
                    dangerouslySetInnerHTML={{ __html: translations[language].accountWarning }}>
                  </p>
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
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <strong>{translations[language].language}</strong>
                    <select
                      value={language}
                      onChange={handleIdiomaChange}
                      style={{ marginLeft: '1rem', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleDeleteAccount}
                      style={buttonStyle}
                    >
                      {translations[language].deleteAccount}
                    </button>
                  </div>
                </div>
              </>
            )}
            {selectedPanel === 'escritorio' && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <button
                  onClick={handleDarkMode}
                  style={buttonStyle}
                >
                  {translations[language].toggleDark}
                </button>
              </div>
            )}
            {selectedPanel === 'notificaciones' && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>{language === 'es' ? "Contenido de Notificaciones" : "Notifications content"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Menú lateral fijo */}
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          backgroundColor: darkMode ? darkModeColors.sidebar.background : '#1c2833',
          width: '350px',
          minHeight: '100vh',
          padding: '1rem',
          paddingTop: '100px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 1000,
          color: darkMode ? darkModeColors.sidebar.text : '#fff'
        }}>
          {/* Opciones del menú lateral */}
          <div className="menu-option-container" onClick={() => setSelectedPanel('datos')}>
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
          </div>
          <hr style={{ borderTop: '0.5px solid #aaa', width: '80%', transform: 'scaleY(0.5)' }} />
          <div className="menu-option-container" onClick={() => setSelectedPanel('escritorio')}>
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
          </div>
          <hr style={{ borderTop: '0.5px solid #aaa', width: '80%', transform: 'scaleY(0.5)' }} />
          <div className="menu-option-container" onClick={() => setSelectedPanel('notificaciones')}>
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