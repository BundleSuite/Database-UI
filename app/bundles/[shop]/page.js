'use client'
import React, { useState, useEffect } from 'react';
import { BundlesTable } from '@/app/components/bundles-table';

export default function ShopBundlesPage({ params }) {
  const [bundles, setBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { shop } = params;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/bundles/${shop}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bundles');
        }
        const data = await response.json();
        const allBundles = [
          ...data.bundles,
          ...data.byobs
        ];
        setBundles(allBundles);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [shop]);

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
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-lg bg-destructive/10 p-6 text-destructive">
          <h2 className="font-semibold">Error Loading Bundles</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const containerClasses = "container mx-auto py-10 space-y-8 max-w-7xl px-4 sm:px-6 lg:px-8"
  const headerClasses = "flex flex-col space-y-1.5 pb-6"

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <h1 className="text-3xl font-bold tracking-tight">
          Bundles for {shop}
        </h1>
        <p className="text-muted-foreground">
          Manage bundles for this store
        </p>
      </div>

      <div className="rounded-xl border bg-card">
        <BundlesTable data={bundles} />
      </div>
    </div>
  );
}