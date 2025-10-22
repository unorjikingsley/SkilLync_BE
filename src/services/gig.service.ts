import { PrismaClient } from '@prisma/client';
import { Gig } from '@prisma/client'

const prisma = new PrismaClient();

interface CreateGigInput {
  title: string
  description: string
  price: number
  category: string
  freelancerId: string
}

// Create a new gig
export const createGig = async (data: CreateGigInput): Promise<Gig> => {
  return prisma.gig.create({ data })
}

// List all gigs
export const getAllGigs = async (): Promise<Gig[]> => {
  return prisma.gig.findMany()
}

// Get gig by ID
export const getGigById = async (id: string): Promise<Gig | null> => {
  return prisma.gig.findUnique({ where: { id } })
}

// Update gig
export const updateGig = async (
  id: string,
  data: Partial<Gig>
): Promise<Gig | null> => {
  return prisma.gig.update({
    where: { id },
    data,
  })
}

// Delete gig
export const deleteGig = async (id: string): Promise<Gig | null> => {
  return prisma.gig.delete({
    where: { id },
  })
}
