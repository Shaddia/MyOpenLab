import React, { useEffect, useState } from 'react';
import '../styles/home.css';
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
import Layout from './layout';
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from 'react-icons/fa';

const Home = () => {
    const { user } = useAuth();
    const [showPopup, setShowPopup] = useState(false);
    const [projects, setProjects] = useState([]);
    const [usersData, setUsersData] = useState({});
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        caracteristicas: '',
        herramientas: '',
        fechaInicio: '',
        fechaFin: '',
    });
    const [editingProjectId, setEditingProjectId] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'proyectos'), orderBy('fechaCreacion', 'desc'));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setProjects(datos);

            const newUsersData = { ...usersData };
            for (const project of datos) {
                if (!newUsersData[project.autorId]) {
                    const userDoc = await getDoc(doc(db, 'users', project.autorId));
                    if (userDoc.exists()) {
                        newUsersData[project.autorId] = userDoc.data();
                    }
                }
            }
            setUsersData(newUsersData);
        });

        return () => unsubscribe();
    }, []);

    const handleOpenPopup = () => {
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
        });
        setShowPopup(false);
        setEditingProjectId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const { nombre, descripcion, caracteristicas, herramientas, fechaInicio, fechaFin } = formData;

        if (!nombre || !descripcion || !caracteristicas || !herramientas || !fechaInicio || !fechaFin) {
            alert('Por favor completa todos los campos.');
            return;
        }

        const data = {
            ...formData,
            autorId: user.uid,
            autorNombre: user.displayName,
            fechaCreacion: serverTimestamp(),
            likes: [],
            favorites: [],
        };

        try {
            if (editingProjectId) {
                await updateDoc(doc(db, 'proyectos', editingProjectId), data);
            } else {
                await addDoc(collection(db, 'proyectos'), data);
            }
            handleClosePopup();
        } catch (err) {
            console.error('Error al guardar el proyecto:', err);
        }
    };

    const handleEdit = (project) => {
        setFormData({
            nombre: project.nombre,
            descripcion: project.descripcion,
            caracteristicas: project.caracteristicas,
            herramientas: project.herramientas,
            fechaInicio: project.fechaInicio,
            fechaFin: project.fechaFin,
        });
        setEditingProjectId(project.id);
        setShowPopup(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro que quieres eliminar este proyecto?')) {
            try {
                await deleteDoc(doc(db, 'proyectos', id));
            } catch (err) {
                console.error('Error al eliminar el proyecto:', err);
            }
        }
    };

    const toggleReaction = async (id, type) => {
        const projectRef = doc(db, 'proyectos', id);
        const projectSnap = await getDoc(projectRef);
        const projectData = projectSnap.data();

        const field = type === 'like' ? 'likes' : 'favorites';
        const arr = projectData[field] || [];

        const updatedArr = arr.includes(user.uid)
            ? arr.filter(uid => uid !== user.uid)
            : [...arr, user.uid];

        await updateDoc(projectRef, { [field]: updatedArr });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

            <div className="post-creator" onClick={handleOpenPopup}>
                <textarea placeholder="Haz clic aquí para crear un nuevo proyecto..." readOnly />
            </div>

            {showPopup && (
                <div className="popup">
                    <div className="popup-inner">
                        <h3>{editingProjectId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
                        <input name="nombre" placeholder="Nombre del proyecto" value={formData.nombre} onChange={handleInputChange} required />
                        <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleInputChange} required />
                        <textarea name="caracteristicas" placeholder="Características" value={formData.caracteristicas} onChange={handleInputChange} required />
                        <input name="herramientas" placeholder="Herramientas de desarrollo" value={formData.herramientas} onChange={handleInputChange} required />
                        <label>Fecha de inicio:</label>
                        <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleInputChange} required />
                        <label>Fecha de finalización:</label>
                        <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleInputChange} required />
                        <div style={{ marginTop: '1rem' }}>
                            <button onClick={handleSubmit}>{editingProjectId ? 'Guardar Cambios' : 'Publicar'}</button>
                            <button onClick={handleClosePopup} style={{ marginLeft: '1rem', backgroundColor: '#ccc' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="posts">
                <h3>Publicaciones</h3>
                {projects.length === 0 && <p>No hay proyectos aún.</p>}
                {projects.map((project) => {
                    const userInfo = usersData[project.autorId] || {};
                    const userPhoto = userInfo.photoURL || '/default-avatar.png';
                    const userName = userInfo.name || project.autorNombre || 'Usuario';

                    const liked = project.likes?.includes(user.uid);
                    const favorited = project.favorites?.includes(user.uid);

                    return (
                        <div key={project.id} className="post-card">
                            <div className="post-header">
                                <div className="author-photo" style={{ width: '60px', height: '60px' }}>
                                    <img src={userPhoto} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                                </div>
                                <div className="author-details">
                                    <h4>{userName}</h4>
                                    <p className="post-date">{formatDate(project.fechaCreacion)}</p>
                                </div>
                            </div>

                            <div className="post-content">
                                <p><strong>Proyecto:</strong> <strong>{project.nombre}</strong></p>
                                <p><strong>Descripción:</strong>  {project.descripcion}</p>
                                <p><strong>Características:</strong> {project.caracteristicas}</p>
                                <p><strong>Herramientas:</strong> {project.herramientas}</p>
                                <p><strong>Desde:</strong> {project.fechaInicio} <strong>Hasta:</strong> {getFechaFin(project.fechaFin)}</p>
                            </div>

                            {project.autorId === user.uid && (
                                <div className="post-actions">
                                    <button onClick={() => handleEdit(project)}>Editar</button>
                                    <button onClick={() => handleDelete(project.id)} className="btn-delete">Eliminar</button>
                                </div>
                            )}

                            <div className="post-action-bar">
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
                    );
                })}
            </div>
        </Layout>
    );
};

export default Home;
