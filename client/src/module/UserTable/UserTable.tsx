'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { User } from '@/type/type';

interface UserTableProps {
  data: User[];
}

export const UserTable = ({ data }: UserTableProps) => {
     console.log('UserTable received data:', data); // Step 1
  const columns = useMemo<ColumnDef<User>[]>(() => [
    // {
    //   accessorKey: 'id',
    //   header: 'ID',
    //   cell: info => {
    //     const idVal = info.getValue() as string;
    //      console.log('Cell Value - ID:', idVal); // Step 3
    //     return <span title={idVal}>{idVal.substring(0, 8)}...</span>;
    //   },
    // },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: info => info.getValue() || 'N/A',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: info => {
        const dateValue = info.getValue() as string;
        try {
          return new Date(dateValue).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        } catch {
          return dateValue;
        }
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated At',
      cell: info => {
        const dateValue = info.getValue() as string;
        try {
          return new Date(dateValue).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        } catch {
          return dateValue;
        }
      },
    },
  ], []);

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
console.log('Table rows:', table.getRowModel().rows); // Step 2
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 dark:border-gray-700">
    
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {table.getRowModel().rows.map(row => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
