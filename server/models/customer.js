import mongoose from "mongoose";

/* =========================
   ADDRESS
========================= */

const addressSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            trim: true,
            required: true,
        },

        city: {
            type: String,
            trim: true,
            required: true,
        },

        state: {
            type: String,
            trim: true,
            required: true,
        },

        country: {
            type: String,
            trim: true,
            default: "INDIA",
        },

        pincode: {
            type: String,
            trim: true,
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);


/* =========================
   PRODUCTS PURCHASED
========================= */

const purchaseSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            enum: [
                "cement",
                "iron_rod",
                "iron_sheet",
                "other",
            ],
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
        },

        unit: {
            type: String,
            required: true,
            enum: [
                "bag",
                "ton",
                "piece",
            ],
        },

        // When this product was added/recorded
        date: {
            type: Date,
            default: Date.now,
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { _id: true }
);


/* =========================
   GIFTS
========================= */

const giftSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        quantity: {
            type: Number,
            default: 1,
            min: 1,
        },

        images: {
            type: [String],
            default: [],
        },

        givenDate: {
            type: Date,
            default: Date.now,
        },

        occasion: {
            type: String,
            enum: [
                "festival",
                "birthday",
                "loyalty",
                "business",
                "special",
                "other",
            ],
            default: "business",
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { _id: true }
);


/* =========================
   CUSTOMER
========================= */

const CustomerSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            default: "/images/default-user.png",
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        addresses: {
            type: [addressSchema],
            default: [],
        },

        /* =========================
           PURCHASED PRODUCTS
        ========================= */

        purchases: {
            type: [purchaseSchema],
            default: [],
        },

        /* =========================
           GIFTS
        ========================= */

        gifts: {
            type: [giftSchema],
            default: [],
        },

        /* =========================
           EXTRA CUSTOMER INFORMATION
        ========================= */

        notes: {
            type: String,
            trim: true,
            default: "",
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);


/* =========================
   INDEXES
========================= */

CustomerSchema.index({ phone: 1 }, { unique: true });
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ "addresses.city": 1 });


export default mongoose.models.Customer ||
    mongoose.model("Customer", CustomerSchema);