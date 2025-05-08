import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
// Páginas que ya tienes
import Login from './pages/Login';
import MiPerfil from './pages/Miperfil';
import Home from './pages/Home';
import Favoritos from './pages/Favoritos';
import MeGusta from './pages/MeGusta';
// Importar el PrivateRoute que protegerá las rutas privadas
import PrivateRoute from './components/PrivateRoute';

import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Eventos from './pages/Eventos';
import Configuración from './pages/Configuración';


function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthProvider>
      <BrowserRouter>

        {/* Configuración de las rutas */}
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/home" element={<Home />} />
          {/* Ruta privada, solo accesible si el usuario está logueado */}
          <Route
            path="/favoritos"
            element={
              <PrivateRoute>
                <Favoritos />
              </PrivateRoute>
            }
          />
          {/* Ruta privada, solo accesible si el usuario está logueado */}
          <Route
            path="/megusta"
            element={
              <PrivateRoute>
                <MeGusta />
              </PrivateRoute>
            }
          />
          {/* Ruta privada, solo accesible si el usuario está logueado */}
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <MiPerfil />
              </PrivateRoute>
            }
          />
          {/* Ruta privada, solo accesible si el usuario está logueado */}
          <Route
            path="/configuracion"
            element={
              <PrivateRoute>
                <Configuración />
              </PrivateRoute>
            }
          />
          {/* En caso de rutas no definidas, redirige a login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
