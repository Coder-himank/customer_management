
import { connectDB } from "@/lib/mongodb";

import Customer from "@/server/models/customer";
import Purchase from "@/server/models/Purchases";
import Gift from "@/server/models/Gifts";
import Target from "@/server/models/Targets";
import { requireAuth } from "@/lib/auth";

const getGiftReadyCustomers = async () => {
    // Get active targets
    const targets = await Target.find({}).lean();

    const giftReadyCustomers = [];

    for (const target of targets) {
        const startDate = new Date(target.startDate);

        const endDate = new Date(target.endDate);
        endDate.setHours(23, 59, 59, 999);

        // ---------------------------------------
        // 1. Find purchases eligible for target
        // ---------------------------------------

        const purchaseFilter = {
            date: {
                $gte: startDate,
                $lte: endDate,
            },
            category: target.category,
        };

        // If target is for a particular product
        if (target.productName) {
            purchaseFilter.productName =
                target.productName;
        }

        // If target specifies a unit
        if (target.unit) {
            purchaseFilter.unit = target.unit;
        }

        const purchases = await Purchase.find(
            purchaseFilter
        )
            .populate(
                "customerId",
                "name phone companyName"
            )
            .lean();

        // ---------------------------------------
        // 2. Group purchases by customer
        // ---------------------------------------

        const customerMap = {};

        for (const purchase of purchases) {
            if (!purchase.customerId) continue;

            const customerId =
                purchase.customerId._id.toString();

            if (!customerMap[customerId]) {
                customerMap[customerId] = {
                    customerId:
                        purchase.customerId._id,

                    name:
                        purchase.customerId.name,

                    phone:
                        purchase.customerId.phone,

                    companyName:
                        purchase.customerId.companyName,

                    totalPurchased: 0,

                    totalSales: 0,
                };
            }

            customerMap[customerId].totalPurchased +=
                purchase.quantity || 0;

            customerMap[customerId].totalSales +=
                purchase.totalAmount || 0;
        }

        // ---------------------------------------
        // 3. Check target completion
        // ---------------------------------------

        for (const customer of Object.values(
            customerMap
        )) {
            if (
                customer.totalPurchased <
                target.targetQuantity
            ) {
                continue;
            }

            // ---------------------------------------
            // 4. Check if customer already received
            //    gift for this target
            // ---------------------------------------

            const alreadyGifted = await Gift.exists({
                targetId: target._id,
                customerId: customer.customerId,
            });

            if (alreadyGifted) {
                continue;
            }

            // ---------------------------------------
            // 5. Customer is gift eligible
            // ---------------------------------------

            giftReadyCustomers.push({
                targetId: target._id,
                targetName: target.name,

                customerId: customer.customerId,
                name: customer.name,
                phone: customer.phone,
                companyName: customer.companyName,

                totalPurchased:
                    customer.totalPurchased,

                targetQuantity:
                    target.targetQuantity,

                progress: 100,

                totalSales:
                    customer.totalSales,

                startDate:
                    target.startDate,

                endDate:
                    target.endDate,
            });
        }
    }

    return giftReadyCustomers;
};

export default async function handler(req, res) {

    const auth = await requireAuth(req, res);

    if (!auth.authenticated) {
        return res.status(401).json({
            error: "Authentication required",
        });
    }

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

    
        const giftReadyCustomers = (await getGiftReadyCustomers()).length;
            

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
