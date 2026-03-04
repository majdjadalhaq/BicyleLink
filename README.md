# BiCycleL - Premium Second-Hand Bike Marketplace

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)

This is a premium community-driven marketplace for high-quality second-hand bikes in the Netherlands. Built with the **MERN stack**, this project features dynamic search, realtime web-socket messaging, complex security middleware, and a responsive glassmorphism UI.

> This is the final project for the HackYourFuture curriculum we did as a cohort using the agile methodology with our team and a group of mentors.

[Live Demo](https://bicyclel.nl)

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

### 2.1 Client structure

- `public` || public facing client code
- `src/__tests__` || any `jest` tests for specific components will be in a `__tests__` folder on the same level
- `src/components` || all of our shared components that are used over multiple pages
- `src/hooks` || all of our custom hooks
- `src/pages` || the page components of our app, any routing will go between these components
- `src/utils` || any utility functions that can be used anywhere on the client side
- `src/main.jsx` || the start point of the client
- `vite.config.js` || to configure vite

### 2.2 Server structure

- `src/__tests__` || any `jest` tests for the api endpoints as that is our testing strategy for the backend
- `src/controllers` || all of our controller functions that interact with the database
- `src/db` || all of our configuration for the database
- `src/models` || all of our `mongoose` models will be placed here
- `src/routes` || code to match up the API with our controllers
- `src/socket` || Secure Socket.IO handlers
- `src/utils` || any utility functions that can be used anywhere on the server side
- `src/app.js` || the start point of the server

## 3. Tech Stack

### Core

- **MongoDB + [mongoose](https://mongoosejs.com/)** || Document store and ODM to add schemas to our database.
- **Express.js & Node.js** || Backend router and runtime.
- **React + [vite](https://vite.dev/)** || Frontend rendering and blazing-fast bundling to create a static app to host.
- **TailwindCSS** || Utility-first styling with complex pseudo-selector integrations.
- **[cors](https://github.com/expressjs/cors#readme)** || To open up our API.
- **[dotenv](https://www.npmjs.com/package/dotenv)** || To load the .env variables into the process environment.

### Security & Realtime

- **Socket.IO** || WebSockets with JWT middleware.
- **jsonwebtoken** || Stateless secure authentication.
- **express-rate-limit** || Burst traffic protection.
- **bcryptjs** || Password hashing.

### Testing & Infrastructure

- **[Cypress](https://www.cypress.io/) & [jest](https://jestjs.io/)** || End-to-End coverage and component mocking, used to run our tests and coverage.
- **[Husky](https://typicode.github.io/husky/#/)** || To run our tests and linter before committing.
- **[eslint](https://eslint.org/)** || To check our code across different configurations for frontend and backend.
- **[prettier](https://prettier.io/)** || To automatically format our code.
- **[concurrently](https://github.com/open-cli-tools/concurrently#readme)** || To run commands in parallel.
- **[mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server)** || To mock out our database in our backend tests.

## 4. Deployment

Deploy the `main` branch to any static host (Vercel, Netlify) for the Frontend build `./client/dist`, and the backend environment inside Heroku or Render pointing towards a hosted MongoDB Atlas cluster. Ensure production environment variables match the `.env` structures.
