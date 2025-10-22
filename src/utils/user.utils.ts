// user.helpers.ts
import prisma from '../db.config'
import { User } from '@prisma/client'

export const findActiveUserById = async (id: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({ where: { id } })
  return !user || user.deletedAt ? null : user
}

export const findActiveUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({ where: { email } })
  return !user || user.deletedAt ? null : user
}
