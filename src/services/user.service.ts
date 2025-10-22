import { BadRequestError } from '../utils/errorHandler';
import prisma from '../db.config';
import { User, Prisma } from '@prisma/client';
import { findActiveUserByEmail, findActiveUserById } from '../utils/user.utils';
// import bcrypt from 'bcryptjs';

/**
 * Create a new user
 * @param data Prisma.UserCreateInput
 * @returns Promise<User>
 */

export const createUser = async (data: Prisma.UserCreateInput): Promise<User> => {
  try {
    const existingUser = await findActiveUserByEmail(data.email)

    if (existingUser) {
      throw new BadRequestError('User with this email already exists')
    }

    // Hash Password
    // if (data.password){
    //   data.password = await bcrypt.hash(data.password, 10);
    // }

    const newUser = await prisma.user.create({ data })

    return newUser
  } catch (error) {
    console.error('Create User Error:', error)
    throw error //controller handles error
  }
}

export const getAllUsers = async (): Promise<User[]> => {
  try {
    return prisma.user.findMany({
      where: { deletedAt: null },
    })
  } catch (error) {
    console.error('Get All Users Error:', error)
    throw error
  }
}

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await findActiveUserById(id);

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
    const existingUser = await findActiveUserById(id);

    if (!existingUser) {
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
    const existingUser = await findActiveUserById(id);

    if (!existingUser) {
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
