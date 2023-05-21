import { faker } from "@faker-js/faker"
import { PrismaClient, type Skater } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  for (let i = 0; i < 100; i++) {
    await prisma.skater.create({
      data: {
        name: faker.person.firstName(),
        age: faker.number.int({ min: 10, max: 100 }),
        email: faker.internet.email(),
        stats: faker.number.int({ min: 10, max: 100 }),
        stance:
          faker.helpers.shuffle<Skater["stance"]>(["mongo", "goofy"])[0] ??
          "goofy",
        deckPrice: faker.number.int({ min: 25, max: 100 }),
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect()
  })
