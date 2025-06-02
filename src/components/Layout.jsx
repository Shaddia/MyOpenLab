// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/home.css';
import '../styles/dark-mode.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faCompass,
  faUser,
  faGear,
  faUserCircle,
  faHeart,
  faStar,
  faRightFromBracket,
  faCalendar,
  faCalendarTimes,
  faUserFriends,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../context/LanguageContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/useAuth';
const layoutTranslations = {
  es: {
    logo: "MiOpenLab",
    explorar: "Explorar",
    eventos: "Eventos",
    miPerfil: "Mi perfil",
    configuracion: "Configuración",
    meGusta: "Me gusta",
    favoritos: "Favoritos",
    cerrarSesion: "Cerrar sesión",
    darkModeOn: "Modo Oscuro",
    darkModeOff: "Modo Claro"
  },
  en: {
    logo: "MyOpenLab",
    explorar: "Explore",
    eventos: "Events",
    miPerfil: "My Profile",
    configuracion: "Settings",
    meGusta: "Likes",
    favoritos: "Favorites",
    cerrarSesion: "Logout",
    darkModeOn: "Dark Mode",
    darkModeOff: "Light Mode"
  }
};

const Layout = ({ children, pageTitle }) => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const texts = layoutTranslations[language];
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // Nuevo estado para la búsqueda

  // Inicializa darkMode leyendo de localStorage (si no existe, false)
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notificaciones'),
      where('to', '==', user.uid),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <div className="home-container">
      <aside className="sidebar">
        <h1 className="logo-box">{texts.logo}</h1>
        <nav className="nav-links">
          <Link to="/home"><FontAwesomeIcon icon={faCompass} /> {texts.explorar}</Link>
          <Link to="/eventos"><FontAwesomeIcon icon={faCalendarTimes} /> {texts.eventos}</Link>
          <Link to="/perfil"><FontAwesomeIcon icon={faUser} /> {texts.miPerfil}</Link>
          <Link to="/amigos"> <FontAwesomeIcon icon={faUserFriends} /> Amigos</Link>
          <Link to="/configuracion"><FontAwesomeIcon icon={faGear} /> {texts.configuracion}</Link>
          <hr className="divider" />
          <div className="account-section">
            <Link to="/megusta"><FontAwesomeIcon icon={faHeart} /> {texts.meGusta}</Link>
            <Link to="/favoritos"><FontAwesomeIcon icon={faStar} /> {texts.favoritos}</Link>
            <hr className="divider" />
            <button onClick={handleLogout} className="logout-button">
              <FontAwesomeIcon icon={faRightFromBracket} /> {texts.cerrarSesion}
            </button>
          </div>
        </nav>
      </aside>
      <main className="main-content" style={{ position: 'relative' }}>
        {/* Encabezado de página con título, búsqueda, notificaciones y modo oscuro */}
        <div
          className="page-top-bar border-b border-purple-500 p-4"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: pageTitle === "Notificaciones" ? 'flex-start' : 'space-between'
          }}
        >
          <h2 className="section-title" style={{ margin: 0 }}>
            {pageTitle}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Barra de búsqueda */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #ccc',
              borderRadius: '20px',
              padding: '0.4rem 0.8rem',
              marginRight: '1rem'
            }}>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => {
                  console.log("Nuevo searchQuery:", e.target.value);
                  setSearchQuery(e.target.value);
                }}
                style={{ border: 'none', outline: 'none' }}
              />
            </div>
            {pageTitle !== "Notificaciones" && (
              <Link to="/notificaciones" style={{
                color: '#7e22ce',
                position: 'relative',
                marginRight: '1rem'
              }}>
                <FontAwesomeIcon icon={faBell} style={{ fontSize: '1.2rem', verticalAlign: 'middle' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-10px',
                    background: '#ff0000',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '0 6px',
                    fontSize: '0.7rem'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={toggleDarkMode} 
              style={{ marginRight: '1rem', padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              {darkMode ? '🌕' : '🌛'}
            </button>
          </div>
        </div>
        {pageTitle === "Notificaciones" && (
          <div style={{ backgroundColor: '#7e22ce', height: '1px', width: '100vw' }}></div>
        )}
        
        {
  React.Children.map(children, child => {
    if (
      React.isValidElement(child) &&
      // Verifica tanto displayName como name por si acaso
      (child.type.displayName === "home" || child.type.name === "home")
    ) {
      return React.cloneElement(child, { searchQuery: searchQuery || "" });
    }
    return child;
  })
}
      </main>
    </div>
  );
};

export default Layout;