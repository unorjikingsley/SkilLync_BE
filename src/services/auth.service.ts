import prisma from '../db.config'
import { hashPassword, comparePassword } from '../utils/passwordUtils'
import { createJWT, verifyRefreshToken, createRefreshToken } from '../utils/tokenUtil'
import cloudinary from 'cloudinary'
import crypto from 'crypto'
import { sendVerificationEmail } from '../utils/emailService'
import { BadRequestError, UnauthenticatedError } from '../utils/errorHandler'
import { RegisterInput, LoginInput } from 'types/auth.types'

export class AuthService {
  // Register user
  static async registerUser(data: RegisterInput) {
    const { email, password, firstName, lastName, bio, role, profileImage } =
      data

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
      select: { id: true, isVerified: true },
    })

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new BadRequestError(
          'Email already registered and verified. Please log in.'
        )
      } else {
        // User exists but not verified – resend verification link
        // generate a new random token (32-byte hex string)
        const newVerificationToken = crypto.randomBytes(32).toString('hex')
        const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verificationToken: newVerificationToken,
            verificationTokenExpiresAt: newExpiry,
          },
        })

        await sendVerificationEmail(email, newVerificationToken)

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
    const verificationTokenExpiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24
    ) // 24h

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
        ...normalizedData,
        verificationToken,
        verificationTokenExpiresAt,
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
      where: {
        verificationToken: token,
        verificationTokenExpiresAt: { gt: new Date() }, // token expiry in DB must be greater than now
      },
      select: { id: true, isVerified: true },
    })
    if (!user) {
      // Either token invalid or expired (we don't reveal which for security)
      throw new BadRequestError('Invalid or expired verification token.')
    }

    // If already verified (unlikely since token would probably be cleared), return success
    if (user.isVerified) {
      return { message: 'Email already verified.' }
    }

    // Mark verified and clear token + expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    })
    return {
      message:
        'Email verified successfully. You can now login to your account.',
    }
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

  // Login user (JWT + optional cookie)
  static async loginUser(data: LoginInput) {
    const { email, password } = data

    // findFirst with deletedAt filter (deletedAt is nullable, ensure active user)
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isVerified: true,
      },
    })

    if (!user) {
      throw new BadRequestError('Invalid email or password.')
    }

    // compare password (bcrypt)
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      throw new BadRequestError('Invalid email or password.')
    }

    // Ensure verified
    if (!user.isVerified) {
      throw new UnauthenticatedError(
        'Please verify your email before logging in.'
      )
    }

    // Create tokens
    const accessToken = createJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
    const refreshToken = createRefreshToken(user.id)

    // Return safe user object (omit password)
    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    }

    return { accessToken, refreshToken, user: safeUser }
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
