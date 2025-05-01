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
} from '@fortawesome/free-solid-svg-icons';

const Layout = ({ children }) => {
  return (
    <div className="home-container">
      <aside className="sidebar">
        <h1 className="logo-box">MiOpenLab</h1>

        <nav className="nav-links">
        <a href="/home"><FontAwesomeIcon icon={faUser} /> Inicio</a>
          <a href="#"><FontAwesomeIcon icon={faCompass} /> Explorar</a>
          <a href="/perfil"><FontAwesomeIcon icon={faUser} /> Mi perfil</a>
          <a href="#"><FontAwesomeIcon icon={faGear} /> Configuración</a>

          <hr className="divider" />

          <div className="account-section">
            <a href="#"><FontAwesomeIcon icon={faHeart} /> Me gusta</a>
            <a href="#"><FontAwesomeIcon icon={faStar} /> Favoritos</a>

            <hr className="divider" />

            <a href="#"><FontAwesomeIcon icon={faRightFromBracket} /> Cerrar sesión</a>
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
