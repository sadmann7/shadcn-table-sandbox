"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { type Skater } from "@prisma/client"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Order, Sort } from "@/app/page"

import { DebouncedInput } from "./debounced-input"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

interface UnstyledTableProps {
  data: Skater[]
  pageCount?: number
}

export function UnstyledTable({ data, pageCount }: UnstyledTableProps) {
  const router = useRouter()
  const path = usePathname()
  const searchParams = useSearchParams()

  const page = searchParams.get("page") ?? "1"
  const items = searchParams.get("items") ?? "10"
  const sort = (searchParams.get("sort") ?? "name") as Sort
  const order = searchParams.get("order") as Order | null
  const query = searchParams.get("query")

  // create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Skater, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "age",
        header: "Age",
        // Disable column filter for this column
        enableColumnFilter: false,
        // Disable sorting for this column
        enableSorting: false,
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      { accessorKey: "stats", header: "Stats", enableColumnFilter: false },
      {
        accessorKey: "stance",
        header: "Stance",
        // Cell value formatting
        cell: ({ row }) => (
          <span className="capitalize">{row.getValue("stance")}</span>
        ),
      },
      {
        accessorKey: "deckPrice",
        // Column header formatting
        header: () => <span className="text-left">Deck Price</span>,
        // Cell value formatting
        cell: ({ row }) => formatPrice(row.getValue("deckPrice")),
      },
      // Actions column
      {
        id: "actions",
        cell: ({ row }) => {
          const skater = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
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

  // Handle server-side column (email) filtering
  const [emailFilter, setEmailFilter] = React.useState(query ?? "")

  // Handle server-side column sorting
  const [sorting] = React.useState<ColumnSort[]>([
    {
      id: sort,
      desc: order === "desc" ? true : false,
    },
  ])

  return (
    <React.Fragment>
      <div className="flex items-center justify-between gap-5 py-4">
        <Input
          className="hidden max-w-xs"
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <DebouncedInput
          className="max-w-xs"
          placeholder="Filter emails.."
          value={emailFilter}
          onChange={(value) => {
            setEmailFilter(value.toString())
            router.push(
              `${path}?${createQueryString({
                page: page,
                query: value.toString(),
              })}`
            )
          }}
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
            {Array.from({ length: 6 }).map((_, i) => (
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
        manualFiltering
        itemsCount={Number(items)}
        renders={{
          table: ({ children }) => <Table>{children}</Table>,
          header: ({ children }) => <TableHeader>{children}</TableHeader>,
          headerRow: ({ children }) => <TableRow>{children}</TableRow>,
          headerCell: ({ children, header }) => (
            <TableHead
              className="whitespace-nowrap"
              // Handle server-side sorting
              onClick={() => {
                const isSortable = header.column.getCanSort()
                const nextSortDirection = header.column.getNextSortingOrder()

                // Update the URL with the new sort order if the column is sortable
                isSortable &&
                  router.push(
                    `${path}?${createQueryString({
                      page: page,
                      sort: nextSortDirection ? header.column.id : null,
                      order: nextSortDirection ? nextSortDirection : null,
                    })}`
                  )
              }}
            >
              {children}
            </TableHead>
          ),
          body: ({ children }) => (
            <TableBody>
              {data.length ? (
                children
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          ),
          bodyRow: ({ children }) => <TableRow>{children}</TableRow>,
          bodyCell: ({ children }) => <TableCell>{children}</TableCell>,
          filterInput: ({}) => null,
          // Custom pagination bar
          paginationBar: () => {
            return (
              <div className="flex flex-col-reverse items-center gap-4 py-4 md:flex-row">
                <div className="flex-1 text-sm font-medium">
                  {items.length} of {items.length} row(s) selected.
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
                  <div className="flex flex-wrap items-center space-x-2">
                    <span className="text-sm font-medium">
                      Results per page
                    </span>
                    <Select
                      value={items}
                      onValueChange={(value) => {
                        router.push(
                          `${path}?${createQueryString({
                            page: page,
                            items: value,
                          })}`
                        )
                      }}
                    >
                      <SelectTrigger className="h-8 w-16">
                        <SelectValue placeholder={items} />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 30, 40, 50].map((item) => (
                          <SelectItem key={item} value={item.toString()}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm font-medium">
                    {`Page ${page} of ${pageCount ?? 10}`}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => {
                        router.push(
                          `${path}?${createQueryString({
                            page: 1,
                          })}`
                        )
                      }}
                      disabled={Number(page) === 1}
                    >
                      <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">First page</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => {
                        router.push(
                          `${path}?${createQueryString({
                            page: Number(page) - 1,
                          })}`
                        )
                      }}
                      disabled={Number(page) === 1}
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => {
                        router.push(
                          `${path}?${createQueryString({
                            page: Number(page) + 1,
                          })}`
                        )
                      }}
                      disabled={Number(page) === pageCount ?? 10}
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Next page</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => {
                        router.push(
                          `${path}?${createQueryString({
                            page: pageCount ?? 10,
                          })}`
                        )
                      }}
                      disabled={Number(page) === pageCount ?? 10}
                    >
                      <ChevronsRight className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Last page</span>
                    </Button>
                  </div>
                </div>
              </div>
            )
          },
        }}
      />
    </React.Fragment>
  )
}
