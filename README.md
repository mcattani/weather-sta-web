# Weather Station Web

![React](https://img.shields.io/badge/React-19.2.7-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-7952B3?logo=bootstrap)
![Theme](https://img.shields.io/badge/Design-Liquid%20Glass-00B4D8)
![AI Assisted](https://img.shields.io/badge/Design-AI%20Assisted-purple)
![License](https://img.shields.io/badge/License-GPL%203.0-blue)
![Status](https://img.shields.io/badge/Status-En%20construcci%C3%B3n-yellow)

Una web de panel de control para visualizar datos de una estación meteorológica en tiempo real (con datos y sensores conectados a un ESP32 C3 Mini). 

> Este proyecto aún está en construcción. Forma parte de un proyecto más amplio e integral que abarca el hardware físico (un microcontrolador ESP32 C3 Mini y sus sensores meteorológicos). El repositorio correspondiente al código del firmware y circuitos del ESP32 está actualmente en desarrollo y se vinculará a esta documentación próximamente.

## Descripción general

Weather Station Web es una aplicación web construida con React y Vite que muestra información climática y de sensores a partir de dos fuentes principales:

- Firebase Firestore, donde se almacenan los datos recibidos de la estación.
- WeatherAPI, utilizada para complementar la vista con información meteorológica externa como estado del clima, sensación térmica, viento y UV.

El proyecto cuenta con una interfaz moderna basada en la estética **"Liquid Glass"**, adaptable a cualquier resolución de pantalla y optimizada mediante componentes modulares en React.

## Diseño e Inteligencia Artificial

La identidad gráfica y el estilo visual de esta aplicación (denominado **"Liquid Glass"**), que incluye las tarjetas traslúcidas estilo *glassmorphism*, la paleta de colores, la tipografía y las animaciones de fondo, fueron **diseñados y generados con la asistencia de Inteligencia Artificial (IA)**.

## Características actuales

- Interfaz moderna basada en diseño **"Liquid Glass"** con superficies vidriadas traslúcidas.
- Fondo dinámico animado con aceleración por hardware (GPU) adaptado a múltiples resoluciones.
- Componente modular reutilizable (`GlassCard`) para el renderizado consistente de tarjetas métricas.
- Lectura del último dato registrado en tiempo real desde Firestore.
- Indicador visual de estado online/offline de la estación.
- Visualización de métricas de sensores (temperatura, humedad, presión).
- Integración con WeatherAPI para mostrar datos externos como:
  - Estado del clima
  - Sensación térmica
  - Viento y dirección
  - Índice UV
- Manejo de estados de carga y errores.
- Diseño totalmente responsivo para móviles, tablets y monitores multipantalla.

## Tecnologías usadas

- React 19
- Vite
- Bootstrap 5
- React Bootstrap
- Firebase Firestore
- react-bootstrap-icons
- ESLint

## Estructura del proyecto

```text
src/
├── assets/
│   └── glass-theme.css
├── components/
│   └── GlassCard.jsx
├── firebase.js
├── layout/
├── pages/
│   └── Home.jsx
├── App.jsx
└── main.jsx
```

## Instalación local

Requisitos:

- Node.js 18 o superior
- npm

Pasos:

```bash
git clone <tu-repo-url>
cd weather_sta_web
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_PROJECT_ID=tu_project_id
VITE_STORAGE_BUCKET=tu_storage_bucket
VITE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_APP_ID=tu_app_id
VITE_WEATHER_API_KEY=tu_weatherapi_key
```

## Scripts disponibles

```bash
npm run dev
```
Inicia el servidor de desarrollo de Vite.

```bash
npm run build
```
Genera la versión de producción para despliegue.

```bash
npm run lint
```
Ejecuta ESLint para revisar el código.

## Despliegue

Actualmente no hay un despliegue publicado todavía. La idea es publicarlo pronto en Vercel y dejarlo accesible desde un enlace directo.

## Más Información

Para más detalles sobre este proyecto y otros contenidos relacionados, visita:
- The Nerdy Apprentice Blog: https://thenerdyapprentice.blogspot.com/

## Licencia

Este proyecto está licenciado bajo GPL-3.0.
