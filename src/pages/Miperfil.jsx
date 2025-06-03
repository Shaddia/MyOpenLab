import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/useAuth';
import { doc, getDoc, collection, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faCamera, faAward } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import defaultAvatar from '../assets/default-avatar.png';
import { useNavigate, Link } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Chip, IconButton, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete, Snackbar, Alert } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import PortfolioEditor from '../components/PortafolioEditor';
import EditIcon from '@mui/icons-material/Edit';
import { Box } from '@mui/material';
import { BiCodeAlt } from 'react-icons/bi';
import { FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ReputationSystem from '../components/ReputationSystem';
import Badges from '../components/Badges';
import ReputationModal from '../components/ReputationModal'; // Asegúrate de crear e importar este componente

// Función para formatear timestamps
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Sin fecha';
  if (typeof timestamp === 'string') return timestamp;
  if (typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return 'Sin fecha';
};

// Opciones predefinidas para habilidades y stack - EXPORTADAS CORRECTAMENTE
export const predefinedSkills = ["React", "Angular", "SQL", "Node.js", "Python", "Docker", "AWS", "Firebase", "Java", "C++"];
export const predefinedTechStack = ["React", "Node.js", "Firebase", "Docker", "AWS", "Python", "Java", "Angular"];

const MiPerfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  // Guardamos los ids como string
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [expandedEventoId, setExpandedEventoId] = useState(null);

  // Estados para edición
  const [isEditingPost, setIsEditingPost] = useState(null);
  const [editedPost, setEditedPost] = useState({ nombre: '', descripcion: '', herramientas: '', fechaFin: '' });
  const [isEditingEvento, setIsEditingEvento] = useState(null);
  const [editedEvento, setEditedEvento] = useState({ nombre: '', descripcion: '', ciudad: '', fechaEvento: '', horaEvento: '' });
  const [editedInfo, setEditedInfo] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    bio: userData?.bio || '',          // campo para biografía
    github: userData?.github || '',    // campo para links de GitHub
  });
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // Estados para modales de seguidores y seguidos
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersData, setFollowersData] = useState([]);
  const [followingData, setFollowingData] = useState([]);

  const [portfolio, setPortfolio] = useState({
    skills: [],
    studies: [],
    experience: [],
    linkedin: '',
    techStack: []
  });

  const [snackbar, setSnackbar] = useState({ open: false, severity: 'success', message: '' });
  const [dialogOpen, setDialogOpen] = useState(false);

  // Estado para edición del portafolio
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  // Usamos portfolioData para agrupar los campos del portafolio de userData
  const [portfolioData, setPortfolioData] = useState({
    skills: userData?.skills || [],
    studies: userData?.studies || [],
    experience: userData?.experience || [],
    linkedin: userData?.linkedin || '',
    techStack: userData?.techStack || []
  });

  // Agrega este nuevo estado, justo después de definir portfolioData:
  const [portfolioText, setPortfolioText] = useState({
    skills: portfolioData.skills.join(', '),
    studies: portfolioData.studies.join(', '),
    experience: portfolioData.experience.join(', '),
    linkedin: portfolioData.linkedin,
    techStack: portfolioData.techStack.join(', ')
  });

  // Estados para Educación y Experiencia (para la vista de edición)
  const [educationItems, setEducationItems] = useState([
    { title: '', institution: '', start: null, end: null }
  ]);
  const [experienceItems, setExperienceItems] = useState([
    { title: '', company: '', description: '', start: null, end: null }
  ]);

  // Funciones para Educación
  const addEdu = () => {
    setEducationItems([...educationItems, { title: '', institution: '', start: null, end: null }]);
  };
  const removeEdu = (index) => {
    setEducationItems(educationItems.filter((_, idx) => idx !== index));
  };
  const handleEduChange = (index, field, value) => {
    const updated = [...educationItems];
    updated[index][field] = value;
    setEducationItems(updated);
  };

  // Funciones para Experiencia
  const addExp = () => {
    setExperienceItems([...experienceItems, { title: '', company: '', description: '', start: null, end: null }]);
  };
  const removeExp = (index) => {
    setExperienceItems(experienceItems.filter((_, idx) => idx !== index));
  };
  const handleExpChange = (index, field, value) => {
    const updated = [...experienceItems];
    updated[index][field] = value;
    setExperienceItems(updated);
  };

  const fetchUserData = async () => {
    if (user && user.uid) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log('No hay datos de usuario');
      }
    }
  };

  // Dentro del cuerpo del componente MiPerfil, antes del return:

  const handleSavePortfolio = async () => {
    const now = new Date();
    const updatedPortfolio = {
      skills: portfolioText.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s),
      // Transforma los items de educación en un array de objetos
      studies: educationItems.map(item => ({
        title: item.title,
        institution: item.institution,
        start: item.start ? new Date(item.start).toISOString().slice(0, 10) : '',
        end: item.end ? (new Date(item.end) > now ? "Actualmente" : new Date(item.end).toISOString().slice(0, 10)) : ''
      })),
      // Transforma los items de experiencia en un array de objetos
      experience: experienceItems.map(item => ({
        title: item.title,
        company: item.company,
        description: item.description,
        start: item.start ? new Date(item.start).toISOString().slice(0, 10) : '',
        end: item.end ? (new Date(item.end) > now ? "Actualmente" : new Date(item.end).toISOString().slice(0, 10)) : ''
      })),
      linkedin: portfolioText.linkedin.trim(),
      techStack: portfolioText.techStack
        .split(',')
        .map(s => s.trim())
        .filter(s => s)
    };

    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, updatedPortfolio);
      // Sincroniza la data actualizada
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
      setSnackbar({ open: true, severity: 'success', message: 'Portafolio actualizado correctamente' });
      setIsEditingPortfolio(false);
    } catch (error) {
      console.error('Error al actualizar el portafolio:', error);
      setSnackbar({ open: true, severity: 'error', message: 'Error al actualizar el portafolio' });
    }
  };

  const fetchPostsAndEventos = async () => {
    if (user && user.uid) {
      const postsQuery = query(collection(db, 'proyectos'), where('autorId', '==', user.uid));
      const eventosQuery = query(collection(db, 'eventos'), where('autorId', '==', user.uid));

      try {
        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map((docSnap) => ({
          uniqueId: String(docSnap.id),
          ...docSnap.data(),
        }));
        const eventosSnapshot = await getDocs(eventosQuery);
        const eventosData = eventosSnapshot.docs.map((docSnap) => ({
          uniqueId: String(docSnap.id),
          ...docSnap.data(),
        }));
        setPosts(postsData);
        setEventos(eventosData);
      } catch (error) {
        console.error('Error al obtener los datos: ', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchFollowersInfo = async (followers) => {
    const results = await Promise.all(
      followers.map(async (followerUID) => {
        const docRef = doc(db, 'users', followerUID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          return { uid: followerUID, name: 'Desconocido', photoURL: defaultAvatar };
        }
      })
    );
    setFollowersData(results);
  };

  const fetchFollowingInfo = async (following) => {
    const results = await Promise.all(
      following.map(async (followingUID) => {
        const docRef = doc(db, 'users', followingUID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          return { uid: followingUID, name: 'Desconocido', photoURL: defaultAvatar };
        }
      })
    );
    setFollowingData(results);
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchPostsAndEventos();
    }
  }, [user]);

  useEffect(() => {
    if (userData?.followers) {
      fetchFollowersInfo(userData.followers);
    }
    if (userData?.following) {
      fetchFollowingInfo(userData.following);
    }
  }, [userData?.followers, userData?.following]);

  // En un useEffect actualiza portfolioData cuando userData cambie (opcional)
  useEffect(() => {
    setPortfolioData({
      skills: userData?.skills || [],
      studies: userData?.studies || [],
      experience: userData?.experience || [],
      linkedin: userData?.linkedin || '',
      techStack: userData?.techStack || []
    });
  }, [userData]);

  // Sincroniza portfolioText cuando portfolioData cambie
  useEffect(() => {
    setPortfolioText({
      skills: portfolioData.skills.join(', '),
      studies: portfolioData.studies.join(', '),
      experience: portfolioData.experience.join(', '),
      linkedin: portfolioData.linkedin,
      techStack: portfolioData.techStack.join(', ')
    });
  }, [portfolioData]);

  const handleDeletePost = async (postUniqueId) => {
    try {
      await deleteDoc(doc(db, 'proyectos', postUniqueId));
      setPosts(posts.filter((post) => post.uniqueId !== postUniqueId));
    } catch (error) {
      console.error('Error al eliminar el proyecto: ', error);
    }
  };

  const handleDeleteEvent = async (eventUniqueId) => {
    try {
      await deleteDoc(doc(db, 'eventos', eventUniqueId));
      setEventos(eventos.filter((evento) => evento.uniqueId !== eventUniqueId));
    } catch (error) {
      console.error('Error al eliminar el evento: ', error);
    }
  };

  const handleEditPost = async (postUniqueId) => {
    const postRef = doc(db, 'proyectos', postUniqueId);
    try {
      await updateDoc(postRef, {
        nombre: editedPost.nombre,
        descripcion: editedPost.descripcion,
        herramientas: editedPost.herramientas,
        fechaFin: editedPost.fechaFin,
      });
      setPosts(
        posts.map((post) =>
          post.uniqueId === postUniqueId ? { ...post, ...editedPost } : post
        )
      );
      setIsEditingPost(null);
    } catch (error) {
      console.error('Error al editar el proyecto: ', error);
    }
  };

  const handleEditEvento = async (eventUniqueId) => {
    const eventoRef = doc(db, 'eventos', eventUniqueId);
    try {
      await updateDoc(eventoRef, {
        nombre: editedEvento.nombre,
        descripcion: editedEvento.descripcion,
        ciudad: editedEvento.ciudad,
        fechaEvento: editedEvento.fechaEvento,
        horaEvento: editedEvento.horaEvento,
      });
      setEventos(
        eventos.map((evento) =>
          evento.uniqueId === eventUniqueId ? { ...evento, ...editedEvento } : evento
        )
      );
      setIsEditingEvento(null);
    } catch (error) {
      console.error('Error al editar el evento: ', error);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setProfileImage(base64);
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { photoURL: base64 });
          setUserData((prev) => ({ ...prev, photoURL: base64 }));
        } catch (error) {
          console.error('Error al actualizar la foto de perfil:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Se asegura que se asigna y compara como string
  const toggleExpandPost = (uniqueId) => {
    const id = String(uniqueId);
    setExpandedPostId((prevId) => (prevId === id ? null : id));
  };

  const toggleExpandEvento = (uniqueId) => {
    const id = String(uniqueId);
    setExpandedEventoId((prevId) => (prevId === id ? null : id));
  };

  const handleChangePost = (e) => {
    const { name, value } = e.target;
    setEditedPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeEvento = (e) => {
    const { name, value } = e.target;
    setEditedEvento((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    const userRef = doc(db, 'users', user.uid);
    try {
      const updatedData = {
        name: editedInfo.name || userData?.name || "",
        phone: editedInfo.phone || userData?.phone || "",
        bio: editedInfo.bio || userData?.bio || "",
        github: editedInfo.github ?? userData?.github ?? "" // si es undefined, se asigna ""
      };
      await updateDoc(userRef, updatedData);
      setUserData((prev) => ({ ...prev, ...updatedData }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar los cambios: ', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Agrega este código antes del return o dentro de él, dependiendo de tu flujo de datos:
  const [activities, setActivities] = useState([]);

  // Genera un historial de actividad a partir de los posts y eventos (puedes ampliar esto para incluir comentarios u otras acciones)
  useEffect(() => {
    const activitiesFromPosts = posts.map(post => ({
      id: post.uniqueId,
      type: 'Proyecto',
      action: 'creó un proyecto',
      date: post.fechaCreacion, // se asume que existe
      description: post.nombre
    }));
    const activitiesFromEvents = eventos.map(evt => ({
      id: evt.uniqueId,
      type: 'Evento',
      action: 'creó un evento',
      date: evt.fechaCreacion, // se asume que existe
      description: evt.nombre
    }));
    const allActivities = [...activitiesFromPosts, ...activitiesFromEvents];
    // Orden descendente (lo más reciente primero)
    allActivities.sort((a, b) => {
      const dateA = a.date ? new Date(a.date.seconds * 1000) : 0;
      const dateB = b.date ? new Date(b.date.seconds * 1000) : 0;
      return dateB - dateA;
    });
    setActivities(allActivities);
  }, [posts, eventos]);

  const totalLikes = posts.reduce((sum, post) => sum + (post.likes ? post.likes.length : 0), 0);
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = a.fechaCreacion ? new Date(a.fechaCreacion.seconds * 1000) : 0;
    const dateB = b.fechaCreacion ? new Date(b.fechaCreacion.seconds * 1000) : 0;
    return dateB - dateA;
  });
  const lastActivity = sortedPosts.length > 0 ? sortedPosts[0].fechaCreacion : null;

  const [isReputationModalOpen, setIsReputationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("logros");

  // Calcula la reputación a partir de proyectos y eventos
  const totalReputation = useMemo(() => {
    // Calcula puntos por likes en posts
    const pointsFromProjects = posts.reduce((sum, post) => {
      const likesCount = Array.isArray(post.likes)
        ? post.likes.length
        : (post.likes || 0);
      return sum + likesCount;
    }, 0) * 5;
    
    // Calcula puntos por likes en eventos
    const pointsFromEvents = eventos.reduce((sum, evt) => {
      const likesCount = Array.isArray(evt.likes)
        ? evt.likes.length
        : (evt.likes || 0);
      return sum + likesCount;
    }, 0) * 5;
    
    // Cada publicación (post o evento) vale 15 puntos
    const publicationsPoints = (posts.length + eventos.length) * 15;
    
    console.log("posts:", posts);
    console.log("eventos:", eventos);
    console.log("pointsFromProjects:", pointsFromProjects);
    console.log("pointsFromEvents:", pointsFromEvents);
    console.log("publicationsPoints:", publicationsPoints);
    
    return pointsFromProjects + pointsFromEvents + publicationsPoints;
  }, [posts, eventos]);

  if (loading) return <p>Cargando...</p>;
  if (!user) return <p style={{ padding: '2rem' }}>No estás autenticado.</p>;

  return (
    <Layout>
      <div className="top-bar">
        <h2 className="section-title">Mi perfil</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row-reverse', padding: '2rem', gap: '2rem' }}>
        {/* Contenedor de perfil */}
        <div className="profile-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
          <div
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: '3px solid #8a2be2',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}
          >
            {userData?.photoURL ? (
              <img
                src={userData.photoURL}
                alt="Foto de perfil"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatar;
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#aaa',
                fontSize: '0.9rem'
              }}>
                Sin foto
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} />
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#8a2be2',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
          
          <div
            className="profile-container"
            style={{
              backgroundColor: '#fff',
              borderRadius: '10px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              maxWidth: '350px',
              width: '100%',
              textAlign: 'center',
              color: 'white',
              position: 'relative'
            }}
          >
            <h3 style={{ marginBottom: '2rem', color: 'white' }}>Información del Perfil</h3>
            
          
            
            <p>
              <strong>Nombre:</strong> {userData?.name || 'No especificado'}
            </p>
            <p>
              <strong>Email:</strong> {userData?.email || user.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {userData?.phone || 'No registrado'}
            </p>
            <p>
              <strong>Sobre mi:</strong> {userData?.bio || '¡Habla un poco sobre ti!'}
            </p>
            <p>
              <strong>GitHub:</strong> {userData?.github ? (
                <a
                  href={userData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', marginLeft: '0.5rem' }}
                >
                  <FontAwesomeIcon icon={faGithub} size="1x" style={{ color: '#fff' }} />
                </a>
              ) : 'Ninguno'}
            </p>
            {/* Nuevo bloque para seguidores y seguidos */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-around', width: '100%' }}>
              <div style={{ cursor: 'pointer' }} onClick={() => setShowFollowersModal(true)}>
                <h4>{userData?.followers?.length || 0}</h4>
                <p>Seguidores</p>
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => setShowFollowingModal(true)}>
                <h4>{userData?.following?.length || 0}</h4>
                <p>Siguiendo</p>
              </div>
            </div>
            {/* Botón para editar */}
            {!isEditing ? (
              <button
                onClick={handleEdit}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#8a2be2',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Editar
              </button>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                <h4>Editar Información</h4>
                <input
                  type="text"
                  name="name"
                  value={editedInfo.name}
                  onChange={handleChange}
                  placeholder="Nombre"
                  style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
                />
                <input
                  type="text"
                  name="phone"
                  value={editedInfo.phone}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                />
                <textarea
                  name="bio"
                  value={editedInfo.bio}
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre ti..."
                  style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
                />
                <input
                  type="text"
                  name="github"
                  value={editedInfo.github}
                  onChange={handleChange}
                  placeholder="Link a tus proyectos de GitHub"
                  style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
                />
                <button
                  onClick={handleSaveChanges}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#8a2be2',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                >
                  Guardar cambios
                </button>
                
              </div>
            )}
            {/* Bloque nuevo de reputación integrado en el contenedor */}
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.5rem',
                backgroundColor: '#8a2be2',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem',
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                Reputación: {totalReputation} pts
              </span>
              <button
                onClick={() => setIsReputationModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
                aria-label="Abrir sistema de reputación"
              >
                <FontAwesomeIcon icon={faAward} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenedor de tarjetas */}
        <div
          className="cards-container"
          style={{
            flex: 1,
            borderRadius: '10px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            maxWidth: '950px'
          }}
        >
          <div style={{ marginTop: '2rem' }}>
            <div style={{
              backgroundColor: '#1c2833',
              color: '#fff',
              padding: '0.4rem 0.4rem',
              borderRadius: '5px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '0.7rem' }}>Mis proyectos</h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div
                    key={post.uniqueId}
                    onClick={() => toggleExpandPost(post.uniqueId)}
                    style={{
                      overflow: expandedPostId === post.uniqueId ? 'visible' : 'hidden',
                      width: '320px',
                      borderRadius: '10px',
                      clipPath: 'inset(0 round 10px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      fontSize: '0.85rem',
                      position: 'relative',
                      margin: '0 auto',
                      backgroundColor: '#e8daef'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <div style={{
                      backgroundColor: '#1c2833',
                      color: 'white',
                      padding: '0.5rem 0.75rem',
                      fontWeight: 'bold',
                      position: 'relative'
                    }}>
                      <span style={{ marginRight: '3rem' }}>{post.nombre}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingPost(post.uniqueId);
                          setEditedPost({
                            nombre: post.nombre,
                            descripcion: post.descripcion,
                            herramientas: post.herramientas,
                            fechaFin: post.fechaFin,
                          });
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.1rem',
                          right: '2.5rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.uniqueId);
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.1rem',
                          right: '0.5rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                    <div style={{ padding: '0.5rem', position: 'relative' }}>
                      <p>
                        <strong>Descripción:</strong> {post.descripcion || 'Sin descripción'}
                      </p>
                      {expandedPostId === post.uniqueId && (
                        <>
                          <p><strong>Herramientas:</strong> {post.herramientas}</p>
                          {post.caracteristicas && (<p><strong>Características:</strong> {post.caracteristicas}</p>)}
                          <p><strong>Fecha de Inicio:</strong> {formatTimestamp(post.fechaInicio)}</p>
                          <p><strong>Fecha de Fin:</strong> {formatTimestamp(post.fechaFin)}</p>
                          {post.archivoUrl && (
                            <p>
                              <a
                                href={post.archivoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#8a2be2', textDecoration: 'underline' }}
                              >
                                Ver archivo
                              </a>
                            </p>
                          )}
                          <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            right: '5px',
                            backgroundColor: '#eee',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            fontSize: '0.6rem',
                            color: '#333'
                          }}>
                            {formatTimestamp(post.fechaCreacion)}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No tienes proyectos publicados.</p>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{
              backgroundColor: '#1c2833',
              color: '#fff',
              padding: '0.4rem 0.4rem',
              borderRadius: '5px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '0.7rem' }}>Mis Eventos</h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {eventos.length > 0 ? (
                eventos.map((evento) => (
                  <div
                    key={evento.uniqueId}
                    onClick={() => toggleExpandEvento(evento.uniqueId)}
                    style={{
                      overflow: expandedEventoId === evento.uniqueId ? 'visible' : 'hidden',
                      width: '320px',
                      backgroundColor: '#e8daef',
                      borderRadius: '10px',
                      clipPath: 'inset(0 round 10px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      fontSize: '0.85rem',
                      position: 'relative',
                      margin: '0 auto'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <div style={{
                      backgroundColor: '#1c2833',
                      color: 'white',
                      padding: '0.5rem 0.75rem',
                      fontWeight: 'bold',
                      position: 'relative'
                    }}>
                      <span style={{ marginRight: '3rem' }}>{evento.nombre}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingEvento(evento.uniqueId);
                          setEditedEvento({
                            nombre: evento.nombre,
                            descripcion: evento.descripcion,
                            ciudad: evento.ciudad,
                            fechaEvento: evento.fechaEvento,
                            horaEvento: evento.horaEvento
                          });
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.1rem',
                          right: '40px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(evento.uniqueId);
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.1rem',
                          right: '10px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                    <div style={{ padding: '1rem', position: 'relative' }}>
                      <p>
                        <strong>Descripción:</strong> {evento.descripcion}
                      </p>
                      {expandedEventoId === evento.uniqueId && (
                        <>
                          <p><strong>Ciudad:</strong> {evento.ciudad}</p>
                          <p><strong>Fecha de Evento:</strong> {evento.fechaEvento}</p>
                          <p><strong>Hora de Evento:</strong> {evento.horaEvento}</p>
                          {evento.pais && <p><strong>País:</strong> {evento.pais}</p>}
                          {evento.direccion && <p><strong>Dirección:</strong> {evento.direccion}</p>}
                          {evento.proposito && <p><strong>Propósito:</strong> {evento.proposito}</p>}
                          {evento.archivoUrl && (
                            <p>
                              <a
                                href={evento.archivoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#8a2be2', textDecoration: 'underline' }}
                              >
                                Ver archivo
                              </a>
                            </p>
                          )}
                          <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            right: '5px',
                            backgroundColor: '#eee',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            fontSize: '0.6rem',
                            color: '#333'
                          }}>
                            {new Date(evento.fechaCreacion.seconds * 1000).toLocaleString()}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No tienes eventos registrados.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-stats" style={{
        backgroundColor: '#1c2833',
        color: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        margin: '1rem 2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem'
      }}>
        <div>
          <h4>{posts.length}</h4>
          <p>Proyectos publicados</p>
        </div>
        <div>
          <h4>{totalLikes}</h4>
          <p>Total de likes</p>
        </div>
        <div>
          <h4>
            {lastActivity
              ? new Date(lastActivity.seconds * 1000).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
              : 'N/A'}
          </h4>
          <p>Última actividad</p>
        </div>
      </div>

      {/* Modal de edición de proyecto */}
      {isEditingPost && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Editar Proyecto</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={editedPost.nombre}
                onChange={handleChangePost}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción:</label>
              <textarea
                name="descripcion"
                value={editedPost.descripcion}
                onChange={handleChangePost}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Herramientas:</label>
              <input
                type="text"
                name="herramientas"
                value={editedPost.herramientas}
                onChange={handleChangePost}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Características:</label>
              <input
                type="text"
                name="fechaFin"
                value={editedPost.fechaFin}
                onChange={handleChangePost}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha de Inicio:</label>
              <input
                type="text"
                name="fechaInicio"
                value={editedPost.fechaInicio || ''}
                onChange={handleChangePost}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha Fin:</label>
              <input
                type="text"
                name="fechaFin"
                value={editedPost.fechaFin}
                onChange={handleChangePost}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setIsEditingPost(null)}
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
                onClick={() => handleEditPost(isEditingPost)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#8a2be2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de evento */}
      {isEditingEvento && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Editar Evento</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={editedEvento.nombre}
                onChange={handleChangeEvento}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción:</label>
              <textarea
                name="descripcion"
                value={editedEvento.descripcion}
                onChange={handleChangeEvento}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ciudad:</label>
              <input
                type="text"
                name="ciudad"
                value={editedEvento.ciudad}
                onChange={handleChangeEvento}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Fecha de Evento:</label>
              <input
                type="text"
                name="fechaEvento"
                value={editedEvento.fechaEvento}
                onChange={handleChangeEvento}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Hora de Evento:</label>
              <input
                type="text"
                name="horaEvento"
                value={editedEvento.horaEvento}
                onChange={handleChangeEvento}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Propósito (opcional):</label>
              <input
                type="text"
                name="proposito"
                value={editedEvento.proposito || ''}
                onChange={handleChangeEvento}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setIsEditingEvento(null)}
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
                onClick={() => handleEditEvento(isEditingEvento)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#8a2be2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="timeline-container" style={{
        backgroundColor: '#1c2833',
        color: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        margin: '1rem 2rem'
      }}>
        <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>Historial de Actividad</h4>
        <div className="timeline" style={{
          position: 'relative',
          marginLeft: '20px'
        }}>
          {activities.length > 0 ? activities.map(activity => (
            <div key={activity.id} className="timeline-item" style={{
              position: 'relative',
              paddingLeft: '20px',
              marginBottom: '1rem'
            }}>
              {/* Línea de la timeline */}
              <div style={{
                position: 'absolute',
                left: '0',
                top: '0',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#8a2be2',
                border: '2px solid #fff'
              }}></div>
              <div style={{ fontSize: '0.9rem' }}>
                <strong>{activity.action}</strong> <em>({activity.type})</em>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                {activity.date
                  ? new Date(activity.date.seconds * 1000).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  : 'Sin fecha'}
              </div>
            </div>
          )) : (
            <p style={{ textAlign: 'center' }}>No hay actividad registrada.</p>
          )}
        </div>
      </div>

      {/* Modal de Seguidores */}
      {showFollowersModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Seguidores</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {followersData.length > 0 ? (
                followersData.map(follower => (
                  <div key={follower.uid}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      borderBottom: '1px solid #ddd',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowFollowersModal(false);
                      navigate(`/perfil/${follower.uid}`);
                    }}>
                    <img
                      src={follower.photoURL || defaultAvatar}
                      alt={follower.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        marginRight: '1rem'
                      }}
                    />
                    <span style={{ fontSize: '1rem', color: '#333' }}>
                      {follower.name}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center' }}>No tienes seguidores.</p>
              )}
            </div>
            <button
              onClick={() => setShowFollowersModal(false)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#8a2be2',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Siguiendo */}
      {showFollowingModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Siguiendo</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {followingData.length > 0 ? (
                followingData.map(person => (
                  <div key={person.uid}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      borderBottom: '1px solid #ddd',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowFollowingModal(false);
                      navigate(`/perfil/${person.uid}`);
                    }}>
                    <img
                      src={person.photoURL || defaultAvatar}
                      alt={person.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        marginRight: '1rem'
                      }}
                    />
                    <span style={{ fontSize: '1rem', color: '#333' }}>
                      {person.name}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center' }}>No sigues a nadie.</p>
              )}
            </div>
            <button
              onClick={() => setShowFollowingModal(false)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#8a2be2',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* Nueva sección de Portafolio Profesional (estilo CV) */}
      {/* ===================================== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card sx={{ margin: '2rem auto', maxWidth: 900, p: 4, borderRadius: '16px', boxShadow: 3, backgroundColor: '#ffffff' }}>
          <CardContent>
            <Typography variant="h4" align="center" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', mb: 4 }}>
              Portafolio Profesional
            </Typography>

            {/* STACK TECNOLÓGICO */}
            <div style={{ marginBottom: '2rem' }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', mb: 2 }}>
                <BiCodeAlt style={{ marginRight: '0.5rem', color: '#1e88e5' }} /> Stack Tecnológico
              </Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {userData?.techStack && userData.techStack.length > 0 ? (
                  userData.techStack.map((tech, idx) => (
                    <span key={idx}
                      style={{
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                      {tech}
                    </span>
                  ))
                ) : (
                  <span style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    JavaScript
                  </span>
                )}
              </div>
            </div>

            {/* EXPERIENCIA PROFESIONAL */}
            <div style={{ marginBottom: '2rem' }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', mb: 2 }}>
                <FaBriefcase style={{ marginRight: '0.5rem', color: '#a855f7' }} /> Experiencia Profesional
              </Typography>
              {userData?.experience && userData.experience.length > 0 ? (
                userData.experience.map((exp, idx) => {
                  // Se asume que cada exp es un objeto con propiedades title, company, start y end
                  const now = new Date();
                  let displayEnd = exp.end;
                  if (exp.end && new Date(exp.end) > now) {
                    displayEnd = "Actualmente";
                  }
                  return (
                    <div key={idx} style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      fontFamily: 'Poppins, sans-serif',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {exp.title} {exp.company && `- ${exp.company}`}
                        </Typography>
                        {exp.description && (
                          <Typography variant="body2">
                            {exp.description}
                          </Typography>
                        )}
                      </div>
                      {(exp.start || exp.end) && (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a855f7' }}>
                          {exp.start} - {displayEnd}
                        </Typography>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Desarrollador Senior
                  </Typography>
                  <Typography variant="body1">
                    Google
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a855f7', textAlign: 'right' }}>
                    Febrero 2022 - Presente
                  </Typography>
                </div>
              )}
            </div>

            {/* EDUCACIÓN */}
            <div style={{ marginBottom: '2rem' }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', mb: 2 }}>
                <FaGraduationCap style={{ marginRight: '0.5rem', color: '#10b981' }} /> Educación
              </Typography>
              {userData?.studies && userData.studies.length > 0 ? (
                userData.studies.map((edu, idx) => {
                  const now = new Date();
                  let displayEnd = edu.end;
                  if (edu.end && new Date(edu.end) > now) {
                    displayEnd = "Actualmente";
                  }
                  return (
                    <div key={idx} style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      fontFamily: 'Poppins, sans-serif',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {edu.title} {edu.institution && `- ${edu.institution}`}
                        </Typography>
                      </div>
                      {(edu.start || edu.end) && (
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a855f7' }}>
                          {edu.start} - {displayEnd}
                        </Typography>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Licenciatura en Informática
                  </Typography>
                  <Typography variant="body1">
                    Universidad de Buenos Aires
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a855f7', textAlign: 'right' }}>
                    2018 - 2022
                  </Typography>
                </div>
              )}
            </div>

            {/* HABILIDADES */}
            <div style={{ marginBottom: '2rem' }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', mb: 2 }}>
                <EditIcon style={{ marginRight: '0.5rem', color: '#1e88e5' }} /> Habilidades
              </Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {userData?.skills && userData.skills.length > 0 ? (
                  userData.skills.map((skill, idx) => (
                    <span key={idx}
                      style={{
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    React
                  </span>
                )}
              </div>
            </div>

            {/* LINKEDIN */}
            <div style={{ marginBottom: '2rem' }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', mb: 2 }}>
                <LinkedInIcon style={{ marginRight: '0.5rem', color: '#0071bc' }} /> LinkedIn
              </Typography>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <TextField
                  value={userData?.linkedin || ''}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    style: { fontSize: '1rem' },
                  }}
                />
                <a
                  href={
                    userData?.linkedin
                      ? userData.linkedin.startsWith('http')
                        ? userData.linkedin
                        : `https://${userData.linkedin}`
                      : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#0077b5',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FontAwesomeIcon icon={faGithub} style={{ marginRight: '0.5rem' }} />
                  Visitar
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Editor de Portafolio */}
      <PortfolioEditor
        open={isEditingPortfolio}
        handleClose={() => setIsEditingPortfolio(false)}
        portfolio={portfolioData}
        setPortfolio={setPortfolioData}
      />

      {/* Botón para editar portafolio si falta información */}

      <IconButton onClick={() => setIsEditingPortfolio(true)} sx={{ float: 'right' }} aria-label="Editar portafolio">
        <EditIcon />
      </IconButton>


      {isEditingPortfolio && (
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Editar Portafolio</h2>

          <div className="mb-6">
            <TextField
              label="Habilidades (separadas por coma)"
              fullWidth
              margin="normal"
              value={portfolioText.skills}
              onChange={(e) => setPortfolioText({ ...portfolioText, skills: e.target.value })}
              InputProps={{ style: { fontSize: '1rem' } }}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center"><FaGraduationCap className="mr-2" /> Educación</h3>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {educationItems.map((edu, idx) => (
                <div key={idx} className="bg-white border border-gray-300 p-4 rounded-lg mb-4 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                    <TextField
                      label="Título"
                      fullWidth
                      margin="normal"
                      value={edu.title}
                      onChange={(e) => handleEduChange(idx, 'title', e.target.value)}
                      InputProps={{ style: { fontSize: '1rem' } }}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Inicio"
                        value={edu.start}
                        onChange={(newValue) => handleEduChange(idx, 'start', newValue)}
                        renderInput={(params) => <TextField {...params} className="sm:w-40" margin="normal" />}
                      />
                      <DatePicker
                        label="Fin"
                        value={edu.end}
                        onChange={(newValue) => handleEduChange(idx, 'end', newValue)}
                        renderInput={(params) => <TextField {...params} className="sm:w-40" margin="normal" />}
                      />
                    </LocalizationProvider>
                  </div>
                  <TextField
                    label="Institución"
                    fullWidth
                    margin="normal"
                    value={edu.institution}
                    onChange={(e) => handleEduChange(idx, 'institution', e.target.value)}
                    InputProps={{ style: { fontSize: '1rem' } }}
                  />
                  <button
                    onClick={() => removeEdu(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                    title="Eliminar educación"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              ))}
            </LocalizationProvider>
            <button
              onClick={addEdu}
              className="mx-auto block text-[#a855f7] border border-dashed border-[#a855f7] bg-[#faf5ff] py-2 px-4 rounded"
            >
              + Añadir educación
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center"><FaBriefcase className="mr-2" /> Experiencia Profesional</h3>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {experienceItems.map((exp, idx) => (
                <div key={idx} className="bg-white border border-gray-300 p-4 rounded-lg mb-4 relative">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                    <TextField
                      label="Cargo"
                      fullWidth
                      margin="normal"
                      value={exp.title}
                      onChange={(e) => handleExpChange(idx, 'title', e.target.value)}
                      InputProps={{ style: { fontSize: '1rem' } }}
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Inicio"
                        value={exp.start}
                        onChange={(newValue) => handleExpChange(idx, 'start', newValue)}
                        renderInput={(params) => <TextField {...params} className="sm:w-40" margin="normal" />}
                      />
                      <DatePicker
                        label="Fin"
                        value={exp.end}
                        onChange={(newValue) => handleExpChange(idx, 'end', newValue)}
                        renderInput={(params) => <TextField {...params} className="sm:w-40" margin="normal" />}
                      />
                    </LocalizationProvider>
                  </div>
                  <TextField
                    label="Empresa"
                    fullWidth
                    margin="normal"
                    value={exp.company}
                    onChange={(e) => handleExpChange(idx, 'company', e.target.value)}
                    InputProps={{ style: { fontSize: '1rem' } }}
                  />
                  <TextField
                    label="Descripción"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    value={exp.description}
                    onChange={(e) => handleExpChange(idx, 'description', e.target.value)}
                    InputProps={{ style: { fontSize: '1rem' } }}
                  />
                  <button
                    onClick={() => removeExp(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                    title="Eliminar experiencia"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              ))}
            </LocalizationProvider>
            <button
              onClick={addExp}
              className="mx-auto block text-[#a855f7] border border-dashed border-[#a855f7] bg-[#faf5ff] py-2 px-4 rounded"
            >
              + Añadir experiencia
            </button>
          </div>

          <div className="mb-6">
            <TextField
              label="LinkedIn"
              fullWidth
              margin="normal"
              value={portfolioText.linkedin}
              onChange={(e) => setPortfolioText({ ...portfolioText, linkedin: e.target.value })}
              InputProps={{ style: { fontSize: '1rem' } }}
            />
          </div>

          <div className="mb-6">
            <TextField
              label="Tech Stack (separadas por coma)"
              fullWidth
              margin="normal"
              value={portfolioText.techStack}
              onChange={(e) => setPortfolioText({ ...portfolioText, techStack: e.target.value })}
              InputProps={{ style: { fontSize: '1rem' } }}
            />
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button variant="contained" color="primary" onClick={handleSavePortfolio}>
              Guardar Cambios
            </Button>
            <Button variant="outlined" onClick={() => setIsEditingPortfolio(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <ReputationSystem posts={posts} userData={userData} />
      <Badges userData={userData} posts={posts} />

      

      {/* Modal de reputación */}
      {isReputationModalOpen && (
        <ReputationModal
          isOpen={isReputationModalOpen}
          onClose={() => setIsReputationModalOpen(false)}
        />
      )}
    </Layout>
  );
};

export default MiPerfil;