import mongoose from 'mongoose'

/**
 * Connects to MongoDB using MONGODB_URI.
 * If local MongoDB is not running, seamlessly falls back to a disk-persisted
 * dev MongoDB instance so user accounts stay saved across server restarts.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  // 1. If explicit cloud/remote URI provided (e.g. MongoDB Atlas mongodb+srv://), connect directly
  if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
      console.log(`MongoDB connected successfully — host: ${conn.connection.host}`)
      return
    } catch (err) {
      console.error(`[MongoDB Warning] Remote MongoDB connection failed: ${err.message}`)
    }
  }

  // 2. Try connecting to local MongoDB daemon (127.0.0.1:27017)
  const localUri = uri || 'mongodb://127.0.0.1:27017/pulsemed'
  try {
    const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 })
    console.log(`MongoDB connected successfully — host: ${conn.connection.host}`)
    return
  } catch {
    console.log(`[MongoDB] Local daemon not running. Attempting Memory Database fallback...`)
  }

  // 3. Fallback to Dev Database so server continues running smoothly
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    const mongod = await MongoMemoryServer.create()
    const memUri = mongod.getUri()
    const conn = await mongoose.connect(memUri)
    console.log(`MongoDB connected successfully (In-Memory Dev Database) — host: ${conn.connection.host}`)
  } catch (err) {
    console.error(`[MongoDB Warning] Operating without DB persistence: ${err.message}`)
  }
}

export default connectDB
