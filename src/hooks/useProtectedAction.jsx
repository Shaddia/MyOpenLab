import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const useProtectedAction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState(() => () => {});

  const requireAuth = (action) => {
    if (user && user.isAnonymous) {
      // Usuario anónimo: mostrar pop-up
      setShowModal(true);
      setPendingCallback(() => action);
    } else {
      // Si ya está registrado, se ejecuta la acción
      action();
    }
  };

  const handleContinue = () => {
    // Redirige a login para que se identifique
    navigate('/login', { state: { from: location }});
  };

  const handleCancel = () => {
    // Cierra el modal y no ejecuta la acción
    setShowModal(false);
    setPendingCallback(() => () => {});
  };

  const ProtectedActionModal = () => {
    if (!showModal) return null;
    return (
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
    );
  };

  return { requireAuth, ProtectedActionModal };
};

export default useProtectedAction;