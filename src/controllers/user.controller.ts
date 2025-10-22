import { Request, Response } from 'express'
import * as userService from '../services/user.service'
import { handleError } from '@utils/errorHandler'

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json(user)
  } catch (err) {
    console.error('Error creating user:', err)
    return handleError(res, err)
  }
}

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers()
    res.status(200).json(users)
  } catch (error) {
    console.error('Error getting users:', error)
    return handleError(res, error)
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ message: 'Missing user id' })

    const user = await userService.getUserById(id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.status(200).json(user)
  } catch (error) {
    console.error('Error getting a specific user:', error)
    return handleError(res, error)
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ message: 'Missing user id' })

    const user = await userService.updateUser(id, req.body)
    res.status(200).json(user)
  } catch (error) {
    console.error('Error getting a specific user:', error)
    return handleError(res, error)
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ message: 'Missing user id' })

    const user = await userService.deleteUser(id)
    res.status(200).json({ message: 'User deleted', user })
  } catch (error) {
    console.error('Error getting a specific user:', error)
    return handleError(res, error)
  }
}
