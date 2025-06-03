import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAward, faMedal, faStar } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@mui/material';

const Badges = ({ userData, posts }) => {
  const badges = [];

  // Badge: Primer Proyecto
  if (posts.length === 1) {
    badges.push({
      icon: faAward,
      label: 'Primer Proyecto',
      description: 'Creaste tu primer proyecto.'
    });
  }
  // Badge: 10 seguidores
  if (userData?.followers && userData.followers.length >= 10) {
    badges.push({
      icon: faMedal,
      label: '10 Seguidores',
      description: 'Has alcanzado 10 seguidores.'
    });
  }
  // Badge: Proyecto Destacado del Mes (suponiendo que en cada proyecto exista la propiedad "destacado")
  if (posts.some(post => post.destacado)) {
    badges.push({
      icon: faStar,
      label: 'Proyecto Destacado',
      description: 'Tienes un proyecto destacado este mes.'
    });
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex gap-4 justify-center">
      {badges.map((badge, idx) => (
        <Tooltip key={idx} title={badge.description} arrow>
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={badge.icon} size="2x" className="text-indigo-600" />
            <span className="mt-1 text-sm font-medium">{badge.label}</span>
          </div>
        </Tooltip>
      ))}
    </div>
  );
};

export default Badges;