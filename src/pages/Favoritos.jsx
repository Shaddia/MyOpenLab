// Favoritos.jsx
import React, { useEffect, useState } from 'react';
import '../styles/home.css';
import { useAuth } from '../context/useAuth';
import { db } from '../services/firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import Layout from './layout';
import { FaHeart, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Favoritos = () => {
  const { user } = useAuth();
  const [favoriteProjects, setFavoriteProjects] = useState([]);
  const [usersData, setUsersData] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'proyectos'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favoritos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(project => project.favorites?.includes(user.uid));
      setFavoriteProjects(favoritos);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = {};
      for (const project of favoriteProjects) {
        if (!data[project.autorId]) {
          const userSnap = await getDoc(doc(db, 'users', project.autorId));
          if (userSnap.exists()) {
            data[project.autorId] = userSnap.data();
          }
        }
      }
      setUsersData(data);
    };

    if (favoriteProjects.length > 0) {
      fetchUsers();
    }
  }, [favoriteProjects]);

  const removeFavorite = async (projectId) => {
    const projectRef = doc(db, 'proyectos', projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
      const projectData = projectSnap.data();
      const updatedFavorites = projectData.favorites?.filter(uid => uid !== user.uid) || [];

      await updateDoc(projectRef, { favorites: updatedFavorites });
    }
  };

  return (
    <Layout>
      <div className="top-bar">
        <h2 className="section-title">Mis Favoritos</h2>
        <div className="underline" />
      </div>

      <div className="posts">
        {favoriteProjects.length === 0 ? (
          <p>Aún no tienes proyectos en favoritos.</p>
        ) : (
          <AnimatePresence>
            {favoriteProjects.map(project => {
              const autor = usersData[project.autorId] || {};
              const postDate = project.fechaPublicacion?.toDate?.() || new Date();
              const formattedDate = postDate.toLocaleDateString();

              return (
                <motion.div
                  key={project.id}
                  className="post-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="post-header">
                    <div className="author-photo">
                      <img src={autor.photoURL || '/default-avatar.png'} alt="Avatar" />
                    </div>
                    <div className="author-details">
                      <h4>{autor.name || project.autorNombre || 'Usuario'}</h4>
                      <p className="post-date">{formattedDate}</p>
                    </div>
                  </div>

                  <div className="post-content">
                    <p><strong>Proyecto:</strong> <strong>{project.nombre}</strong></p>
                    <p>{project.descripcion}</p>
                    <p><strong>Características:</strong> {project.caracteristicas}</p>
                    <p><strong>Herramientas:</strong> {project.herramientas}</p>
                    <p><strong>Desde:</strong> {project.fechaInicio} <strong>Hasta:</strong> {project.fechaFin}</p>
                  </div>

                  <div className="post-action-bar">
                    <div className="reaction-btn">
                      <FaHeart color="purple" size={20} />
                      <span>{project.likes?.length || 0}</span>
                    </div>
                    <div
                      onClick={() => removeFavorite(project.id)}
                      className="reaction-btn"
                      style={{ cursor: 'pointer' }}
                      title="Quitar de favoritos"
                    >
                      <FaStar color="gray" size={20} />
                      <span>{project.favorites?.length || 0}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </Layout>
  );
};

export default Favoritos;
