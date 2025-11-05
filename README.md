# SlotSwapper — Full Stack

## Overview
SlotSwapper is a peer-to-peer timeslot swapping app. Users create events and mark them as swappable. Other users can request swaps.

This repo contains two folders: `backend` (Express + MongoDB) and `frontend` (React + Vite).

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (local or Atlas). If using local, default connection is `mongodb://localhost:27017/slotswapper`.

## Setup — Backend
1. Open a terminal and `cd backend`
2. Copy `.env.example` to `.env` and fill values (especially `MONGO_URI` and `JWT_SECRET`).
3. Install and start:

```bash
npm install
npm run dev   # requires nodemon, or `npm start` to run once
```

Server listens on `http://localhost:5000` by default.

## Setup — Frontend
1. Open another terminal and `cd frontend`
2. Install and start dev server:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (or another Vite port).

## Important environment variables
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret to sign tokens
- `PORT` — backend port (optional)

## API Endpoints (summary)
All protected routes require `Authorization: Bearer <token>` header.

### Auth
- `POST /api/auth/signup` — `{ name, email, password }` -> `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` -> `{ token, user }`

### Events
- `POST /api/events` — create event `{ title, startTime, endTime }`
- `GET /api/events/me` — list my events
- `PUT /api/events/:id` — update event (including `status`)
- `DELETE /api/events/:id` — delete

### Swaps
- `GET /api/swaps/swappable-slots` — list other users' SWAPPABLE slots
- `POST /api/swaps/swap-request` — `{ mySlotId, theirSlotId }` — creates a swap request and marks both as `SWAP_PENDING`
- `GET /api/swaps/my-requests` — lists incoming and outgoing swap requests
- `POST /api/swaps/swap-response/:requestId` — `{ accept: true|false }` — accept or reject; on accept swaps owners and sets both slots back to `BUSY`. On reject sets both back to `SWAPPABLE`.

## Notes & Assumptions
- This implementation uses MongoDB transactions (via `mongoose.startSession`) for the critical swap request/response flows. For transactions to work reliably you should use a replica set or MongoDB Atlas. If running a single-node local MongoDB without replica set, transactions may fail — in that case the code still attempts updates but it's recommended to run a local replica set or use Atlas for full transactional guarantees.
- JWT stored in `localStorage` (simple approach). For production use, consider httpOnly cookies.
- Frontend is minimal and focuses on functionality.

## Bonus ideas you can extend
- Real-time notifications with Socket.io
- Unit tests for swap logic
- Deploy backend to Render/Heroku and frontend to Vercel
