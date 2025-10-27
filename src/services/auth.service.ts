import prisma from '../db.config'
import { hashPassword, comparePassword } from '../utils/passwordUtils'
import { createJWT, verifyRefreshToken, createRefreshToken } from '../utils/tokenUtil'
import cloudinary from 'cloudinary'
import crypto from 'crypto'
import { sendVerificationEmail } from '../utils/emailService'
import { BadRequestError, UnauthenticatedError } from '@utils/errorHandler'
import { RegisterInput, LoginInput } from 'types/auth.types'

export class AuthService {
  // Register user
  static async registerUser(data: RegisterInput) {
    const { email, password, firstName, lastName, bio, role, profileImage } =
      data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      if (existingUser.isVerified) {
        throw new Error('Email already registered and verified. Please log in.')
      } else {
        // User exists but not verified – resend verification link
        // generate a new random token (32-byte hex string)
        const newVerificationToken = crypto.randomBytes(32).toString('hex')

        await prisma.user.update({
          where: { email },
          data: { verificationToken: newVerificationToken },
        })

        await sendVerificationEmail(existingUser.email, newVerificationToken)

        return {
          message:
            'This email is already registered but not verified. A new verification link has been sent to your email.',
        }
      }
    }

    // Upload image to Cloudinary if provided
    let uploadedImageUrl = null
    let uploadedImagePublicId = null

    if (profileImage) {
      const uploaded = await cloudinary.v2.uploader.upload(profileImage, {
        folder: 'skillync_user',
      })
      uploadedImageUrl = uploaded.secure_url
      uploadedImagePublicId = uploaded.public_id
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    const normalizedData = {
      bio: bio ?? null,
      profileImage: uploadedImageUrl ?? null,
      profileImageId: uploadedImagePublicId ?? null,
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        verificationToken,
        ...normalizedData,
      },
    })

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken)

    return {
      message: 'User registered successfully. Please verify your email.',
      user: { email: user.email, firstName: user.firstName },
    }
  }

  static async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    })
    if (!user) throw new Error('Invalid or expired token.')

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    })

    return {
      message:
        'Email verified successfully. You can now login to your account.',
    }
  }

  // Login user (JWT + optional cookie)
  static async loginUser(data: LoginInput) {
    const { email, password } = data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new BadRequestError('Invalid email or password.')

    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) throw new BadRequestError('Invalid email or password.')

    if (!user.isVerified)
      throw new UnauthenticatedError(
        'Please verify your email before logging in.'
      )

    const accessToken = createJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
    const refreshToken = createRefreshToken(user.id)

    return { accessToken, refreshToken, user }
  }

  // REFRESH ACCESS TOKEN
  static async refresh(refreshToken: string) {
    try {
      // ✅ Verify refresh token using helper
      const decoded = verifyRefreshToken(refreshToken)
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user) throw new Error('User not found.')

      // ✅ Create a new access token (not refresh token again)
      const newAccessToken = createJWT({
        id: user.id,
        email: user.email,
        role: user.role,
      })

      return { accessToken: newAccessToken }
    } catch (error) {
      throw new Error('Invalid or expired refresh token.')
    }
  }

  // Google OAuth login (to be implemented later)
  static async googleLogin(googleData: { token: string }) {
    // integrate Google Identity verification here
    // verify Google token → extract profile → create/find user in DB
    return { message: 'Google login coming soon', googleData }
  }

  static async logoutUser() {
    // Stateless JWT logout - handled on client
    return { message: 'Logout successful.' }
  }
}
