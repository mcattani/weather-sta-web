# Weather Station Web

![React](https://img.shields.io/badge/React-19.2.7-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-7952B3?logo=bootstrap)
![License](https://img.shields.io/badge/License-GPL%203.0-blue)
![Status](https://img.shields.io/badge/Status-En%20construcci%C3%B3n-yellow)

Una web de panel de control para visualizar datos de una estación meteorológica en tiempo real (con datos y sensores conectados a un ESP32 C3 Mini). 

> Este proyecto aún está en construcción

## Descripción general

Weather Station Web es una aplicación web construida con React y Vite que muestra información climática y de sensores a partir de dos fuentes principales:

- Firebase Firestore, donde se almacenan los datos recibidos de la estación.
- WeatherAPI, utilizada para complementar la vista con información meteorológica externa como estado del clima, sensación térmica, viento y UV.

La idea es convertirlo en un dashboard limpio, moderno y responsivo.

## Características actuales

- Panel principal con diseño responsivo.
- Lectura del último dato registrado desde Firestore.
- Mostrar estado de la estación según la disponibilidad de datos.
- Visualización de métricas como temperatura, humedad y presión.
- Integración con WeatherAPI para mostrar datos externos como:
  - estado del clima
  - sensación térmica
  - viento
  - índice UV
- Manejo de estados de carga y errores.
- Diseño pensado para verse bien en móvil y escritorio.

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
- 🔗 [The Nerdy Apprentice Blog](https://thenerdyapprentice.blogspot.com/)

## Licencia

Este proyecto está licenciado bajo GPL-3.0.


