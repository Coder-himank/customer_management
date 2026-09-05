
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

import Customer from "@/server/models/customer";
import Purchase from "@/server/models/Purchases";
import Gift from "@/server/models/Gifts";
import Target from "@/server/models/Targets";


import { requireAuth } from "@/lib/auth";

export default async function handler(req, res) {

    const auth = await requireAuth(req, res);

    if (!auth.authenticated) {
        return res.status(401).json({
            error: "Authentication required",
        });
    }

    await connectDB();

    try {

        const { id } = req.query;


        /* =========================
           VALIDATE CUSTOMER ID
        ========================= */

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                success: false,
                error: "Invalid customer ID",
            });

        }


        const customerId =
            new mongoose.Types.ObjectId(id);


        /* =====================================================
           GET CUSTOMER + DASHBOARD DATA
        ===================================================== */

        if (req.method === "GET") {

            const customer =
                await Customer
                    .findById(customerId)
                    .lean();


            if (!customer) {

                return res.status(404).json({
                    success: false,
                    error: "Customer not found",
                });

            }


            /* =========================
               GET PURCHASES
            ========================= */

            const purchases =
                await Purchase
                    .find({ customerId })
                    .sort({ date: -1 })
                    .lean();


            /* =========================
               GET GIFTS
            ========================= */

            const gifts =
                await Gift
                    .find({ customerId })
                    .sort({ givenDate: -1 })
                    .lean();


            /* =========================
               GET ACTIVE TARGETS
            ========================= */

            const targets =
                await Target
                    .find({
                        customerId,
                        status: "active",
                    })
                    .sort({ endDate: 1 })
                    .lean();


            /* =================================================
               LIFETIME ANALYTICS
            ================================================= */

            let totalOrders = purchases.length;

            let totalAmount = 0;

            let cementBags = 0;

            let ironRodTons = 0;

            let ironSheetPieces = 0;


            purchases.forEach((purchase) => {

                totalAmount +=
                    Number(purchase.totalAmount) || 0;


                if (purchase.category === "cement") {

                    cementBags +=
                        Number(purchase.quantity) || 0;

                }


                if (purchase.category === "iron_rod") {

                    ironRodTons +=
                        Number(purchase.quantity) || 0;

                }


                if (purchase.category === "iron_sheet") {

                    ironSheetPieces +=
                        Number(purchase.quantity) || 0;

                }

            });


            /* =================================================
               CURRENT YEAR
            ================================================= */

            const currentYear =
                new Date().getFullYear();


            const yearlyPurchases =
                purchases.filter((purchase) => {

                    return (
                        new Date(purchase.date)
                            .getFullYear() === currentYear
                    );

                });


            let yearlyOrders =
                yearlyPurchases.length;

            let yearlyAmount = 0;

            let yearlyCementBags = 0;

            let yearlyIronRodTons = 0;

            let yearlyIronSheetPieces = 0;


            yearlyPurchases.forEach((purchase) => {

                yearlyAmount +=
                    Number(purchase.totalAmount) || 0;


                if (purchase.category === "cement") {

                    yearlyCementBags +=
                        Number(purchase.quantity) || 0;

                }


                if (purchase.category === "iron_rod") {

                    yearlyIronRodTons +=
                        Number(purchase.quantity) || 0;

                }


                if (purchase.category === "iron_sheet") {

                    yearlyIronSheetPieces +=
                        Number(purchase.quantity) || 0;

                }

            });


            /* =================================================
               PRODUCT ANALYSIS
            ================================================= */

            const productMap = {};


            purchases.forEach((purchase) => {

                const key =
                    purchase.productName;


                if (!productMap[key]) {

                    productMap[key] = {

                        productName:
                            purchase.productName,

                        category:
                            purchase.category,

                        orders: 0,

                        quantity: 0,

                        unit:
                            purchase.unit,

                        amount: 0,

                    };

                }


                productMap[key].orders += 1;


                productMap[key].quantity +=
                    Number(purchase.quantity) || 0;


                productMap[key].amount +=
                    Number(purchase.totalAmount) || 0;

            });


            const products =
                Object.values(productMap);


            /* =========================
               PRODUCT PERCENTAGE
            ========================= */

            const totalProductAmount =
                products.reduce(
                    (sum, product) =>
                        sum + product.amount,
                    0
                );


            products.forEach((product) => {

                product.percentage =
                    totalProductAmount > 0

                        ? (
                            product.amount /
                            totalProductAmount
                        ) * 100

                        : 0;

            });


            /* =================================================
               CUSTOMER RANKING
            ================================================= */

            /*
             * Get all customers' total purchase amounts.
             *
             * This is fine for now.
             * Later move ranking to an Analytics collection
             * when the database becomes large.
             */

            const rankingData =
                await Purchase.aggregate([

                    {
                        $group: {
                            _id: "$customerId",

                            totalAmount: {
                                $sum: {
                                    $ifNull: [
                                        "$totalAmount",
                                        0
                                    ]
                                }
                            },
                        },
                    },

                    {
                        $sort: {
                            totalAmount: -1,
                        },
                    },

                ]);


            const customerRankIndex =
                rankingData.findIndex(
                    (item) =>
                        item._id?.toString() ===
                        customerId.toString()
                );


            const rank =
                customerRankIndex === -1
                    ? null
                    : customerRankIndex + 1;


            const totalCustomers =
                await Customer.countDocuments({
                    status: {
                        $ne: "blocked",
                    },
                });


            /*
             * Percentile:
             *
             * Example:
             * rank = 12
             * total = 486
             *
             * percentile ≈ 97.5
             */

            const percentile =
                totalCustomers > 0 && rank
                    ? (
                        (totalCustomers - rank) /
                        totalCustomers
                    ) * 100
                    : 0;


            /* =================================================
               AVERAGE CUSTOMER PURCHASE
            ================================================= */

            const totalBusinessAmount =
                rankingData.reduce(
                    (sum, item) =>
                        sum +
                        (Number(item.totalAmount) || 0),
                    0
                );


            const averageCustomerAmount =
                rankingData.length > 0
                    ? totalBusinessAmount /
                      rankingData.length
                    : 0;


            /* =================================================
               TARGET PROGRESS
            ================================================= */

            const processedTargets =
                targets.map((target) => {

                    let currentQuantity = 0;


                    /*
                     * Calculate target progress
                     * from purchases.
                     */

                    purchases.forEach((purchase) => {

                        const purchaseDate =
                            new Date(purchase.date);


                        const startDate =
                            new Date(target.startDate);


                        const endDate =
                            new Date(target.endDate);


                        const dateInRange =
                            purchaseDate >= startDate &&
                            purchaseDate <= endDate;


                        if (!dateInRange) return;


                        /*
                         * Product-specific target
                         */

                        if (
                            target.category &&
                            purchase.category !==
                            target.category
                        ) {
                            return;
                        }


                        /*
                         * Optional product filter
                         */

                        if (
                            target.productName &&
                            purchase.productName !==
                            target.productName
                        ) {
                            return;
                        }


                        currentQuantity +=
                            Number(
                                purchase.quantity
                            ) || 0;

                    });


                    const targetQuantity =
                        Number(
                            target.targetQuantity
                        ) || 0;


                    const progress =
                        targetQuantity > 0

                            ? (
                                currentQuantity /
                                targetQuantity
                            ) * 100

                            : 0;


                    return {

                        ...target,

                        currentQuantity,

                        progress: Math.min(
                            100,
                            Math.max(
                                0,
                                progress
                            )
                        ),

                    };

                });


            /* =================================================
               FINAL RESPONSE
            ================================================= */

            return res.status(200).json({

                success: true,

                data: {

                    /* CUSTOMER */

                    customer,


                    /* ANALYTICS */

                    analytics: {

                        lifetime: {

                            totalOrders,

                            totalAmount,

                            cementBags,

                            ironRodTons,

                            ironSheetPieces,

                        },


                        currentYear: {

                            year: currentYear,

                            totalOrders:
                                yearlyOrders,

                            totalAmount:
                                yearlyAmount,

                            cementBags:
                                yearlyCementBags,

                            ironRodTons:
                                yearlyIronRodTons,

                            ironSheetPieces:
                                yearlyIronSheetPieces,

                        },


                        ranking: {

                            overall:
                                rank,

                            purchaseAmount:
                                rank,

                            totalCustomers,

                            percentile:

                                Number(
                                    percentile
                                ).toFixed(2),

                        },


                        averageCustomerAmount,

                    },


                    /* PRODUCTS */

                    products,


                    /* RECENT PURCHASES */

                    orders:
                        purchases.slice(0, 20),


                    /* GIFTS */

                    gifts,


                    /* TARGETS */

                    targets:
                        processedTargets,

                },

            });

        }


        /* =====================================================
           UPDATE CUSTOMER
        ===================================================== */

        if (req.method === "PUT") {

            const allowedFields = [

                "name",
                "phone",
                "alternatePhone",
                "email",
                "image",

                "customerType",
                "companyName",
                "gstNumber",
                "panNumber",

                "addresses",

                "status",
                "segment",

                "notes",

                "firstPurchaseDate",
                "lastPurchaseDate",
                "lastContactDate",

                "tags",
                "source",

            ];


            const updateData = {};


            allowedFields.forEach((field) => {

                if (
                    req.body[field] !== undefined
                ) {

                    updateData[field] =
                        req.body[field];

                }

            });


            if (
                Object.keys(updateData).length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "No valid fields provided",

                });

            }


            const customer =
                await Customer.findByIdAndUpdate(

                    customerId,

                    updateData,

                    {
                        new: true,
                        runValidators: true,
                    }

                ).lean();


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Customer not found",

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Customer updated successfully",

                customer,

            });

        }


        /* =====================================================
           DELETE CUSTOMER
        ===================================================== */

        if (req.method === "DELETE") {

            /*
             * Delete customer and related data.
             *
             * This keeps your database clean.
             */

            const customer =
                await Customer.findByIdAndDelete(
                    customerId
                );


            if (!customer) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Customer not found",

                });

            }


            await Promise.all([

                Purchase.deleteMany({
                    customerId,
                }),

                Gift.deleteMany({
                    customerId,
                }),

                Target.deleteMany({
                    customerId,
                }),

            ]);


            return res.status(200).json({

                success: true,

                message:
                    "Customer and related data deleted successfully",

            });

        }


        /* =====================================================
           METHOD NOT ALLOWED
        ===================================================== */

        return res.status(405).json({

            success: false,

            error: "Method not allowed",

        });


    } catch (error) {

        console.error(
            "CUSTOMER API ERROR:",
            error
        );


        /* =========================
           DUPLICATE PHONE
        ========================= */

        if (error.code === 11000) {

            return res.status(409).json({

                success: false,

                error:
                    "A customer with this phone number already exists",

            });

        }


        return res.status(500).json({

            success: false,

            error:
                "Internal server error",

        });

    }

}
