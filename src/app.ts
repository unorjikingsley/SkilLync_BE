import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express';
import prisma from './db.config';

const app = express()

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World')
})

export default app;
