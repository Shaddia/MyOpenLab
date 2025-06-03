import React from 'react';

const ReputationSystem = ({ posts, userData }) => {
  // Ejemplo de cálculo: sumar 5 puntos por cada like en proyectos
  const pointsFromLikes = posts.reduce((sum, post) => sum + (post.likes ? post.likes.length * 5 : 0), 0);
  // Puedes agregar más reglas (comentarios, compartidos, etc.)
  const totalReputation = pointsFromLikes;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-center">Copyright © 2025 Shaddia Acuña. Todos los derechos reservados.</h3>
    </div>
  );
};

export default ReputationSystem;