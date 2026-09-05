import { connectDB } from "@/lib/mongodb";
import Purchase from "@/server/models/Purchases";
import Customer from "@/server/models/customer";

export default async function handler(req, res) {
  await connectDB();

  try {
    // =========================
    // GET ALL PURCHASES
    // =========================
    if (req.method === "GET") {
      const purchases = await Purchase.find({})
        .populate("customerId", "name phone companyName")
        .sort({ date: -1 });

      return res.status(200).json({
        success: true,
        data: purchases,
      });
    }

    // =========================
    // CREATE PURCHASE
    // =========================
    if (req.method === "POST") {
      const {
        customerId,
        productName,
        category,
        quantity,
        unit,
        rate,
        totalAmount,
        date,
        notes,
      } = req.body;

      // Required fields
      if (
        !customerId ||
        !productName ||
        !category ||
        quantity === undefined ||
        !unit
      ) {
        return res.status(400).json({
          success: false,
          message: "Customer, product, category, quantity and unit are required",
        });
      }

      // Check customer exists
      const customer = await Customer.findById(customerId);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Optional: don't allow blocked/inactive customers
      if (customer.status === "blocked") {
        return res.status(400).json({
          success: false,
          message: "This customer is blocked",
        });
      }

      // Calculate amount if rate is provided
      const calculatedAmount =
        totalAmount !== undefined
          ? Number(totalAmount)
          : Number(quantity) * Number(rate || 0);

      const purchase = await Purchase.create({
        customerId,
        productName: productName.trim(),
        category,
        quantity: Number(quantity),
        unit,
        rate: Number(rate || 0),
        totalAmount: calculatedAmount,
        date: date ? new Date(date) : new Date(),
        notes: notes?.trim() || "",
      });

      const populatedPurchase = await Purchase.findById(purchase._id)
        .populate("customerId", "name phone companyName");

      return res.status(201).json({
        success: true,
        message: "Purchase added successfully",
        data: populatedPurchase,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Purchase API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}