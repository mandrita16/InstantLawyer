import mongoose from "mongoose";

const lawyerSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    specialization: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: Number,
        required: true
    },
    ratePerHour: {
        type: Number,
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    bio: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String,
        default: "https://placeholder.com/lawyer-profile"
    }
}, { timestamps: true });

export const Lawyer = mongoose.model('Lawyer', lawyerSchema);