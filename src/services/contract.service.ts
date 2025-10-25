import { Contract, ContractStatus } from '@prisma/client';
import prisma from '../db.config';
import { BadRequestError, NotFoundError } from '../utils/errorHandler';

interface CreateContractInput {
  projectId: string
  freelancerId: string
  clientId: string
  escrowAmount: number
}

// ✅ Create contract (usually from an accepted proposal)
export const createContract = async (
  data: CreateContractInput
): Promise<Contract> => {
  const { projectId, freelancerId, clientId, escrowAmount } = data

  if (escrowAmount <= 0)
    throw new BadRequestError('Escrow amount must be greater than zero')

  // Validate freelancer and client
  const freelancer = await prisma.user.findFirst({
    where: { id: freelancerId, deletedAt: null },
  })
  const client = await prisma.user.findFirst({
    where: { id: clientId, deletedAt: null },
  })
  if (!freelancer) throw new NotFoundError('Freelancer not found or inactive')
  if (!client) throw new NotFoundError('Client not found or inactive')

  // Validate project
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new NotFoundError('Project not found')

  // Ensure no duplicate contract for same project and freelancer
  const existingContract = await prisma.contract.findFirst({
    where: { projectId, freelancerId, deletedAt: null },
  })
  if (existingContract)
    throw new BadRequestError(
      'A contract already exists for this project and freelancer'
    )

  return prisma.contract.create({
    data: {
      projectId,
      freelancerId,
      clientId,
      escrowAmount,
    },
  })
}

// ✅ Get all contracts
export const getAllContracts = async (): Promise<Contract[]> => {
  const contracts = await prisma.contract.findMany({
    where: {
      freelancer: { deletedAt: null },
      client: { deletedAt: null },
    },
    include: {
      project: { select: { title: true, budget: true } },
      freelancer: { select: { firstName: true, lastName: true } },
      client: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (contracts.length === 0) throw new NotFoundError('No contracts found')
  return contracts
}

// ✅ Update contract status
export const updateContractStatus = async (
  id: string,
  status: ContractStatus
): Promise<Contract> => {
  const validStatuses: ContractStatus[] = ['ACTIVE', 'COMPLETED', 'TERMINATED']
  if (!validStatuses.includes(status))
    throw new BadRequestError('Invalid contract status')

  const contract = await prisma.contract.findUnique({ where: { id } })
  if (!contract) throw new NotFoundError('Contract not found')

  return prisma.contract.update({
    where: { id },
    data: { status },
  })
}

// ✅ Soft delete contract
export const deleteContract = async (id: string): Promise<Contract> => {
  const contract = await prisma.contract.findUnique({ where: { id } })
  if (!contract) throw new NotFoundError('Contract not found')

  return prisma.contract.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export const getContractById = async (id: string): Promise<Contract> => {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      project: { select: { title: true } },
      freelancer: { select: { firstName: true, lastName: true } },
      client: { select: { firstName: true, lastName: true } },
    },
  })
  if (!contract) throw new NotFoundError('Contract not found')
  return contract
}

export const getContractsByClientId = async (clientId: string): Promise<Contract[]> => {
  const contracts = await prisma.contract.findMany({
    where: { clientId, deletedAt: null },
    include: {
      project: { select: { title: true } },
      freelancer: { select: { firstName: true, lastName: true } },
      client: { select: { firstName: true, lastName: true } },
    },
  })
  if (contracts.length === 0) throw new NotFoundError('No contracts found')
  return contracts
}

export const getcontractsByFreelancerId = async (freelancerId: string): Promise<Contract[]> => {
  const contracts = await prisma.contract.findMany({
    where: { freelancerId, deletedAt: null },
    include: {
      project: { select: { title: true } },
      freelancer: { select: { firstName: true, lastName: true } },
      client: { select: { firstName: true, lastName: true } },
    },
  })
  if (contracts.length === 0) throw new NotFoundError('No contracts found')
  return contracts
};
