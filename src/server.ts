import app from './app';
import prisma from './db.config';
const PORT = process.env.PORT || 3000

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
