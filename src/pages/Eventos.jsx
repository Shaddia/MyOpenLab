import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    updateDoc,
    deleteDoc
} from 'firebase/firestore';

import Layout from '../components/Layout';
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from 'react-icons/fa';

const Eventos = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [usersData, setUsersData] = useState({});

    // Estado para el formulario de edición de evento
    const [editingEvent, setEditingEvent] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // Estado para el popup de confirmación al eliminar
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deleteEventId, setDeleteEventId] = useState(null);

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
        if (typeof timestamp === 'object' && typeof timestamp.toDate === 'function') {
          const date = timestamp.toDate();
          return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
        return timestamp;
    };

    const toggleReaction = async (id, type) => {
        if (user.isAnonymous) {
            navigate('/login?register=true');
            return;
        }
        const eventRef = doc(db, 'eventos', id);
        const eventSnap = await getDoc(eventRef);
        const eventData = eventSnap.data();

        const field = type === 'like' ? 'likes' : 'favorites';
        const arr = eventData[field] || [];

        const updatedArr = arr.includes(user.uid)
            ? arr.filter((uid) => uid !== user.uid)
            : [...arr, user.uid];

        await updateDoc(eventRef, { [field]: updatedArr });

        setEvents((prevEvents) =>
            prevEvents.map((event) =>
                event.id === id ? { ...event, [field]: updatedArr } : event
            )
        );
    };

    // Funciones para editar evento
    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setEditFormData({ ...event });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        try {
            const eventRef = doc(db, 'eventos', editingEvent.id);
            await updateDoc(eventRef, { ...editFormData });
            setEditingEvent(null);
        } catch (err) {
            console.error("Error al actualizar el evento:", err);
        }
    };

    const handleCancelEdit = () => {
        setEditingEvent(null);
    };

    // Funciones para eliminar evento con popup de confirmación
    const handleDeleteEvent = (id) => {
        setDeleteEventId(id);
        setShowDeletePopup(true);
    };

    const confirmDeleteEvent = async () => {
        try {
            await deleteDoc(doc(db, 'eventos', deleteEventId));
            setShowDeletePopup(false);
            setDeleteEventId(null);
        } catch (error) {
            console.error("Error al eliminar el evento:", error);
        }
    };

    const cancelDeleteEvent = () => {
        setShowDeletePopup(false);
        setDeleteEventId(null);
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
                                            border: '2px solid #ddd'
                                        }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                    />
                                </div>
                                <div className="author-details">
                                    <h4 className="font-bold text-lg text-gray-800">{userName}</h4>
                                    <p className="post-date text-sm text-gray-500" style={{ fontSize: '0.7rem' }}>
                                        {formatDate(event.fechaCreacion)}
                                    </p>
                                </div>
                            </div>

                            <div className="post-content text-gray-700 space-y-2" style={{ textAlign: 'left', fontSize: '0.9rem' }}>
                                <p><strong className="text-gray-900">Evento:</strong> {event.nombre || 'Sin nombre'}</p>
                                {event.descripcion && <p><strong>Descripción:</strong> {event.descripcion}</p>}
                                {event.caracteristicas && <p><strong>Características:</strong> {event.caracteristicas}</p>}
                                {event.herramientas && <p><strong>Herramientas:</strong> {event.herramientas}</p>}
                                {event.ciudad && <p><strong>Ciudad:</strong> {event.ciudad}</p>}
                                {event.fechaEvento && <p><strong>Fecha de Evento:</strong> {formatDate(event.fechaEvento)}</p>}
                                {event.horaEvento && <p><strong>Hora de Evento:</strong> {event.horaEvento}</p>}
                                {event.pais && <p><strong>País:</strong> {event.pais}</p>}
                                {event.direccion && <p><strong>Dirección:</strong> {event.direccion}</p>}
                                {event.proposito && <p><strong>Propósito:</strong> {event.proposito}</p>}
                                {event.archivoUrl && (
                                    <div className="mt-2" style={{ textAlign: 'center' }}>
                                        {event.archivoUrl.includes('video') ? (
                                            <video controls style={{ maxWidth: '100%', borderRadius: '12px', margin: '0 auto' }}>
                                                <source src={event.archivoUrl} />
                                                Tu navegador no soporta la etiqueta de video.
                                            </video>
                                        ) : (
                                            <img src={event.archivoUrl} alt="Archivo" style={{ maxWidth: '100%', borderRadius: '12px', margin: '0 auto' }} />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="post-action-bar flex justify-between items-center">
                                {/* Botones Editar y Eliminar en la esquina izquierda */}
                                {event.autorId === user.uid && (
                                    <div 
                                        className="edit-delete-buttons" 
                                        style={{ 
                                            display: 'flex', 
                                            gap: '1rem' 
                                        }}
                                    >
                                        <button 
                                            onClick={() => handleEditEvent(event)} 
                                            style={{
                                                border: '1px solid #8a2be2',
                                                color: '#8a2be2',
                                                backgroundColor: 'transparent',
                                                borderRadius: '999px',
                                                padding: '0.5rem 1rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteEvent(event.id)} 
                                            style={{
                                                border: '1px solid #e74c3c',
                                                color: '#e74c3c',
                                                backgroundColor: 'transparent',
                                                borderRadius: '999px',
                                                padding: '0.5rem 1rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                )}

                                {/* Botones Like y Favorito en la esquina derecha */}
                                 <div className="post-action-bar flex justify-between items-center"  style={{ borderTop: 'none', paddingTop: 0, marginTop: '-5px' }}>
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
                        </div>
                    );
                })}
            </div>

            {/* Modal para editar evento */}
            {editingEvent && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '2rem',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Editar Evento</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input name="nombre" placeholder="Nombre del evento" value={editFormData.nombre || ''} onChange={handleEditInputChange} required />
                            <input name="ciudad" placeholder="Ciudad" value={editFormData.ciudad || ''} onChange={handleEditInputChange} required />
                            <input name="pais" placeholder="País" value={editFormData.pais || ''} onChange={handleEditInputChange} required />
                            <input name="direccion" placeholder="Dirección del evento" value={editFormData.direccion || ''} onChange={handleEditInputChange} required />
                            <textarea name="descripcion" placeholder="Descripción" value={editFormData.descripcion || ''} onChange={handleEditInputChange} required />
                            <textarea name="proposito" placeholder="Propósito del evento (opcional)" value={editFormData.proposito || ''} onChange={handleEditInputChange} />
                            <label>Fecha del evento:</label>
                            <input type="date" name="fechaEvento" value={editFormData.fechaEvento || ''} onChange={handleEditInputChange} required />
                            <label>Hora del evento:</label>
                            <input type="time" name="horaEvento" value={editFormData.horaEvento || ''} onChange={handleEditInputChange} required />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={handleSaveEdit} style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#8a2be2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                                Guardar Cambios
                            </button>
                            <button onClick={handleCancelEdit} style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#ccc',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup de confirmación para eliminar evento */}
            {showDeletePopup && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '2rem',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h3 style={{ marginBottom: '1rem' }}>Confirmar eliminación</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Una vez eliminado no se podrá recuperar, ¿Estás seguro?
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                onClick={confirmDeleteEvent}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#8a2be2',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Sí, eliminar
                            </button>
                            <button
                                onClick={cancelDeleteEvent}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#ccc',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Eventos;
