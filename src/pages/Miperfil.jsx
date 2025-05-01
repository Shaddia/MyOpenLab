import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Layout from './layout';

const MiPerfil = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Función para cargar los datos del usuario desde Firestore
  const fetchUserData = async () => {
    if (user && user.uid) {
      const docRef = doc(db, 'usuarios', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());  // Guardar los datos, incluyendo la foto
      }
    }
  };

  // Cargar los datos del usuario cuando el componente se monta
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);  // Se vuelve a ejecutar cuando `user` cambia

  // Manejo del cambio de archivo cuando se selecciona una foto
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificación para asegurarse de que el archivo sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen.');
      return;
    }

    setUploading(true);
    setError('');  // Limpiar el error previo si hay uno

    try {
      const storageRef = ref(storage, `fotosPerfil/${user.uid}`);  // Referencia para almacenar la imagen
      await uploadBytes(storageRef, file);  // Subir la imagen a Firebase Storage

      // Obtener la URL de la imagen subida
      const url = await getDownloadURL(storageRef);

      // Actualizar Firestore con la nueva URL de la foto
      const docRef = doc(db, 'usuarios', user.uid);
      await updateDoc(docRef, { foto: url });

      // Cargar los datos del usuario nuevamente para actualizar el estado
      fetchUserData();
    } catch (error) {
      setError('Hubo un error al subir la foto.');
      console.error("Error al subir la foto:", error);
    }

    setUploading(false);
  };

  if (!user) return <p style={{ padding: '2rem' }}>No estás autenticado.</p>;

  return (
    <Layout>
      <div className="top-bar">
        <h2 className="section-title">Mi perfil</h2>
      </div>

      <div style={{ display: 'flex', padding: '2rem', gap: '2rem' }}>
        {/* FOTO DE PERFIL */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: '3px solid #8a2be2',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            {userData?.foto ? (
              <img
                src={userData.foto}  // Mostrar la foto desde Firestore
                alt="Foto de perfil"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#aaa',
                fontSize: '0.9rem'
              }}>
                Sin foto
              </div>
            )}
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <input
              type="file"
              accept="image/*"
              id="upload-photo"
              onChange={handleFileChange}
              style={{
                opacity: 0,
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
            />
            <label
              htmlFor="upload-photo"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#8a2be2',
                color: 'white',
                borderRadius: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Seleccionar foto
            </label>
          </div>
          {uploading && <p>Cargando...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>

        {/* DATOS DEL PERFIL */}
        <div style={{
          flex: 1,
          backgroundColor: '#fff',  // Fondo blanco
          borderRadius: '10px',  // Bordes redondeados
          padding: '2rem',  // Espaciado interno
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',  // Sombra suave
          maxWidth: '950px',  // Aumento aún mayor del ancho máximo
          margin: '0 auto',  // Centrado
        }}>
          <h3
            style={{
              marginBottom: '2rem',
              color: '##6a1bbd',  // Título oscuro
              fontWeight: '600',  // Título más prominente
            }}
          >
            Información del Perfil
          </h3>
          
          <p style={{ fontSize: '1.2rem', color:'#8a2be2', marginBottom: '2rem' }}>
            <strong>Nombre:</strong> {userData?.nombre || 'No especificado'}
          </p>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            <strong>Email:</strong> {user.email}
          </p>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            <strong>Teléfono:</strong> {userData?.telefono || 'No registrado'}
          </p>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            <strong>Rol:</strong> {userData?.rol || 'Usuario'}
          </p>

          <button
            onClick={logout}
            style={{
              marginTop: '2rem',
              padding: '0.8rem 1.5rem',
              backgroundColor: '#ff5e57',  // Botón rojo-anaranjado
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff3b2f'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff5e57'}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default MiPerfil;
