import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // First get all stores
    const shopifyStores = await prisma.shopifyStore.findMany({
      select: {
        name: true,
        shop: true,
        myshopifyDomain: true,
        url: true,
        currencyCode: true,
        planDisplayName: true,
        shopifyPlus: true,
        createdAt: true,
        contactEmail: true,
        email: true,
        country: true,
        shopInstallation: {
          select: {
            installedAt: true,
            id: true
          }
        }
      },
      orderBy: {
        shopInstallation: {
          installedAt: 'desc'
        }
      }
    });

    // Get bundle counts for all stores in one query
    const bundleCounts = await prisma.$transaction([
      prisma.bundle.groupBy({
        by: ['userId'],
        _count: true,
        where: {
          user: {
            shop: {
              in: shopifyStores.map(store => store.myshopifyDomain)
            }
          }
        }
      }),
      prisma.bYOB.groupBy({
        by: ['userId'],
        _count: true,
        where: {
          user: {
            shop: {
              in: shopifyStores.map(store => store.myshopifyDomain)
            }
          }
        }
      })
    ]);

    // Get the user-shop mapping in separate queries
    const [bundleUsers, byobUsers] = await prisma.$transaction([
      prisma.session.findMany({
        where: {
          id: {
            in: bundleCounts[0].map(count => count.userId)
          }
        },
        select: {
          id: true,
          shop: true
        }
      }),
      prisma.session.findMany({
        where: {
          id: {
            in: bundleCounts[1].map(count => count.userId)
          }
        },
        select: {
          id: true,
          shop: true
        }
      })
    ]);

    // Create maps for quick lookups
    const bundleUserMap = bundleUsers.reduce((acc, user) => {
      acc[user.id] = user.shop;
      return acc;
    }, {});

    const byobUserMap = byobUsers.reduce((acc, user) => {
      acc[user.id] = user.shop;
      return acc;
    }, {});

    // Create a map of shop to bundle counts
    const shopBundleCounts = {};
    shopifyStores.forEach(store => {
      shopBundleCounts[store.myshopifyDomain] = {
        regularBundles: 0,
        byobBundles: 0,
        totalBundles: 0
      };
    });

    // Add regular bundle counts
    bundleCounts[0].forEach(count => {
      const shop = bundleUserMap[count.userId];
      if (shop && shopBundleCounts[shop]) {
        shopBundleCounts[shop].regularBundles = count._count;
        shopBundleCounts[shop].totalBundles += count._count;
      }
    });

    // Add BYOB bundle counts
    bundleCounts[1].forEach(count => {
      const shop = byobUserMap[count.userId];
      if (shop && shopBundleCounts[shop]) {
        shopBundleCounts[shop].byobBundles = count._count;
        shopBundleCounts[shop].totalBundles += count._count;
      }
    });

    // Add bundle counts to store data
    const storesWithBundleCounts = shopifyStores.map(store => ({
      ...store,
      bundleCounts: shopBundleCounts[store.myshopifyDomain] || {
        regularBundles: 0,
        byobBundles: 0,
        totalBundles: 0
      }
    }));

    return NextResponse.json({ shopifyStores: storesWithBundleCounts })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
