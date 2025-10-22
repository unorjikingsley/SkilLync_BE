import { BadRequestError } from '../utils/errorHandler';
import prisma from '../db.config';
import { User, Prisma } from '@prisma/client';
// import bcrypt from 'bcryptjs';

/**
 * Create a new user
 * @param data Prisma.UserCreateInput
 * @returns Promise<User>
 */

export const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
  const existingUser = await prisma.user.findUnique({
    where: { 
      email: data.email,
      deletedAt: null
    },
  })

  if (existingUser) {
    throw new BadRequestError('User with this email already exists')
  }

  // Hash Password
  // if (data.password){
  //   data.password = await bcrypt.hash(data.password, 10);
  // }

  return prisma.user.create({ data })
}

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany({
    where: { deletedAt: null },
  })
}

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const getUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!getUser || getUser.deletedAt) {
      return null
    }

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    })
  
    return user
  } catch (error) {
    console.error('Delete User Error:', error)
    throw error //controller handles error
  }
}

export const updateUser = async (
  id: string,
  data: Prisma.UserUpdateInput
): Promise<User | null> => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser || existingUser.deletedAt) {
      return null // No user found or already deleted
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    })
    return updatedUser
  } catch (error) {
    console.error('Delete User Error:', error)
    throw error //controller handles error
  }
}

export const deleteUser = async (id: string): Promise<User | null> => {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser || existingUser.deletedAt) {
      return null // No user found or already deleted
    }

    // alter email after delete
    const timeStamp = new Date().toISOString();
    console.log('timestamp:', timeStamp)
    const sanitizedEmail = existingUser.email.replace('@', "_at_")
    const newEmail = `${sanitizedEmail}_deleted_${timeStamp}`

    // Perform soft-delete
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        email: newEmail
      },
    })

    return deletedUser
  } catch (error) {
    console.error('Delete User Error:', error)
    throw error //controller handles error
  }
}
