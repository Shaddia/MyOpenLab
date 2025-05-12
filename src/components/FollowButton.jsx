import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaUserPlus, FaUserCheck } from 'react-icons/fa';

const FollowButton = ({ targetUid }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Al montar, consulta si el usuario ya te sigue
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const userDocRef = doc(db, 'users', targetUid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const currentFollowers = userData.followers || [];
          setIsFollowing(currentFollowers.includes(user.uid));
        }
      } catch (error) {
        console.error('Error al verificar seguimiento:', error);
      }
    };
    checkFollowStatus();
  }, [targetUid, user.uid]);

  const handleFollowAction = async () => {
    try {
      const userDocRef = doc(db, 'users', targetUid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, { followers: [user.uid] }, { merge: true });
        setIsFollowing(true);
        return;
      }
      const userData = userDocSnap.data();
      const currentFollowers = userData.followers || [];
      const alreadyFollowing = currentFollowers.includes(user.uid);
      const updatedFollowers = alreadyFollowing
        ? currentFollowers.filter(uid => uid !== user.uid)
        : [...currentFollowers, user.uid];

      await updateDoc(userDocRef, { followers: updatedFollowers });
      setIsFollowing(!alreadyFollowing);
    } catch (err) {
      console.error('Error al seguir/desseguir al usuario:', err);
    }
  };

  const handleClick = () => {
    if (user.isAnonymous) {
      setShowModal(true);
    } else {
      handleFollowAction();
    }
  };

  const handleContinue = () => {
    navigate('/login?register=true');
  };

  const handleCancel = () => {
    setShowModal(false);
    navigate('/home');
  };

  return (
    <>
      <button 
        onClick={handleClick} 
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer', 
          display: 'flex',
          alignItems: 'center'
        }}>
        {isFollowing 
          ? <FaUserCheck style={{ marginRight: '6px' }} className="followIcon" /> 
          : <FaUserPlus style={{ marginRight: '6px' }} className="followIcon" />
        }
        <span className="followIcon">
          {isFollowing ? "Siguiendo" : "Seguir"}
        </span>
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%'
          }}>
            <p>Esta acción requiere ingresar con una cuenta</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem' }}>
              <button
                onClick={handleCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ccc',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FollowButton;