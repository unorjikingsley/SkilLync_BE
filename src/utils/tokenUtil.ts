import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types/auth.types';

const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRES_IN || '1d'
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d'

/**
 * Create a signed JWT token
 * @param payload - data to embed in token (e.g., user id, email, role)
 * @returns string - signed JWT token
 */

export const createJWT = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET as string

  // Explicitly cast expiresIn to ms.StringValue (from jsonwebtoken types)  
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY as any,
    //   expiresIn: process.env
    //     .JWT_EXPIRES_IN as unknown as jwt.SignOptions['expiresIn'],
  }

  const token = jwt.sign(payload, secret, options)

  return token
}

export const createRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET as string
  const payload = { userId }
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY as any
  }
  return jwt.sign(payload, secret, options)
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded token payload
 */

export const verifyJWT = (token: string): JWTPayload => {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JWTPayload
  return decoded
}

export const verifyRefreshToken = (token: string): { userId: string } => {
  const decoded = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET as string
  ) as {
    userId: string
    iat: number
    exp: number
  }
  return decoded
}
