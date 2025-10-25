import { Proposal, ProposalStatus } from '@prisma/client'
import prisma from '../db.config'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'

interface CreateProposalInput {
  bidAmount: number
  coverLetter: string
  freelancerId: string
  projectId: string
}

// ✅ Create Proposal
export const createProposal = async (
  data: CreateProposalInput
): Promise<Proposal> => {
  const { bidAmount, coverLetter, freelancerId, projectId } = data

  if (!bidAmount || !coverLetter || !freelancerId || !projectId)
    throw new BadRequestError('All fields are required')

  if (bidAmount <= 0)
    throw new BadRequestError('Bid amount must be greater than zero')

  // Check if freelancer exists and is active
  const freelancer = await prisma.user.findUnique({
    where: { id: freelancerId, deletedAt: null },
  })
  if (!freelancer || freelancer.deletedAt)
    throw new NotFoundError('Freelancer not found or deactivated')

  // Check if project exists and is open, and client is active
  const project = await prisma.project.findUnique({
    where: { id: projectId, deletedAt: null, client: { deletedAt: null } },
  })

  if (!project || project.deletedAt !== null)
    throw new NotFoundError('Project not found or unavailable')

  // Ensure the project is till open
  if (project.status !== 'OPEN')
    throw new BadRequestError(
      'Cannot send proposal to a project that is not open'
    )

  // ✅ Ensure project deadline is not in the past - future feature
  // if (project.deadline && new Date(project.deadline) < new Date())
  //   throw new BadRequestError(
  //     'Project deadline has passed — cannot submit proposal'
  //   )

  // Prevent duplicate proposals by the same freelancer on same project
  const existingProposal = await prisma.proposal.findFirst({
    where: { projectId, freelancerId },
  })
  if (existingProposal)
    throw new BadRequestError(
      'You have already submitted a proposal for this project'
    )

  return prisma.proposal.create({
    data: {
      bidAmount,
      coverLetter: coverLetter.trim(),
      freelancerId,
      projectId,
    },
  })
}

// ✅ Get all proposals (admin or general listing)
export const getAllProposals = async (): Promise<Proposal[]> => {
  const proposals = await prisma.proposal.findMany({
    where: {
      freelancer: { deletedAt: null },
      project: { deletedAt: null },
    },
    include: {
      freelancer: {
        select: { firstName: true, lastName: true, profileImage: true },
      },
      project: { select: { title: true, budget: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (proposals.length === 0) throw new NotFoundError('No proposals found')
  return proposals
}

// ✅ Get proposal by ID
export const getProposalById = async (id: string): Promise<Proposal> => {
  const proposal = await prisma.proposal.findFirst({
    where: {
      id,
      freelancer: { deletedAt: null },
      project: { deletedAt: null },
    },
    include: {
      freelancer: {
        select: { firstName: true, lastName: true, profileImage: true },
      },
      project: { select: { title: true, budget: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!proposal) throw new NotFoundError('Proposal not found')
  return proposal
}

// ✅ Get proposals by freelancer
export const getProposalsByFreelancer = async (
  freelancerId: string
): Promise<Proposal[]> => {
  const proposals = await prisma.proposal.findMany({
    where: { freelancerId, freelancer: { deletedAt: null } },
    include: {
      project: { select: { title: true, budget: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!proposals.length)
    throw new NotFoundError('No proposals found for this freelancer')
  return proposals
}

// ✅ Get proposals by project
export const getProposalsByProject = async (
  projectId: string
): Promise<Proposal[]> => {
  const proposals = await prisma.proposal.findMany({
    where: { projectId, project: { deletedAt: null } },
    include: {
      freelancer: {
        select: { firstName: true, lastName: true, profileImage: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!proposals.length)
    throw new NotFoundError('No proposals found for this project')
  return proposals
}

// ✅ Update proposal status (e.g., ACCEPTED / REJECTED)
export const updateProposalStatus = async (
  id: string,
  status: ProposalStatus
): Promise<Proposal> => {
  const validStatuses: ProposalStatus[] = ['PENDING', 'ACCEPTED', 'REJECTED']
  if (!validStatuses.includes(status))
    throw new BadRequestError('Invalid proposal status')

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { project: { select: { clientId: true } } },
  })
  if (!proposal) throw new NotFoundError('Proposal not found')
  if (!proposal.project)
    throw new NotFoundError('Related project or client not found')

  return prisma.proposal.update({
    where: { id },
    data: { status },
    include: {
      project: { select: { clientId: true, title: true } },
      freelancer: { select: { firstName: true, lastName: true } },
    },
  })
}

// ✅ Delete proposal (hard delete for simplicity)
export const deleteProposal = async (id: string): Promise<Proposal> => {
  const proposal = await prisma.proposal.findUnique({ where: { id } })
  if (!proposal) throw new NotFoundError('Proposal not found')

  return prisma.proposal.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
