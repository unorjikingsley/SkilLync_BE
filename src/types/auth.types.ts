import { Role } from '@prisma/client'

export interface RegisterInput {
  email: string
  password: string
  firstName: string
  lastName: string
  bio?: string
  role: Role
  profileImage?: string
  profileImagePublicId?: string
}

export interface LoginInput {
  email: string
  password: string
  setCookie?: boolean
}

export interface JWTPayload {
  id: string
  email: string
  role?: Role
}
