import { io } from 'socket.io-client'

const BACKEND = import.meta.env.PROD
  ? 'https://stranger-chat-backend-production-f526.up.railway.app'
  : 'http://localhost:3001'

const stored = localStorage.getItem('visitor_id')
export const isReturning = stored !== null
export const visitorId = stored ?? (() => {
  const id = crypto.randomUUID()
  localStorage.setItem('visitor_id', id)
  return id
})()

export const socket = io(BACKEND)

socket.on('connect', () => {
  socket.emit('identify', { visitorId, isReturning })
})

// Heartbeat: respond to server pings to prevent ghost connections
socket.on('ping_custom', () => {
  socket.emit('pong_custom')
})
