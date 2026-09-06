import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        refernceId: {
            type: String,
        }
        
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.User ||
    mongoose.model("User", userSchema);