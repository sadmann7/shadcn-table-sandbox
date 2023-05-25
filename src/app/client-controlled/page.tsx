import { prisma } from "@/lib/db"
import { ClientControlledTable } from "@/components/client-controlled-table"
import { columns } from "@/components/columns"

export default async function ClinetControlledPage() {
  const skaters = await prisma.skater.findMany()

  return (
    <main className="container grid items-center py-5">
      <ClientControlledTable data={skaters} columns={columns} />
    </main>
  )
}
