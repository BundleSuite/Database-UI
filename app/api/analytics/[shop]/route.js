import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
    const { shop } = params;

    try {
        // Get query parameters for date filtering
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30' // Default to 30 days

        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        // Fetch all analytics data for the shop
        const [bundleRevenue, shopInfo] = await Promise.all([
            prisma.bundleRevenue.findMany({
                where: {
                    shop: shop,
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.shopifyStore.findUnique({
                where: {
                    myshopifyDomain: shop
                },
                select: {
                    name: true,
                    currencyCode: true,
                    planDisplayName: true,
                    shopifyPlus: true
                }
            })
        ]);

        // Calculate analytics metrics
        const analytics = {
            overview: {
                totalRevenue: 0,
                totalOrders: bundleRevenue.length,
                totalBundles: 0,
                averageOrderValue: 0,
                totalDiscounts: 0
            },
            bundleTypes: {
                fixed: { count: 0, revenue: 0 },
                infinite: { count: 0, revenue: 0 },
                byob: { count: 0, revenue: 0 }
            },
            dailyRevenue: {},
            topBundles: {},
            customerMetrics: {
                newCustomers: 0,
                returningCustomers: 0,
                totalCustomers: new Set()
            }
        };

        // Process bundle revenue data
        bundleRevenue.forEach(order => {
            if (order.orderStatus.toLowerCase() === 'cancelled') return;

            const revenue = Number(order.revenue);
            const discount = Number(order.discountAmount);

            // Update overview metrics
            analytics.overview.totalRevenue += revenue;
            analytics.overview.totalDiscounts += discount;

            // Update bundle type metrics
            const type = order.bundleType.toLowerCase();
            if (analytics.bundleTypes[type]) {
                analytics.bundleTypes[type].count++;
                analytics.bundleTypes[type].revenue += revenue;
            }

            // Update daily revenue
            const date = order.createdAt.toISOString().split('T')[0];
            analytics.dailyRevenue[date] = (analytics.dailyRevenue[date] || 0) + revenue;

            // Update top bundles
            if (!analytics.topBundles[order.bundleId]) {
                analytics.topBundles[order.bundleId] = {
                    name: order.bundleName,
                    orders: 0,
                    revenue: 0,
                    quantity: 0
                };
            }
            analytics.topBundles[order.bundleId].orders++;
            analytics.topBundles[order.bundleId].revenue += revenue;
            analytics.topBundles[order.bundleId].quantity += order.quantity;

            // Update customer metrics
            if (order.customerEmail) {
                analytics.customerMetrics.totalCustomers.add(order.customerEmail);
                if (order.firstPurchase) {
                    analytics.customerMetrics.newCustomers++;
                } else {
                    analytics.customerMetrics.returningCustomers++;
                }
            }
        });

        // Calculate averages and finalize metrics
        analytics.overview.averageOrderValue =
            analytics.overview.totalOrders > 0
                ? analytics.overview.totalRevenue / analytics.overview.totalOrders
                : 0;
        
        
        console.log(analytics)

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