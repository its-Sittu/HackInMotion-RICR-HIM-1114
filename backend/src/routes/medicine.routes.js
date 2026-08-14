import express from 'express'
import { searchMedicinesHandler, aiConsultHandler, checkInteractionHandler } from '../controllers/medicine.controller.js'

const router = express.Router()

// GET /api/medicines/search?q=medName
router.get('/search', searchMedicinesHandler)

// POST /api/medicines/ai-consult
router.post('/ai-consult', aiConsultHandler)

// POST /api/medicines/check-interaction
router.post('/check-interaction', checkInteractionHandler)

export default router
