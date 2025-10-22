import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express';
import routes from './routes/index';
import { errorHandler } from './middleware/error.middleware';

const app = express();
app.use(express.json());

app.use(routes)

app.use(errorHandler)

app.get('/', (req, res) => {
  res.send('Hello World')
})



export default app;
