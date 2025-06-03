import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/useAuth';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import '../styles/foro.css';  // Asegúrate de tener este archivo en la ruta indicada

const grupos = [
  {
    nombre: "React",
    descripcion: "Biblioteca JavaScript para interfaces",
    etiquetas: ["Frontend", "JavaScript"],
    icono: "👀​",
    colorEtiquetas: ["purple", "green"],
    miembros: "2.4k",
    temas: 24,
  },
  {
    nombre: "Python",
    descripcion: "Lenguaje de programación versátil",
    etiquetas: ["Backend", "Data"],
    icono: "🐍",
    colorEtiquetas: ["blue", "red"],
    miembros: "1.8k",
    temas: 18,
  },
  {
    nombre: "UX/UI",
    descripcion: "Diseño y experiencia de usuario",
    etiquetas: ["Diseño", "UX"],
    icono: "🎨",
    colorEtiquetas: ["pink", "indigo"],
    miembros: "1.2k",
    temas: 12,
  },
];

const Foro = () => {
  const { user } = useAuth();
  const [misForos, setMisForos] = useState([]);
  const [generalForos, setGeneralForos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDiscussion, setActiveDiscussion] = useState(null);

  // States para formulario de creación
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [etiquetas, setEtiquetas] = useState('');

  useEffect(() => {
    // Suscribirse a la colección 'foros'
    const unsubscribe = onSnapshot(collection(db, 'foros'), (snapshot) => {
      const forums = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Mis Foros: aquellos creados por el usuario autenticado
      const mis = forums.filter((foro) => foro.autorId === user.uid);
      // Foros Generales: aquellos creados por otros usuarios (para evitar duplicados)
      const general = forums.filter((foro) => foro.autorId !== user.uid);
      setMisForos(mis);
      setGeneralForos(general);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      // Convertir las etiquetas en array, separando por comas
      const etiquetasArray = etiquetas.split(',').map(tag => tag.trim()).filter(Boolean);
      const newForo = {
        nombre,
        descripcion,
        etiquetas: etiquetasArray,
        autorId: user.uid,
        creadoEn: serverTimestamp(),
      };
      await addDoc(collection(db, 'foros'), newForo);
      // Limpiar formulario y cerrar modal
      setNombre('');
      setDescripcion('');
      setEtiquetas('');
      setModalOpen(false);
    } catch (error) {
      console.error('Error al crear foro:', error);
    }
  };

  if (loading) return <div className="container mx-auto p-4">Cargando...</div>;

  return (
    <div className="foro-container">
      <div className="foro-inner">
        {/* Título principal */}
        <h1 className="foro-title">
          Grupos de interés
        </h1>

        {/* Grid de tarjetas */}
        <div className="foro-grid">
          {grupos.map((grupo, index) => (
            <div key={index} className="foro-card">
              {/* Encabezado */}
              <div className="foro-card-header">
                <div className="foro-icon">
                  <span>{grupo.icono}</span>
                </div>
                <div className="foro-header-text">
                  <h3 className="foro-group-name">
                    {grupo.nombre}
                  </h3>
                  <p className="foro-group-desc">{grupo.descripcion}</p>
                </div>
              </div>

              {/* Etiquetas */}
              <div className="foro-tags">
                {grupo.etiquetas.map((tag, idx) => {
                  let tagClass = "tag-default";
                  if (grupo.colorEtiquetas[idx] === "purple") {
                    tagClass = "tag-purple";
                  } else if (grupo.colorEtiquetas[idx] === "green") {
                    tagClass = "tag-green";
                  } else if (grupo.colorEtiquetas[idx] === "blue") {
                    tagClass = "tag-blue";
                  } else if (grupo.colorEtiquetas[idx] === "red") {
                    tagClass = "tag-red";
                  } else if (grupo.colorEtiquetas[idx] === "pink") {
                    tagClass = "tag-pink";
                  } else if (grupo.colorEtiquetas[idx] === "indigo") {
                    tagClass = "tag-indigo";
                  }
                  return (
                    <span key={idx} className={`foro-tag ${tagClass}`}>
                      {tag}
                    </span>
                  );
                })}
              </div>

              {/* Información adicional */}
              <div className="foro-info">
                <p className="foro-members">{grupo.miembros} miembros</p>
                <p className="foro-topics">{grupo.temas} temas activos</p>
              </div>

              {/* Enlace de acción */}
              <div className="foro-link">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveDiscussion(activeDiscussion === grupo.nombre ? null : grupo.nombre);
                  }}
                  className="discussion-link"
                >
                  Ver discusiones →
                </a>
              </div>

              {/* Sección de discusiones (solo visible si es el grupo activo) */}
              {activeDiscussion === grupo.nombre && (
                <div className="foro-discussion">
                  <h4 className="discussion-title">Discusiones recientes:</h4>
                  <ul className="discussion-list">
                    <li>
                      <Link to={`/foro/discussion/${grupo.nombre}-1`}>
                        Tema 1: Introducción a {grupo.nombre}
                      </Link>
                    </li>
                    <li>
                      <Link to={`/foro/discussion/${grupo.nombre}-2`}>
                        Tema 2: Avances y retos en {grupo.nombre}
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botón "Nueva discusión" */}
        <div className="foro-new-discussion">
          <button className="new-discussion-btn">
            <FaPlus /> <span>+ Nueva discusión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Foro;