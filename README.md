# BiCycleL - Premium Second-Hand Bike Marketplace

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)

This is a premium community-driven marketplace for high-quality second-hand bikes in the Netherlands. Built with the **MERN stack**, this project features dynamic search, realtime web-socket messaging, complex security middleware, and a responsive glassmorphism UI.

`[Live Demo](TODO: add link)`

## 🚀 Features

- **Real-time Chat**: Connects buyers and sellers instantly via Socket.IO with secure JWT validation.
- **Dynamic Search & Filtering**: Advanced geographical distance filtering, $text MongoDB keyword scoring, and fluid dual-range sliders.
- **Robust Security**: NoSQL Injection protections, global rate-limiters, and comprehensive REST Middlewares.
- **Responsive UI**: Sticky navigation layout mapped gracefully to both mobile bottom-bars and desktop sidebars.

## 1. Setup

First, to setup all the directories run the following in the main directory:

```sh
npm install
npm run setup
```

The first command will install dependencies and test libraries. The second will install both `client` and `server` directories.

In the `client` and `server` directory there are two `.env.example` files. Create a copy and rename them to `.env`. Fill in the required credentials (MongoDB, JWT keys, etc.).

To run the app in dev mode, run the following command in the root directory:

```sh
npm run dev
```

## 2. Code structure

```
client/
├── public/                 # Static assets (favicons, manifests)
└── src/
    ├── __tests__/          # Jest tests
    ├── components/         # Reusable UI elements (Nav, Sliders, Cards, etc.)
    ├── hooks/              # Custom reactive hooks (useUnreadCount, useSocket)
    ├── pages/              # Route-level components
    ├── utils/              # Client-side helpers and design constants
    ├── index.css           # Global Tailwind imports & CSS Layout Definitions
    └── main.jsx            # React root mount

server/
└── src/
    ├── __tests__/          # Backend test suites
    ├── controllers/        # Request handlers (Listings, Auth, Admin)
    ├── db/                 # MongoDB Atlas initializers
    ├── models/             # Mongoose schemas with indexing
    ├── routes/             # Express API endpoints
    ├── socket/             # Secure Socket.IO handlers
    ├── utils/              # Security and formatting helpers
    └── app.js              # Express app initialization
```

## 3. Tech Stack

### Core

- **MongoDB + Mongoose** || Document store and ODM.
- **Express.js & Node.js** || Backend router and runtime.
- **React + Vite** || Frontend rendering and blazing-fast bundling.
- **TailwindCSS** || Utility-first styling with complex pseudo-selector integrations.

### Security & Realtime

- **Socket.IO** || WebSockets with JWT middleware.
- **jsonwebtoken** || Stateless secure authentication.
- **express-rate-limit** || Burst traffic protection.
- **bcryptjs** || Password hashing.

### Testing & Infrastructure

- **Cypress & Jest** || End-to-End coverage and component mocking.
- **Husky + ESLint + Prettier** || Pre-commit Code Quality formatting.

## 4. Deployment

Deploy the `main` branch to any static host (Vercel, Netlify) for the Frontend build `./client/dist`, and the backend environment inside Heroku or Render pointing towards a hosted MongoDB Atlas cluster. Ensure production environment variables match the `.env` structures.
