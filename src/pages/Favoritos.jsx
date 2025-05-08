import React, { useEffect, useState } from 'react';
import '../styles/home.css'; // Asegúrate de que ambos archivos CSS sean compatibles
import defaultAvatar from '../assets/default-avatar.png'; // Ajusta la ruta si es distinta

import { useAuth } from '../context/useAuth';
import { db } from '../services/firebase';
import {
    collection,
    query,
    onSnapshot,
    getDoc,
    doc,
    updateDoc
} from 'firebase/firestore';
import Layout from '../components/Layout';
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from 'react-icons/fa';

const Favoritos = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [usersData, setUsersData] = useState({});

    useEffect(() => {
      const qProyectos = query(collection(db, 'proyectos'));
      const qEventos = query(collection(db, 'eventos'));
  
      const unsubscribeProyectos = onSnapshot(qProyectos, async (snapshotProyectos) => {
          const proyectos = snapshotProyectos.docs
              .map((doc) => ({ id: doc.id, tipo: 'proyecto', ...doc.data() }))
              .filter((project) => project.favorites?.includes(user.uid));
  
          const newUsersData = { ...usersData };
          for (const project of proyectos) {
              if (!newUsersData[project.autorId]) {
                  const userDoc = await getDoc(doc(db, 'users', project.autorId));
                  if (userDoc.exists()) {
                      newUsersData[project.autorId] = userDoc.data();
                  }
              }
          }
          setUsersData(newUsersData);
          setProjects((prev) => [...prev.filter(p => p.tipo !== 'proyecto'), ...proyectos]);
      });
  
      const unsubscribeEventos = onSnapshot(qEventos, async (snapshotEventos) => {
          const eventos = snapshotEventos.docs
              .map((doc) => ({ id: doc.id, tipo: 'evento', ...doc.data() }))
              .filter((evento) => evento.favorites?.includes(user.uid));
  
          const newUsersData = { ...usersData };
          for (const evento of eventos) {
              if (!newUsersData[evento.autorId]) {
                  const userDoc = await getDoc(doc(db, 'users', evento.autorId));
                  if (userDoc.exists()) {
                      newUsersData[evento.autorId] = userDoc.data();
                  }
              }
          }
          setUsersData(newUsersData);
          setProjects((prev) => [...prev.filter(p => p.tipo !== 'evento'), ...eventos]);
      });
  
      return () => {
          unsubscribeProyectos();
          unsubscribeEventos();
      };
  }, [user.uid]);
  

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const toggleReaction = async (id, type) => {
        const projectRef = doc(db, 'proyectos', id);
        const projectSnap = await getDoc(projectRef);
        const projectData = projectSnap.data();

        const field = type === 'like' ? 'likes' : 'favorites';
        const arr = projectData[field] || [];

        const updatedArr = arr.includes(user.uid)
            ? arr.filter((uid) => uid !== user.uid)
            : [...arr, user.uid];

        await updateDoc(projectRef, { [field]: updatedArr });
    };

    return (
        <Layout>
            <div className="top-bar">
                <h2 className="section-title">Favoritos</h2>
                <div className="underline" />
            </div>

            <div className="posts">
                <h3>Publicaciones Favoritas</h3>
                {projects.length === 0 && <p>No tienes proyectos o eventos favoritos aún.</p>}
                {projects.map((project) => {
                    const userInfo = usersData[project.autorId] || {};
                    const userPhoto = userInfo.photoURL || defaultAvatar;
                    const userName = userInfo.name || project.autorNombre || 'Usuario';

                    const liked = project.likes?.includes(user.uid);
                    const favorited = project.favorites?.includes(user.uid);

                    return (
                        <div
                            key={project.id}
                            className="post-card bg-white shadow-md rounded-2xl p-5 mb-6"
                            style={{ maxWidth: '568px', marginInline: 'auto' }}
                        >
                            <div className="post-header flex items-center mb-4">
                                <div className="author-photo mr-4" style={{ width: '60px', height: '60px' }}>
                                    <img
                                        src={userPhoto}
                                        alt="Avatar"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '50%',
                                            border: '2px solid #ddd',
                                        }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                    />
                                </div>
                                <div className="author-details">
                                    <h4 className="font-bold text-lg text-gray-800">{userName}</h4>
                                    <p className="post-date text-sm text-gray-500">{formatDate(project.fechaCreacion)}</p>
                                </div>
                            </div>

                            <div className="post-content text-gray-700 space-y-2">
                                <p>
                                    <strong className="text-gray-900">{project.tipo === 'evento' ? 'Evento' : 'Proyecto'}:</strong> {project.nombre}
                                </p>
                                {project.descripcion && (
                                    <p><strong>Descripción:</strong> {project.descripcion}</p>
                                )}
                                {project.caracteristicas && (
                                    <p><strong>Características:</strong> {project.caracteristicas}</p>
                                )}
                                {project.herramientas && (
                                    <p><strong>Herramientas:</strong> {project.herramientas}</p>
                                )}
                                {project.archivoUrl && (
                                    <div className="mt-2">
                                        {project.archivoUrl.includes('video') ? (
                                            <video controls style={{ maxWidth: '100%', borderRadius: '12px' }}>
                                                <source src={project.archivoUrl} />
                                                Tu navegador no soporta la etiqueta de video.
                                            </video>
                                        ) : (
                                            <img src={project.archivoUrl} alt="Archivo" style={{ maxWidth: '100%', borderRadius: '12px' }} />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="post-action-bar flex justify-between items-center">
                                {/* Botones de Me Gusta y Favorito alineados a la derecha */}
                                <div className="like-fav-buttons flex gap-4 items-center">
                                    <button
                                        className={`btn-like ${liked ? 'active' : ''}`}
                                        onClick={() => toggleReaction(project.id, 'like')}
                                    >
                                        {liked ? <FaHeart /> : <FaRegHeart />}
                                        <span>{project.likes?.length || 0}</span>
                                    </button>
                                    <button
                                        className={`btn-fav ${favorited ? 'active' : ''}`}
                                        onClick={() => toggleReaction(project.id, 'favorite')}
                                    >
                                        {favorited ? <FaStar /> : <FaRegStar />}
                                        <span>{project.favorites?.length || 0}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Layout>
    );
};

export default Favoritos;