import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Customer from "@/server/models/customer";

export default async function handler(req, res) {

    await connectDB();

    try {

        const { id } = req.query;


        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({
                success: false,
                error: "Invalid customer ID",
            });

        }


        /* =========================
           GET SINGLE CUSTOMER
        ========================= */

        if (req.method === "GET") {

            const customer = await Customer
                .findById(id)
                .lean();


            if (!customer) {

                return res.status(404).json({
                    success: false,
                    error: "Customer not found",
                });

            }


            return res.status(200).json({
                success: true,
                customer,
            });
        }


        /* =========================
           UPDATE CUSTOMER
        ========================= */

        if (req.method === "PUT") {

            const allowedFields = [
                "name",
                "phone",
                "email",
                "image",
                "addresses",
                "purchases",
                "gifts",
                "notes",
            ];


            const updateData = {};


            allowedFields.forEach(field => {

                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }

            });


            if (Object.keys(updateData).length === 0) {

                return res.status(400).json({
                    success: false,
                    error: "No valid fields provided",
                });

            }


            const customer =
                await Customer.findByIdAndUpdate(
                    id,
                    updateData,
                    {
                        new: true,
                        runValidators: true,
                    }
                );


            if (!customer) {

                return res.status(404).json({
                    success: false,
                    error: "Customer not found",
                });

            }


            return res.status(200).json({
                success: true,
                message: "Customer updated successfully",
                customer,
            });
        }


        /* =========================
           DELETE CUSTOMER
        ========================= */

        if (req.method === "DELETE") {

            const customer =
                await Customer.findByIdAndDelete(id);


            if (!customer) {

                return res.status(404).json({
                    success: false,
                    error: "Customer not found",
                });

            }


            return res.status(200).json({
                success: true,
                message: "Customer deleted successfully",
            });
        }


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