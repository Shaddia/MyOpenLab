import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Layout from '../components/Layout';
import { useAuth } from '../context/useAuth';
import { FaUserPlus, FaHeart, FaStar } from 'react-icons/fa';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

const Notificaciones = () => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notificaciones'),
      where('to', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notis = [];
      snapshot.forEach((docSnap) => {
        notis.push({ id: docSnap.id, ...docSnap.data() });
      });
      console.log("Notificaciones recibidas:", notis);
      setNotificaciones(notis);
    });
    return () => unsubscribe();
  }, [user]);

  // Efecto para marcar como leídas las notificaciones mostradas
  useEffect(() => {
    if (notificaciones.length > 0) {
      notificaciones.forEach((notif) => {
        if (!notif.read) {
          updateDoc(doc(db, 'notificaciones', notif.id), { read: true })
            .catch(console.error);
        }
      });
    }
  }, [notificaciones]);

  return (
    <Layout>
      <div className="top-bar">
        <h2 className="section-title">NOTIFICACIONES</h2>
        <div className="underline" />
      </div> 
      {notificaciones.length === 0 ? (
        <p>No tienes nuevas notificaciones.</p>
      ) : (
        notificaciones.map((notif) => {
          let icon;
          if (notif.type === 'follow') {
            icon = <FaUserPlus style={{ marginRight: '1rem', color: '#7e22ce' }} />;
          } else if (notif.type === 'like') { 
            icon = <FaHeart style={{ marginRight: '1rem', color: '#ff0000' }} />;
          } else if (notif.type === 'favorite') {
            icon = <FaStar style={{ marginRight: '1rem', color: '#f39c12' }} />;
          } else if (notif.type === 'post') {
            icon = <FaStar style={{ marginRight: '1rem', color: '#7e22ce' }} />;
          }

          return (
            <div 
              key={notif.id} 
              className="notification-container" style={{
                backgroundColor: '#f3e8ff',
                border: '1px solid #7e22ce',
                borderRadius: '11px',
                padding: '0.25rem',
                marginBottom: '0.30rem',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {icon}
              <div style={{ flex: 1 }}>
                {notif.type === 'follow' && (
                  <p style={{ margin: 0 }}>
                    <strong>{notif.fromName}</strong> te ha seguido.
                    <br />
                    <small style={{ color: '#666' }}>{formatDate(notif.createdAt)}</small>
                  </p>
                )}
                {notif.type === 'like' && (
                  <p style={{ margin: 0 }}>
                    <strong>{notif.fromName}</strong> le dio me gusta a tu post <strong>{notif.postName}</strong>.
                    <br />
                    <small style={{ color: '#666' }}>{formatDate(notif.createdAt)}</small>
                  </p>
                )}
                {notif.type === 'favorite' && (
                  <p style={{ margin: 0 }}>
                    <strong>{notif.fromName}</strong> ha añadido a sus favoritos tu post <strong>{notif.postName}</strong>.
                    <br />
                    <small style={{ color: '#666' }}>{formatDate(notif.createdAt)}</small>
                  </p>
                )}
                {notif.type === 'post' && (
                  <p style={{ margin: 0 }}>
                    <strong>{notif.fromName}</strong> ha publicado un nuevo post.
                    <br />
                    <small style={{ color: '#666' }}>{formatDate(notif.createdAt)}</small>
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </Layout>
  );
};

export default Notificaciones;