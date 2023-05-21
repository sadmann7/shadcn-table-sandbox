"use client";

import { formatPrice } from "@/lib/utils";
import * as React from "react";
import { Table, type ColumnDef } from "unstyled-table";
import ReactPaginate from "react-paginate";
import { type Skater } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Table as ShadcnTable,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

interface UnstyledTableProps {
  data: Skater[];
  pageCount: number;
}

export function UnstyledTable({ data }: UnstyledTableProps) {
  const router = useRouter();

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

  return (
    <Table
      columns={columns}
      // The inline `[]` prevents re-rendering the table when the data changes.
      data={data ?? []}
      showFooter
      renders={{
        table: ({ children, ...props }) => (
          <ShadcnTable {...props}>{children}</ShadcnTable>
        ),
        header: ({ children, ...props }) => (
          <TableHeader {...props}>{children}</TableHeader>
        ),
        headerRow: ({ children, ...props }) => (
          <TableRow {...props}>{children}</TableRow>
        ),
        headerCell: ({ children, ...props }) => (
          <TableCell {...props}>{children}</TableCell>
        ),
        body: ({ children, ...props }) => (
          <TableBody {...props}>{children}</TableBody>
        ),
        bodyRow: ({ children, ...props }) => (
          <TableRow {...props}>{children}</TableRow>
        ),
        bodyCell: ({ children, ...props }) => (
          <TableCell {...props}>{children}</TableCell>
        ),
        // Custom pagination bar
        paginationBar: () => {
          return (
            <ReactPaginate
              className="flex items-center gap-2.5"
              pageCount={10}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              onPageChange={({ selected }) => {
                const selectedPage = selected + 1;
                router.push(`/?page=${selectedPage}`);
              }}
            />
          );
        },
      }}
    />
  );
}
