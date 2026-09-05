import { connectDB } from "@/lib/mongodb";

import Target from "@/server/models/Targets";
import Purchase from "@/server/models/Purchases";
import Gift from "@/server/models/Gifts";

import { requireAuth } from "@/lib/auth";

export default async function handler(req, res) {

    const auth = await requireAuth(req, res);

    if (!auth.authenticated) {
        return res.status(401).json({
            error: "Authentication required",
        });
    }

    await connectDB();

    if (req.method === "GET") {

        try {

            const targets = await Target.find({})
                .sort({ createdAt: -1 })
                .lean();

            const result = [];

            for (const target of targets) {

                const startDate = new Date(target.startDate);
                const endDate = new Date(target.endDate);

                endDate.setHours(23, 59, 59, 999);

                const purchaseFilter = {
                    date: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                    category: target.category,
                };

                if (target.productName) {
                    purchaseFilter.productName =
                        target.productName;
                }

                if (target.unit) {
                    purchaseFilter.unit =
                        target.unit;
                }

                const purchases =
                    await Purchase.find(
                        purchaseFilter
                    ).lean();

                const customerMap = {};

                purchases.forEach((purchase) => {

                    const customerId =
                        purchase.customerId.toString();

                    if (!customerMap[customerId]) {
                        customerMap[customerId] = {
                            quantity: 0,
                            sales: 0,
                        };
                    }

                    customerMap[customerId].quantity +=
                        purchase.quantity || 0;

                    customerMap[customerId].sales +=
                        purchase.totalAmount || 0;
                });

                const participants =
                    Object.keys(customerMap).length;

                let completed = 0;

                let totalPurchased = 0;
                let salesGenerated = 0;

                Object.values(customerMap).forEach(
                    (customer) => {

                        totalPurchased +=
                            customer.quantity;

                        salesGenerated +=
                            customer.sales;

                        if (
                            customer.quantity >=
                            target.targetQuantity
                        ) {
                            completed++;
                        }
                    }
                );

                /*
                 * Gifts are dynamic.
                 *
                 * We only count gifts associated with
                 * this target.
                 */
                const giftsGiven =
                    await Gift.countDocuments({
                        targetId: target._id,
                    });

                result.push({
                    ...target,

                    participants,

                    completed,

                    totalPurchased,

                    salesGenerated,

                    giftsGiven,
                });
            }

            return res.status(200).json({
                targets: result,
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                error: "Failed to fetch targets",
            });
        }
    }

    if (req.method === "POST") {

        try {

            const target = await Target.create(
                req.body
            );

            return res.status(201).json({
                target,
            });

        } catch (error) {

            console.error(error);

            return res.status(400).json({
                error: error.message,
            });
        }
    }

    return res.status(405).json({
        error: "Method not allowed",
    });
}