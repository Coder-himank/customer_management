import { connectDB } from "@/lib/mongodb";
import Gift from "@/server/models/Gifts";
import Customer from "@/server/models/customer";
import Target from "@/server/models/Targets";

import { requireAuth } from "@/lib/auth";

export default async function handler(req, res) {
  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const auth = await requireAuth(req, res);

  if (!auth.authenticated) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  await connectDB();

  const { id } = req.query;

  try {
    // =====================================================
    // FIND GIFT
    // =====================================================

    const gift = await Gift.findById(id);

    if (!gift) {
      return res.status(404).json({
        success: false,
        message: "Gift not found",
      });
    }

    // =====================================================
    // GET GIFT
    // =====================================================

    if (req.method === "GET") {
      const populatedGift = await Gift.findById(id)
        .populate(
          "customerId",
          "name phone companyName status"
        )
        .populate(
          "targetId",
          "name targetType category productName targetQuantity unit startDate endDate status"
        )
        .lean();

      return res.status(200).json({
        success: true,
        data: populatedGift,
      });
    }

    // =====================================================
    // UPDATE GIFT
    // =====================================================

    if (req.method === "PUT") {
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

      // -------------------------------------------------
      // CUSTOMER
      // -------------------------------------------------

      const finalCustomerId =
        customerId !== undefined
          ? customerId
          : gift.customerId;

      const customer = await Customer.findById(
        finalCustomerId
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // -------------------------------------------------
      // BLOCKED CUSTOMER CHECK
      // -------------------------------------------------

      if (customer.status === "blocked") {
        return res.status(400).json({
          success: false,
          message:
            "Cannot give a gift to a blocked customer",
        });
      }

      // -------------------------------------------------
      // TARGET
      // -------------------------------------------------
      // Target is GENERAL.
      //
      // It does NOT belong to a particular customer.
      // Therefore we only verify that the target exists.
      // -------------------------------------------------

      const finalTargetId =
        targetId !== undefined
          ? targetId
          : gift.targetId;

      if (finalTargetId) {
        const target = await Target.findById(
          finalTargetId
        );

        if (!target) {
          return res.status(404).json({
            success: false,
            message: "Target not found",
          });
        }
      }

      // -------------------------------------------------
      // UPDATE GIFT FIELDS
      // -------------------------------------------------

      gift.customerId = finalCustomerId;

      // Allows removing a target by sending:
      // targetId: ""
      //
      // Also allows keeping the existing target when
      // targetId is not supplied.

      gift.targetId =
        finalTargetId || null;

      if (name !== undefined) {
        gift.name = String(name).trim();
      }

      if (quantity !== undefined) {
        const parsedQuantity = Number(quantity);

        if (
          !Number.isFinite(parsedQuantity) ||
          parsedQuantity < 1
        ) {
          return res.status(400).json({
            success: false,
            message: "Quantity must be at least 1",
          });
        }

        gift.quantity = parsedQuantity;
      }

      if (estimatedValue !== undefined) {
        const parsedValue =
          Number(estimatedValue);

        if (
          !Number.isFinite(parsedValue) ||
          parsedValue < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Estimated value cannot be negative",
          });
        }

        gift.estimatedValue = parsedValue;
      }

      if (receiverPhoto !== undefined) {
        gift.receiverPhoto =
          String(receiverPhoto).trim();
      }

      if (givenDate !== undefined) {
        const parsedDate = new Date(givenDate);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid gift date",
          });
        }

        gift.givenDate = parsedDate;
      }

      if (occasion !== undefined) {
        gift.occasion = occasion;
      }

      if (notes !== undefined) {
        gift.notes = String(notes).trim();
      }

      // -------------------------------------------------
      // SAVE GIFT
      // -------------------------------------------------

      await gift.save();

      // -------------------------------------------------
      // UPDATE CUSTOMER LAST CONTACT
      // -------------------------------------------------

      customer.lastContactDate =
        gift.givenDate;

      await customer.save();

      // -------------------------------------------------
      // RETURN UPDATED GIFT
      // -------------------------------------------------

      const updatedGift =
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

      return res.status(200).json({
        success: true,
        message: "Gift updated successfully",
        data: updatedGift,
      });
    }

    // =====================================================
    // DELETE GIFT
    // =====================================================

    if (req.method === "DELETE") {
      await Gift.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Gift deleted successfully",
      });
    }

    // =====================================================
    // METHOD NOT ALLOWED
    // =====================================================

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(
      "Gift ID API Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}