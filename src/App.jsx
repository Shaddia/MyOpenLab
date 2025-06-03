import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import MiPerfil from './pages/Miperfil';
import Home from './pages/Home';
import Favoritos from './pages/Favoritos';
import Foro from './pages/Foro';
import MeGusta from './pages/MeGusta';
import PrivateRoute from './components/PrivateRoute';
import './styles/dark-mode.css';
import Eventos from './pages/Eventos';
import Configuración from './pages/Configuración';
import Amigos from './pages/Amigos';
import Notificaciones from './pages/Notificaciones';

function App() {
  const [count, setCount] = useState(0);

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Inicio />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/favoritos"
              element={
                <PrivateRoute>
                  <Favoritos />
                </PrivateRoute>
              }
            />
            <Route
              path="/megusta"
              element={
                <PrivateRoute>
                  <MeGusta />
                </PrivateRoute>
              }
            />
            <Route
              path="/foro"
              element={
                <PrivateRoute>
                  <Foro />
                </PrivateRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <MiPerfil />
                </PrivateRoute>
              }
            />
            <Route
              path="/configuracion"
              element={
                <PrivateRoute>
                  <Configuración />
                </PrivateRoute>
              }
            />
            <Route
              path="/amigos"
              element={
                <PrivateRoute>
                  <Amigos />
                </PrivateRoute>
              }
            />
            <Route
              path="/notificaciones"
              element={
                <PrivateRoute>
                  <Notificaciones />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;