
import { connectDB } from "@/lib/mongodb";

import Customer from "@/server/models/customer";
import Purchase from "@/server/models/Purchases";
import Gift from "@/server/models/Gifts";

export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed",
        });
    }

    try {

        await connectDB();

        const currentYear = new Date().getFullYear();

        /* =========================
           DATE RANGE
        ========================= */

        const startOfYear = new Date(
            currentYear,
            0,
            1
        );

        const startOfNextYear = new Date(
            currentYear + 1,
            0,
            1
        );


        /* =========================
           CUSTOMER COUNT
        ========================= */

        const totalCustomers =
            await Customer.countDocuments({
                status: {
                    $ne: "blocked",
                },
            });


        const activeCustomers =
            await Customer.countDocuments({
                status: "active",
            });


        /* =========================
           PURCHASE ANALYTICS
        ========================= */

        const purchaseStats =
            await Purchase.aggregate([

                {
                    $match: {
                        date: {
                            $gte: startOfYear,
                            $lt: startOfNextYear,
                        },
                    },
                },

                {
                    $group: {
                        _id: null,

                        totalSales: {
                            $sum: {
                                $ifNull: [
                                    "$totalAmount",
                                    0,
                                ],
                            },
                        },

                        cementBags: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$category",
                                            "cement",
                                        ],
                                    },
                                    {
                                        $ifNull: [
                                            "$quantity",
                                            0,
                                        ],
                                    },
                                    0,
                                ],
                            },
                        },

                        sariyaTons: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$category",
                                            "iron_rod",
                                        ],
                                    },
                                    {
                                        $ifNull: [
                                            "$quantity",
                                            0,
                                        ],
                                    },
                                    0,
                                ],
                            },
                        },

                        ironSheetPieces: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$category",
                                            "iron_sheet",
                                        ],
                                    },
                                    {
                                        $ifNull: [
                                            "$quantity",
                                            0,
                                        ],
                                    },
                                    0,
                                ],
                            },
                        },

                        totalOrders: {
                            $sum: 1,
                        },
                    },
                },

            ]);


        const purchases =
            purchaseStats[0] || {

                totalSales: 0,

                cementBags: 0,

                sariyaTons: 0,

                ironSheetPieces: 0,

                totalOrders: 0,

            };


        /* =========================
           GIFTS
        ========================= */

        const giftsGiven =
            await Gift.aggregate([

                {
                    $match: {
                        givenDate: {
                            $gte: startOfYear,
                            $lt: startOfNextYear,
                        },
                    },
                },

                {
                    $group: {
                        _id: null,

                        total: {
                            $sum: {
                                $ifNull: [
                                    "$quantity",
                                    1,
                                ],
                            },
                        },

                        customers: {
                            $addToSet:
                                "$customerId",
                        },
                    },
                },

            ]);


        const giftStats =
            giftsGiven[0] || {
                total: 0,
                customers: [],
            };


        /* =========================
           GIFT READY CUSTOMERS
           
           Example rule:
           high_value / VIP customers
           who have NOT received a gift
           this year.
           
           You can change this logic later.
        ========================= */

        const giftedCustomerIds =
            giftStats.customers || [];


        const giftReadyCustomers =
            await Customer.countDocuments({

                status: "active",

                segment: {
                    $in: [
                        "vip",
                        "high_value",
                    ],
                },

                _id: {
                    $nin: giftedCustomerIds,
                },

            });


        /* =========================
           RESPONSE
        ========================= */

        return res.status(200).json({

            success: true,

            data: {

                customers: {
                    total: totalCustomers,
                    active: activeCustomers,
                },

                sales: {

                    total:
                        purchases.totalSales,

                    cement:
                        purchases.cementBags,

                    sariya:
                        purchases.sariyaTons,

                    ironSheets:
                        purchases.ironSheetPieces,

                    orders:
                        purchases.totalOrders,

                },

                gifts: {

                    given:
                        giftStats.total,

                    ready:
                        giftReadyCustomers,

                },

                year: currentYear,

            },

        });

    } catch (error) {

        console.error(
            "DASHBOARD ANALYTICS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                "Failed to load dashboard analytics",

        });

    }
}
