// src/components/Layout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/home.css';
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
  faBell // Importa el icono de notificaciones
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../context/LanguageContext';

const layoutTranslations = {
  es: {
    logo: "MiOpenLab",
    explorar: "Explorar",
    eventos: "Eventos",
    miPerfil: "Mi perfil",
    configuracion: "Configuración",
    meGusta: "Me gusta",
    favoritos: "Favoritos",
    cerrarSesion: "Cerrar sesión"
  },
  en: {
    logo: "MyOpenLab",
    explorar: "Explore",
    eventos: "Events",
    miPerfil: "My Profile",
    configuracion: "Settings",
    meGusta: "Likes",
    favoritos: "Favorites",
    cerrarSesion: "Logout"
  }
};

const Layout = ({ children, pageTitle }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const texts = layoutTranslations[language];

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

            <button
              onClick={handleLogout}
              className="logout-button"
            >
              <FontAwesomeIcon icon={faRightFromBracket} /> {texts.cerrarSesion}
            </button>
          </div>
        </nav>
      </aside>

      <main className="main-content" style={{ position: 'relative' }}>
        {/* Encabezado de página con título y notificaciones */}
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
          <Link to="/notificaciones" style={{ color: '#7e22ce' }}>
            <FontAwesomeIcon icon={faBell} style={{ fontSize: '1.2rem', verticalAlign: 'middle' }} />
          </Link>

        </div>
        {/* Línea horizontal morada para Notificaciones */}
        {pageTitle === "Notificaciones" && (
          <div style={{ backgroundColor: '#7e22ce', height: '1px', width: '100vw' }}></div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;