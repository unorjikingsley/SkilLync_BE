import { Router } from 'express'
import * as gigController from '../controllers/gig.controller'

const router = Router()

router.post('/', gigController.createGig)
router.get('/', gigController.getAllGigs)
router.get('/:id', gigController.getGigById)
router.put('/:id', gigController.updateGig)
router.delete('/:id', gigController.deleteGig)

export default router
