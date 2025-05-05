import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Layout from './layout';

const MiPerfil = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const fetchUserData = async () => {
    if (user && user.uid) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: '',
          phone: '',
          email: user.email || '',
          photoURL: '',
          uid: user.uid,
        });
        return fetchUserData();
      }

      const data = docSnap.data();
      setUserData(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      fetchUserData();
    } catch (error) {
      setError('Error al subir la imagen.');
      console.error(error);
    }

    setUploading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        phone: formData.phone,
      });
      setEditing(false);
      fetchUserData();
    } catch (error) {
      setError('No se pudieron guardar los cambios.');
      console.error(error);
    }
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
            {userData?.photoURL ? (
              <img
                src={userData.photoURL}
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
          <div>
            <input
              type="file"
              accept="image/*"
              id="upload-photo"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="upload-photo"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#8a2be2',
                color: 'white',
                borderRadius: '20px',
                cursor: 'pointer',
              }}
            >
              Cambiar foto
            </label>
          </div>
          {uploading && <p>Subiendo imagen...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>

        {/* INFORMACIÓN DEL USUARIO */}
        <div style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '950px',
        }}>
          <h3 style={{ marginBottom: '2rem', color: '#6a1bbd' }}>
            Información del Perfil
          </h3>

          {editing ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label>Nombre:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Teléfono:</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                />
              </div>
              <button
                onClick={handleSaveChanges}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: '#8a2be2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Guardar Cambios
              </button>
            </>
          ) : (
            <>
              <p><strong>Nombre:</strong> {userData?.name || 'No especificado'}</p>
              <p><strong>Email:</strong> {userData?.email || user.email}</p>
              <p><strong>Teléfono:</strong> {userData?.phone || 'No registrado'}</p>
              <p><strong>UID:</strong> {userData?.uid || user.uid}</p>
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '0.8rem 1.5rem',
                  backgroundColor: '#8a2be2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  marginTop: '1rem',
                  cursor: 'pointer',
                }}
              >
                Editar
              </button>
            </>
          )}

          <button
            onClick={logout}
            style={{
              marginTop: '2rem',
              padding: '0.8rem 1.5rem',
              backgroundColor: '#ff5e57',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default MiPerfil;
