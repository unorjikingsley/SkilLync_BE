import prisma from '../db.config'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'
import { Review } from '@prisma/client'

interface CreateReviewInput {
  reviewerId: string
  revieweeId: string
  rating: number
  comment?: string
}

// ✅ Create review
export const createReview = async (
  data: CreateReviewInput
): Promise<Review> => {
  const { reviewerId, revieweeId, rating, comment } = data

  console.log('request', reviewerId, revieweeId, rating, comment)

  if (!reviewerId || !revieweeId || !rating)
    throw new BadRequestError('Reviewer, reviewee, and rating are required')

  if (reviewerId === revieweeId)
    throw new BadRequestError('You cannot review yourself')

  if (rating < 1 || rating > 5)
    throw new BadRequestError('Rating must be between 1 and 5')

  // Validate users
  const reviewer = await prisma.user.findUnique({
    where: { id: reviewerId, deletedAt: null },
  })
  const reviewee = await prisma.user.findUnique({
    where: { id: revieweeId, deletedAt: null },
  })
  if (!reviewer) throw new NotFoundError('Reviewer not found or inactive')
  if (!reviewee) throw new NotFoundError('Reviewee not found or inactive')

  // Prevent duplicate reviews
  const existing = await prisma.review.findFirst({
    where: { reviewerId, revieweeId },
  })
  if (existing) throw new BadRequestError('You have already reviewed this user')

  return prisma.review.create({
    data: {
      reviewerId,
      revieweeId,
      rating,
      comment: comment !== undefined ? comment.trim() : null,
    },
  })
}

// ✅ Get all reviews
export const getAllReviews = async (): Promise<Review[]> => {
  const reviews = await prisma.review.findMany({
    include: {
      reviewer: { select: { firstName: true, lastName: true } },
      reviewee: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!reviews.length) throw new NotFoundError('No reviews found')
  return reviews
}

// ✅ Get reviews by user (reviews received)
export const getReviewsByUser = async (
  revieweeId: string
): Promise<Review[]> => {
  const reviews = await prisma.review.findMany({
    where: { revieweeId },
    include: {
      reviewer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!reviews.length) throw new NotFoundError('No reviews found for this user')
  return reviews
}

//  Edit review (rating or comment)
export const editReview = async (
  reviewId: string,
  reviewerId: string,
  rating: number,
  comment?: string
) => {
  if (!rating || rating < 1 || rating > 5)
    throw new BadRequestError('Rating must be between 1 and 5')

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) throw new NotFoundError('Review not found')

  if (review.reviewerId !== reviewerId)
    throw new BadRequestError('You can only edit reviews you created')

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      rating,
      comment: comment !== undefined ? comment.trim() : null, // ✅ explicitly handle undefined
    },
  })

}

// ✅ Delete review
export const deleteReview = async (id: string): Promise<Review> => {
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) throw new NotFoundError('Review not found')

  return prisma.review.delete({ where: { id } })
}
