import { Request, Response, NextFunction } from 'express'
import * as gigService from '../services/gig.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'

// ✅ Create a new gig
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
      price: parseFloat(price),
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

// ✅ List all gigs
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

// ✅ Get gig by ID
export const getGigById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Gig ID is required')

    const gig = await gigService.getGigById(id);
    if (!gig) throw new NotFoundError('Gig not found');

    return successMessage({
      res,
      data: gig,
      message: 'Gig retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get gigs by freelancer
export const getGigsByFreelancer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { freelancerId } = req.params
    if (!freelancerId) throw new BadRequestError('Freelancer ID is required')

    const gigs = await gigService.getGigsByFreelancer(freelancerId)
    if (!gigs.length) throw new NotFoundError('No gigs found for this freelancer');

    return successMessage({
      res,
      data: gigs,
      message: 'Freelancer gigs retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Update gig
export const updateGig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Gig ID is required')

    const updatedGig = await gigService.updateGig(id, req.body)
    if (!updatedGig) throw new NotFoundError('Gig not found');

    return successMessage({
      res,
      data: updatedGig,
      message: 'Gig updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Delete gig
export const deleteGig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Gig ID is required')

    const deletedGig = await gigService.deleteGig(id);
    if (!deletedGig) throw new NotFoundError('Gig not found');

    return successMessage({
      res,
      data: deletedGig,
      message: 'Gig deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Search gigs
export const searchGigs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query //send your search term as a query parameter (the ?query=value style)
    if (!query) throw new BadRequestError('Search query is required')

    // const query = req.params.query?.trim() // send your search term as a URL parameter (/search/:query)
    // if (!query) throw new BadRequestError('Search query is required')

    const gigs = await gigService.searchGigs(String(query))
    if (!gigs.length)
      throw new NotFoundError('No gigs found matching your search')

    return successMessage({
      res,
      data: gigs,
      message: 'Gigs retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}
