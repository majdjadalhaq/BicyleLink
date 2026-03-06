# BiCycleL Technical Stack

A comprehensive overview of the technologies, libraries, and infrastructure powering the BiCycleL marketplace.

## Core Technologies

| Layer         | Technology            | Icons                                                                                                                                                                                           |
| ------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**  | React 19, Vite 7      | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)               |
| **Backend**   | Node.js 20, Express 5 | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) |
| **Database**  | MongoDB, Mongoose 9   | ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)                                                                                                 |
| **Real-time** | Socket.IO 4           | ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)                                                                                           |

## Client-Side Libraries

- **State Management**: React Context API
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v3
- **Data Fetching**: Native Fetch API with custom `useApi` abstraction
- **Maps & Location**: Leaflet, React Leaflet, OpenStreetMap
- **Utilities**: Date-fns, Lodash, Clsx, Tailwind-merge
- **Media**: React-easy-crop, Recharts, @react-oauth/google

## Server-Side Libraries

- **Authentication**: JSON Web Token (JWT), Bcrypt.js
- **Middleware**: Helmet, CORS, Express Rate Limit
- **Validation**: Express Validator
- **Communication**: Nodemailer, Resend API
- **Logging**: Winston, Morgan

## Development & Tooling

- **Testing**: Jest, React Testing Library, Cypress (E2E)
- **Quality**: ESLint v9, Prettier
- **Git Hooks**: Husky
- **Workflow**: Concurrently, MongoDB Memory Server

## Infrastructure

- **Cloud Hosting**: Heroku (PaaS)
- **Database Hosting**: MongoDB Atlas (DBaaS)
- **Media Storage**: Cloudinary
- **Email Service**: Resend
- **Geocoding**: Nominatim (OpenStreetMap)

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Database Schema](./DATABASE.md)
