import { Contract, ContractStatus } from '@prisma/client';
import prisma from '../db.config';

interface CreateContractInput {
  projectId: string
  freelancerId: string
  clientId: string
  escrowAmount: number
}

// Create contract
export const createContract = async (
  data: CreateContractInput
): Promise<Contract> => {
  return prisma.contract.create({
    data: {
      ...data,
      status: ContractStatus.ACTIVE,
    },
  })
}

// List all contracts
export const getAllContracts = async (): Promise<Contract[]> => {
  return prisma.contract.findMany()
}

// Get contract by ID
export const getContractById = async (id: string): Promise<Contract | null> => {
  return prisma.contract.findUnique({ where: { id } })
}

// Update contract
export const updateContract = async (
  id: string,
  data: Partial<Contract>
): Promise<Contract | null> => {
  const existing = await prisma.contract.findUnique({ where: { id } })
  if (!existing) return null

  return prisma.contract.update({ where: { id }, data })
}

// Delete contract (soft delete)
export const deleteContract = async (id: string): Promise<Contract | null> => {
  const existing = await prisma.contract.findUnique({ where: { id } })
  if (!existing) return null

  return prisma.contract.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
