// src/components/PrivateRoute.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Si no hay usuario, se redirige normalmente a login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  // Solo se permiten para usuarios anónimos las siguientes rutas
  const allowedRoutesForAnonymous = ['/home', '/eventos'];
  
  // Si el usuario es anónimo, pero intenta acceder a una ruta no permitida, 
  // mostramos el modal
  const isAnonymousAndNotAllowed = user.isAnonymous && !allowedRoutesForAnonymous.includes(location.pathname);
  
  const [showModal, setShowModal] = useState(isAnonymousAndNotAllowed);
  
  // Si el usuario ya no es anónimo o accede a una ruta permitida, renderizamos el contenido
  if (!user.isAnonymous || allowedRoutesForAnonymous.includes(location.pathname)) {
    return children;
  }
  
  // Funciones del modal:
  const handleContinue = () => {
    // Redirige a login (o registro) para que el usuario se identifique
    navigate('/login', { state: { from: location }});
  };

  const handleCancel = () => {
    // Redirige al home
    navigate('/home');
  };

  return (
    <>
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '10px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <p>Esta acción requiere ingresar con una cuenta</p>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-around' }}>
              <button
                onClick={handleContinue}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#8a2be2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Continuar
              </button>
              <button
                onClick={handleCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Solo llega aquí si el usuario ya no es anónimo; de lo contrario se quedará en el modal */}
      {!showModal && children}
    </>
  );
};

export default PrivateRoute;
