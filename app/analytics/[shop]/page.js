'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs,TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Percent,
} from "lucide-react"
import { TopBundlesTable } from '../../components/analytics/top-bundles-table'
import { formatCurrency, formatMetric } from '@/lib/helper'
import { RevenueChart } from '../../components/analytics/revenue-chart'
import { BundleTypeChart } from '../../components/analytics/bundle-type-chart'

export default function ShopAnalyticsPage({ params }) {
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('30')
  const { shop } = params

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/analytics/${shop}?period=${period}`)
        if (!response.ok) throw new Error('Failed to fetch analytics')
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [shop, period])

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-[200px] animate-pulse rounded bg-muted" />
            <div className="h-4 w-[160px] animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <h2 className="font-semibold">Error Loading Analytics</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatMetric(analytics?.analytics?.totalRevenue ?? 0, 
        (v) => formatCurrency(v, analytics.currency)),
      icon: DollarSign,
      description: `${period} day total`
    },
    {
      title: "Total Orders",
      value: formatMetric(analytics?.analytics?.totalOrders ?? 0),
      icon: ShoppingCart,
      description: "Bundle purchases"
    },
    {
      title: "Average Order",
      value: formatMetric(analytics?.analytics?.averageOrderValue ?? 0, 
        (v) => formatCurrency(v, analytics.currency)),
      icon: TrendingUp,
      description: "Per bundle order"
    },
    {
      title: "Total Savings",
      value: formatMetric(analytics?.analytics?.totalDiscounts ?? 0, 
        (v) => formatCurrency(v, analytics.currency)),
      icon: Percent,
      description: "Customer discounts"
    }
  ]

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics for {analytics.shopInfo.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your bundle performance and revenue
        </p>
      </div>

      <Tabs defaultValue="30" className="space-y-4" onValueChange={setPeriod}>
        <TabsList>
          <TabsTrigger value="7">7 Days</TabsTrigger>
          <TabsTrigger value="30">30 Days</TabsTrigger>
          <TabsTrigger value="90">90 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={analytics.analytics.dailyRevenue} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Revenue by Bundle Type</CardTitle>
          </CardHeader>
          <CardContent>
            <BundleTypeChart data={analytics.analytics.bundleTypes} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Bundles</CardTitle>
        </CardHeader>
        <CardContent>
          <TopBundlesTable 
            data={Object.entries(analytics.analytics.topBundles).map(([id, bundle]) => ({
              id,
              ...bundle
            }))} 
            currency={analytics.currency} 
          />
        </CardContent>
      </Card>
    </div>
  )
}