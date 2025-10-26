import { Request, Response, NextFunction } from 'express'
import * as reviewService from '../services/review.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError } from '../utils/errorHandler'

// ✅ Create review
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Header:', req.headers['content-type'])
    console.log('Body:', req.body)

    const { reviewerId, revieweeId, rating, comment } = req.body

    const review = await reviewService.createReview({
      reviewerId,
      revieweeId,
      rating,
      comment,
    })
    return successMessage({
      res,
      data: review,
      message: 'Review created successfully',
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get all reviews
export const getAllReviews = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await reviewService.getAllReviews()
    return successMessage({
      res,
      data: reviews,
      message: 'Reviews retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get reviews for a specific user
export const getReviewsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { revieweeId } = req.params
    if (!revieweeId) throw new BadRequestError('Reviewee ID is required')
    const reviews = await reviewService.getReviewsByUser(revieweeId)
    return successMessage({
      res,
      data: reviews,
      message: 'User reviews retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// PATCH /reviews/:id/edit
export const editReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = req.params.id
    const { reviewerId, rating, comment } = req.body

    if (!reviewId || !reviewerId) {
      throw new BadRequestError('Review ID and Reviewer ID are required')
    }

    const updatedReview = await reviewService.editReview(reviewId, reviewerId, rating, comment)

    return successMessage({
      res,
      data: updatedReview,
      message: 'Review updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Delete review
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Review ID is required')
    const deleted = await reviewService.deleteReview(id)
    return successMessage({
      res,
      data: deleted,
      message: 'Review deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
