import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
// Páginas que ya tienes
import Login from './pages/Login';
import MiPerfil from './pages/Miperfil';
import Home from './pages/Home';
import Explorar from './pages/Explorar';
import Favoritos from './pages/Favoritos';
import MeGusta from './pages/MeGusta';
// Importar el PrivateRoute que protegerá las rutas privadas
import PrivateRoute from './components/PrivateRoute';

import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';


function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthProvider>
      <BrowserRouter>

        {/* Configuración de las rutas */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/explorar" element={<Explorar />} />

          {/* Ruta privada, solo accesible si el usuario está logueado */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
