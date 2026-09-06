import mongoose from "mongoose";

/* =========================
   ADDRESS
========================= */

const addressSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            trim: true,
            default: "Home",
        },

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
            default: "India",
        },

        pincode: {
            type: String,
            trim: true,
            match: [/^[0-9]{6}$/, "Invalid pincode"],
        },

        landmark: {
            type: String,
            trim: true,
            default: "",
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: true,
    }
);


/* =========================
   CUSTOMER
========================= */

const CustomerSchema = new mongoose.Schema(
    {
        /* =========================
           BASIC INFORMATION
        ========================= */

        image: {
            type: String,
            default: "/images/default-user.png",
            trim: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        alternatePhone: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },


        /* =========================
           BUSINESS INFORMATION
        ========================= */

        customerType: {
            type: String,
            enum: [
                "retail",
                "contractor",
                "builder",
                "dealer",
                "company",
                "other",
            ],
            default: "retail",
        },

        companyName: {
            type: String,
            trim: true,
            default: "",
        },

        gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },

        panNumber: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },


        /* =========================
           ADDRESSES
        ========================= */

        addresses: {
            type: [addressSchema],
            default: [],
        },


        /* =========================
           CUSTOMER STATUS
        ========================= */

        status: {
            type: String,
            enum: [
                "active",
                "inactive",
                "blocked",
            ],
            default: "active",
        },


        /* =========================
           CUSTOMER SEGMENT
           
           This should normally be
           calculated by analytics.
        ========================= */

        segment: {
            type: String,
            enum: [
                "new",
                "regular",
                "growing",
                "high_value",
                "vip",
                "declining",
                "inactive",
            ],
            default: "new",
        },


        /* =========================
           CUSTOMER NOTES
        ========================= */

        notes: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },


        /* =========================
           IMPORTANT DATES
        ========================= */

        firstPurchaseDate: {
            type: Date,
            default: null,
        },

        lastPurchaseDate: {
            type: Date,
            default: null,
        },

        lastContactDate: {
            type: Date,
            default: null,
        },


        /* =========================
           CUSTOMER METADATA
        ========================= */

        tags: {
            type: [String],
            default: [],
        },

        source: {
            type: String,
            enum: [
                "walk_in",
                "referral",
                "existing_customer",
                "phone",
                "website",
                "other",
            ],
            default: "other",
        },


        /* =========================
           CREATED / UPDATED
        ========================= */

        createdAt: {
            type: Date,
            default: Date.now,
        },

        
    logs: [{type:String, default: "Customer record created"}]
    },

    {
        timestamps: true,
    }
);


/* =========================
   INDEXES
========================= */

// Phone lookup
CustomerSchema.index(
    { phone: 1 },
    { unique: true }
);

// Customer search
CustomerSchema.index({
    name: 1,
});

// Location filtering
CustomerSchema.index({
    "addresses.city": 1,
});

CustomerSchema.index({
    "addresses.state": 1,
});

// Business filtering
CustomerSchema.index({
    customerType: 1,
});

CustomerSchema.index({
    status: 1,
});

CustomerSchema.index({
    segment: 1,
});

// Useful for inactive-customer queries
CustomerSchema.index({
    lastPurchaseDate: 1,
});


/* =========================
   MODEL
========================= */

export default mongoose.models.Customer ||
    mongoose.model("Customer", CustomerSchema);