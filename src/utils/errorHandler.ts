import { StatusCodes } from 'http-status-codes';

// Base custom error type
export class CustomError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND)
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string = 'Bad request') {
    super(message, StatusCodes.BAD_REQUEST)
  }
}

export class UnauthenticatedError extends CustomError {
  constructor(message: string = 'Unauthenticated') {
    super(message, StatusCodes.UNAUTHORIZED)
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(message, StatusCodes.FORBIDDEN)
  }
}

