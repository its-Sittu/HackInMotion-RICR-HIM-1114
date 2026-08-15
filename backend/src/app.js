import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { notFoundHandler } from './middleware/notFoundHandler.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Dynamic CORS Configuration allowing local dev & production hosting domains
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all web origins and non-browser requests to ensure zero CORS blocks across deployments
      return callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// Request parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Root API router
app.use('/api', routes)

// 404 Handler for unknown routes
app.use(notFoundHandler)

// Centralized Global Error Handler
app.use(errorHandler)

export default app
