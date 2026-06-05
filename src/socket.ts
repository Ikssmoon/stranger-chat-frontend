import { io } from 'socket.io-client'

// Module-level singleton — connects once and lives for the page lifetime.
// Do NOT call socket.disconnect() inside React effects; the connection must
// survive StrictMode's simulated unmount/remount cycle.
const BACKEND = import.meta.env.PROD
  ? 'https://stranger-chat-backend-production-f526.up.railway.app'
  : 'http://localhost:3001'

export const socket = io(BACKEND)
