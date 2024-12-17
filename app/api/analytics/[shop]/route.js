import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
    const { shop } = params;

    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30'

        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        const shopInfo = await prisma.shopifyStore.findUnique({
            where: {
                myshopifyDomain: shop
            },
            select: {
                name: true,
                shop: true,
                currencyCode: true,
                planDisplayName: true,
            }
        });

        if (!shopInfo) {
            return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }

        // Get analytics data
        const [bundleAnalytics, byobAnalytics] = await Promise.all([
            prisma.BundleAnalytics.findMany({
                where: {
                    shop: shopInfo.shop.replace('https://', ''),
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    bundle: {
                        select: {
                            bundleName: true,
                            bundleType: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.ByobAnalytics.findMany({
                where: {
                    shop: shopInfo.shop.replace('https://', ''),
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    user: {
                        select: {
                            bundleName: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        ]);

        // Process analytics data
        const analytics = {
            overview: {
                totalViews: bundleAnalytics.reduce((sum, item) => sum + (item.views || 0), 0) + 
                          byobAnalytics.reduce((sum, item) => sum + (item.views || 0), 0),
                totalRevenue: bundleAnalytics.reduce((sum, item) => sum + Number(item.revenue || 0), 0) + 
                            byobAnalytics.reduce((sum, item) => sum + Number(item.revenue || 0), 0),
                totalOrders: bundleAnalytics.reduce((sum, item) => sum + (item.orders || 0), 0) + 
                           byobAnalytics.reduce((sum, item) => sum + (item.orders || 0), 0),
                totalBundles: bundleAnalytics.length + byobAnalytics.length
            },
            bundleTypes: {
                fixed: { 
                    count: bundleAnalytics.filter(b => b.bundle.bundleType === 'fixed').length,
                    revenue: bundleAnalytics
                        .filter(b => b.bundle.bundleType === 'fixed')
                        .reduce((sum, item) => sum + Number(item.revenue || 0), 0)
                },
                infinite: { 
                    count: bundleAnalytics.filter(b => b.bundle.bundleType === 'infinite').length,
                    revenue: bundleAnalytics
                        .filter(b => b.bundle.bundleType === 'infinite')
                        .reduce((sum, item) => sum + Number(item.revenue || 0), 0)
                },
                byob: { 
                    count: byobAnalytics.length,
                    revenue: byobAnalytics.reduce((sum, item) => sum + Number(item.revenue || 0), 0)
                }
            },
            dailyRevenue: {},
            topBundles: {}
        };

        // Process daily revenue
        [...bundleAnalytics, ...byobAnalytics].forEach(item => {
            const date = item.createdAt.toISOString().split('T')[0];
            analytics.dailyRevenue[date] = (analytics.dailyRevenue[date] || 0) + Number(item.revenue || 0);
        });

        // Process top bundles
        const bundleMap = {};
        [...bundleAnalytics, ...byobAnalytics].forEach(item => {
            const id = item.bundleId || item.byobId;
            const name = item.bundle?.bundleName || item.user?.bundleName;
            const type = item.bundle?.bundleType || 'byob';

            if (!bundleMap[id]) {
                bundleMap[id] = {
                    id,
                    name,
                    type,
                    views: 0,
                    revenue: 0,
                    orders: 0
                };
            }

            bundleMap[id].views += item.views || 0;
            bundleMap[id].revenue += Number(item.revenue || 0);
            bundleMap[id].orders += item.orders || 0;
        });

        analytics.topBundles = bundleMap;

        // Calculate average order value
        analytics.overview.averageOrderValue = 
            analytics.overview.totalOrders > 0 
                ? analytics.overview.totalRevenue / analytics.overview.totalOrders 
                : 0;

        return NextResponse.json({
            analytics: analytics,
            shopInfo: shopInfo,
            currency: shopInfo.currencyCode
        });
    } catch (error) {
        console.error('Error fetching shop analytics:', error);
        return NextResponse.json({ error: 'An error occurred while fetching shop analytics' }, { status: 500 });
    }
} 