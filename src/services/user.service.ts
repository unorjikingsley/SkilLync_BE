import { PrismaClient, Prisma, User } from '@prisma/client'
const prisma = new PrismaClient()

export const createUser = async (data: Prisma.UserCreateInput) => {
  return prisma.user.create({ data })
}

export const getAllUsers = async () => {
  return prisma.user.findMany({
    where: { deletedAt: null },
  })
}

export const getUserById = async (id: string) => {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
  })
}

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  return prisma.user.update({
    where: { id },
    data,
  })
}

export const deleteUser = async (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
