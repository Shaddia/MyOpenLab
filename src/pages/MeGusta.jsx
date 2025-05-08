import React, { useEffect, useState } from 'react';
import '../styles/home.css';
import defaultAvatar from '../assets/default-avatar.png';

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

const MeGusta = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [usersData, setUsersData] = useState({});

    useEffect(() => {
        const qProyectos = query(collection(db, 'proyectos'));
        const qEventos = query(collection(db, 'eventos'));

        const unsubscribeProyectos = onSnapshot(qProyectos, async (snapshotProyectos) => {
            const likedProjects = snapshotProyectos.docs
                .map((doc) => ({ id: doc.id, tipo: 'proyecto', ...doc.data() }))
                .filter((project) => project.likes?.includes(user.uid));

            const unsubscribeEventos = onSnapshot(qEventos, async (snapshotEventos) => {
                const likedEventos = snapshotEventos.docs
                    .map((doc) => ({ id: doc.id, tipo: 'evento', ...doc.data() }))
                    .filter((event) => event.likes?.includes(user.uid));

                const combined = [...likedProjects, ...likedEventos];
                setProjects(combined);

                const newUsersData = { ...usersData };
                for (const item of combined) {
                    if (!newUsersData[item.autorId]) {
                        const userDoc = await getDoc(doc(db, 'users', item.autorId));
                        if (userDoc.exists()) {
                            newUsersData[item.autorId] = userDoc.data();
                        }
                    }
                }
                setUsersData(newUsersData);
            });

            return () => {
                unsubscribeEventos();
            };
        });

        return () => {
            unsubscribeProyectos();
        };
    }, [user.uid, usersData]);


    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        // Si el timestamp tiene toDate, usarlo
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            const date = timestamp.toDate();
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            // Sino, crear un objeto Date. Puede ser una cadena o número.
            const date = new Date(timestamp);
            return isNaN(date.getTime())
                ? ''
                : date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
        }
    };

    const toggleReaction = async (id, type, tipo) => {
        try {
          const collectionName = tipo === 'evento' ? 'eventos' : 'proyectos';
          const docRef = doc(db, collectionName, id);
          const docSnap = await getDoc(docRef);
      
          if (!docSnap.exists()) {
            console.error('Documento no encontrado:', id);
            return;
          }
      
          const data = docSnap.data();
          
          const field = type === 'like' ? 'likes' : 'favorites';
          const arr = data[field] || [];
          const updatedArr = arr.includes(user.uid)
            ? arr.filter((uid) => uid !== user.uid)
            : [...arr, user.uid];
      
          await updateDoc(docRef, { [field]: updatedArr });
        } catch (error) {
          console.error('Error toggling reaction:', error);
        }
      };

    return (
        <Layout>
            <div className="top-bar">
                <h2 className="section-title">Me Gusta</h2>
                <div className="underline" />
            </div>

            <div className="posts">
                <h3>Publicaciones que te gustan</h3>
                {projects.length === 0 && <p>No has dado "Me Gusta" a ningún proyecto o evento aún.</p>}
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
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                        }}
                    />
                </div>
                <div className="author-details">
                    <h4 className="font-bold text-lg text-gray-800">{userName}</h4>
                    <p className="post-date text-sm text-gray-500">{formatDate(project.fechaCreacion)}</p>
                </div>
            </div>

            <div
                className="post-content text-gray-700 space-y-2"
                style={{ textAlign: 'left', fontSize: '0.9rem' }}
            >
                <p>
                    <strong className="text-gray-900">
                        {project.tipo === 'evento' ? 'Evento' : 'Proyecto'}:
                    </strong>{' '}
                    {project.nombre}
                </p>
                {project.descripcion && (
                    <p>
                        <strong>Descripción:</strong> {project.descripcion}
                    </p>
                )}
                {project.tipo === 'proyecto' && (
                    <>
                        {project.caracteristicas && (
                            <p>
                                <strong>Características:</strong> {project.caracteristicas}
                            </p>
                        )}
                        {project.herramientas && (
                            <p>
                                <strong>Herramientas:</strong> {project.herramientas}
                            </p>
                        )}
                        {project.fechaInicio && (
                            <p>
                                <strong>Fecha de Inicio:</strong> {formatDate(project.fechaInicio)}
                            </p>
                        )}
                        {project.fechaFin && (
                            <p>
                                <strong>Fecha de Fin:</strong> {formatDate(project.fechaFin)}
                            </p>
                        )}
                    </>
                )}
                {project.tipo === 'evento' && (
                    <>
                        {project.ciudad && (
                            <p>
                                <strong>Ciudad:</strong> {project.ciudad}
                            </p>
                        )}
                        {project.pais && (
                            <p>
                                <strong>País:</strong> {project.pais}
                            </p>
                        )}
                        {project.direccion && (
                            <p>
                                <strong>Dirección:</strong> {project.direccion}
                            </p>
                        )}
                        {project.proposito && (
                            <p>
                                <strong>Propósito:</strong> {project.proposito}
                            </p>
                        )}
                        {project.fechaEvento && (
                            <p>
                                <strong>Fecha del Evento:</strong> {formatDate(project.fechaEvento)}
                            </p>
                        )}
                        {project.horaEvento && (
                            <p>
                                <strong>Hora del Evento:</strong> {project.horaEvento}
                            </p>
                        )}
                    </>
                )}
                {project.archivoUrl && (
                    <div className="mt-2" style={{ textAlign: 'center' }}>
                        {project.archivoUrl.includes('video') ? (
                            <video
                                controls
                                style={{ maxWidth: '100%', borderRadius: '12px' }}
                            >
                                <source src={project.archivoUrl} />
                                Tu navegador no soporta la etiqueta de video.
                            </video>
                        ) : (
                            <img
                                src={project.archivoUrl}
                                alt="Archivo"
                                style={{ maxWidth: '100%', borderRadius: '12px' }}
                            />
                        )}
                    </div>
                )}
            </div>

            <div className="post-action-bar flex justify-between items-center">
                <div className="like-fav-buttons flex gap-4 items-center">
                    <button
                        className={`btn-like ${liked ? 'active' : ''}`}
                        onClick={() => toggleReaction(project.id, 'like', project.tipo)}
                    >
                        {liked ? <FaHeart /> : <FaRegHeart />}
                        <span>{project.likes?.length || 0}</span>
                    </button>
                    <button
                        className={`btn-fav ${favorited ? 'active' : ''}`}
                        onClick={() => toggleReaction(project.id, 'favorite', project.tipo)}
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

export default MeGusta;
