'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/helper"

export function TopBundlesTable({ data, currency }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bundle Name</TableHead>
          <TableHead className="text-right">Orders</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((bundle) => (
          <TableRow key={bundle.id}>
            <TableCell className="font-medium">{bundle.name}</TableCell>
            <TableCell className="text-right">{bundle.orders}</TableCell>
            <TableCell className="text-right">{bundle.quantity}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(bundle.revenue, currency)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 