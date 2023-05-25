"use client"

import * as React from "react"
import { type Skater } from "@prisma/client"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { toast } from "react-hot-toast"
import {
  Table as ShadcnTable,
  type ColumnDef,
  type Row,
  type VisibilityState,
} from "unstyled-table"

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
import { deleteSkaters } from "@/app/_actions/skater"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Skeleton } from "./ui/skeleton"

interface ClientControlledTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

export function ClientControlledTable<TData, TValue>({
  data,
  columns,
}: ClientControlledTableProps<TData, TValue>) {
  const [isPending, startTransition] = React.useTransition()

  // Handle row selection
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedRows, setSelectedRows] = React.useState<Row<Skater>[]>([])

  // Handle global filtering
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Handle column visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  return (
    <React.Fragment>
      <div className="flex items-center justify-between gap-5 py-4">
        <Input
          className="max-w-xs"
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Delete rows"
            variant="destructive"
            onClick={() => {
              startTransition(() => {
                void deleteSkaters(selectedRows.map((row) => row.original.id))
                setSelectedRows([])
                toast.success("Skaters deleted")
              })
            }}
            disabled={isPending || !selectedRows.length}
          >
            Delete
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
                <ChevronDown
                  className="-mr-1 ml-2 h-5 w-5"
                  aria-hidden="true"
                />
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
      </div>
      <ShadcnTable
        columns={columns}
        // The inline `[]` prevents re-rendering the table when the data changes.
        data={data ?? []}
        // States controlled by the table
        state={{ globalFilter, columnVisibility }}
        // Handle global filtering
        setGlobalFilter={setGlobalFilter}
        // Handle column visibility
        setColumnVisibility={setColumnVisibility}
        renders={{
          table: ({ children }) => <Table>{children}</Table>,
          header: ({ children }) => <TableHeader>{children}</TableHeader>,
          headerRow: ({ children }) => <TableRow>{children}</TableRow>,
          headerCell: ({ children }) => (
            <TableHead className="whitespace-nowrap">{children}</TableHead>
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
          filterInput: () => null,
          // Custom pagination bar
          paginationBar: ({ tableInstance }) => {
            return (
              <div className="flex flex-col-reverse items-center gap-4 py-4 md:flex-row">
                <div className="flex-1 text-sm font-medium">
                  {selectedRows.length} of {data.length} row(s) selected.
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
                  <div className="flex flex-wrap items-center space-x-2">
                    <span className="text-sm font-medium">Rows per page</span>
                    <Select
                      value={tableInstance
                        .getState()
                        .pagination.pageSize.toString()}
                      onValueChange={(value) => {
                        tableInstance.setPageSize(Number(value))
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-8 w-16">
                        <SelectValue />
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
                    {`Page ${
                      tableInstance.getState().pagination.pageIndex + 1
                    } of ${tableInstance.getPageCount() ?? 10}`}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => tableInstance.setPageIndex(0)}
                      disabled={!tableInstance.getCanPreviousPage()}
                    >
                      <ChevronsLeft className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">First page</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => tableInstance.previousPage()}
                      disabled={!tableInstance.getCanPreviousPage()}
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() => tableInstance.nextPage()}
                      disabled={!tableInstance.getCanNextPage()}
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Next page</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 px-0"
                      onClick={() =>
                        tableInstance.setPageIndex(
                          tableInstance.getPageCount() - 1
                        )
                      }
                      disabled={!tableInstance.getCanNextPage()}
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
