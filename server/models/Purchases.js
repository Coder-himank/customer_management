import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            index: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            enum: [
                "cement",
                "iron_rod",
                "iron_sheet",
                "other",
            ],
            required: true,
            index: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
        },

        unit: {
            type: String,
            enum: [
                "bag",
                "bundle",
                "kg",
                "ton",
                "piece",
            ],
            required: true,
        },

        rate: {
            type: Number,
            min: 0,
            default: 0,
        },

        totalAmount: {
            type: Number,
            min: 0,
            default: 0,
        },

        date: {
            type: Date,
            default: Date.now,
            index: true,
        },

        notes: {
            type: String,
            trim: true,
        },
        logs: [{type:String, default: "Purchase record created"}]
    },
    {
        timestamps: true,
    }

);

purchaseSchema.index({
    customerId: 1,
    date: -1,
});

purchaseSchema.index({
    category: 1,
    date: -1,
});

export default mongoose.models.Purchase ||
    mongoose.model("Purchase", purchaseSchema);