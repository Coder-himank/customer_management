import mongoose from "mongoose";

const giftSchema = new mongoose.Schema(
  {
    // =========================
    // CUSTOMER
    // =========================

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // =========================
    // TARGET
    // =========================

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Target",
      default: null,
      index: true,
    },

    // =========================
    // GIFT DETAILS
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    estimatedValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    // =========================
    // PHOTO OF PERSON RECEIVING
    // =========================

    receiverPhoto: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // DATE
    // =========================

    givenDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // =========================
    // OCCASION
    // =========================

    occasion: {
      type: String,
      enum: [
        "diwali",
        "holi",
        "new_year",
        "birthday",
        "anniversary",
        "business_event",
        "customer_reward",
        "other",
      ],
      default: "customer_reward",
    },

    // =========================
    // NOTES
    // =========================

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    logs: [{type:String, default: "Gift record created"}]
  },
  {
    timestamps: true,
  }
);

giftSchema.index({
  customerId: 1,
  givenDate: -1,
});

giftSchema.index({
  targetId: 1,
  givenDate: -1,
});

export default mongoose.models.Gift ||
  mongoose.model("Gift", giftSchema);