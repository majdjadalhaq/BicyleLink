# BiCycleL

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO_4-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**[Live Application](https://bicyclel.nl)** — Second-hand bike marketplace for the Netherlands.

BiCycleL connects buyers and sellers of quality second-hand bikes. Sellers list their bikes, buyers browse and chat in real time, and after a sale completes the buyer can leave a verified review. Built on the MERN stack with Socket.IO for live messaging and notifications.

Developed as part of the HackYourFuture curriculum using Agile methodology across multiple two-week sprints.

---

## Getting Started

**Install all dependencies** (root, client, and server in one command):

```bash
npm install && npm run setup
```

**Configure environment variables:**

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in the required values — see [Deployment Guide](docs/DEPLOYMENT.md) for the full variable reference.

**Start in development mode:**

```bash
npm run dev
```

This starts the Express server and Vite dev server concurrently.

---

## Features

**Marketplace**
- Browse, search, and filter listings by location, price range, brand, and category
- Interactive map on each listing with OpenStreetMap and a draggable pin for location selection when creating a listing
- Image upload with crop support via Cloudinary (up to 5 images per listing)
- Listing lifecycle: active → sold, with buyer selection and a buyer lock to prevent reassignment

**Messaging**
- Real-time chat between buyers and sellers scoped to a specific listing
- Typing indicators, online status, image sharing, and location sharing in chat
- Inbox with unread counts, bulk delete, and mark-all-read

**Reviews**
- Buyers who are recorded as the buyer of a sold listing can leave a one-time review for the seller
- Review, edit, and delete — seller's aggregate rating updates automatically
- Seller receives a real-time notification when a review is posted

**Accounts**
- Local authentication (email + password) and Google OAuth
- Email verification on signup, forgot password with 6-digit code flow
- Profile setup, avatar upload with cropping, notification preferences
- Account settings: change password, change email (with re-verification), delete account

**Admin**
- Dashboard with platform stats
- User management: role changes, block/unblock, manual verification, admin warnings
- Listing moderation: featured toggle, force delete
- Report management with status tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 3, React Router 7 |
| Backend | Node.js 20, Express 5 |
| Database | MongoDB Atlas, Mongoose 9 |
| Real-time | Socket.IO 4 |
| Auth | JWT (httpOnly cookies), Google OAuth |
| Maps | Leaflet, React Leaflet, OpenStreetMap / Nominatim |
| Media | Cloudinary |
| Email | Resend |
| Testing | Jest, React Testing Library, Cypress |

---

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Tech Stack Details](docs/TECH_STACK.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
