import { Request, Response, NextFunction } from 'express';
import * as proposalService from '../services/proposal.service';
import { successMessage } from '../utils/successMessage';
import { BadRequestError, NotFoundError } from '../utils/errorHandler';

// Submit a proposal
export const submitProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bidAmount, coverLetter, freelancerId, projectId } = req.body;
    if (!bidAmount || !coverLetter || !freelancerId || !projectId) {
      throw new BadRequestError('bidAmount, freelancerId, and projectId are required');
    }

    const proposal = await proposalService.submitProposal({ bidAmount, coverLetter, freelancerId, projectId });
    return successMessage({ res, data: proposal, message: 'Proposal submitted successfully', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

// List all proposals
export const getAllProposals = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const proposals = await proposalService.getAllProposals();
    return successMessage({ res, data: proposals, message: 'Proposals retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

// Get proposal by ID
export const getProposalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new BadRequestError('Proposal ID is required');

    const proposal = await proposalService.getProposalById(id);
    if (!proposal) throw new NotFoundError('Proposal not found');

    return successMessage({ res, data: proposal, message: 'Proposal retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

// Update proposal
export const updateProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new BadRequestError('Proposal ID is required');

    const proposal = await proposalService.updateProposal(id, req.body);
    if (!proposal) throw new NotFoundError('Proposal not found');

    return successMessage({ res, data: proposal, message: 'Proposal updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete proposal
export const deleteProposal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new BadRequestError('Proposal ID is required');

    const proposal = await proposalService.deleteProposal(id);
    if (!proposal) throw new NotFoundError('Proposal not found');

    return successMessage({ res, data: proposal, message: 'Proposal deleted successfully' });
  } catch (error) {
    next(error);
  }
};
