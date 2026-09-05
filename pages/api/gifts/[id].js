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

  const { id } = req.query;

  try {
    const gift = await Gift.findById(id);

    if (!gift) {
      return res.status(404).json({
        success: false,
        message: "Gift not found",
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

      const finalCustomerId =
        customerId || gift.customerId;

      // -----------------------------------------------
      // VERIFY CUSTOMER
      // -----------------------------------------------

      const customer = await Customer.findById(
        finalCustomerId
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

        if (
          target.customerId.toString() !==
          finalCustomerId.toString()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Target does not belong to this customer",
          });
        }
      }

      // -----------------------------------------------
      // UPDATE
      // -----------------------------------------------

      gift.customerId = finalCustomerId;

      gift.targetId =
        finalTargetId || null;

      if (name !== undefined) {
        gift.name = name.trim();
      }

      if (quantity !== undefined) {
        gift.quantity = Number(quantity);
      }

      if (estimatedValue !== undefined) {
        gift.estimatedValue =
          Number(estimatedValue);
      }

      if (receiverPhoto !== undefined) {
        gift.receiverPhoto =
          receiverPhoto.trim();
      }

      if (givenDate !== undefined) {
        gift.givenDate =
          new Date(givenDate);
      }

      if (occasion !== undefined) {
        gift.occasion = occasion;
      }

      if (notes !== undefined) {
        gift.notes = notes.trim();
      }

      await gift.save();

      // -----------------------------------------------
      // UPDATE CUSTOMER
      // -----------------------------------------------

      customer.lastContactDate =
        gift.givenDate;

      await customer.save();

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