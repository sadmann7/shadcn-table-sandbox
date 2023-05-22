"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type Skater } from "@prisma/client"
import { ChevronDown, MoreHorizontal } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  Table as ShadcnTable,
  type ColumnDef,
  type ColumnSort,
  type VisibilityState,
} from "unstyled-table"

import { formatPrice } from "@/lib/utils"
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
import type { Order, Sort } from "@/app/page"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

interface UnstyledTableProps {
  data: Skater[]
  itemsCount: number
  pageCount?: number
}

export function UnstyledTable({
  data,
  itemsCount,
  pageCount,
}: UnstyledTableProps) {
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
      {
        accessorKey: "age",
        header: "Age",
        enableColumnFilter: false,
        // Disable sorting for this column
        enableSorting: false,
      },
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

  // Handle global filtering
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Handle column visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  // Handle server-side stuffs
  const page = searchParams.get("page")
  const sort = searchParams.get("sort") as Sort
  const order = searchParams.get("order") as Order

  const [sorting] = React.useState<ColumnSort[]>([
    {
      id: sort ?? ("name" satisfies Sort),
      desc: order === "desc" ? true : false,
    },
  ])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-5 py-4">
        <Input
          placeholder="Search..."
          className="max-w-xs"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
              <ChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto min-w-[8rem] p-1">
            <div className="flex items-center space-x-2 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <input id="toggleAllColumns" type="checkbox" className="peer" />
              <label
                htmlFor="toggleAllColumns"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Toggle All
              </label>
            </div>
            {Array.from({ length: 6 }).map((column, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <input type="checkbox" id={i.toString()} className="peer" />
                <label
                  htmlFor={i.toString()}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {`Column ${i}`}
                </label>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      <ShadcnTable
        columns={columns}
        // The inline `[]` prevents re-rendering the table when the data changes.
        data={data ?? []}
        // States controlled by the table
        state={{ globalFilter, columnVisibility, sorting }}
        // Handle global filtering
        setGlobalFilter={setGlobalFilter}
        // Handle column visibility
        setColumnVisibility={setColumnVisibility}
        // Handle server-side sorting
        manualPagination
        itemsCount={itemsCount ?? 10}
        renders={{
          table: ({ children }) => <Table>{children}</Table>,
          header: ({ children }) => <TableHeader>{children}</TableHeader>,
          headerRow: ({ children }) => <TableRow>{children}</TableRow>,
          headerCell: ({ children, header }) => (
            <TableHead
              // Handle server-side sorting
              onClick={() => {
                const isSortable = header.column.getCanSort()
                const nextSortDirection = header.column.getNextSortingOrder()

                // Update the URL with the new sort order if the column is sortable
                isSortable &&
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
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push(
                      `/?page=${Number(page) - 1}${
                        sort ? `&sort=${sort}&order=${order}` : ""
                      }`
                    )
                  }}
                  disabled={Number(page) === 1}
                >
                  Previous
                  <span className="sr-only">Previous page</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push(
                      `/?page=${Number(page) + 1}${
                        sort ? `&sort=${sort}&order=${order}` : ""
                      }`
                    )
                  }}
                  disabled={Number(page) === pageCount ?? 10}
                >
                  Next
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            )
          },
        }}
      />
    </div>
  )
}
