import { faker } from "@faker-js/faker"
import { type Skater } from "@prisma/client"

import { prisma } from "@/lib/db"
import { UnstyledTable } from "@/components/unstyled-table"

faker.seed(69420)

export type Sort = "name" | "age" | "email" | "stats" | "stance" | "deckPrice"
export type Order = "asc" | "desc"
export type Query = "name" | "email"

interface IndexPageProps {
  searchParams: {
    page?: string
    sort?: Sort
    order?: Order
  }
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const { page, sort, order } = searchParams

  const pageNumber = typeof page === "string" ? +page : 1
  const pageCount = 10

  // Get 10 skaters from the database
  const skaters = await prisma.skater.findMany({
    // For server-side pagination
    take: pageCount,
    skip: pageNumber * 10,
    // For server-side sorting
    orderBy: {
      [sort ?? "name"]: order ?? "asc",
    },
  })

  // await prisma.skater.deleteMany()

  // Generate 100 skaters if there are none
  if (!skaters.length) {
    for (let i = 0; i < 100; i++) {
      const name = faker.person.firstName()
      const age = faker.number.int({ min: 10, max: 100 })
      const email = faker.internet.email()
      const stats = faker.number.int({ min: 10, max: 100 })
      const stance =
        faker.helpers.shuffle<Skater["stance"]>(["mongo", "goofy"])[0] ??
        "goofy"
      const deckPrice = faker.number.int({ min: 25, max: 100 })

      // Save the skaters to the database
      await prisma.skater.create({
        data: {
          name,
          age,
          email,
          stats,
          stance,
          deckPrice,
        },
      })
    }
  }

  return (
    <main className="container py-6">
      <UnstyledTable data={skaters} pageCount={pageCount} />
    </main>
  )
}
