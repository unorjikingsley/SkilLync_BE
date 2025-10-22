import { Request, Response, NextFunction } from 'express'
import * as gigService from '../services/gig.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'

// Create a new gig
export const createGig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, price, category, freelancerId } = req.body
    if (!title || !description || !price || !category || !freelancerId) {
      throw new BadRequestError('All fields are required')
    }

    const gig = await gigService.createGig({
      title,
      description,
      price,
      category,
      freelancerId,
    })
    return successMessage({
      res,
      data: gig,
      message: 'Gig created successfully',
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

// List all gigs
export const getAllGigs = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const gigs = await gigService.getAllGigs()
    return successMessage({
      res,
      data: gigs,
      message: 'Gigs retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Get gig by ID
export const getGigById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Gig ID is required')

    const gig = await gigService.getGigById(id)
    if (!gig) throw new NotFoundError('Gig not found')

    return successMessage({
      res,
      data: gig,
      message: 'Gig retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Update gig
export const updateGig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Gig ID is required')

    const gig = await gigService.updateGig(id, req.body)
    if (!gig) throw new NotFoundError('Gig not found')

    return successMessage({
      res,
      data: gig,
      message: 'Gig updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Delete gig
export const deleteGig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Gig ID is required')

    const gig = await gigService.deleteGig(id)
    if (!gig) throw new NotFoundError('Gig not found')

    return successMessage({
      res,
      data: gig,
      message: 'Gig deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
