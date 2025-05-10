// src/context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';

// Crear el contexto
export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Proveedor del contexto
export const ThemeProvider = ({ children }) => {
  // Verificar si hay una preferencia guardada
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme === 'true';
  });

  // Aplicar la clase 'dark-mode' al body cuando cambie el estado
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Función para alternar entre modos
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};