import { connectDB } from "@/lib/mongodb";
import Gift from "@/server/models/Gifts";
import Customer from "@/server/models/customer";
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
    // =====================================================
    // GET GIFTS
    // =====================================================

    if (req.method === "GET") {
      const gifts = await Gift.find({})
        .populate(
          "customerId",
          "name phone companyName status"
        )
        .populate(
          "targetId",
          "name targetType category productName targetQuantity unit startDate endDate status"
        )
        .sort({ givenDate: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        gifts,
      });
    }

    // =====================================================
    // CREATE GIFT
    // =====================================================

    if (req.method === "POST") {
      const {
        customerId,
        targetId,
        name,
        quantity,
        estimatedValue,
        receiverPhoto,
        givenDate,
        occasion,
        notes,
      } = req.body;

      // -----------------------------------------------
      // REQUIRED FIELDS
      // -----------------------------------------------

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: "Customer is required",
        });
      }

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Gift name is required",
        });
      }

      if (
        quantity === undefined ||
        Number(quantity) < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Gift quantity must be at least 1",
        });
      }

      // -----------------------------------------------
      // VERIFY CUSTOMER
      // -----------------------------------------------

      const customer = await Customer.findById(
        customerId
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      if (customer.status === "blocked") {
        return res.status(400).json({
          success: false,
          message:
            "Cannot give a gift to a blocked customer",
        });
      }

      // -----------------------------------------------
      // VERIFY TARGET
      // -----------------------------------------------

      let target = null;

      if (targetId) {
        target = await Target.findById(targetId);

        if (!target) {
          return res.status(404).json({
            success: false,
            message: "Selected target not found",
          });
        }

        if (target.status !== "active") {
          return res.status(400).json({
            success: false,
            message:
              "Cannot give a gift for an inactive target",
          });
        }
      }

      // -----------------------------------------------
      // CREATE GIFT
      // -----------------------------------------------

      const gift = await Gift.create({
        customerId,

        targetId: targetId || null,

        name: name.trim(),

        quantity: Number(quantity),

        estimatedValue: Number(
          estimatedValue || 0
        ),

        receiverPhoto:
          receiverPhoto?.trim() || "",

        givenDate: givenDate
          ? new Date(givenDate)
          : new Date(),

        occasion:
          occasion || "customer_reward",

        notes: notes?.trim() || "",
      });

      // -----------------------------------------------
      // UPDATE CUSTOMER CONTACT DATE
      // -----------------------------------------------

      customer.lastContactDate =
        gift.givenDate;

      await customer.save();

      // -----------------------------------------------
      // RETURN POPULATED DATA
      // -----------------------------------------------

      const populatedGift =
        await Gift.findById(gift._id)
          .populate(
            "customerId",
            "name phone companyName status"
          )
          .populate(
            "targetId",
            "name targetType category productName targetQuantity unit startDate endDate status"
          )
          .lean();

      return res.status(201).json({
        success: true,
        message: "Gift recorded successfully",
        data: populatedGift,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Gift API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}