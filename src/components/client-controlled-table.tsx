"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PlusCircle,
} from "lucide-react"
import { Table as ShadcnTable, type ColumnDef } from "unstyled-table"

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
import { deleteSkatersAction } from "@/app/_actions/skater"

import { DebounceInput } from "./debounce-input"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Skeleton } from "./ui/skeleton"

interface ClientControlledTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
}

export function ClientControlledTable<TData, TValue>({
  data,
  columns,
}: ClientControlledTableProps<TData, TValue>) {
  // This lets us update states without blocking the UI
  // Read more: https://react.dev/reference/react/useTransition#usage
  const [isPending, startTransition] = React.useTransition()

  return (
    <div className="w-full">
      <ShadcnTable
        columns={columns}
        // The inline `[]` prevents re-rendering the table when the data changes.
        data={data ?? []}
        // States controlled by the table
        state={{
          sorting: [{ id: "email", desc: false }],
        }}
        // Table renderers
        renders={{
          table: ({ children, tableInstance }) => {
            return (
              <div className="w-full p-1">
                <DebounceInput
                  className="max-w-xs"
                  placeholder="Search all columns..."
                  value={tableInstance.getState().globalFilter as string}
                  onChange={(value) => {
                    tableInstance.setGlobalFilter(value)
                  }}
                />
                <div className="flex items-center gap-2 py-4">
                  <div className="flex w-full max-w-xs items-center gap-2">
                    <DebounceInput
                      className="max-w-xs"
                      placeholder="Filter emails..."
                      value={
                        (tableInstance
                          .getColumn("email")
                          ?.getFilterValue() as string) ?? ""
                      }
                      onChange={(value) => {
                        tableInstance.getColumn("email")?.setFilterValue(value)
                      }}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label="Open stance filter menu"
                          variant="outline"
                          className="ml-auto"
                          disabled={isPending}
                        >
                          <PlusCircle className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline-block">Stance</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuCheckboxItem
                          checked={
                            tableInstance
                              .getColumn("stance")
                              ?.getFilterValue() === "mongo"
                          }
                          onCheckedChange={(value) => {
                            tableInstance
                              .getColumn("stance")
                              ?.setFilterValue(value ? "mongo" : null)
                          }}
                        >
                          Mongo
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={
                            tableInstance
                              .getColumn("stance")
                              ?.getFilterValue() === "goofy"
                          }
                          onCheckedChange={(value) => {
                            tableInstance
                              .getColumn("stance")
                              ?.setFilterValue(value ? "goofy" : null)
                          }}
                        >
                          Goofy
                        </DropdownMenuCheckboxItem>
                        {(tableInstance
                          .getColumn("stance")
                          ?.getFilterValue() as React.ReactNode) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="justify-center"
                              onClick={() => {
                                tableInstance
                                  .getColumn("stance")
                                  ?.setFilterValue(null)
                              }}
                            >
                              Clear Filter
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        startTransition(async () => {
                          // Delete the selected rows
                          await deleteSkatersAction(
                            tableInstance
                              .getSelectedRowModel()
                              .rows.map(
                                (row) => (row.original as { id: string }).id
                              )
                          )
                          // Reset row selection
                          tableInstance.resetRowSelection()
                        })
                      }}
                      disabled={
                        !tableInstance.getSelectedRowModel().rows.length ||
                        isPending
                      }
                    >
                      Delete
                    </Button>
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
                </div>
                <div className="rounded-md border">
                  <Table>{children}</Table>
                </div>
              </div>
            )
          },
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
                  {tableInstance.getFilteredSelectedRowModel().rows.length} of{" "}
                  {tableInstance.getRowModel().rows.length} row(s) selected.
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
    </div>
  )
}
