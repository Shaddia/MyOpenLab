import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import Layout from '../components/Layout';
import { useAuth } from '../context/useAuth';
import FollowButton from '../components/FollowButton';

// Función para formatear la fecha (ajústala según lo necesites)
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

const Amigos = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);

  // Obtén la lista de ids que el usuario sigue
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user) return;
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const followingData = docSnap.data().following || [];
        console.log('Following array:', followingData);
        setFollowing(followingData);
      }
    };
    fetchFollowing();
  }, [user]);

  // Consulta los posts de los usuarios a los que se sigue
  useEffect(() => {
    if (!following || following.length === 0) {
      setPosts([]);
      return;
    }
    // Nota: Firestore permite "in" queries hasta 10 elementos.
    const q = query(
      collection(db, 'posts'),
      where('autorId', 'in', following)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = [];
      snapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, [following]);

  return (
    <Layout>
      <h2 style={{ textAlign: 'center', margin: '1rem 0' }}>
        Publicaciones de Amigos
      </h2>
      {posts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>
          No hay publicaciones de tus amigos.
        </p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              margin: '1rem auto',
              maxWidth: '600px',
              border: '1px solid #ccc',
              padding: '1rem',
              borderRadius: '8px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}
            >
              <strong>{post.nombre || 'Sin nombre'}</strong>
              {post.autorId !== user.uid && (
                <div style={{ marginLeft: '10px' }}>
                  <FollowButton targetUid={post.autorId} />
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#555' }}>
              {formatDate(post.fechaCreacion)}
            </p>
            <p>{post.descripcion || 'Sin descripción'}</p>
          </div>
        ))
      )}
    </Layout>
  );
};

export default Amigos;