import express from 'express'
import * as reviewController from '../controllers/review.controller'

const router = express.Router()

router.post('/', reviewController.createReview)
router.get('/', reviewController.getAllReviews)
router.get('/user/:revieweeId', reviewController.getReviewsByUser)
router.patch('/:id/edit', reviewController.editReview)
router.delete('/:id', reviewController.deleteReview)

export default router
