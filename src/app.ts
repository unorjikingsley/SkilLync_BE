import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express';
import userRoutes from './routes/user.route';
import skillRoutes from './routes/skill.route';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/api', userRoutes)
app.use('/api', skillRoutes)

export default app;
