import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log(`[MediGuard Backend] Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[MediGuard Backend] Unhandled Rejection:', err)
})

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[MediGuard Backend] SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    console.log('[MediGuard Backend] Process terminated')
  })
})

export default server
