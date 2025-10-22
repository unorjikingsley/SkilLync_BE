import { Request, Response, NextFunction } from 'express'
import { CustomError } from '../utils/errorHandler';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Fallback for unknown errors
  console.error(err)
  return res.status(500).json({ error: 'Internal server error' })
}
