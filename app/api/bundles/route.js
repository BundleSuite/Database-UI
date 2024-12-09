import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [bundles, byobs] = await Promise.all([
      prisma.bundle.findMany({
        select: {
          bundleName: true,
          bundleType: true,
          discountType: true,
          ProductHandle: true,
          discountValue: true,
          products: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              shop: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.bYOB.findMany({
        select: {
          bundleName: true,
          discountType: true,
          discountValue: true,
          products: true,
          productStatus: true,
          createdAt: true,
          user: {
            select: {
              shop: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // Get all unique shop URLs
    const shopUrls = [...new Set([
      ...bundles.map(b => b.user.shop),
      ...byobs.map(b => b.user.shop)
    ])];

    // Fetch shop info for all shops in one query
    const shopInfo = await prisma.shopifyStore.findMany({
      where: {
        myshopifyDomain: {
          in: shopUrls
        }
      },
      select: {
        myshopifyDomain: true,
        url:true,
        name: true,
        planDisplayName: true
      }
    });

    // Create a map for easy lookup
    const shopInfoMap = shopInfo.reduce((acc, shop) => {
      acc[shop.myshopifyDomain] = shop;
      return acc;
    }, {});

    const allBundles = {
      bundles: bundles.map(bundle => ({
        ...bundle,
        bundleType: bundle.bundleType.toLowerCase(),
        products: bundle.products,
        variants: bundle.variants || null,
        shop: bundle.user.shop,
        shopInfo: shopInfoMap[bundle.user.shop] || null
      })),
      byobs: byobs.map(byob => ({
        ...byob,
        bundleType: 'byob',
        products: byob.products,
        conditions: byob.conditions,
        media: byob.media,
        tiers: byob.tiers,
        shop: byob.user.shop,
        shopInfo: shopInfoMap[byob.user.shop] || null
      }))
    };


    return NextResponse.json(allBundles)
  } catch (error) {
    console.error('Error fetching bundles:', error)
    return NextResponse.json(
      { error: 'Error fetching bundles' },
      { status: 500 }
    )
  }
} 