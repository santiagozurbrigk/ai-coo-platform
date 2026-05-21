import * as React from "react";
import { cn } from "../lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../primitives/table";
import { Card, CardContent, CardHeader, CardTitle } from "../primitives/card";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

export interface DataTableProps<T> {
  title?: string;
  description?: string;
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  title,
  description,
  columns,
  data,
  keyExtractor,
  emptyMessage = "Sin datos",
  className,
}: DataTableProps<T>) {
  return (
    <Card className={cn(className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className={title || description ? undefined : "p-0"}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={keyExtractor(row)}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
