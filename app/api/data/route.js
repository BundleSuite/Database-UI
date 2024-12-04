import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
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
        mailingSubscribed: true,
        limitReached: true,
        shopInstallation: {
          select: {
            installedAt: true
          }
        }
      }
    });

    return NextResponse.json({ shopifyStores })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }
}
