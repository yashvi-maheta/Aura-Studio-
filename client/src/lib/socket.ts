/**
 * socket.ts — Singleton Socket.IO client.
 *
 * Import `socket` wherever you need to listen to real-time events.
 * The connection is shared across all components.
 */

import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_API_URL ?? ''

export const socket = io(SERVER_URL, {
  withCredentials: true,
  autoConnect: true,
  // In development the Vite proxy forwards /socket.io, so '' works fine.
  // In production, SERVER_URL should be the full backend origin.
})
