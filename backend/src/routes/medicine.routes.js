import express from 'express'
import {
  searchMedicinesHandler,
  aiConsultHandler,
  checkInteractionHandler,
  analyzeSymptomsHandler,
  getUserMedicinesHandler,
  addUserMedicineHandler,
  deleteUserMedicineHandler
} from '../controllers/medicine.controller.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/medicines/search?q=medName
router.get('/search', optionalAuthMiddleware, searchMedicinesHandler)

// POST /api/medicines/ai-consult
router.post('/ai-consult', optionalAuthMiddleware, aiConsultHandler)

// POST /api/medicines/check-interaction
router.post('/check-interaction', optionalAuthMiddleware, checkInteractionHandler)

// POST /api/medicines/analyze-symptoms
router.post('/analyze-symptoms', optionalAuthMiddleware, analyzeSymptomsHandler)

// ── User Private Medicine List (Protected by JWT Auth) ─────────────────────────
// GET /api/medicines/user/list
router.get('/user/list', authMiddleware, getUserMedicinesHandler)

// POST /api/medicines/user/add
router.post('/user/add', authMiddleware, addUserMedicineHandler)

// DELETE /api/medicines/user/:id
router.delete('/user/:id', authMiddleware, deleteUserMedicineHandler)

export default router
