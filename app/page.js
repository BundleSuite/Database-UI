'use client'
import { useState, useEffect } from 'react';
import { Loader2, Store, Globe, Calendar, Award } from "lucide-react";
import { StoresTable } from './components/stores-table';
import Link from 'next/link';

export default function Home() {
  const [shopifyStores, setShopifyStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setShopifyStores(data.shopifyStores);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const stats = [
    {
      title: "Total Stores",
      value: shopifyStores.length,
      icon: Store,
      description: "Active Shopify stores",
    },
    {
      title: "Countries",
      value: new Set(shopifyStores.map(store => store.country)).size,
      icon: Globe,
      description: "Unique countries",
    },
    {
      title: "Plus Stores",
      value: shopifyStores.filter(store => store.shopifyPlus).length,
      icon: Award,
      description: "Shopify Plus merchants",
    },
    {
      title: "Recent Installs",
      value: shopifyStores.filter(store => {
        const installDate = new Date(store.shopInstallation.installedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return installDate > thirtyDaysAgo;
      }).length,
      icon: Calendar,
      description: "Last 30 days",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading stores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <h2 className="font-semibold">Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Shopify Stores ({shopifyStores.length})
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your connected Shopify stores
          </p>
        </div>
        <Link
          href="/bundles"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          View Bundles
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.title} className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6">
        <StoresTable data={shopifyStores} />
      </div>
    </div>
  );
}
