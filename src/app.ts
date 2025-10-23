import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express';
import routes from './routes/index';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use(routes)

// app.use((req, res) => {
//   res.status(404).json({ msg: 'not found' })
// })

app.use(errorHandler)

// app.get('/', (req, res) => {
//   res.send('Hello World')
// })

app.get('/api/test', (req, res) => {
  res.json({ msg: 'Routes are working' })
})

export default app;



