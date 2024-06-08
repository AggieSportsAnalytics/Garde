const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const idealAngles = await prisma.idealAngles.findMany();
    console.log(idealAngles)    
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })