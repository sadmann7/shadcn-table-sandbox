import { faker } from "@faker-js/faker"
import { type Skater } from "@prisma/client"

import { prisma } from "@/lib/db"
import { UnstyledTable } from "@/components/unstyled-table"

faker.seed(69420)

interface IndexPageProps {
  searchParams: {
    page?: string
    sort?: "name" | "age" | "email" | "stats" | "stance" | "deckPrice"
    order?: "asc" | "desc"
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

  // Generate 100 skaters if there are none
  if (skaters.length === 0) {
    for (let i = 0; i < 100; i++) {
      const name = faker.name.firstName()
      const age = faker.datatype.number({ min: 10, max: 60 })
      const email = faker.internet.email()
      const stats = faker.datatype.number({ min: 10, max: 100 })
      const stance =
        faker.helpers.shuffle<Skater["stance"]>(["mongo", "goofy"])[0] ??
        "goofy"
      const deckPrice = faker.datatype.number({ min: 25, max: 100 })

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

  return <UnstyledTable data={skaters} pageCount={pageCount} />
}
