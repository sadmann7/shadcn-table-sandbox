import { prisma } from "@/lib/db"
import { ServerControlledTable } from "@/components/server-controlled-table"

export type Sort = "name" | "age" | "email" | "stats" | "stance" | "deckPrice"
export type Order = "asc" | "desc"

interface IndexPageProps {
  searchParams: {
    page?: string
    items?: string
    sort?: Sort
    order?: Order
    query?: string
  }
}

export default async function IndexPage({ searchParams }: IndexPageProps) {
  const { page, items, sort, order, query } = searchParams

  // Number of skaters to show per page
  const limit = items ? parseInt(items) : 10
  // Number of skaters to skip
  const offset = page ? (parseInt(page) - 1) * limit : 1

  // Get skaters and total skaters count in a single query
  const [skaters, totalSkaters] = await prisma.$transaction([
    prisma.skater.findMany({
      // For server-side pagination
      take: limit,
      skip: offset,
      // For server-side filtering
      where: {
        email: query ? { contains: query, mode: "insensitive" } : undefined,
      },
      // For server-side sorting
      orderBy: { [sort ?? "email"]: order ?? "asc" },
    }),
    prisma.skater.count(),
  ])

  // Page count
  const pageCount = Math.ceil(totalSkaters / limit)

  return (
    <main className="container grid items-center py-5">
      <ServerControlledTable data={skaters} pageCount={pageCount} />
    </main>
  )
}
