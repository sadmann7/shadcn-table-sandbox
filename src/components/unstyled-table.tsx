"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatPrice } from "@/lib/utils";
import { type Skater } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import ReactPaginate from "react-paginate";
import { Table as ShadcnTable, type ColumnDef } from "unstyled-table";
import { buttonVariants } from "./ui/button";

interface UnstyledTableProps {
  data: Skater[];
  pageCount: number;
}

export function UnstyledTable({ data, pageCount }: UnstyledTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Skater, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name", enableColumnFilter: false },
      { accessorKey: "age", header: "Age", enableColumnFilter: false },
      { accessorKey: "email", header: "Email", enableColumnFilter: false },
      { accessorKey: "stats", header: "Stats", enableColumnFilter: false },
      { accessorKey: "stance", header: "Stance", enableColumnFilter: false },
      {
        accessorKey: "deckPrice",
        // Column header formatting
        header: () => <span className="text-left">Deck Price</span>,
        // Cell value formatting
        cell: ({ row }) => formatPrice(row.getValue("deckPrice")),
        enableColumnFilter: false,
      },
    ],
    []
  );

  // Handle server-side stuffs
  const page = searchParams.get("page");
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");

  return (
    <ShadcnTable
      columns={columns}
      // The inline `[]` prevents re-rendering the table when the data changes.
      data={data ?? []}
      manualPagination
      renders={{
        table: ({ children }) => <Table>{children}</Table>,
        header: ({ children }) => <TableHeader>{children}</TableHeader>,
        headerRow: ({ children }) => <TableRow>{children}</TableRow>,
        headerCell: ({ children, header }) => (
          <TableHead
            // Handle server-side sorting
            onClick={() => {
              const nextSortDirection = header.column.getNextSortingOrder();

              // Update the URL with the new sort direction
              router.push(
                `/?page=${page ? page : 1}${
                  nextSortDirection === false
                    ? ""
                    : `&sort=${header.column.id}&order=${nextSortDirection}`
                }`
              );
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
                const selectedPage = selected + 1;

                router.push(
                  `/?page=${selectedPage}${
                    sort ? `&sort=${sort}${order ? `&order=${order}` : ""}` : ""
                  }`
                );
              }}
            />
          );
        },
      }}
    />
  );
}
