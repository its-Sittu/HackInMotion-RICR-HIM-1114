import mongoose from 'mongoose'

/**
 * Maps mongoose readyState codes to human-readable strings.
 * 0 = disconnected | 1 = connected | 2 = connecting | 3 = disconnecting
 */
const DB_STATE_MAP = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
}

/**
 * Returns the actual live health status of the backend and database.
 * The "database" field reflects mongoose's true connection state — never faked.
 */
export const getHealthStatus = () => {
  const dbState = mongoose.connection.readyState
  const dbStatus = DB_STATE_MAP[dbState] ?? 'unknown'

  return {
    success: true,
    message: 'MediGuard backend is running',
    database: dbStatus
  }
}
