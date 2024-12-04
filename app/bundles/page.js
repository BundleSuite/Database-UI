'use client'
import React, { useState, useEffect } from 'react';
import { BundlesTable } from '@/app/components/bundles-table';
import { Loader2 } from "lucide-react";

export default function BundlesPage() {
    const [bundles, setBundles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/bundles');
                console.log("this is the response", response);
                if (!response.ok) {
                    throw new Error('Failed to fetch bundles');
                }
                const data = await response.json();
                // Combine regular bundles and BYOBs into a single array
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
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading bundles...</p>
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

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Bundles ({bundles.length})
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your product bundles and BYOB configurations
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Add action buttons here if needed */}
                </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
                <BundlesTable data={bundles} />
            </div>
        </div>
    );
}