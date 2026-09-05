import { connectDB } from "@/lib/mongodb";
import Purchase from "@/server/models/Purchases";
import Customer from "@/server/models/customer";

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  try {

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Purchase ID is required",
      });
    }
    // =========================
    // CHECK PURCHASE
    // =========================
    const existingPurchase = await Purchase.findById(id);

    

    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    if (req.method === "GET") {

      const populatedPurchase = await existingPurchase.populate("customerId", "name phone companyName addresses");
      return res.status(200).json({
        success: true,
        data: populatedPurchase,
      });
    }


    // =========================
    // UPDATE PURCHASE
    // =========================
    if (req.method === "PUT") {
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

      // Validate customer
      if (customerId) {
        const customer = await Customer.findById(customerId);

        if (!customer) {
          return res.status(404).json({
            success: false,
            message: "Customer not found",
          });
        }

        if (customer.status === "blocked") {
          return res.status(400).json({
            success: false,
            message: "This customer is blocked",
          });
        }
      }

      // Calculate total
      const finalQuantity =
        quantity !== undefined
          ? Number(quantity)
          : existingPurchase.quantity;

      const finalRate =
        rate !== undefined
          ? Number(rate)
          : existingPurchase.rate;

      const calculatedAmount =
        totalAmount !== undefined
          ? Number(totalAmount)
          : finalQuantity * finalRate;

      const updatedPurchase = await Purchase.findByIdAndUpdate(
        id,
        {
          ...(customerId && { customerId }),
          ...(productName && { productName: productName.trim() }),
          ...(category && { category }),
          ...(quantity !== undefined && {
            quantity: Number(quantity),
          }),
          ...(unit && { unit }),
          ...(rate !== undefined && {
            rate: Number(rate),
          }),
          totalAmount: calculatedAmount,
          ...(date && { date: new Date(date) }),
          ...(notes !== undefined && {
            notes: notes.trim(),
          }),
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("customerId", "name phone companyName");

      return res.status(200).json({
        success: true,
        message: "Purchase updated successfully",
        data: updatedPurchase,
      });
    }

    // =========================
    // DELETE PURCHASE
    // =========================
    if (req.method === "DELETE") {
      await Purchase.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Purchase deleted successfully",
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Purchase [id] API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}