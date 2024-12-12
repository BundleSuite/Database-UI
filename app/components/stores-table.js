"use client"
import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Download, Filter, Settings, Search, X, XCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Define the columns
export const columns = [
  {
    accessorKey: "shop",
    header: "Shop URL",
    cell: ({ row }) => {
      const url = row.getValue("shop");
      return (
        <Link
          href={url}
          target="_blank"
          className="text-primary hover:underline"
        >
          {url}
        </Link>
      )
    },
  },
  {
    accessorKey: "myshopifyDomain",
    header: "Myshopify Domain",
  },
  {
    accessorKey: "bundleCounts.totalBundles",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Bundles
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.original.bundleCounts?.totalBundles || 0
  },
  {
    accessorKey: "bundleCounts.byobBundles",
    header: "BYOB Bundles",
    cell: ({ row }) => row.original.bundleCounts?.byobBundles || 0
  },
  {
    accessorKey: "bundleCounts.regularBundles",
    header: "Regular Bundles",
    cell: ({ row }) => row.original.bundleCounts?.regularBundles || 0
  },
  {
    id: "bundles",
    header: "View Bundles",
    cell: ({ row }) => {
      const shop = row.original.myshopifyDomain;
      return (
        <Link
          href={`/bundles/${shop}`}
          className="text-primary hover:underline"
        >
          View Bundles
        </Link>
      )
    },
  },
  {
    id: "analytics",
    header: "View Analytics",
    cell: ({ row }) => {
      const shop = row.original.myshopifyDomain;
      return (
        <Link
          href={`/analytics/${shop}`}
          className="text-primary hover:underline"
        >
          View Analytics
        </Link>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Store Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "shopInstallation.installedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Installed At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.original.shopInstallation.installedAt)
      return (
        <div className="whitespace-nowrap">
          {date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
          <div className="text-xs text-muted-foreground">
            {date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "contactEmail",
    header: "Contact Email",
  },
  {
    accessorKey: "currencyCode",
    header: "Currency",
  },
  {
    accessorKey: "planDisplayName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Plan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "shopifyPlus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Shopify Plus
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div>{row.getValue("shopifyPlus") ? "Yes" : "No"}</div>
    ),
  },
  {
    accessorKey: "storeAge",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Store Age
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      if (!createdAt) return '-';

      const created = new Date(createdAt);
      const now = new Date();
      const diffInDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffInDays / 365);
      const months = Math.floor((diffInDays % 365) / 30);
      const days = diffInDays % 30;

      let age = [];
      if (years > 0) age.push(`${years} years`);
      if (months > 0) age.push(`${months} months`);
      if (days > 0) age.push(`${days} days`);

      return age.join(' ') || '< 1 day';
    },
  },
  {
    accessorKey: "country",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Country
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
]

// Add this helper function for CSV export
const downloadCSV = (data) => {
  const headers = [
    'Store Name',
    'Shop URL',
    'Myshopify Domain',
    'Installed At',
    'Email',
    'Contact Email',
    'Currency',
    'Plan',
    'Shopify Plus',
    'Store Age',
    'Country'
  ];

  const csvData = data.map(store => [
    store.name,
    store.shop,
    store.myshopifyDomain,
    new Date(store.shopInstallation.installedAt).toLocaleString(),
    store.email,
    store.contactEmail,
    store.currencyCode,
    store.planDisplayName,
    store.shopifyPlus ? 'Yes' : 'No',
    store.createdAt ? calculateStoreAge(new Date(store.createdAt)) : '-',
    store.country || '-'
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'shopify-stores.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function for store age calculation
const calculateStoreAge = (createdAt) => {
  const now = new Date();
  const diffInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffInDays / 365);
  const months = Math.floor((diffInDays % 365) / 30);
  const days = diffInDays % 30;

  let age = [];
  if (years > 0) age.push(`${years}y`);
  if (months > 0) age.push(`${months}m`);
  if (days > 0) age.push(`${days}d`);
  return age.join(' ') || '< 1d';
};

// Add this helper function to check if any filters are active
const hasActiveFilters = (globalFilter, columnFilters) => {
  return globalFilter !== '' || columnFilters.length > 0;
}

// Update the FilterDropdown component to show active state
const FilterDropdown = ({ column, title, options }) => {
  const hasActiveFilter = column.getFilterValue()?.length > 0;

  return (
    <div className="relative">
      {hasActiveFilter && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="mr-2 h-4 w-4" />
            {title}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={column.getFilterValue()?.includes(option)}
              onCheckedChange={(checked) => {
                const currentValues = column.getFilterValue() || []
                const newValues = checked
                  ? [...currentValues, option]
                  : currentValues.filter((value) => value !== option)
                column.setFilterValue(newValues.length ? newValues : undefined)
              }}
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function StoresTable({ data }) {
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  // Update the table configuration
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    filterFns: {
      includesString: (row, columnId, filterValue) => {
        const value = row.getValue(columnId)
        if (Array.isArray(filterValue)) {
          // Handle multi-select filters
          if (columnId === "shopifyPlus") {
            const isPlus = value === true
            return filterValue.includes(isPlus ? "Plus" : "Regular")
          }
          return filterValue.includes(value)
        }
        // Handle global search
        return value?.toString().toLowerCase().includes(filterValue.toLowerCase())
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  })

  const resetFilters = () => {
    setGlobalFilter('')
    setColumnFilters([])
    table.resetColumnFilters()
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 w-[300px]"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {hasActiveFilters(globalFilter, columnFilters) && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reset Filters
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <FilterDropdown
            column={table.getColumn("planDisplayName")}
            title="Plan"
            options={["Basic", "Shopify", "Advanced", "Plus"]}
          />
          <FilterDropdown
            column={table.getColumn("country")}
            title="Country"
            options={Array.from(new Set(data.map(store => store.country))).filter(Boolean)}
          />
          <FilterDropdown
            column={table.getColumn("shopifyPlus")}
            title="Store Type"
            options={["Plus", "Regular"]}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadCSV(data)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} stores
          {table.getFilteredRowModel().rows.length !== data.length && (
            <span> (filtered from {data.length} total)</span>
          )}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
} 