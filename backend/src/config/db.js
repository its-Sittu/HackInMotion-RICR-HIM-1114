import mongoose from 'mongoose'

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Never logs or exposes the connection string.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediguard'

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    })
    console.log(`MongoDB connected successfully — host: ${conn.connection.host}`)
  } catch (err) {
    console.error(`[MongoDB Error] Could not connect to MongoDB at: ${uri}`)
    console.error(`👉 Fix: Make sure your local MongoDB service is running, OR update MONGODB_URI in backend/.env with your MongoDB Atlas connection string.`)
    throw err
  }
}

export default connectDB
