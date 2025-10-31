// import { BadRequestError } from '../utils/errorHandler';
import prisma from '../db.config';
import { User, Prisma } from '@prisma/client';
import { findActiveUserByEmail, findActiveUserById } from '../utils/user.utils';
import { v2 as cloudinary } from 'cloudinary';
import { BadRequestError } from '@utils/errorHandler';
import bcrypt from 'bcrypt';

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
): Promise<Partial<User> | null> => {
  try {
    // 1) Ensure user exists and is active
    const user = await findActiveUserById(id)
    if (!user) return null

    // 2) Prevent updates to restricted fields
    const restrictedFields = [
      'id',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'isVerified',
      'verificationToken',
      'verificationTokenExpiresAt',
    ]
    for (const field of restrictedFields) {
      if (field in (data as any)) delete (data as any)[field]
    }

    // 3) Validate & normalize email if present
    if ((data as any).email && typeof (data as any).email === 'string') {
      const email = (data as any).email as string
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email))
        throw new BadRequestError('Invalid email format')

      const existingEmail = await prisma.user.findFirst({
        where: { email, id: { not: id } },
        select: { id: true },
      })
      if (existingEmail) throw new BadRequestError('Email already in use')
    }

    // 4) Validate role if present (adjust values to match your Prisma Role enum)
    if ((data as any).role) {
      const roleVal = String((data as any).role)
      const allowedRoles = ['CLIENT', 'FREELANCER', 'ADMIN'] // match your Prisma enum
      if (!allowedRoles.includes(roleVal))
        throw new BadRequestError('Invalid role value')
    }

    // 5) Hash password if being updated
    if ((data as any).password && typeof (data as any).password === 'string') {
      const hashed = await bcrypt.hash((data as any).password as string, 10)
      ;(data as any).password = hashed
    }

    // 6) Profile image handling:
    //    If caller passed profileImage (base64 data URL string), upload to Cloudinary.
    //    Expect: data.profileImage contains a base64 string, not a URL.
    let newProfileImageUrl: string | null = null
    let newProfileImageId: string | null = null

    if (
      (data as any).profileImage &&
      typeof (data as any).profileImage === 'string'
    ) {
      const imageData = (data as any).profileImage as string

      // Upload to Cloudinary
      try {
        const uploaded = await cloudinary.uploader.upload(imageData, {
          folder: 'skillync_user',
          overwrite: true,
          resource_type: 'image',
        })
        newProfileImageUrl = uploaded.secure_url
        newProfileImageId = uploaded.public_id
      } catch (err) {
        console.error('Cloudinary upload failed:', err)
        throw new Error('Failed to upload profile image. Please try again.')
      }

      // Attach to the update payload
      ;(data as any).profileImage = newProfileImageUrl
      ;(data as any).profileImageId = newProfileImageId

      // Delete old image from Cloudinary if exists (best-effort)
      if (user.profileImageId) {
        try {
          await cloudinary.uploader.destroy(user.profileImageId)
        } catch (err) {
          console.warn('Cloudinary old-image delete failed:', err)
          // don't throw — not critical
        }
      }
    } else {
      // If profileImage is not provided in update, ensure we don't overwrite existing field unintentionally
      if (!('profileImage' in (data as any))) {
        delete (data as any).profileImage
      }
      if (!('profileImageId' in (data as any))) {
        delete (data as any).profileImageId
      }
    }

    // 7) Perform the update
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    })

    // 8) Strip sensitive fields before returning
    const {
      password,
      verificationToken,
      verificationTokenExpiresAt,
      ...safeUser
    } = updatedUser

    return safeUser
  } catch (error) {
    console.error('Update User Error:', error)
    throw error
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
