import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express';

const app = express()

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World')
})

try {
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}...`)
  })
} catch (error) {
  console.log(error)
  process.exit(1)
}
