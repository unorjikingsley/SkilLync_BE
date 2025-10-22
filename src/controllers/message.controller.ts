import { Request, Response, NextFunction } from 'express'
import * as messageService from '../services/message.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'

// Send a message
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { senderId, receiverId, content } = req.body
    if (!senderId || !receiverId || !content) {
      throw new BadRequestError(
        'senderId, receiverId, and content are required'
      )
    }

    const message = await messageService.sendMessage({
      senderId,
      receiverId,
      content,
    })
    return successMessage({
      res,
      data: message,
      message: 'Message sent successfully',
      statusCode: 201,
    })
  } catch (error) {
    next(error)
  }
}

// List messages per user (inbox or sent)
export const getAllMessagesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params
    if (!userId) throw new BadRequestError('userId is required')

    const messages = await messageService.getMessagesByUser(userId)
    return successMessage({
      res,
      data: messages,
      message: 'Messages retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getInboxMessagesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params
    if (!userId) throw new BadRequestError('userId is required')

    const messages = await messageService.getInboxMessagesByUser(userId)
    return successMessage({
      res,
      data: messages,
      message: 'Inbox messages retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Get sent messages
export const getSentMessagesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params
    if (!userId) throw new BadRequestError('userId is required')

    const messages = await messageService.getSentMessagesByUser(userId)
    return successMessage({
      res,
      data: messages,
      message: 'Sent messages retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}
