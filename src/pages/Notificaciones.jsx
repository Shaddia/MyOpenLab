import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import Layout from '../components/Layout';
import { useAuth } from '../context/useAuth';

// Función para formatear fecha
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notificaciones'),
      where('to', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notis = [];
      snapshot.forEach((doc) => {
        notis.push({ id: doc.id, ...doc.data() });
      });
      setNotificaciones(notis);
      const count = notis.filter(n => !n.read).length;
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <Layout>
            <div className="top-bar">
                <h2 className="section-title">NOTIFICACIONES</h2>
                <div className="underline" />
            </div> 

        {notificaciones.length === 0 ? (
          <p>No tienes nuevas notificaciones.</p>
        ) : (
          notificaciones.map((notif) => (
            <div key={notif.id} className="notification-item border-b py-2">
              {notif.type === 'follow' && (
                <p>
                  <strong>{notif.fromName}</strong> te ha seguido. 
                  <small className="text-gray-500 ml-2">{formatDate(notif.createdAt)}</small>
                </p>
              )}
              {notif.type === 'post' && (
                <p>
                  <strong>{notif.fromName}</strong> ha publicado un nuevo post. 
                  <small className="text-gray-500 ml-2">{formatDate(notif.createdAt)}</small>
                </p>
              )}
            </div>
          ))
        )}
      
    </Layout>
  );
};

export default Notificaciones;