import { Gig } from '@prisma/client'
import prisma from '../db.config'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'

interface CreateGigInput {
  title: string
  description: string
  price: number
  category: string
  freelancerId: string
}

// Create a new gig
export const createGig = async (data: CreateGigInput): Promise<Gig> => {
  const { title, description, price, category, freelancerId } = data

  // Validate price
  if (price <= 0) throw new BadRequestError('Price must be greater than zero')

  // Check if freelancer exists
  const freelancerExists = await prisma.user.findFirst({
    where: { id: freelancerId, deletedAt: null },
  })
  if (!freelancerExists) throw new NotFoundError('Freelancer(user) not found')

  // Prevent duplicate gig with same title for the same freelancer
  const existingGig = await prisma.gig.findFirst({
    where: {
      title: { equals: title.trim(), mode: 'insensitive' },
      freelancerId,
    },
  })
  if (existingGig)
    throw new BadRequestError('You already have a gig with this title')

  // Create the gig
  return prisma.gig.create({
    data: {
      title: title.trim().toUpperCase(),
      description: description.trim(),
      price,
      category: category.trim().toUpperCase(),
      freelancerId,
    },
  })
}

// List all gigs
export const getAllGigs = async (): Promise<Gig[]> => {
  const gigs = await prisma.gig.findMany({
    where: {
      freelancer: { deletedAt: null },
    },
    include: {
      freelancer: {
        select: { firstName: true, lastName: true, profileImage: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return gigs;
}

// Get gig by ID
export const getGigById = async (id: string): Promise<Gig> => {
  const gig = await prisma.gig.findFirst({
    where: { id, freelancer: { deletedAt: null } },
    include: {
      freelancer: {
        select: { firstName: true, lastName: true, profileImage: true },
      },
    },
  })
  if (!gig) throw new NotFoundError('Gig not found')
  return gig
}

// Get gigs by freelancer
export const getGigsByFreelancer = async (freelancerId: string): Promise<Gig[]> => {
  // Ensure freelancer exists and is active
  const freelancer = await prisma.user.findFirst({
    where: { id: freelancerId, deletedAt: null },
  })
  if (!freelancer)
    throw new NotFoundError('Freelancer not found or deactivated')

  const gigs = await prisma.gig.findMany({
    where: { freelancerId },
    orderBy: { createdAt: 'desc' },
  })

  if (!gigs.length) throw new NotFoundError('No gigs found for this freelancer')
  return gigs
}

// Update gig
export const updateGig = async (
  id: string,
  data: Partial<Gig> //The data can be partial, meaning not all gig fields are required — maybe just one or two.
): Promise<Gig> => {
  const existingGig = await prisma.gig.findFirst({
    where: { id, freelancer: { deletedAt: null } },
  })
  if (!existingGig)
    throw new NotFoundError('Gig not found or owner is deactivated')

  // Prevent updating to the same values
  if (
    data.title?.trim().toUpperCase() === existingGig.title.toUpperCase() &&
    data.description?.trim() === existingGig.description &&
    data.price === existingGig.price &&
    data.category?.trim().toUpperCase() === existingGig.category.toUpperCase()
  ) {
    throw new BadRequestError('No changes detected to update')
  }

  return prisma.gig.update({
    where: { id },
    data: {
      title: data.title?.trim().toUpperCase() || existingGig.title,
      description: data.description?.trim() || existingGig.description,
      price: data.price ?? existingGig.price,
      category: data.category?.trim().toUpperCase() || existingGig.category,
    },
  })
}

// Delete gig
export const deleteGig = async (id: string): Promise<Gig> => {
  const gig = await prisma.gig.findFirst({
    where: { id, freelancer: { deletedAt: null } },
  })
  if (!gig) throw new NotFoundError('Gig not found or owner is deactivated')

  return prisma.gig.delete({ where: { id } })
}

// Search gigs by title or category
export const searchGigs = async (query: string): Promise<Gig[]> => {
  if (!query.trim()) throw new BadRequestError('Search query cannot be empty')

  const gigs = await prisma.gig.findMany({
    where: {
      freelancer: { deletedAt: null },
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      freelancer: {
        select: { firstName: true, lastName: true, profileImage: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!gigs.length)
    throw new NotFoundError('No gigs found matching your search')

  return gigs;
}
