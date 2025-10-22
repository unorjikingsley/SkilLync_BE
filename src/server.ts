import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express';
import prisma from './db.config';

const app = express()

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World')
})

async function main() {
  try {
    await prisma.$connect()
    console.log('SkillyncDB is connected')

    app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}...`)
    })
  } catch (error) {
    console.error('PSQL Connection Error:', error)
    process.exit(1)
  }
}

main();
