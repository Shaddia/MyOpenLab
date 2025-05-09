import React, { useEffect, useState } from 'react';
import '../styles/home.css';
import defaultAvatar from '../assets/default-avatar.png'; // Ajusta la ruta si es distinta
import { createNotification } from '../services/notificaciones';
import { useAuth } from '../context/useAuth';
import { db } from '../services/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
    getDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Layout from '../components/Layout';
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import FollowButton from '../components/FollowButton';  // Asegúrate de importarlo

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);
    const [projects, setProjects] = useState([]);
    const [usersData, setUsersData] = useState({});
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [tipoPublicacion, setTipoPublicacion] = useState('');
    const [archivo, setArchivo] = useState(null);
    // Nuevo estado para almacenar la URL original del archivo
    const [originalArchivoUrl, setOriginalArchivoUrl] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        caracteristicas: '',
        herramientas: '',
        fechaInicio: '',
        fechaFin: '',
        ciudad: '',
        pais: '',
        direccion: '',
        proposito: ''
    });

    useEffect(() => {
        const qProyectos = query(collection(db, 'proyectos'), orderBy('fechaCreacion', 'desc'));

        const unsubscribeProyectos = onSnapshot(qProyectos, async (snapshotProyectos) => {
            const proyectos = snapshotProyectos.docs.map((doc) => ({ id: doc.id, tipo: 'proyecto', ...doc.data() }));
            setProjects(proyectos);

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
        });

        return () => {
            unsubscribeProyectos();
        };
    }, []);



    const handleOpenPopup = () => {
        if (user.isAnonymous) {
            // Redirige a la página de registro si el usuario es anónimo
            navigate('/login?register=true');
            return;
        }
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            caracteristicas: '',
            herramientas: '',
            fechaInicio: '',
            fechaFin: '',
            ciudad: '',
            pais: '',
            direccion: '',
            proposito: ''
        });
        setArchivo(null);
        setOriginalArchivoUrl(null); // Limpiar la URL original
        setShowPopup(false);
        setEditingProjectId(null);
        setTipoPublicacion('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleArchivoChange = (e) => {
        if (e.target.files[0]) {
            setArchivo(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        const {
            nombre,
            descripcion,
            caracteristicas,
            herramientas,
            fechaInicio,
            fechaFin,
            ciudad,
            pais,
            direccion,
            fechaEvento,
            horaEvento,
            proposito
        } = formData;

        if (!tipoPublicacion) {
            alert('Selecciona si es un proyecto o un evento.');
            return;
        }

        if (tipoPublicacion === 'proyecto') {
            if (!nombre || !descripcion || !caracteristicas || !herramientas || !fechaInicio || !fechaFin) {
                alert('Por favor completa todos los campos del proyecto.');
                return;
            }
        }

        if (tipoPublicacion === 'evento') {
            if (!nombre || !descripcion || !ciudad || !pais || !direccion || !fechaEvento || !horaEvento) {
                alert('Por favor completa todos los campos obligatorios del evento.');
                return;
            }
        }

        let archivoUrl = null;

        if (archivo) {
            const storage = getStorage(); // ¡Esto es importante!
            const archivoRef = ref(storage, `archivos/${Date.now()}_${archivo.name}`);
            try {
                await uploadBytes(archivoRef, archivo);
                archivoUrl = await getDownloadURL(archivoRef);
                console.log("Archivo subido correctamente:", archivoUrl);
            } catch (err) {
                console.error('Error al subir el archivo:', err);
                alert('Error al subir el archivo. Intenta nuevamente.');
                return;
            }
        } else if (editingProjectId) {
            // Conserva la URL original si no se selecciona un nuevo archivo al editar
            archivoUrl = originalArchivoUrl;
        }

        const data = {
            ...formData,
            archivoUrl: archivoUrl || null,
            autorId: user.uid,
            autorNombre: user.displayName,
            fechaCreacion: serverTimestamp(),
            likes: [],
            favorites: [],
        };

        try {
            if (tipoPublicacion === 'proyecto') {
                if (editingProjectId) {
                    await updateDoc(doc(db, 'proyectos', editingProjectId), data);
                    console.log("Proyecto actualizado");
                } else {
                    await addDoc(collection(db, 'proyectos'), data);
                    console.log("Proyecto creado");
                }
            } else if (tipoPublicacion === 'evento') {
                await addDoc(collection(db, 'eventos'), data);
                console.log("Evento creado");
            }

            handleClosePopup();
        } catch (err) {
            console.error('Error al guardar la publicación:', err);
            alert('Error al guardar. Intenta nuevamente.');
        }
    };


    const handleEdit = (project) => {
        setTipoPublicacion(project.tipo || 'proyecto');
        setFormData({
            nombre: project.nombre || '',
            descripcion: project.descripcion || '',
            caracteristicas: project.caracteristicas || '',
            herramientas: project.herramientas || '',
            fechaInicio: project.fechaInicio || '',
            fechaFin: project.fechaFin || '',
            ciudad: project.ciudad || '',
            pais: project.pais || '',
            direccion: project.direccion || '',
            proposito: project.proposito || ''
        });
        setEditingProjectId(project.id);
        // Al editar, guarda la URL original (si existe) para conservarla si no se selecciona un nuevo archivo
        setOriginalArchivoUrl(project.archivoUrl || null);
        setShowPopup(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeletePopup(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteDoc(doc(db, 'proyectos', deleteId));
            setShowDeletePopup(false);
            setDeleteId(null);
        } catch (err) {
            console.error('Error al eliminar la publicación:', err);
            alert('Error al eliminar. Intenta nuevamente.');
        }
    };

    const cancelDelete = () => {
        setShowDeletePopup(false);
        setDeleteId(null);
    };

   // Dentro de Home.jsx, reemplaza o modifica toggleReaction:
const toggleReaction = async (id, type, pubTipo) => {
    if (user.isAnonymous) {
        navigate('/login?register=true');
        return;
    }
    const collectionName = pubTipo === 'evento' ? 'eventos' : 'proyectos';
    const projectRef = doc(db, collectionName, id);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;
    const projectData = projectSnap.data();
    const field = type === 'like' ? 'likes' : 'favorites';
    const currentReactions = projectData[field] || [];
    const alreadyReacted = currentReactions.includes(user.uid);
    const updatedReactions = alreadyReacted
        ? currentReactions.filter(uid => uid !== user.uid)
        : [...currentReactions, user.uid];

    await updateDoc(projectRef, { [field]: updatedReactions });

    // Solo creamos la notificación si se añade la reacción y el autor no es quien reaccionó
    if (!alreadyReacted && projectData.autorId !== user.uid) {
        await createNotification({
            type: 'like',
            from: user.uid,
            fromName: user.displayName,
            to: projectData.autorId,
            // Usa projectData.nombre o un fallback (por ejemplo: 'tu publicación')
            postName: projectData.nombre || projectData.titulo || 'tu publicación'
        });
    }
};

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        if (typeof timestamp === 'object' && typeof timestamp.toDate === 'function') {
            const date = timestamp.toDate();
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } else {
            // Si ya es un string o Date, se intenta convertir a Date
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
    };

    const getFechaFin = (fechaFin) => {
        const hoy = new Date().toISOString().split('T')[0];
        return fechaFin > hoy ? 'Actualmente' : fechaFin;
    };

    return (
        <Layout>
            <div className="top-bar">
                <h2 className="section-title">Publicaciones</h2>
                <div className="underline" />
            </div>

            <div
                className="crear-publicacion-box"
                onClick={handleOpenPopup}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    border: '1px solid #b0b0b0',
                    borderRadius: '999px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    marginTop: '12px', // BAJAR UN POQUITO
                    maxWidth: '600px',
                    marginInline: 'auto'
                }}
            >
                <div style={{ width: '40px', height: '40px', marginRight: '12px' }}>
                    <img
                        src={
                            user?.photoURL ||
                            usersData[user?.uid]?.photoURL || // fallback desde Firestore
                            defaultAvatar
                        }
                        alt="Avatar"
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                    />


                </div>

                <span style={{ color: '#666' }}>Crear publicación</span>
            </div>




            {showPopup && (
                <div className="popup">
                    <div className="popup-inner">
                        <h3>{editingProjectId ? 'Editar Publicación' : 'Nueva Publicación'}</h3>

                        <div
                            className="popup-content-scrollable"
                            style={{
                                maxHeight: '60vh',
                                overflowY: 'auto',
                                paddingRight: '10px',
                                marginBottom: '1rem'
                            }}
                        >
                            <label>Selecciona el tipo de publicación:</label>
                            <select
                                value={tipoPublicacion}
                                onChange={(e) => {
                                    setTipoPublicacion(e.target.value);
                                    setFormData({}); // Limpiar campos al cambiar
                                }}
                            >
                                <option value="">Seleccionar opción</option>
                                <option value="evento">Evento</option>
                                <option value="proyecto">Proyecto</option>
                            </select>


                            {tipoPublicacion === 'proyecto' && (
                                <>
                                    <input name="nombre" placeholder="Nombre del proyecto" value={formData.nombre} onChange={handleInputChange} required />
                                    <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleInputChange} required />
                                    <textarea name="caracteristicas" placeholder="Características" value={formData.caracteristicas} onChange={handleInputChange} required />
                                    <input name="herramientas" placeholder="Herramientas de desarrollo" value={formData.herramientas} onChange={handleInputChange} required />
                                    <label>Fecha de inicio:</label>
                                    <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} required />
                                    <label>Fecha de finalización:</label>
                                    <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleInputChange} required />

                                    <label>Archivo multimedia (opcional):</label>
                                    <input type="file" accept="image/*,video/*" onChange={handleArchivoChange} />
                                </>
                            )}

                            {tipoPublicacion === 'evento' && (
                                <>
                                    <input name="nombre" placeholder="Nombre del evento" value={formData.nombre} onChange={handleInputChange} required />
                                    <input name="ciudad" placeholder="Ciudad" value={formData.ciudad} onChange={handleInputChange} required />
                                    <input name="pais" placeholder="País" value={formData.pais} onChange={handleInputChange} required />
                                    <input name="direccion" placeholder="Dirección del evento" value={formData.direccion} onChange={handleInputChange} required />
                                    <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleInputChange} required />
                                    <textarea name="proposito" placeholder="Propósito del evento (opcional)" value={formData.proposito} onChange={handleInputChange} />
                                    <label>Fecha del evento:</label>
                                    <input type="date" name="fechaEvento" value={formData.fechaEvento} onChange={handleInputChange} required />
                                    <label>Hora del evento:</label>
                                    <input type="time" name="horaEvento" value={formData.horaEvento} onChange={handleInputChange} required />

                                    <label>Archivo multimedia (opcional):</label>
                                    <input type="file" accept="image/*,video/*" onChange={handleArchivoChange} />
                                </>
                            )}
                        </div>

                        <div className="popup-actions">
                            <button onClick={handleSubmit} disabled={!tipoPublicacion}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#8a2be2', // Botón morado
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {editingProjectId ? 'Guardar Cambios' : 'Publicar'}
                            </button>
                            <button onClick={handleClosePopup} style={{ marginLeft: '1rem', backgroundColor: '#ccc' }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}



            <div className="posts">
                <h3>Publicaciones</h3>
                {projects.length === 0 && <p>No hay proyectos aún.</p>}
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
                            <div className="post-header flex items-start mb-4">
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
                                <div className="author-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="author-details flex flex-row items-center gap-2">
                                        <h4 className="font-bold text-lg text-gray-800" style={{ margin: 0, display: 'inline-block' }}>
                                            {userName}
                                        </h4>
                                        {project.autorId !== user.uid && (
                                            <FollowButton targetUid={project.autorId} />
                                        )}
                                    </div>
                                    <p className="post-date text-gray-500" style={{ fontSize: '0.7rem', margin: 0 }}>
                                        {formatDate(project.fechaCreacion)}
                                    </p>
                                </div>
                            </div>

                            <div
                                className="post-content text-gray-700 space-y-2"
                                style={{ textAlign: 'left', fontSize: '0.9rem' }}  // Alinea el texto a la izquierda
                            >
                                <p>
                                    <strong className="text-gray-900">
                                        {project.tipo === 'evento' ? 'Evento' : 'Proyecto'}:
                                    </strong>{' '}
                                    {project.nombre || 'Sin nombre'}
                                </p>
                                <p><strong>Descripción:</strong> {project.descripcion || 'Sin descripción'}</p>
                                <p><strong>Características:</strong> {project.caracteristicas || 'No especificadas'}</p>
                                <p><strong>Herramientas:</strong> {project.herramientas || 'No especificadas'}</p>
                                {project.tipo === 'proyecto' && (
                                    <>
                                        <p><strong>Fecha de Inicio:</strong> {formatDate(project.fechaInicio) || 'No especificada'}</p>
                                        <p><strong>Fecha de Fin:</strong> {formatDate(project.fechaFin) || 'No especificada'}</p>
                                    </>
                                )}
                                {project.tipo === 'evento' && (
                                    <>
                                        <p><strong>Ciudad:</strong> {project.ciudad || 'No especificada'}</p>
                                        <p><strong>País:</strong> {project.pais || 'No especificado'}</p>
                                        <p><strong>Dirección:</strong> {project.direccion || 'No especificada'}</p>
                                        <p><strong>Propósito:</strong> {project.proposito || 'No especificado'}</p>
                                        <p><strong>Fecha de Evento:</strong> {formatDate(project.fechaEvento) || 'No especificada'}</p>
                                        <p><strong>Hora de Evento:</strong> {project.horaEvento || 'No especificada'}</p>
                                    </>
                                )}
                                {project.archivoUrl && (
                                    <div className="mt-2" style={{ textAlign: 'center' }}>  {/* Centra el archivo multimedia */}
                                        {project.archivoUrl.includes('video') ? (
                                            <video controls style={{ maxWidth: '100%', borderRadius: '12px', margin: '0 auto' }}>
                                                <source src={project.archivoUrl} />
                                                Tu navegador no soporta la etiqueta de video.
                                            </video>
                                        ) : (
                                            <img
                                                src={project.archivoUrl}
                                                alt="Archivo"
                                                style={{ maxWidth: '100%', borderRadius: '12px', margin: '0 auto' }}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="post-action-bar flex justify-between items-center">
                                {/* Botones de Editar y Eliminar alineados a la izquierda */}
                                {project.autorId === user.uid && (
                                    <div className="edit-delete-buttons flex gap-2">
                                        <button onClick={() => handleEdit(project)} className="text-blue-600">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDeleteClick(project.id)} className="text-red-600">
                                            Eliminar
                                        </button>
                                    </div>
                                )}

                                {/* Botones de Me Gusta y Favorito alineados a la derecha */}
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
                            No se podrá recuperar una vez eliminado. ¿Estás seguro?
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button
                                onClick={confirmDelete}
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
                                onClick={cancelDelete}
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

export default Home;