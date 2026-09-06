import { connectDB } from "@/lib/mongodb";

import Target from "@/server/models/Targets";
import Purchase from "@/server/models/Purchases";
import Gift from "@/server/models/Gifts";
import Customer from "@/server/models/customer";

import { requireAuth } from "@/lib/auth";

export default async function handler(req, res) {

    const auth = await requireAuth(req, res);

    if (!auth.authenticated) {
        return res.status(401).json({
            error: "Authentication required",
        });
    }

    await connectDB();  

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {

        const { id } = req.query;

        const target =
            await Target.findById(id).lean();

        if (!target) {

            return res.status(404).json({
                error: "Target not found",
            });
        }

        const startDate =
            new Date(target.startDate);

        const endDate =
            new Date(target.endDate);

        endDate.setHours(
            23,
            59,
            59,
            999
        );

        /*
         * Find purchases belonging to
         * this campaign.
         */

        const purchaseFilter = {

            date: {
                $gte: startDate,
                $lte: endDate,
            },

            category:
                target.category,

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
            )
                .populate(
                    "customerId",
                    "name phone companyName status"
                )
                .lean();


        /*
         * Group purchases by customer.
         */

        const customerMap = {};

        purchases.forEach((purchase) => {

            if (!purchase.customerId) return;

            const customer =
                purchase.customerId;

            const customerId =
                customer._id.toString();

            if (!customerMap[customerId]) {

                customerMap[customerId] = {

                    _id: customer._id,

                    name:
                        customer.name,

                    phone:
                        customer.phone,

                    companyName:
                        customer.companyName,

                    purchased: 0,

                    sales: 0,

                };
            }

            customerMap[customerId]
                .purchased +=
                purchase.quantity || 0;

            customerMap[customerId]
                .sales +=
                purchase.totalAmount || 0;

        });

        const customers =
            Object.values(
                customerMap
            ).map((customer) => {

                const progress =
                    target.targetQuantity
                        ? Math.min(
                            100,
                            Math.round(
                                (customer.purchased /
                                    target.targetQuantity) *
                                    100
                            )
                        )
                        : 0;

                return {
                    ...customer,
                    progress,
                };
            });

        /*
         * Gifts are dynamically pulled
         * from the Gift collection.
         */

        const gifts =
            await Gift.find({
                targetId: target._id,
            })
                .populate(
                    "customerId",
                    "name phone companyName"
                )
                .lean();

        return res.status(200).json({

            target,

            customers,

            gifts,

        });

    } catch (error) {

        console.error(
            "Target details error:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to load target",
        });
    }
}