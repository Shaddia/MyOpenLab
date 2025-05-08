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
} from '@fortawesome/free-solid-svg-icons';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    // Clear any authentication tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // You can clear any other auth data you might have stored
    
    // Redirect to login page
    navigate('/login', { replace: true });
    
    // Force a page reload if navigation doesn't work
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <div className="home-container">
      <aside className="sidebar">
        <h1 className="logo-box">MiOpenLab</h1>

        <nav className="nav-links">
          <Link to="/home"><FontAwesomeIcon icon={faCompass} /> Explorar</Link>
          <Link to="/eventos"><FontAwesomeIcon icon={faCalendarTimes} /> Eventos</Link>
          <Link to="/perfil"><FontAwesomeIcon icon={faUser} /> Mi perfil</Link>
          <Link to="/configuracion"><FontAwesomeIcon icon={faGear} /> Configuración</Link>

          <hr className="divider" />

          <div className="account-section">
            <Link to="/megusta"><FontAwesomeIcon icon={faHeart} /> Me gusta</Link>
            <Link to="/favoritos"><FontAwesomeIcon icon={faStar} /> Favoritos</Link>

            <hr className="divider" />

            <button 
              onClick={handleLogout} 
              className="logout-button"
            >
              <FontAwesomeIcon icon={faRightFromBracket} /> Cerrar sesión
            </button>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;