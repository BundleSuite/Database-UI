import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  const { shop } = params;
  
  try {
    const [bundles, byobs] = await Promise.all([
      prisma.bundle.findMany({
        where: {
          user: {
            shop: shop
          }
        },
        select: {
          bundleName: true,
          bundleType: true,
          discountType: true,
          ProductHandle: true,
          discountValue: true,
          products: true,
          status: true,
          createdAt: true,
          userId: true
        }
      }),
      prisma.bYOB.findMany({
        where: {
          user: {
            shop: shop
          }
        },
        select: {
          bundleName: true,
          discountType: true,
          discountValue: true,
          products: true,
          productStatus: true,
          createdAt: true,
          userId: true
        }
      })
    ]);

    const allBundles = {
      bundles: bundles.map(bundle => ({
        ...bundle,
        bundleType: bundle.bundleType.toLowerCase(),
        products: bundle.products,
        variants: bundle.variants || null
      })),
      byobs: byobs.map(byob => ({
        ...byob,
        bundleType: 'byob',
        products: byob.products,
        conditions: byob.conditions,
        media: byob.media,
        tiers: byob.tiers
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