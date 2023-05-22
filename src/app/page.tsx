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

export default function IndexPage({ searchParams }: IndexPageProps) {
  const { page, sort, order } = searchParams

  return <main className="container grid items-center py-6"></main>
}
