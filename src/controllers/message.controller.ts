import { Request, Response, NextFunction } from 'express'
import * as messageService from '../services/message.service'
import { successMessage } from '../utils/successMessage'
import { BadRequestError } from '../utils/errorHandler'

// ✅ Create message
export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { senderId, receiverId, content } = req.body
    const message = await messageService.createMessage({
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

// ✅ Get all messages
export const getAllMessages = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const messages = await messageService.getAllMessages()
    return successMessage({
      res,
      data: messages,
      message: 'Messages retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get conversation between two users
export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId1, userId2 } = req.params
    if (!userId1 || !userId2)
      throw new BadRequestError('Both user IDs are required')

    const conversation = await messageService.getConversation(userId1, userId2)
    return successMessage({
      res,
      data: conversation,
      message: 'Conversation retrieved',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Get messages by sender
export const getMessagesBySender = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { senderId } = req.params
    if (!senderId) throw new BadRequestError('Sender ID is required')

    const messages = await messageService.getMessagesBySender(senderId)
    return successMessage({
      res,
      data: messages,
      message: 'Messages retrieved successfully',
    })
  } catch (error) {
    next(error)
  }
}

// PATCH /messages/:id/edit
export const editMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messageId = req.params.id
    const { senderId, newContent } = req.body

    if (!messageId || !senderId) {
      throw new BadRequestError('Review ID and Reviewer ID are required')
    }

    const updatedMessage = await messageService.editMessage(messageId, senderId, newContent)

    return successMessage({
      res,
      data: updatedMessage,
      message: 'Message updated successfully',
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Delete message
export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    if (!id) throw new BadRequestError('Message ID is required')

    const deleted = await messageService.deleteMessage(id)
    return successMessage({
      res,
      data: deleted,
      message: 'Message deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
