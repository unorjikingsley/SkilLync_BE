import { Message } from "@prisma/client";
import prisma from "../db.config";

interface SendMessageInput {
  senderId: string
  receiverId: string
  content: string
}

// Send a message
export const sendMessage = async (data: SendMessageInput): Promise<Message> => {
  return prisma.message.create({
    data,
  })
}

// List all messages sent or received by a user
export const getMessagesByUser = async (userId: string): Promise<Message[]> => {
  return prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

// Inbox messages (received)
export const getInboxMessagesByUser = async (userId: string): Promise<Message[]> => {
  return prisma.message.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: 'desc' },
  });
};

// Sent messages
export const getSentMessagesByUser = async (userId: string): Promise<Message[]> => {
  return prisma.message.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: 'desc' },
  });
};
