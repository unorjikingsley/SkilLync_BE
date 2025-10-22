import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

interface SuccessOptions<T> {
  res: Response
  data?: T
  message?: string
  statusCode?: number
}

export const successMessage = <T>({
  res,
  data,
  message = 'Success',
  statusCode = StatusCodes.OK,
}: SuccessOptions<T>): Response => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  })
}
