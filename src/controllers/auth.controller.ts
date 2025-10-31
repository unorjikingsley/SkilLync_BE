import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service';
import upload, { formatImage } from '../middleware/multerMiddleware'
import { BadRequestError } from '../utils/errorHandler'
import { StatusCodes } from 'http-status-codes';
import { RegisterInput } from '../types/auth.types';

// ✅ Cookie lifespan (same as JWT expiry)
const COOKIE_EXPIRY_MS = 24 * 60 * 60 * 1000 // 1 day
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export class AuthController {
  /**
   * @desc Register a new user
   * @route POST /api/auth/register
   * @access Public
   */
  static register = [
    upload.single('profileImage'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password, firstName, lastName, bio, role } = req.body

        let profileImageBase64: string | undefined

        if (req.file) {
          profileImageBase64 = formatImage(req.file)
        }

        const registerData: RegisterInput = {
          email,
          password,
          firstName,
          lastName,
          bio,
          role,
          ...(profileImageBase64 ? { profileImage: profileImageBase64 } : {}),
        }

        const result = await AuthService.registerUser(registerData)

        return res.status(201).json(result)
      } catch (error) {
        next(error)
      }
    },
  ]

  /**
   * @desc Verify user email
   * @route GET /api/auth/verify/:token
   * @access Public
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string
      if (!token || typeof token !== 'string') {
        throw new BadRequestError('Invalid verification token')
      }

      const result = await AuthService.verifyEmail(token)
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @desc Login user
   * @route POST /api/auth/login
   * @access Public
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      const setCookie = req.body.setCookie ?? false

      // 🟩 Call service to authenticate user
      const { accessToken, refreshToken, user } = await AuthService.loginUser({
        email,
        password,
      })

      // 🟩 If `setCookie` is true, set HTTP-only cookies
      if (setCookie) {
        res.cookie('auth_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: COOKIE_EXPIRY_MS,
        })

        res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: REFRESH_EXPIRY_MS,
        })
      }

      // 🟩 Respond with token only if not using cookies
      return res.status(StatusCodes.OK).json({
        message: 'Login successful',
        token: setCookie ? undefined : accessToken,
        refreshToken: setCookie ? undefined : refreshToken,
        user,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * @desc Logout user
   * @route POST /api/auth/logout
   * @access Private
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('auth_token')
      res.clearCookie('refresh_token')
      const result = await AuthService.logoutUser()
      return res.status(StatusCodes.OK).json(result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @desc Refresh access token
   * @route POST /api/auth/refresh
   * @access Public (requires valid refresh token)
   */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Prefer cookie if available, otherwise body
      const refreshToken = req.cookies?.refresh_token || req.body.refreshToken

      if (!refreshToken) {
        throw new BadRequestError('Refresh token missing')
      }

      const result = await AuthService.refresh(refreshToken)

      return res.status(StatusCodes.OK).json({
        message: 'Access token refreshed successfully',
        ...result,
      })
    } catch (error) {
      next(error)
    }
  }
}
