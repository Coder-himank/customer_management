import mongoose from "mongoose";

const targetSchema = new mongoose.Schema(
  {
    // Target name shown to the user
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // What kind of target is this?
    targetType: {
      type: String,
      enum: [
        "quantity",
        "amount",
        "orders",
        "product",
      ],
      required: true,
      index: true,
    },

    // Optional product/category restriction
    category: {
      type: String,
      enum: [
        "cement",
        "iron_rod",
        "iron_sheet",
        "other",
      ],
      default: null,
    },

    productName: {
      type: String,
      trim: true,
      default: null,
    },

    // Target value
    targetQuantity: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Unit of target
    unit: {
      type: String,
      enum: [
        "bag",
        "bundle",
        "kg",
        "ton",
        "piece",
        "order",
        "rupee",
      ],
      default: null,
    },

    startDate: {
      type: Date,
      required: true,
      index: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "active",
        "completed",
        "expired",
        "cancelled",
      ],
      default: "active",
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

targetSchema.index({
  customerId: 1,
  status: 1,
  startDate: 1,
  endDate: 1,
});

export default mongoose.models.Target ||
  mongoose.model("Target", targetSchema);