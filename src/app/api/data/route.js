import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

function calculateAge(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const remainingDays = diffDays % 365;

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  }
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

export async function GET() {
  try {
    const shopifyStores = await prisma.shopifyStore.findMany({
      select: {
        name: true,
        shop: true,
        url: true,
        planDisplayName: true,
        createdAt: true,
        shopInstallation: {
          select: {
            installedAt: true
          }
        }
      },
    });

    const bundles = await prisma.bundle.findMany({
      select: {
        id: true,
        bundleName: true,
        bundleType: true,
        discountType: true,
        discountValue: true,
        userId: true,
        ProductHandle: true,
        products: true,
        createdAt: true,
      },
    });

    const byobBundles = await prisma.bYOB.findMany({
      select: {
        id: true,
        bundleName: true,
        discountType: true,
        discountValue: true,
        userId: true,
        products: true,
        createdAt: true,
      },
    });

    const bundleCountByStore = [...bundles, ...byobBundles].reduce((acc, bundle) => {
      const myshopifyDomain = bundle.userId.replace('offline_', '');
      acc[myshopifyDomain] = (acc[myshopifyDomain] || 0) + 1;
      return acc;
    }, {});

    const formattedShopifyStores = shopifyStores.map(store => ({
      ...store,
      age: calculateAge(store.createdAt),
      installedAgo: formatTimeAgo(store.shopInstallation.installedAt),
      bundleCount: bundleCountByStore[store.shop] || 0
    }));

    const allBundlesWithStoreInfo = await Promise.all([
      ...bundles.map(async (bundle) => {
        const myshopifyDomain = bundle.userId.replace('offline_', '');
        const shopifyStore = await prisma.shopifyStore.findUnique({
          where: { myshopifyDomain },
          select: { name: true, url: true },
        });
        return {
          ...bundle,
          bundleType: bundle.bundleType || 'regular',
          storeName: shopifyStore ? shopifyStore.name : 'Unknown Store',
          storeUrl: shopifyStore ? shopifyStore.url : '#',
        };
      }),
      ...byobBundles.map(async (bundle) => {
        const myshopifyDomain = bundle.userId.replace('offline_', '');
        const shopifyStore = await prisma.shopifyStore.findUnique({
          where: { myshopifyDomain },
          select: { name: true, url: true },
        });
        return {
          ...bundle,
          bundleType: 'byob',
          storeName: shopifyStore ? shopifyStore.name : 'Unknown Store',
          storeUrl: shopifyStore ? shopifyStore.url : '#',
        };
      }),
    ]);

    return NextResponse.json({ shopifyStores: formattedShopifyStores, bundles: allBundlesWithStoreInfo })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
