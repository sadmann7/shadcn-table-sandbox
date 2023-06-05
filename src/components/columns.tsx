"use client"

import { type Skater } from "@prisma/client"
import { MoreHorizontal } from "lucide-react"
import { type ColumnDef } from "unstyled-table"

import { formatPrice } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"

export const columns: ColumnDef<Skater, unknown>[] = [
  {
    // Column for row selection
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(!!value)
        }}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value)
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
    // Column for row actions
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
]
