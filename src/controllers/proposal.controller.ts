import { Request, Response, NextFunction } from 'express'
import * as proposalService from '../services/proposal.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError } from '../utils/errorHandler'

// ✅ Create Proposal
export const createProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bidAmount, coverLetter, freelancerId, projectId } = req.body
    const proposal = await proposalService.createProposal({
      bidAmount,
      coverLetter,
      freelancerId,
      projectId,
    })
    return successMessage({
      res,
      data: proposal,
      message: 'Proposal created successfully',
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get all proposals
export const getAllProposals = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const proposals = await proposalService.getAllProposals()
    return successMessage({
      res,
      data: proposals,
      message: 'Proposals retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get proposal by ID
export const getProposalById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Proposal ID is required')

    const proposal = await proposalService.getProposalById(id)
    return successMessage({
      res,
      data: proposal,
      message: 'Proposal retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get proposals by freelancer
export const getProposalsByFreelancer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { freelancerId } = req.params
    if (!freelancerId) throw new BadRequestError('Freelancer ID is required')

    const proposals = await proposalService.getProposalsByFreelancer(
      freelancerId
    )
    return successMessage({
      res,
      data: proposals,
      message: 'Freelancer proposals retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get proposals by project
export const getProposalsByProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params
    if (!projectId) throw new BadRequestError('Project ID is required')

    const proposals = await proposalService.getProposalsByProject(projectId)
    return successMessage({
      res,
      data: proposals,
      message: 'Project proposals retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Update proposal status
export const updateProposalStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!id || !status)
      throw new BadRequestError('Proposal ID and status are required')

    const updated = await proposalService.updateProposalStatus(id, status)
    return successMessage({
      res,
      data: updated,
      message: 'Proposal status updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Delete proposal
export const deleteProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Proposal ID is required')

    const deleted = await proposalService.deleteProposal(id)
    return successMessage({
      res,
      data: deleted,
      message: 'Proposal deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
