import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Cambia el puerto si es necesario
  },
  // Elimina la propiedad `define` si no es necesaria
})
