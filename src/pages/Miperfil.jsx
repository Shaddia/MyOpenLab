import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase'; // Asegúrate de tener esto configurado

const MiPerfil = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.uid) {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No existe el documento del usuario');
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <p style={{ padding: '2rem' }}>No estás autenticado.</p>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>Mi Perfil</h2>
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '1.5rem',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        {userData?.foto && (
          <img src={userData.foto} alt="Foto de perfil"
               style={{ width: '100px', borderRadius: '50%', marginBottom: '1rem' }} />
        )}
        <p><strong>Nombre:</strong> {userData?.nombre || 'No especificado'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Teléfono:</strong> {userData?.telefono || 'No registrado'}</p>
        <p><strong>Rol:</strong> {userData?.rol || 'Usuario'}</p>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '1.5rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: '#ff5e57',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default MiPerfil;
