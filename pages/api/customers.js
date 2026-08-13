import { connectDB } from "@/lib/mongodb";
import Customer from "@/server/models/customer";

export default async function handler(req, res) {

    await connectDB();

    try {

        /* =========================
           GET ALL CUSTOMERS
        ========================= */

        if (req.method === "GET") {

            const customers = await Customer
                .find({})
                .sort({ createdAt: -1 })
                .lean();

            return res.status(200).json({
                success: true,
                count: customers.length,
                customers,
            });
        }


        /* =========================
           CREATE CUSTOMER
        ========================= */

        if (req.method === "POST") {

            const {
                name,
                phone,
                email,
                image,
                addresses,
                purchases,
                gifts,
                notes,
            } = req.body;


            if (!name || !phone) {

                return res.status(400).json({
                    success: false,
                    error: "Name and phone are required",
                });

            }


            const existingCustomer = await Customer.findOne({
                phone: phone.toString(),
            });


            if (existingCustomer) {

                return res.status(409).json({
                    success: false,
                    error: "Customer with this phone already exists",
                });

            }


            const customer = await Customer.create({

                name: name.trim(),

                phone: phone.toString().trim(),

                email: email?.trim() || undefined,

                image: image || undefined,

                addresses: addresses || [],

                purchases: purchases || [],

                gifts: gifts || [],

                notes: notes || "",

            });


            return res.status(201).json({
                success: true,
                message: "Customer created successfully",
                customer,
            });
        }


        /* =========================
           METHOD NOT ALLOWED
        ========================= */

        return res.status(405).json({
            success: false,
            error: "Method not allowed",
        });


    } catch (error) {

        console.error("CUSTOMER API ERROR:", error);

        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
}