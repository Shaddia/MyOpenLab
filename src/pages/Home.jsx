import React, { useEffect, useState } from 'react';
import '../styles/home.css';
import defaultAvatar from '../assets/default-avatar.png'; // Ajusta la ruta si es distinta
import { createNotification } from '../services/notificaciones';
import { useAuth } from '../context/useAuth';
import { getProjectCategory } from '../utils/projectCategory';
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
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaBell, FaCommentDots } from 'react-icons/fa'; import { useNavigate } from 'react-router-dom';
import FollowButton from '../components/FollowButton';  // Asegúrate de importarlo

const Home = ({ searchQuery = "", ...props }) => {
    console.log("Valor recibido de searchQuery:", searchQuery);
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
    const [protectedPopup, setProtectedPopup] = useState(false);
    const [pendingReaction, setPendingReaction] = useState(null);
    //const [searchQuery, setSearchQuery] = useState("");
    const [expandedProjectId, setExpandedProjectId] = useState(null);
    const [commentInputs, setCommentInputs] = useState({});
    const [activeCommentProject, setActiveCommentProject] = useState(null);
    const [commentsByProject, setCommentsByProject] = useState({});

    useEffect(() => {
        const qComments = query(
            collection(db, "comentarios"),
            orderBy("createdAt", "asc")
        );
        const unsubscribeComments = onSnapshot(qComments, (snapshot) => {
            const commentsObj = {};
            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                const projectId = data.projectId;
                if (!commentsObj[projectId]) {
                    commentsObj[projectId] = [];
                }
                commentsObj[projectId].push({ id: docSnap.id, ...data });
            });
            setCommentsByProject(commentsObj);
        });
        return () => unsubscribeComments();
    }, []);
    const handleCommentChange = (projectId, value) => {
        setCommentInputs(prev => ({ ...prev, [projectId]: value }));
    };
const formatCommentTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if(diffInMinutes < 60) return `${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if(diffInHours < 24) return `${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} d`;
};
    const handleCommentSubmit = async (project) => {
        const commentText = commentInputs[project.id];
        if (!commentText || commentText.trim() === "") return;
        try {
            await addDoc(collection(db, "comentarios"), {
                projectId: project.id,
                comment: commentText,
                authorId: user.uid,
                authorName: user.displayName,
                createdAt: serverTimestamp()
            });
            setCommentInputs(prev => ({ ...prev, [project.id]: "" }));
        } catch (err) {
            console.error("Error al enviar el comentario:", err);
            alert("Error al enviar el comentario, intenta nuevamente.");
        }
    };
    const initialFormData = {
        nombre: '',
        descripcion: '',
        caracteristicas: '',
        herramientas: '',
        fechaInicio: '',
        fechaFin: '',
        ciudad: '',
        pais: '',
        direccion: '',
        proposito: '',
        etiquetas: '',    // NUEVO: etiquetas
        publico: true,     // NUEVO: bandera de visibilidad (true = público, false = privado)
        github: '',       // Enlace del repositorio (opcional)
        videoDemo: '',    // Enlace del video demo (opcional)
        otrosEnlaces: ''  // Otros enlaces opcionales
    }
    const [formData, setFormData] = useState(initialFormData);
    // 4. Al obtener los proyectos, filtra para que solo se muestren los documentos públicos o los privados del propio usuario.
    useEffect(() => {
        const qProyectos = query(collection(db, 'proyectos'), orderBy('fechaCreacion', 'desc'));

        const unsubscribeProyectos = onSnapshot(qProyectos, async (snapshotProyectos) => {
            const proyectos = snapshotProyectos.docs
                .map((doc) => ({ id: doc.id, tipo: 'proyecto', ...doc.data() }))
                .filter(project => (
                    !project.deleted && project.isPublic === true
                ));
            setProjects(proyectos);
            // Código que obtiene datos de los usuarios...

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
            proposito: '',
            etiquetas: '',
            publico: false  // Asegura que siempre tenga un valor
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
            proposito,
            etiquetas // NUEVO: etiquetas
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
            const storage = getStorage();
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
            archivoUrl = originalArchivoUrl;
        }

        // --- Nuevo: Determinar categoría automática ---
        let keywords = [];
        if (etiquetas) {
            keywords.push(...etiquetas.split(',').map(tag => tag.trim()));
        }
        if (descripcion) {
            const textKeywords = descripcion
                .toLowerCase()
                .replace(/[^\w\s]/g, '') // eliminar signos de puntuación
                .split(/\s+/)
                .filter(word => word.length > 3); // evita palabras muy cortas
            keywords.push(...textKeywords);
        }
        const category = getProjectCategory(keywords);
        // --------------------------------------------------

        const data = {
            ...formData,
            archivoUrl: archivoUrl || null,
            autorId: user.uid,
            autorNombre: user.displayName,
            fechaCreacion: serverTimestamp(),
            likes: [],
            favorites: [],
            category, // Categoría automática calculada
            isPublic: formData.publico   // Guardamos la visibilidad como "isPublic"
        };

        try {
            if (tipoPublicacion === 'proyecto') {
                if (editingProjectId) {
                    await updateDoc(doc(db, 'proyectos', editingProjectId), data);
                    console.log("Proyecto actualizado");
                } else {
                    const docRef = await addDoc(collection(db, 'proyectos'), data);
                    console.log("Proyecto creado con ID:", docRef.id);
                }
            } else if (tipoPublicacion === 'evento') {
                const docRef = await addDoc(collection(db, 'eventos'), data);
                console.log("Evento creado con ID:", docRef.id);
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
            // Actualiza el campo "deleted" a true para hacer soft delete
            //await deleteDoc(doc(db, 'proyectos', deleteId)); Entonces en vez de eliminar, actualiza el campo deleted
            await updateDoc(doc(db, 'proyectos', deleteId), { deleted: true });
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
    const toggleReactionProtected = async (id, type, pubTipo) => {
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
        if (!alreadyReacted && projectData.autorId !== user.uid) {
            await createNotification({
                type: type, // "like" o "favorite"
                from: user.uid,
                fromName: user.displayName,
                to: projectData.autorId,
                postName: projectData.nombre || projectData.titulo || 'tu publicación'
            });
        }
    };

    const toggleReaction = (id, type, pubTipo) => {
        if (user.isAnonymous) {
            // En lugar de redirigir inmediatamente, mostramos el pop-up
            setProtectedPopup(true);
            setPendingReaction(() => () => toggleReactionProtected(id, type, pubTipo));
            return;
        }
        toggleReactionProtected(id, type, pubTipo);
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

    const toggleExpandProject = (id) => {
        setExpandedProjectId(prev => (prev === id ? null : id));
    };


    // FILTRADO CORREGIDO
    const filteredProjects = projects.filter(project => {
        // Si el campo de búsqueda está vacío, se muestran todos los proyectos
        if (!searchQuery || searchQuery.trim() === "") return true;

        const query = searchQuery.trim().toLowerCase();

        // Preparar los campos para la búsqueda
        const nombre = (project.nombre || '').toLowerCase();
        const descripcion = (project.descripcion || '').toLowerCase();
        const autorNombre = (project.autorNombre || '').toLowerCase();

        // Manejar etiquetas (pueden ser string o array)
        let etiquetas = '';
        if (project.etiquetas) {
            if (Array.isArray(project.etiquetas)) {
                etiquetas = project.etiquetas.join(' ').toLowerCase();
            } else {
                etiquetas = project.etiquetas.toLowerCase();
            }
        }

        // Verificar si la consulta coincide con algún campo
        return nombre.includes(query) ||
            descripcion.includes(query) ||
            autorNombre.includes(query) ||
            etiquetas.includes(query);
    });

    console.log("Proyectos filtrados:", filteredProjects);
    console.log("Search query actual:", searchQuery);
    return (
        <Layout>
            <div className="top-bar" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 className="section-title">Publicaciones</h2>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                </div>
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
                                    setFormData(initialFormData); // Reset con valores predeterminados
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

                                    {/* NUEVO: Etiquetas */}
                                    <input
                                        name="etiquetas"
                                        placeholder="Etiquetas (separadas por comas)"
                                        value={formData.etiquetas}
                                        onChange={handleInputChange}
                                    />
                                    {/* Nuevos campos opcionales para enlaces */}
                                    <input
                                        name="github"
                                        placeholder="Enlace de GitHub (opcional)"
                                        value={formData.github}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        name="videoDemo"
                                        placeholder="Enlace de Video Demo (opcional)"
                                        value={formData.videoDemo}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        name="otrosEnlaces"
                                        placeholder="Otros enlaces (opcional)"
                                        value={formData.otrosEnlaces}
                                        onChange={handleInputChange}
                                    />

                                    {/* NUEVO: Público */}
                                    <label style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: '0.5rem',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: '#f6f6f6',
                                        maxWidth: '220px',
                                        cursor: 'pointer'
                                    }}>
                                        <span style={{ fontSize: '0.9rem', color: '#333' }}>
                                            Visible para todos
                                        </span>
                                        <input
                                            type="checkbox"
                                            name="publico"
                                            checked={formData.publico}
                                            onChange={(e) => setFormData(prev => ({ ...prev, publico: e.target.checked }))}
                                            style={{
                                                appearance: 'none',
                                                width: '20px',
                                                height: '20px',
                                                border: `2px solid ${formData.publico ? '#8a2be2' : '#aaa'}`,
                                                borderRadius: '4px',
                                                backgroundColor: formData.publico ? '#8a2be2' : '#fff',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </label>
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

                                    {/* NUEVO: Etiquetas para eventos */}
                                    <input
                                        name="etiquetas"
                                        placeholder="Etiquetas (separadas por comas)"
                                        value={formData.etiquetas}
                                        onChange={handleInputChange}
                                    />

                                    {/* NUEVO: Público (Para eventos también) */}
                                    <label style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            name="publico"
                                            checked={formData.publico}
                                            onChange={(e) => setFormData(prev => ({ ...prev, publico: e.target.checked }))}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        Visible para todos
                                    </label>
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
                {filteredProjects.length === 0 && <p>No hay proyectos que coincidan con la búsqueda.</p>}
                {filteredProjects.map((project) => {
                    const userInfo = usersData[project.autorId] || {};
                    const userPhoto = userInfo.photoURL || defaultAvatar;
                    const userName = userInfo.name || project.autorNombre || 'Usuario';

                    const liked = project.likes?.includes(user.uid);
                    const favorited = project.favorites?.includes(user.uid);

                    return (
                        <div
                            key={project.id}
                            className="post-card bg-white shadow-md rounded-2xl p-5 mb-6"
                            style={{ maxWidth: '568px', marginInline: 'auto', cursor: 'pointer' }}
                            onClick={(e) => {
                                // Evitamos que clicks en botones disparen la expansión.
                                if (
                                    e.target.tagName !== 'BUTTON' &&
                                    (!e.target.parentElement || e.target.parentElement.tagName !== 'BUTTON')
                                ) {
                                    toggleExpandProject(project.id);
                                }
                            }}
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
                                    <div
                                        className="author-details"
                                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}
                                    >
                                        <h4
                                            className="font-bold text-lg text-gray-800"
                                            style={{ margin: 0, whiteSpace: 'nowrap' }}
                                        >
                                            {userName}
                                        </h4>
                                        {project.autorId !== user.uid && (
                                            <FollowButton targetUid={project.autorId} />
                                        )}
                                    </div>
                                    <p
                                        className="post-date text-gray-500"
                                        style={{ fontSize: '0.7rem', margin: 0 }}
                                    >
                                        {formatDate(project.fechaCreacion)}
                                    </p>
                                </div>
                            </div>

                            {/* Se limita la altura si no está expandida, mostrando un resumen */}
                            <div
                                className="post-content text-gray-700 space-y-2"
                                style={{
                                    textAlign: 'left',
                                    fontSize: '0.9rem',
                                    maxHeight: expandedProjectId === project.id ? 'none' : '3rem',
                                    overflow: 'hidden',
                                    transition: 'max-height 0.3s ease'
                                }}
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

                                {/* NUEVO: Mostrar etiquetas */}
                                {project.etiquetas && (
                                    <p style={{ fontStyle: 'italic', color: '#666', marginTop: '0.5rem' }}>
                                        {project.etiquetas}
                                    </p>
                                )}

                                {(project.github || project.videoDemo || project.otrosEnlaces) && (
                                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {project.github && (
                                            <div>
                                                <strong>GitHub: </strong>
                                                <a href={project.github} target="_blank" rel="noopener noreferrer">
                                                    {project.github}
                                                </a>
                                            </div>
                                        )}
                                        {project.videoDemo && (
                                            <div>
                                                <strong>Video Demo: </strong>
                                                <a href={project.videoDemo} target="_blank" rel="noopener noreferrer">
                                                    {project.videoDemo}
                                                </a>
                                            </div>
                                        )}
                                        {project.otrosEnlaces && (
                                            <div>
                                                <strong>Otros Enlaces: </strong>
                                                <a href={project.otrosEnlaces} target="_blank" rel="noopener noreferrer">
                                                    {project.otrosEnlaces}
                                                </a>
                                            </div>
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
                                <div className="like-fav-buttons flex flex-row items-center gap-4">
                                   
                                    {/* Botón de Me Gusta */}
                                    <button
                                        className={`btn-like ${liked ? 'active' : ''}`}
                                        onClick={() => toggleReaction(project.id, 'like', project.tipo)}
                                    >
                                        {liked ? <FaHeart /> : <FaRegHeart />}
                                        <span>{project.likes?.length || 0}</span>
                                    </button>
                                    {/* Botón de Favoritos */}
                                    <button
                                        className={`btn-fav ${favorited ? 'active' : ''}`}
                                        onClick={() => toggleReaction(project.id, 'favorite', project.tipo)}
                                    >
                                        {favorited ? <FaStar /> : <FaRegStar />}
                                        <span>{project.favorites?.length || 0}</span>
                                    </button>
                                     {/* Botón de Comentario */}
                                    <button
                                        className="btn-comment"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveCommentProject(project.id === activeCommentProject ? null : project.id);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: '#8A2BE2',
                                            fontSize: '1.5rem'
                                        }}
                                    >
                                        <FaCommentDots />
                                        <span style={{ marginLeft: '4px', fontSize: '1rem' }}>
                                            {commentsByProject[project.id]?.length || 0}
                                        </span>
                                    </button>
                                </div>
                            </div>
                            {project.isPublic && !user.isAnonymous && activeCommentProject === project.id && (
                                <div
                                    className="comments-section"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ marginTop: '1rem' }}
                                >
                                    <div className="comment-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <img
                                            src={user?.photoURL || defaultAvatar}
                                            alt="Avatar"
                                            className="comment-user-avatar"
                                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Comentar"
                                            value={commentInputs[project.id] || ""}
                                            onChange={(e) => handleCommentChange(project.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="comment-text-input"
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                borderRadius: '20px',
                                                border: '1px solid #ccc',
                                                outline: 'none'
                                            }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCommentSubmit(project);
                                            }}
                                            className="comment-submit"
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#8a2be2',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '20px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Publicar
                                        </button>
                                    </div>
                                    {/* NUEVO: Lista de comentarios con estilo tipo "burbuja" */}
                                    <div className="comments-list" style={{ marginTop: '0.5rem' }}>
                                        {commentsByProject[project.id] && commentsByProject[project.id].map(comment => (
                                            <div
                                                key={comment.id}
                                                className="comment-item"
                                                style={{
                                                    backgroundColor: '#f0f2f5',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '999px',
                                                    marginBottom: '0.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    maxWidth: '80%'
                                                }}
                                            >
                                                <span className="comment-user-name" style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
                                                    {comment.authorName}:
                                                </span>
                                                <span className="comment-text" style={{ marginRight: '0.5rem' }}>
                                                    {comment.comment}
                                                </span>
                                                <span className="comment-time" style={{ fontSize: '0.75rem', color: '#999' }}>
                                                    {formatCommentTime(comment.createdAt)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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

            {protectedPopup && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '2rem',
                        borderRadius: '10px',
                        textAlign: 'center',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <p>Esta acción requiere ingresar con una cuenta</p>
                        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem' }}>
                            <button
                                onClick={() => { setProtectedPopup(false); setPendingReaction(null); navigate('/home'); }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#ccc',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => { setProtectedPopup(false); navigate('/login?register=true'); }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#8a2be2',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
Home.displayName = "home";
export default Home;