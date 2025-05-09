import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import Layout from '../components/Layout';
import { useAuth } from '../context/useAuth';
import FollowButton from '../components/FollowButton';
import defaultAvatar from '../assets/default-avatar.png';

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
  const [proyectos, setProyectos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);

  // Obtén la lista de IDs de los usuarios a los que sigues
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user) {
        console.log('No hay usuario autenticado');
        return;
      }
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const followingData = docSnap.data().following || [];
          console.log('Following array:', followingData);
          setFollowing(followingData);
        } else {
          console.log('No se encontró el documento del usuario');
        }
      } catch (error) {
        console.error('Error al obtener el following:', error);
      }
    };
    fetchFollowing();
  }, [user]);

  // Consulta los proyectos de los usuarios a los que sigues
  useEffect(() => {
    if (!following.length) {
      console.log('No hay uids en following, limpiando proyectos');
      setProyectos([]);
      return;
    }
    const qProyectos = query(
      collection(db, 'proyectos'),
      where('autorId', 'in', following)
    );
    console.log('Ejecutando query para proyectos con following:', following);
    const unsubscribeProyectos = onSnapshot(qProyectos, (snapshot) => {
      const proyectosData = [];
      snapshot.forEach((doc) => {
        proyectosData.push({ id: doc.id, ...doc.data(), tipo: 'proyecto' });
      });
      console.log('Proyectos recibidos:', proyectosData);
      setProyectos(proyectosData);
    });
    return () => unsubscribeProyectos();
  }, [following]);

  // Consulta los eventos de los usuarios a los que sigues
  useEffect(() => {
    if (!following.length) {
      console.log('No hay uids en following, limpiando eventos');
      setEventos([]);
      return;
    }
    const qEventos = query(
      collection(db, 'eventos'),
      where('autorId', 'in', following)
    );
    console.log('Ejecutando query para eventos con following:', following);
    const unsubscribeEventos = onSnapshot(qEventos, (snapshot) => {
      const eventosData = [];
      snapshot.forEach((doc) => {
        eventosData.push({ id: doc.id, ...doc.data(), tipo: 'evento' });
      });
      console.log('Eventos recibidos:', eventosData);
      setEventos(eventosData);
    });
    return () => unsubscribeEventos();
  }, [following]);

  // Combina ambos tipos de publicaciones y ordénalos (suponiendo que ambos tengan "fechaCreacion")
  useEffect(() => {
    const allPosts = [...proyectos, ...eventos];
    allPosts.sort((a, b) => {
      if (a.fechaCreacion && b.fechaCreacion && a.fechaCreacion.seconds && b.fechaCreacion.seconds) {
        return b.fechaCreacion.seconds - a.fechaCreacion.seconds;
      }
      return 0;
    });
    console.log('Publicaciones combinadas:', allPosts);
    setPosts(allPosts);
  }, [proyectos, eventos]);

  return (
    <Layout>
      <h2 className="section-title" style={{ textAlign: 'center', margin: '1rem 0' }}>
        Publicaciones de Amigos
      </h2>
      {posts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No hay publicaciones de tus amigos.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="post-card bg-white shadow-md rounded-2xl p-5 mb-6"
            style={{ maxWidth: '568px', marginInline: 'auto' }}
          >
            <div className="post-header flex items-center mb-4">
              <img 
                src={post.autorFoto || defaultAvatar} 
                alt="Avatar" 
                style={{ width: '40px', height: '40px' }} 
                className="rounded-full object-cover"
              />
              <div className="ml-3 flex items-center">
                <h4 className="font-bold text-lg text-gray-800" style={{ margin: 0 }}>
                  {post.autorNombre || 'Sin nombre'}
                </h4>
                {post.autorId !== user.uid && (
                  <div className="ml-2">
                    <FollowButton targetUid={post.autorId} />
                  </div>
                )}
              </div>
            </div>
            <div
              className="post-content text-gray-700 space-y-2"
              style={{ textAlign: 'left', fontSize: '0.9rem' }}
            >
              {post.tipo === 'proyecto' && (
                <>
                <p>
                    <strong>Nombre:</strong> {post.nombre || 'Sin Nombre'}
                  </p>
                  <p>
                    <strong>Descripción:</strong> {post.descripcion || 'Sin descripción'}
                  </p>
                  <p>
                    <strong>Características:</strong> {post.caracteristicas || 'No especificadas'}
                  </p>
                  <p>
                    <strong>Herramientas:</strong> {post.herramientas || 'No especificadas'}
                  </p>
                  <p>
                    <strong>Fecha de Inicio:</strong> {post.fechaInicio ? formatDate(post.fechaInicio) : 'No especificada'}
                  </p>
                  <p>
                    <strong>Fecha de Fin:</strong> {post.fechaFin ? formatDate(post.fechaFin) : 'No especificada'}
                  </p>
                </>
              )}
              {post.tipo === 'evento' && (
                <>
                <p>
                    <strong>Nombre:</strong> {post.nombre || 'No especificada'}
                  </p>
                  <p>
                    <strong>Descripción:</strong> {post.descripcion || 'No especificada'}
                  </p>
                  <p>
                    <strong>Ciudad:</strong> {post.ciudad || 'No especificada'}
                  </p>
                  <p>
                    <strong>País:</strong> {post.pais || 'No especificado'}
                  </p>
                  <p>
                    <strong>Dirección:</strong> {post.direccion || 'No especificada'}
                  </p>
                  <p>
                    <strong>Propósito:</strong> {post.proposito || 'No especificado'}
                  </p>
                  <p>
                    <strong>Fecha del Evento:</strong> {post.fechaEvento ? formatDate(post.fechaEvento) : 'No especificada'}
                  </p>
                  <p>
                    <strong>Hora del Evento:</strong> {post.horaEvento || 'No especificada'}
                  </p>
                </>
              )}
            </div>
            {/* Aquí puedes agregar botones o acciones adicionales */}
          </div>
        ))
      )}
    </Layout>
  );
};

export default Amigos;