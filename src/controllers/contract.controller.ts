import { Request, Response, NextFunction } from 'express'
import * as contractService from '../services/contract.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'

// Create contract
export const createContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, freelancerId, clientId, escrowAmount } = req.body
    if (!projectId || !freelancerId || !clientId || escrowAmount == null) {
      throw new BadRequestError(
        'projectId, freelancerId, clientId, and escrowAmount are required'
      )
    }

    const contract = await contractService.createContract({
      projectId,
      freelancerId,
      clientId,
      escrowAmount,
    })
    return successMessage({
      res,
      data: contract,
      message: 'Contract created successfully',
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

// List all contracts
export const getAllContracts = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contracts = await contractService.getAllContracts()
    return successMessage({
      res,
      data: contracts,
      message: 'Contracts retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Get contract by ID
export const getContractById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Contract ID is required')

    const contract = await contractService.getContractById(id)
    if (!contract) throw new NotFoundError('Contract not found')

    return successMessage({
      res,
      data: contract,
      message: 'Contract retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Update contract
export const updateContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Contract ID is required')

    const contract = await contractService.updateContract(id, req.body)
    if (!contract) throw new NotFoundError('Contract not found')

    return successMessage({
      res,
      data: contract,
      message: 'Contract updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Delete contract
export const deleteContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Contract ID is required')

    const contract = await contractService.deleteContract(id)
    if (!contract) throw new NotFoundError('Contract not found')

    return successMessage({
      res,
      data: contract,
      message: 'Contract deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
