import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express';
import routes from './routes/index';
import { errorHandler } from './middleware/error.middleware';
import { v2 as cloudinary} from 'cloudinary'
import cookieParser from 'cookie-parser';

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,
  api_key: process.env.CLOUD_API_KEY!,
  api_secret: process.env.CLOUD_API_SECRET!,
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser());

app.use(routes)

app.use(errorHandler)

app.get('/api/test', (req, res) => {
  res.json({ msg: 'Routes are working' })
})

export default app;
