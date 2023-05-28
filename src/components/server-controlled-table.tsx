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
  type Row,
  type VisibilityState,
} from "unstyled-table"

import { formatDate, formatPrice } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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

import { DebounceInput } from "./debounce-input"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Skeleton } from "./ui/skeleton"

interface ServerControlledTableProps {
  data: Skater[]
  pageCount?: number
}

export function ServerControlledTable({
  data,
  pageCount,
}: ServerControlledTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // This lets us update states without blocking the UI
  // Read more: https://react.dev/reference/react/useTransition#usage
  const [isPending, startTransition] = React.useTransition()

  const page = searchParams.get("page") ?? "1"
  const items = searchParams.get("items") ?? "10"
  const sort = (searchParams.get("sort") ?? "email") as Sort
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

  // Handle row selection
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedRows, setSelectedRows] = React.useState<Row<Skater>[]>([])

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Skater, unknown>[]>(
    () => [
      {
        // Column for row selection
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
              //* This is a workaround for row selection without using the Row Selection API
              setSelectedRows(value ? table.getRowModel().rows : [])
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value)
              //* This is a workaround for row selection without using the Row Selection API
              setSelectedRows((rows) =>
                value ? [...rows, row] : rows.filter((r) => r !== row)
              )
            }}
            aria-label="Select row"
          />
        ),
        // Disable column sorting for this column
        enableSorting: false,
        enableHiding: false,
      },
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
      {
        accessorKey: "createdAt",
        header: "Created At",
        // Cell value formatting
        cell: ({ row }) => formatDate(row.getValue("createdAt")),
        // Date column can not be filtered because dates are not unique
        enableColumnFilter: false,
        enableGlobalFilter: false,
      },
      {
        // Column for row actions
        id: "actions",
        enableHiding: false,
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
  const [email, setEmail] = React.useState(query ?? "")

  // Handle server-side column sorting
  const [sorting] = React.useState<ColumnSort[]>([
    {
      id: sort,
      desc: order === "desc" ? true : false,
    },
  ])

  return (
    <ShadcnTable
      columns={columns}
      // The inline `[]` prevents re-rendering the table when the data changes.
      data={data ?? []}
      // Rows per page
      itemsCount={Number(items)}
      // States controlled by the table
      state={{ globalFilter, columnVisibility, sorting }}
      // Handle global filtering
      setGlobalFilter={setGlobalFilter}
      // Handle column visibility
      setColumnVisibility={setColumnVisibility}
      // These are required for controlled pagination, and filtering
      manualPagination
      manualFiltering
      // Table renderers
      renders={{
        table: ({ children, tableInstance }) => (
          <div className="w-full">
            <div className="flex items-center py-4">
              <DebounceInput
                className="ml-1 max-w-xs"
                placeholder="Filter emails.."
                value={email}
                onChange={(value) => {
                  setEmail(String(value))
                  startTransition(() => {
                    router.push(
                      `${pathname}?${createQueryString({
                        page: 1,
                        query: String(value),
                      })}`
                    )
                  })
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {tableInstance
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => {
                            column.toggleVisibility(!!value)
                          }}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="rounded-md border">
              <Table>{children}</Table>
            </div>
          </div>
        ),
        header: ({ children }) => <TableHeader>{children}</TableHeader>,
        headerRow: ({ children }) => <TableRow>{children}</TableRow>,
        headerCell: ({ children, header }) => (
          <TableHead
            className="whitespace-nowrap"
            // Handle server-side column sorting
            onClick={() => {
              const isSortable = header.column.getCanSort()
              const nextSortDirection = header.column.getNextSortingOrder()

              // Update the URL with the new sort order if the column is sortable
              isSortable &&
                startTransition(() => {
                  router.push(
                    `${pathname}?${createQueryString({
                      page: page,
                      sort: nextSortDirection ? header.column.id : null,
                      order: nextSortDirection ? nextSortDirection : null,
                    })}`
                  )
                })
            }}
          >
            {children}
          </TableHead>
        ),
        body: ({ children }) => (
          <TableBody>
            {data.length
              ? children
              : !isPending && (
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
        bodyCell: ({ children }) => (
          <TableCell>
            {isPending ? <Skeleton className="h-6 w-20" /> : children}
          </TableCell>
        ),
        filterInput: ({}) => null,
        // Custom pagination bar
        paginationBar: () => {
          return (
            <div className="flex flex-col-reverse items-center gap-4 py-4 md:flex-row">
              <div className="flex-1 text-sm font-medium">
                {selectedRows.length} of {items} row(s) selected.
              </div>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
                <div className="flex flex-wrap items-center space-x-2">
                  <span className="text-sm font-medium">Rows per page</span>
                  <Select
                    value={items}
                    onValueChange={(value) => {
                      startTransition(() => {
                        router.push(
                          `${pathname}?${createQueryString({
                            page,
                            items: value,
                            sort,
                            order,
                          })}`
                        )
                      })
                    }}
                    disabled={isPending}
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
                      startTransition(() => {
                        router.push(
                          `${pathname}?${createQueryString({
                            page: 1,
                            items: items,
                            sort,
                            order,
                          })}`
                        )
                      })
                    }}
                    disabled={Number(page) === 1 || isPending}
                  >
                    <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">First page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => {
                      startTransition(() => {
                        router.push(
                          `${pathname}?${createQueryString({
                            page: Number(page) - 1,
                            items: items,
                            sort,
                            order,
                          })}`
                        )
                      })
                    }}
                    disabled={Number(page) === 1 || isPending}
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => {
                      startTransition(() => {
                        router.push(
                          `${pathname}?${createQueryString({
                            page: Number(page) + 1,
                            items: items,
                            sort,
                            order,
                          })}`
                        )
                      })
                    }}
                    disabled={Number(page) === (pageCount ?? 10) || isPending}
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
                        `${pathname}?${createQueryString({
                          page: pageCount ?? 10,
                          items: items,
                          sort,
                          order,
                        })}`
                      )
                    }}
                    disabled={Number(page) === (pageCount ?? 10) || isPending}
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
  )
}
