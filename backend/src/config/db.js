import mongoose from 'mongoose'

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Never logs or exposes the connection string.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined in environment variables. ' +
        'Add it to your .env file before starting the server.'
    )
  }

  const conn = await mongoose.connect(uri, {
    // These options are recommended for stable connections
    serverSelectionTimeoutMS: 5000
  })

  console.log(`MongoDB connected successfully — host: ${conn.connection.host}`)
}

export default connectDB
