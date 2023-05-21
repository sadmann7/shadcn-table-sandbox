"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type Skater } from "@prisma/client"
import { MoreHorizontal } from "lucide-react"
import { toast } from "react-hot-toast"
import ReactPaginate from "react-paginate"
import { Table as ShadcnTable, type ColumnDef } from "unstyled-table"

import { cn, formatPrice } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button, buttonVariants } from "./ui/button"

interface UnstyledTableProps {
  data: Skater[]
  pageCount: number
}

export function UnstyledTable({ data, pageCount }: UnstyledTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Skater, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        // Disable column filter for this column
        enableColumnFilter: false,
      },
      { accessorKey: "age", header: "Age", enableColumnFilter: false },
      { accessorKey: "email", header: "Email", enableColumnFilter: false },
      { accessorKey: "stats", header: "Stats", enableColumnFilter: false },
      {
        accessorKey: "stance",
        header: "Stance",
        // Cell value formatting
        cell: ({ row }) => (
          <span className="capitalize">{row.getValue("stance")}</span>
        ),
        enableColumnFilter: false,
      },
      {
        accessorKey: "deckPrice",
        // Column header formatting
        header: () => <span className="text-left">Deck Price</span>,
        // Cell value formatting
        cell: ({ row }) => formatPrice(row.getValue("deckPrice")),
        enableColumnFilter: false,
      },
      // Actions column
      {
        id: "actions",
        cell: ({ row }) => {
          const skater = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    void navigator.clipboard.writeText(skater.id)
                    toast.success("Skater ID copied to clipboard")
                  }}
                >
                  Copy skater ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View skater</DropdownMenuItem>
                <DropdownMenuItem>View deck details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  // Handle server-side stuffs
  const page = searchParams.get("page")
  const sort = searchParams.get("sort")
  const order = searchParams.get("order")

  return (
    <ShadcnTable
      columns={columns}
      // The inline `[]` prevents re-rendering the table when the data changes.
      data={data ?? []}
      // This let you implement your own pagination
      manualPagination
      renders={{
        table: ({ children }) => <Table>{children}</Table>,
        header: ({ children }) => <TableHeader>{children}</TableHeader>,
        headerRow: ({ children }) => <TableRow>{children}</TableRow>,
        headerCell: ({ children, header }) => (
          <TableHead
            // Handle server-side sorting
            onClick={() => {
              const nextSortDirection = header.column.getNextSortingOrder()

              // Update the URL with the new sort order
              router.push(
                `/?page=${page ? page : 1}${
                  nextSortDirection === false
                    ? ""
                    : `&sort=${header.column.id}&order=${nextSortDirection}`
                }`
              )
            }}
          >
            {children}
          </TableHead>
        ),
        body: ({ children }) => <TableBody>{children}</TableBody>,
        bodyRow: ({ children }) => <TableRow>{children}</TableRow>,
        bodyCell: ({ children }) => <TableCell>{children}</TableCell>,
        // Custom pagination bar
        paginationBar: () => {
          return (
            <ReactPaginate
              className="flex items-center gap-2.5 p-4"
              pageCount={pageCount}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              previousClassName={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
              nextClassName={buttonVariants({
                variant: "outline",
                size: "sm",
              })}
              pageClassName={cn(
                buttonVariants({
                  size: "sm",
                  variant: "outline",
                }),
                "w-8 h-8 px-0"
              )}
              disabledClassName="opacity-50 pointer-events-none"
              onPageChange={({ selected }) => {
                const selectedPage = selected + 1
                // Update the URL with the new page number, sort, and order
                router.push(
                  `/?page=${selectedPage}${
                    sort ? `&sort=${sort}${order ? `&order=${order}` : ""}` : ""
                  }`
                )
              }}
            />
          )
        },
      }}
    />
  )
}
