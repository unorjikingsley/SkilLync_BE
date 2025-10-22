import { Response } from 'express'

export const handleError = (res: Response, error: unknown, status = 400) => {
  console.error(error)
  const message =
    error instanceof Error ? error.message : 'Something went wrong'
  return res.status(status).json({ error: message })
}
