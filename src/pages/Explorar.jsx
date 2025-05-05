// src/pages/Explorar.jsx
import React from 'react';
import { useAuth } from '../context/useAuth';

const Explorar = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Página de Exploración</h2>
      {user ? (
        <p>Bienvenido, {user.nombre || 'usuario'} 👋 ¡Explora el contenido disponible!</p>
      ) : (
        <p>Estás viendo contenido público. Inicia sesión para más funciones.</p>
      )}

      <div style={{ marginTop: '1rem' }}>
        <ul>
          <li>✅ Proyecto 1 - Introducción a React</li>
          <li>✅ Proyecto 2 - Aplicación con Rutas</li>
          <li>✅ Proyecto 3 - Autenticación con Context</li>
          <li>✅ Proyecto 4 - CRUD con Firebase (próximamente)</li>
        </ul>
      </div>
    </div>
  );
};

export default Explorar;
