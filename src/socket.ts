import { io } from 'socket.io-client'

// Module-level singleton — connects once and lives for the page lifetime.
// Do NOT call socket.disconnect() inside React effects; the connection must
// survive StrictMode's simulated unmount/remount cycle.
export const socket = io('http://localhost:3001')
