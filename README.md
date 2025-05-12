<!-- 

# MyOpenLab - Aplicación Web con React + Vite + Firebase

MyOpenLab es una aplicación web moderna construida con React y Vite, que permite a los usuarios autenticarse, gestionar su perfil, y explorar diversas secciones personalizadas. Esta aplicación se conecta a Firebase para autenticar usuarios y almacenar información en una base de datos Firestore en tiempo real. Ofrece una arquitectura modular, buenas prácticas con Context API, rutas protegidas y soporte multilenguaje.

---

## 🛠️ Tecnologías utilizadas

- **React**: Librería principal para construir interfaces de usuario.
- **Vite**: Herramienta de desarrollo rápida para proyectos con React.
- **Firebase Authentication**: Autenticación de usuarios con correo y contraseña.
- **Cloud Firestore**: Base de datos NoSQL en tiempo real usada como backend.
- **React Router DOM**: Enrutamiento entre las diferentes páginas de la aplicación.
- **Context API**: Manejo del estado global para autenticación e idioma.
- **React Icons**: Para mejorar la experiencia visual mediante íconos.

---

## 📁 Estructura del proyecto

MyOpenLab/
├── public/
├── src/
│ ├── assets/ → Archivos gráficos y logotipos
│ ├── components/ → Componentes reutilizables
│ │ ├── layout/ → Barra de navegación y estructura visual
│ │ └── shared/ → Botón de cambio de tema (modo oscuro)
│ ├── context/ → Contextos globales de autenticación e idioma
│ ├── pages/ → Páginas principales de la app
│ ├── services/ → Funciones relacionadas con Firebase
│ ├── utils/ → Traducciones y funciones auxiliares
│ ├── App.jsx → Componente raíz con configuración de rutas
│ ├── main.jsx → Punto de entrada de React
├── .env → Variables de entorno (configuración de Firebase)
├── tailwind.config.js → Configuración de Tailwind (si está en uso)
├── vite.config.js → Configuración de Vite
├── package.json
└── README.txt → Este archivo


---

Instalación y ejecución local
1. Clonar el repositorio
```bash
git clone https://github.com/Shaddia/MyOpenLab.git
cd MyOpenLab
1. Instalar dependencias
npm install

 Configurar Firebase
Ve a Firebase Console y crea un nuevo proyecto.
Habilita Authentication > Email/Password.
Activa Firestore Database en modo de prueba.
Ve a "Configuración del proyecto" y copia los datos de tu aplicación web.
Crea un archivo .env en la raíz del proyecto con la siguiente estructura:
 VITE_API_KEY=tu_api_key
 VITE_AUTH_DOMAIN=tu_auth_domain
 VITE_PROJECT_ID=tu_project_id
 VITE_STORAGE_BUCKET=tu_storage_bucket
 VITE_MESSAGING_SENDER_ID=tu_sender_id
 VITE_APP_ID=tu_app_id

 Ejecución en entorno de desarrollo
npm run dev
Esto abrirá la app en http://localhost:5173.

 Funcionalidades principales
✅ Autenticación segura con Firebase
✅ Rutas protegidas mediante PrivateRoute
✅ Modo oscuro (si se activa mediante el ThemeToggle)
✅ Gestión del estado global de usuario e idioma con Context API
✅ Multilenguaje (ES/EN) mediante archivos de traducción
✅ Perfil del usuario con tarjetas expandibles individualmente
✅ Secciones:

Inicio (/home)

Perfil (/perfil)

Favoritos (/favoritos)

Me gusta (/megusta)

Amigos (/amigos)

Notificaciones (/notificaciones)

Configuración (/configuracion)

Login (/login)

📡 Integración con Firebase
Se utiliza Firebase para dos propósitos:

Autenticación: El login y logout del usuario está controlado por Firebase Auth. El contexto AuthContext.jsx gestiona esta lógica y expone el usuario a toda la app.

Base de datos Firestore: La app puede guardar y consultar datos por UID del usuario (por ejemplo, proyectos favoritos, me gusta, etc.).

⚙️ La lógica de Firebase se encuentra centralizada en services/firebase.js.

📦 Construcción para producción
npm run build

Genera la carpeta dist/ lista para desplegar.

🚀 Despliegue (ej. en Firebase Hosting)
npm install -g firebase-tools
firebase login
firebase init
# Selecciona "Hosting", usa la carpeta `dist` como carpeta de build
firebase deploy

👤 Autor
Shaddia
GitHub: https://github.com/Shaddia

📄 Licencia
Este proyecto está licenciado bajo MIT. Eres libre de usarlo, modificarlo y distribuirlo.  

DEPLOY: https://mi-openlab.web.app
-->