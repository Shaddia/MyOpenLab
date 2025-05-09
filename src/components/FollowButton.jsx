import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const FollowButton = ({ targetUid }) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkFollowing = async () => {
      if (!user) return;
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const following = userDocSnap.data().following || [];
        setIsFollowing(following.includes(targetUid));
      }
    };
    checkFollowing();
  }, [user, targetUid]);

  const handleFollow = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      if (!isFollowing) {
        await updateDoc(userDocRef, {
          following: arrayUnion(targetUid)
        });
        setIsFollowing(true);
      } else {
        await updateDoc(userDocRef, {
          following: arrayRemove(targetUid)
        });
        setIsFollowing(false);
      }
    } catch (err) {
      console.error("Error al seguir/desseguir al usuario:", err);
    }
  };

  return (
    <button
      onClick={handleFollow}
      style={{
        padding: '4px 8px',
        fontSize: '0.7rem',
        color: isFollowing ? '#4d5656' : 'white',
        backgroundColor: isFollowing ? '#ccc' : '#8a2be2',
        borderRadius: '99px',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      {isFollowing ? 'Siguiendo' : 'Seguir'}
    </button>
  );
};

export default FollowButton;