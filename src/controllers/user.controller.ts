import { Request, Response, NextFunction } from 'express'
import * as userService from '../services/user.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'
import { Prisma } from '@prisma/client'
import upload, { formatImage } from 'middleware/multerMiddleware'

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

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Missing user id')

    const user = await userService.getUserById(id)
    if (!user) throw new NotFoundError('User not found')

    return successMessage({
      res,
      data: user,
      message: 'User retrieved successfully',
    })
  } catch (error) {
    console.error('Error getting a specific user:', error)
    next(error)
  }
}

export const updateUser = [
  upload.single('profileImage'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      if (!id) throw new NotFoundError('User ID not provided')

      // Build update payload from request body
      const updatePayload: Prisma.UserUpdateInput = { ...(req.body as any) }

      // If a file was uploaded, convert it to base64 and attach to payload
      if (req.file) {
        try {
          const profileImageBase64 = formatImage(req.file)
          // attach as a base64 data URL (service will upload to Cloudinary)
          ;(updatePayload as any).profileImage = profileImageBase64
        } catch (err) {
          throw new BadRequestError('Failed to parse uploaded image')
        }
      }

      // Call service
      const updated = await userService.updateUser(id, updatePayload)

      if (!updated) throw new NotFoundError('User not found')

      return successMessage({
        res,
        data: updated,
        message: 'User updated successfully',
      })
    } catch (error) {
      console.error('Error updating user:', error)
      next(error)
    }
  },
]

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Missing user ID')

    const user = await userService.deleteUser(id)
    if (!user) throw new NotFoundError('User not found')

    return successMessage({
      res,
      data: user,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting a specific user:', error)
    next(error)
  }
}
