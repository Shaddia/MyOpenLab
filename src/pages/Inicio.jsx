import React from 'react';
import "../styles/inicio.css";
import { useNavigate } from 'react-router-dom';
const Inicio = () => {
    const navigate = useNavigate();

  const handleAnonymousLogin = async () => {
      try {
        await signInAnonymously(auth);
        navigate('/home');
      } catch (error) {
        console.error("Error al ingresar anónimamente", error);
      }
    };
  return (
    <div className="scroll-container">
      <div className="inicio-container">
        <header className="navbar">
          <div className="logo-container">
            <img src="/assets/logo.png" alt="Logo MyOpenLab" className="logo" />
            <span className="nav-title">MyOpenLab</span>
          </div>
          <nav className="nav-menu">
            {/* Se cambiaron los href para hacer scroll hacia las secciones correspondientes */}
            <a href="#caracteristicas">Características</a>
            <a href="#como-funciona">Cómo funciona</a>
             <a href="#testimonios">Testimonios</a>
            <a href="#precios">Precios</a>
            <a href="/login">Iniciar sesión</a>
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
            <a href="/login?mode=register" className="btn-cta">Registrate</a>
            <a 
              href="/home" 
              className="btn-cta secondary" 
              onClick={handleAnonymousLogin}
            >
              Explorar
            </a>
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

        {/* Sección de características */}
        <section className="features-section"id="caracteristicas">
          <h2 className="features-title">
            Todo lo que necesitas para gestionar tus proyectos
          </h2>
          <p className="features-subtitle">
            Diseñado para ayudarte a organizar y compartir tus proyectos de manera eficiente.
          </p>
          <div className="cards-container">
            <div className="card">
              <span className="card-icon">
                <i className="icon-placeholder">➕​</i>
              </span>
              <h3 className="card-title">Crea proyectos personalizados</h3>
              <p className="card-desc">
                Diseña y organiza tus proyectos con todas las herramientas que necesitas para hacerlos únicos.
              </p>
            </div>
            <div className="card">
              <span className="card-icon">
                <i className="icon-placeholder">🔏</i>
              </span>
              <h3 className="card-title">Gestión privada</h3>
              <p className="card-desc">
                Mantén tus proyectos privados y seguros hasta que estés listo para compartirlos con el mundo.
              </p>
            </div>
            <div className="card">
              <span className="card-icon">
                <i className="icon-placeholder">📈</i>
              </span>
              <h3 className="card-title">Comparte públicamente</h3>
              <p className="card-desc">
                Cuando estés listo, comparte tus proyectos con el mundo a través de tu portal personalizado.
              </p>
            </div>
            <div className="card">
              <span className="card-icon">
                <i className="icon-placeholder">📊​</i>
              </span>
              <h3 className="card-title">Análisis y estadísticas</h3>
              <p className="card-desc">
                Obtén información valiosa sobre el rendimiento y la visibilidad de tus proyectos compartidos.
              </p>
            </div>
            <div className="card">
              <span className="card-icon">
                <i className="icon-placeholder">💡</i>
              </span>
              <h3 className="card-title">Innova continuamente</h3>
              <p className="card-desc">
                Encuentra soluciones creativas y evoluciona junto a tu proyecto.
              </p>
            </div>
            <div className="card">
              <span className="card-icon">
                <i className="icon-placeholder">🤝</i>
              </span>
              <h3 className="card-title">Crecimiento profesional</h3>
              <p className="card-desc">
                Conecta con otros profesionales y abre espacio a nuevas oportunidades.
              </p>
            </div>
          </div>
        </section>
        {/* Sección de "Cómo funciona" */}
        <section className="steps-section" id="como-funciona">
          <h2 className="steps-title">Cómo funciona</h2>
          <p className="steps-subtitle">
            Comienza a gestionar tus proyectos en tres simples pasos.
          </p>
          <div className="steps-container">
            <div className="step-card">
              <h3 className="step-title">Crea tu cuenta</h3>
              <p className="step-desc">
                Regístrate en nuestra plataforma y configura tu perfil personalizado en minutos.
              </p>
            </div>
            <div className="step-card">
              <h3 className="step-title">Añade tus proyectos</h3>
              <p className="step-desc">
                Crea y personaliza tus proyectos con toda la información y recursos necesarios.
              </p>
            </div>
            <div className="step-card">
              <h3 className="step-title">Comparte con el mundo</h3>
              <p className="step-desc">
                Decide qué proyectos compartir públicamente a través de tu portal personalizado.
              </p>
            </div>
          </div>
        </section>
        {/* Sección de testimonios */}
        <section className="testimonials-section"id="testimonios">
          <h2 className="testimonials-title">Lo que dicen nuestros usuarios</h2>
          <p className="testimonials-subtitle">
            Descubre cómo MyOpenLab ha ayudado a profesionales a gestionar sus proyectos.
          </p>
          <div className="testimonials-container">
            <div className="testimonial-card">
              <div className="testimonial-initials">AM</div>
              <h3 className="testimonial-name">Ana Martínez</h3>
              <h4 className="testimonial-role">Diseñadora Gráfica</h4>
              <p className="testimonial-text">
                “MyOpenLab me ha permitido organizar todos mis proyectos de diseño y compartirlos con mis clientes de manera profesional. ¡Una herramienta indispensable!”
              </p>
              <p className="testimonial-rating">⭐⭐⭐⭐⭐</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-initials">CR</div>
              <h3 className="testimonial-name">Carlos Rodríguez</h3>
              <h4 className="testimonial-role">Desarrollador Web</h4>
              <p className="testimonial-text">
                “La plataforma me ha ayudado a mostrar mi portafolio de manera profesional. Los clientes pueden ver mi trabajo y contactarme directamente. Muy recomendable.”
              </p>
              <p className="testimonial-rating">⭐⭐⭐⭐⭐</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-initials">LG</div>
              <h3 className="testimonial-name">Laura González</h3>
              <h4 className="testimonial-role">Fotógrafa</h4>
              <p className="testimonial-text">
                “Como fotógrafa, necesitaba un lugar para organizar mis sesiones y compartir galerías con mis clientes. ProjectHub ha sido la solución perfecta para mi negocio.”
              </p>
              <p className="testimonial-rating">⭐⭐⭐⭐⭐</p>
            </div>
          </div>
        </section>
        {/* Sección de Planes */}
        <section className="plans-section"id="precios">
          <h2 className="plans-title">Planes para cada necesidad</h2>
          <p className="plans-subtitle">Elige el plan que mejor se adapte a tus necesidades.</p>
          <div className="plans-container">
            <div className="plan-card">
              <h3 className="plan-name">Básico</h3>
              <p className="plan-desc">Perfecto para principiantes y proyectos personales.</p>
              <p className="plan-price">Gratis</p>
              <ul className="plan-benefits">
                <li>✓ Hasta 5 proyectos</li>
                <li>✓ Portal personalizado básico</li>
                <li>✓ Almacenamiento: 500MB</li>
                <li>✓ Soporte por email</li>
              </ul>
              <a href="/signup" className="btn-cta plan-btn">Comenzar gratis</a>
            </div>
            <div className="plan-card">
              <h3 className="plan-name">Profesional</h3>
              <p className="plan-desc">Ideal para profesionales y pequeños equipos.</p>
              <p className="plan-price">$9.99 /mes</p>
              <ul className="plan-benefits">
                <li>✓ Hasta 20 proyectos</li>
                <li>✓ Portal personalizado avanzado</li>
                <li>✓ Almacenamiento: 5GB</li>
                <li>✓ Colaboración con 3 usuarios</li>
                <li>✓ Estadísticas avanzadas</li>
                <li>✓ Soporte prioritario</li>
              </ul>
              <a href="/signup" className="btn-cta plan-btn">Comenzar prueba gratuita</a>
            </div>
            <div className="plan-card">
              <h3 className="plan-name">Empresarial</h3>
              <p className="plan-desc">Para equipos y empresas con necesidades avanzadas.</p>
              <p className="plan-price">$24.99 /mes</p>
              <ul className="plan-benefits">
                <li>✓ Proyectos ilimitados</li>
                <li>✓ Portal personalizado premium</li>
                <li>✓ Almacenamiento: 50GB</li>
                <li>✓ Colaboración ilimitada</li>
                <li>✓ API de integración</li>
                <li>✓ Soporte 24/7</li>
              </ul>
              <a href="/contact" className="btn-cta plan-btn">Contactar ventas</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inicio;