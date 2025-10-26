import prisma from '../db.config'
import { BadRequestError, NotFoundError } from '../utils/errorHandler'
import { Message } from '@prisma/client'

interface CreateMessageInput {
  senderId: string
  receiverId: string
  content: string
}

// ✅ Create message between two users
export const createMessage = async (
  data: CreateMessageInput
): Promise<Message> => {
  const { senderId, receiverId, content } = data

  if (!senderId || !receiverId || !content)
    throw new BadRequestError('Sender, receiver, and content are required')

  if (senderId === receiverId)
    throw new BadRequestError('Sender and receiver cannot be the same user')

  // Validate users
  const sender = await prisma.user.findUnique({
    where: { id: senderId, deletedAt: null },
  })
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId, deletedAt: null },
  })
  if (!sender) throw new NotFoundError('Sender not found or inactive')
  if (!receiver) throw new NotFoundError('Receiver not found or inactive')

  return prisma.message.create({
    data: {
      senderId,
      receiverId,
      content: content.trim(),
    },
  })
}

// ✅ Get all messages (admin or debug view)
export const getAllMessages = async (): Promise<Message[]> => {
  const messages = await prisma.message.findMany({
    include: {
      sender: { select: { firstName: true, lastName: true } },
      receiver: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!messages.length) throw new NotFoundError('No messages found')
  return messages
}

// ✅ Get conversation between two users
export const getConversation = async (
  userId1: string,
  userId2: string
): Promise<Message[]> => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    include: {
      sender: { select: { firstName: true, lastName: true } },
      receiver: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'asc' }, // ascending for chat flow
  })

  if (!messages.length)
    throw new NotFoundError('No conversation found between these users')

  return messages
}

// ✅ Get messages sent by a user
export const getMessagesBySender = async (
  senderId: string
): Promise<Message[]> => {
  const messages = await prisma.message.findMany({
    where: { senderId },
    include: {
      receiver: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!messages.length)
    throw new NotFoundError('No messages found for this sender')
  return messages
}

// Edit a message within 5 minutes after sending
export const editMessage = async (
  messageId: string,
  senderId: string,
  newContent: string
) => {
  console.log('request', messageId, senderId, newContent)
  if (!newContent)
    throw new BadRequestError('Message content cannot be empty')

  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message) throw new NotFoundError('Message not found')

  if (message.senderId !== senderId)
    throw new BadRequestError('You can only edit messages you sent')

  const currentTime = new Date()
  const sentTime = new Date(message.createdAt)
  const minutesSinceSent =
    (currentTime.getTime() - sentTime.getTime()) / (1000 * 60)

  // ⏱ Limit: 5 minutes edit window
  if (minutesSinceSent > 5)
    throw new BadRequestError(
      'Edit window has expired — message can no longer be edited'
    )

  return prisma.message.update({
    where: { id: messageId },
    data: { content: newContent.trim() },
  })
}

// ✅ Delete message
export const deleteMessage = async (id: string): Promise<Message> => {
  const message = await prisma.message.findUnique({ where: { id } })
  if (!message) throw new NotFoundError('Message not found')

  return prisma.message.delete({ where: { id } })
}
