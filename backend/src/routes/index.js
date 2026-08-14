import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import medicineRoutes from './medicine.routes.js'

const router = Router()

// Register module routes
router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/medicines', medicineRoutes)

export default router
