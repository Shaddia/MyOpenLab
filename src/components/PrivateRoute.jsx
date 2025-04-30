import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p className="text-center mt-4">Cargando...</p>;

  return usuario ? children : <Navigate to="/login" />;
}
