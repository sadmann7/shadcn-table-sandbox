import { prisma } from "@/lib/db"
import { UnstyledTable } from "@/components/unstyled-table"

export type Sort = "name" | "age" | "email" | "stats" | "stance" | "deckPrice"
export type Order = "asc" | "desc"

interface IndexPageProps {
  searchParams: {
    page?: string
    sort?: Sort
    order?: Order
    query?: string
  }
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const { page, sort, order, query } = searchParams

  // Current page number
  const pageNumber = typeof page === "string" ? +page : 1
  // Number of skaters to show per page
  const itemsCount = 10

  // Get skaters and total skaters count in a single query
  const [skaters, totalSkaters] = await prisma.$transaction([
    prisma.skater.findMany({
      // For server-side pagination
      take: itemsCount,
      skip: (pageNumber - 1) * itemsCount,
      // For server-side sorting
      orderBy: {
        [sort ?? "name"]: order ?? "asc",
      },
      // For server-side filtering
      where: {
        email: query ? { contains: query, mode: "insensitive" } : undefined,
      },
    }),
    prisma.skater.count(),
  ])

  // Page count
  const pageCount = Math.ceil(totalSkaters / itemsCount)

  return (
    <main className="container grid items-center py-6">
      <UnstyledTable
        data={skaters}
        itemsCount={itemsCount}
        pageCount={pageCount}
      />
    </main>
  )
}
