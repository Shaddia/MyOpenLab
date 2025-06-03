import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';

const Ranking = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      // Se asume que cada usuario tiene un campo "reputation" actualizado
      const q = query(collection(db, 'users'), orderBy('reputation', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setRanking(users);
    };

    fetchRanking();
  }, []);

  const getMedalColor = (idx) => {
    if (idx === 0) return 'bg-yellow-400';
    if (idx === 1) return 'bg-gray-400';
    if (idx === 2) return 'bg-orange-400';
    return '';
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-center mb-4">Ranking de Usuarios</h3>
      <table className="min-w-full text-center">
        <thead>
          <tr>
            <th className="px-4 py-2">Posición</th>
            <th className="px-4 py-2">Avatar</th>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((user, idx) => (
            <tr key={user.uid} className="border-b">
              <td className={`px-4 py-2 font-bold ${getMedalColor(idx)}`}>
                {idx + 1}
              </td>
              <td className="px-4 py-2">
                <img
                  src={user.photoURL || '/default-avatar.png'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full mx-auto"
                />
              </td>
              <td className="px-4 py-2">{user.name || 'Sin nombre'}</td>
              <td className="px-4 py-2 font-semibold">{user.reputation || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Ranking;