import {
  Table,
  ScrollArea,
  Text,
  ActionIcon,
  Group,
  Pagination,
} from "@mantine/core";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

export interface DataTableColumn<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  onSort?: (key: string, direction: "asc" | "desc") => void;
  emptyText?: string;
}

export function DataTable<T = any>({
  data,
  columns,
  loading = false,
  pagination,
  onSort,
  emptyText = "No data available",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (!onSort) {
      return;
    }

    const newDirection =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) {
      return null;
    }
    return sortDirection === "asc" ? (
      <IconChevronUp size={14} />
    ) : (
      <IconChevronDown size={14} />
    );
  };

  if (loading) {
    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column.key}>{column.title}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <Table.Tr key={index}>
              {columns.map((column) => (
                <Table.Td key={column.key}>
                  <Text c="dimmed">Loading...</Text>
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  }

  if (data.length === 0) {
    return (
      <Table>
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column.key}>{column.title}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td colSpan={columns.length}>
              <Text ta="center" c="dimmed" py="xl">
                {emptyText}
              </Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    );
  }

  return (
    <>
      <ScrollArea>
        <Table data-testid="data-table">
          <Table.Thead>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={column.key}
                  style={{
                    width: column.width,
                    textAlign: column.align || "left",
                    cursor: column.sortable ? "pointer" : "default",
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                  data-testid={`table-header-${column.key}`}
                >
                  <Group
                    gap="xs"
                    justify={
                      column.align === "center"
                        ? "center"
                        : column.align === "right"
                          ? "flex-end"
                          : "flex-start"
                    }
                  >
                    <Text fw={600}>{column.title}</Text>
                    {column.sortable && renderSortIcon(column.key)}
                  </Group>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((record, index) => (
              <Table.Tr key={index} data-testid={`table-row-${index}`}>
                {columns.map((column) => (
                  <Table.Td
                    key={column.key}
                    style={{ textAlign: column.align || "left" }}
                    data-testid={`table-cell-${column.key}-${index}`}
                  >
                    {column.render
                      ? column.render(
                          (record as any)[column.key],
                          record,
                          index
                        )
                      : (record as any)[column.key]}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {pagination && (
        <Group justify="center" mt="md">
          <Pagination
            value={pagination.page}
            onChange={pagination.onChange}
            total={Math.ceil(pagination.total / pagination.pageSize)}
            data-testid="table-pagination"
          />
        </Group>
      )}
    </>
  );
}
