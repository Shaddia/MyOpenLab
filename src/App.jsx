import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Páginas que ya tienes
 import Login from './pages/Login';
 import Register from './pages/Register';
 import MiPerfil from './pages/Miperfil';
 import Explorar from './pages/Explorar';

// Importar el PrivateRoute que protegerá las rutas privadas
import PrivateRoute from './components/PrivateRoute';

import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
  
      {/* Configuración de las rutas */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/explorar" element={<Explorar />} />

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
  );
}

export default App;
