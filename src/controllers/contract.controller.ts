import { Request, Response, NextFunction } from 'express'
import * as contractService from '../services/contract.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError } from '../utils/errorHandler'

// ✅ Create contract
export const createContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId, freelancerId, clientId, escrowAmount } = req.body
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

// ✅ Get all contracts
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

// ✅ Get contract by ID
export const getContractById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Contract ID is required')

    const contract = await contractService.getContractById(id)
    return successMessage({
      res,
      data: contract,
      message: 'Contract retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get contracts by client
export const getContractsByClientId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { clientId } = req.params
    if (!clientId) throw new BadRequestError('Client ID is required')

    const contracts = await contractService.getContractsByClientId(clientId)
    return successMessage({
      res,
      data: contracts,
      message: 'Client contracts retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get contracts by freelancer
export const getContractsByFreelancerId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { freelancerId } = req.params
    if (!freelancerId) throw new BadRequestError('Freelancer ID is required')

    const contracts = await contractService.getcontractsByFreelancerId(
      freelancerId
    )
    return successMessage({
      res,
      data: contracts,
      message: 'Freelancer contracts retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Update contract status
export const updateContractStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!id || !status)
      throw new BadRequestError('Contract ID and status are required')

    const updated = await contractService.updateContractStatus(id, status)
    return successMessage({
      res,
      data: updated,
      message: 'Contract status updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Delete contract
export const deleteContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Contract ID is required')

    const deleted = await contractService.deleteContract(id)
    return successMessage({
      res,
      data: deleted,
      message: 'Contract deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
