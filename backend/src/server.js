import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import connectDB from './config/db.js'

const PORT = process.env.PORT || 5000

/**
 * Bootstrap: connect to MongoDB first, then start the HTTP server.
 * This ensures the server never accepts traffic without a DB connection.
 */
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB()

    // 2. Start Express only after DB is ready
    const server = app.listen(PORT, () => {
      console.log(
        `PulseMed backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
      )
    })

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('[MediGuard Backend] Unhandled Rejection:', err.message)
      server.close(() => process.exit(1))
    })

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('[MediGuard Backend] SIGTERM received. Shutting down gracefully...')
      server.close(() => {
        console.log('[MediGuard Backend] Process terminated')
        process.exit(0)
      })
    })

    return server
  } catch (err) {
    console.error('[MediGuard Backend] Failed to start server:', err.message)
    process.exit(1)
  }
}

startServer()
