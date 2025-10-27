import multer, { StorageEngine } from 'multer'
import DatauriParser from 'datauri/parser'
import path from 'path'

// Configure multer to store file in memory
const storage: StorageEngine = multer.memoryStorage()
const upload = multer({ storage })

const parser = new DatauriParser()

export const formatImage = (file: Express.Multer.File): string | undefined => {
  if (!file) return undefined
  const fileExtension = path.extname(file.originalname).toString()
  return parser.format(fileExtension, file.buffer)?.content
}

export default upload

