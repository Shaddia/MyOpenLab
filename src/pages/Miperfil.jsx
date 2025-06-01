import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/useAuth';
import { doc, getDoc, collection, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faCamera } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import defaultAvatar from '../assets/default-avatar.png';

// Función para formatear timestamps
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Sin fecha';
  if (typeof timestamp === 'string') return timestamp;
  if (typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return 'Sin fecha';
};

const MiPerfil = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchPostsAndEventos();
    }
  }, [user]);

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
              color: 'white'
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
              <strong>GitHub</strong> {userData?.github ? (
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
                            fechaFin: post.fechaFin
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
                name="caracteristicas"
                value={editedPost.caracteristicas || ''}
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
    </Layout>
  );
};

export default MiPerfil;