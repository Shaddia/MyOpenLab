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

const Eventos = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [usersData, setUsersData] = useState({});

    useEffect(() => {
        const qEventos = query(collection(db, 'eventos'));

        const unsubscribeEventos = onSnapshot(qEventos, async (snapshotEventos) => {
            const eventos = snapshotEventos.docs.map((doc) => ({
                id: doc.id,
                tipo: 'evento',
                ...doc.data()
            }));

            setEvents(eventos);

            const newUsersData = { ...usersData };
            for (const event of eventos) {
                if (!newUsersData[event.autorId]) {
                    const userDoc = await getDoc(doc(db, 'users', event.autorId));
                    if (userDoc.exists()) {
                        newUsersData[event.autorId] = userDoc.data();
                    }
                }
            }
            setUsersData(newUsersData);
        });

        return () => unsubscribeEventos();
    }, [usersData]);

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
    const eventRef = doc(db, 'eventos', id);
    const eventSnap = await getDoc(eventRef);
    const eventData = eventSnap.data();

    const field = type === 'like' ? 'likes' : 'favorites';
    const arr = eventData[field] || [];

    const updatedArr = arr.includes(user.uid)
        ? arr.filter((uid) => uid !== user.uid)
        : [...arr, user.uid];

    await updateDoc(eventRef, { [field]: updatedArr });

    // Actualizar el estado local manualmente
    setEvents((prevEvents) =>
        prevEvents.map((event) =>
            event.id === id
                ? {
                    ...event,
                    [field]: updatedArr
                }
                : event
        )
    );
};


    return (
        <Layout>
            <div className="top-bar">
                <h2 className="section-title">Eventos</h2>
                <div className="underline" />
            </div>

            <div className="posts">
                <h3>Todos los eventos</h3>
                {events.length === 0 && <p>No hay eventos disponibles aún.</p>}
                {events.map((event) => {
                    const userInfo = usersData[event.autorId] || {};
                    const userPhoto = userInfo.photoURL || defaultAvatar;
                    const userName = userInfo.name || event.autorNombre || 'Usuario';

                    const liked = event.likes?.includes(user.uid);
                    const favorited = event.favorites?.includes(user.uid);

                    return (
                        <div
                            key={event.id}
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
                                    <p className="post-date text-sm text-gray-500">{formatDate(event.fechaCreacion)}</p>
                                </div>
                            </div>

                            <div className="post-content text-gray-700 space-y-2">
                                <p>
                                    <strong className="text-gray-900">Evento:</strong> {event.nombre}
                                </p>
                                {event.descripcion && (
                                    <p><strong>Descripción:</strong> {event.descripcion}</p>
                                )}
                                {event.caracteristicas && (
                                    <p><strong>Características:</strong> {event.caracteristicas}</p>
                                )}
                                {event.herramientas && (
                                    <p><strong>Herramientas:</strong> {event.herramientas}</p>
                                )}
                                {event.archivoUrl && (
                                    <div className="mt-2">
                                        {event.archivoUrl.includes('video') ? (
                                            <video controls style={{ maxWidth: '100%', borderRadius: '12px' }}>
                                                <source src={event.archivoUrl} />
                                                Tu navegador no soporta la etiqueta de video.
                                            </video>
                                        ) : (
                                            <img src={event.archivoUrl} alt="Archivo" style={{ maxWidth: '100%', borderRadius: '12px' }} />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="post-action-bar flex justify-between items-center">
                                <div className="like-fav-buttons flex gap-4 items-center">
                                    <button
                                        className={`btn-like ${liked ? 'active' : ''}`}
                                        onClick={() => toggleReaction(event.id, 'like')}
                                    >
                                        {liked ? <FaHeart /> : <FaRegHeart />}
                                        <span>{event.likes?.length || 0}</span>
                                    </button>
                                    <button
                                        className={`btn-fav ${favorited ? 'active' : ''}`}
                                        onClick={() => toggleReaction(event.id, 'favorite')}
                                    >
                                        {favorited ? <FaStar /> : <FaRegStar />}
                                        <span>{event.favorites?.length || 0}</span>
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

export default Eventos;
