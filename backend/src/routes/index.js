import { Router } from 'express'
import healthRoutes from './health.routes.js'

const router = Router()

// Register module routes
router.use('/health', healthRoutes)

export default router
