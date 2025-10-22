import { Request, Response, NextFunction } from 'express'
import * as userService from '../services/user.service'
import { successMessage } from '@utils/successHandler';
import { BadRequestError, NotFoundError } from '../utils/errorHandler'

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, fullName, password } = req.body
    if (!email || !fullName || !password)
      throw new BadRequestError('Missing required fields')

    const user = await userService.createUser(req.body)
    res.status(201).json(user)
  } catch (err) {
    console.error('Error creating user:', err)
    next(err)
  }
}

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getAllUsers()
    return successMessage({
      res,
      data: users,
      message: 'Users retrieved successfully',
    })
  } catch (error) {
    console.error('Error getting users:', error)
    next(error)
  }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Missing user id');

    const user = await userService.getUserById(id)
    if (!user) throw new NotFoundError('User not found')

    return successMessage({
      res,
      data: user,
      message: 'User retrieved successfully',
    })
  } catch (error) {
    console.error('Error getting a specific user:', error)
    next(error);
  }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    if (!id) throw new NotFoundError('User not found')

    const user = await userService.updateUser(id, req.body)
    if (!user) throw new NotFoundError('User not found');

    return successMessage({
      res,
      data: user,
      message: 'User updated successfully',
    })
  } catch (error) {
    console.error('Error getting a specific user:', error)
    next(error);
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Missing user id');

    const user = await userService.deleteUser(id)
    if (!user) throw new NotFoundError('User not found')

    return successMessage({
      res,
      data: user,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Error getting a specific user:', error)
    next(error);
  }
}
