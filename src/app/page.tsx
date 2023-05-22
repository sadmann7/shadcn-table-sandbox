import { prisma } from "@/lib/db"
import { UnstyledTable } from "@/components/unstyled-table"

export type Sort = "name" | "age" | "email" | "stats" | "stance" | "deckPrice"
export type Order = "asc" | "desc"

interface IndexPageProps {
  searchParams: {
    page?: string
    sort?: Sort
    order?: Order
  }
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const { page, sort, order } = searchParams

  // Current page number
  const pageNumber = typeof page === "string" ? +page : 1
  // Number of skaters to show per page
  const itemsCount = 10

  // Get 10 skaters from the database
  const skaters = await prisma.skater.findMany({
    // For server-side pagination
    take: itemsCount,
    skip: pageNumber * itemsCount,
    // For server-side sorting
    orderBy: {
      [sort ?? "name"]: order ?? "asc",
    },
  })

  return (
    <main className="container grid items-center py-6">
      {/* <UnstyledTable data={skaters} itemsCount={itemsCount} /> */}
    </main>
  )
}
