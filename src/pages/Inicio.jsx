import React from 'react';
import "../styles/inicio.css";

const Inicio = () => {
  return (
    <div className="inicio-container">
      <header className="navbar">
        <div className="logo-container">
          <img src="/assets/logo.png" alt="Logo MyOpenLab" className="logo" />
          <span className="nav-title">MyOpenLab</span>
        </div>
        <nav className="nav-menu">
          <a href="/Caracteristicas">Caracteristicas</a>
          <a href="/funcionalidad">Cómo funciona</a>
          <a href="/precios">Precios</a>
          <a href="/precios">Iniciar sesión</a>
        </nav>
      </header>

      <section className="hero-section">
        {/* Onda gigante en la parte superior */}
        <div className="wave-container">
          <svg className="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            {/* Primera onda */}
            <path fill="#8a2be2" fillOpacity="1" d="M0,128 C150,200,350,50,500,90 C650,130,850,180,1000,110 C1150,40,1300,130,1440,128 V320 H0 Z"></path>
            {/* Segunda onda */}
            <path fill="#8a2be2" fillOpacity="1" d="M0,160 C200,100,600,220,1440,100 V320 H0 Z"></path>
            {/* Tercera onda */}
            <path fill="#8a2be2" fillOpacity="0.5" d="M0,200 C300,250,900,50,1440,110 V300 H0 Z"></path>
          </svg>
        </div>

        {/* Contenedor izquierdo: información actual */}
        <div className="hero-content">
          <h1 className="title">Gestiona y comparte tus proyectos en un solo lugar</h1>
          <p className="subtitle">
            Crea tu propio espacio personalizado para organizar, gestionar y compartir tus proyectos con el mundo.
          </p>
          <a href="/login" className="btn-cta">Registrate</a>
          <a href="/explorar" className="btn-cta secondary">Explorar</a>
        </div>

        {/* Contenedor derecho: Tarjeta de usuario y proyectos */}
        <div className="hero-right">
          <div className="profile-header">
            <h2 className="profile-name">Juan Perez</h2>
            <span className="profile-status">Activo</span>
          </div>
          <p className="profile-desc">Mi portal de proyectos</p>
          <div className="squares-container">
            <div className="square">
              <div className="project-title">Diseño Web</div>
              <div 
                className="project-status" 
                style={{ backgroundColor: "#E6D6F9" }}
              >
                En progreso
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: "60%", backgroundColor: "#8a2be2" }}
                ></div>
              </div>
            </div>
            <div className="square">
              <div className="project-title">App Móvil</div>
              <div 
                className="project-status" 
                style={{ backgroundColor: "#F0E5FF" }}
              >
                Planificación
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: "30%", backgroundColor: "#A259FF" }}
                ></div>
              </div>
            </div>
            <div className="square">
              <div className="project-title">SEO</div>
              <div 
                className="project-status" 
                style={{ backgroundColor: "#C7F3D0" }}
              >
                Completado
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: "100%", backgroundColor: "#28a745" }}
                ></div>
              </div>
            </div>
            <div className="square">
              <div className="project-title">Marketing</div>
              <div 
                className="project-status" 
                style={{ backgroundColor: "#E6D6F9" }}
              >
                En progreso
              </div>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: "50%", backgroundColor: "#8a2be2" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nueva sección: tarjeta informativa debajo del fondo morado */}
      <section className="features-section">
        <h2 className="features-title">
          Todo lo que necesitas para gestionar tus proyectos
        </h2>
        <p className="features-subtitle">
          Diseñado para ayudarte a organizar y compartir tus proyectos de manera eficiente.
        </p>
        <div className="cards-container">
          <div className="card">
            <span className="card-icon">
              <i className="icon-placeholder">🔧</i>
            </span>
            <h3 className="card-title">Crea proyectos personalizados</h3>
            <p className="card-desc">
              Diseña tu espacio y estructura tus ideas de forma única.
            </p>
          </div>
          <div className="card">
            <span className="card-icon">
              <i className="icon-placeholder">📈</i>
            </span>
            <h3 className="card-title">Organiza y comparte</h3>
            <p className="card-desc">
              Integra herramientas colaborativas y mantén a tu equipo al día.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Inicio;