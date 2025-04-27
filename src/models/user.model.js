import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = mongoose.Schema({
    walletAddress: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        index: true
    },
    referralCode: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    },
    twitterId: {
        type: String,
        required: false,
        unique: true,
        trim: true,
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    confirmedReferralPoints: {
        type: Number,
        default: 0
    },
    nodePoints: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    },
    username: {
        type: String,
        required: false,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true // Allow multiple null values
    },
    email: {
        type: String,
        unique: true,
        required: false,
        lowercase: true,
        trim: true,
        sparse: true // Important! This makes the unique index ignore null values
    },
    fullname: {
        type: String,
        required: false,
        trim: true
    },
    password: {
        type: String,
        required: false // Not all users may have passwords
    },
    refreshToken: {
        type: String,
    },
    // Include all other fields from your database
    lastClaimed: {
        type: Date,
        default: null
    },
    lastResync: {
        type: Date,
        default: null
    },
    dailyStreak: {
        type: Number,
        default: 0
    },
    updateNotification: {
        type: Boolean,
        default: false
    },
    referrals: {
        type: Array,
        default: []
    },
    claimStreakPoints: {
        type: Number,
        default: 0
    },
    boostNodePoints: {
        type: Number,
        default: 0
    },
    rewardPoints: {
        type: Number,
        default: 0
    },
    cliBoostNodePoints: {
        type: Number,
        default: 0
    },
    cliNodePoints: {
        type: Number,
        default: 0
    },
    verifiedProofs: {
        type: Array,
        default: []
    },
    isTwitterVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: {
            type: String,
            default: null
        },
        expiresAt: {
            type: Date,
            default: null
        }
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        required: false,
        trim: true,
        sparse: true
    },
}, { timestamps: true });

// Pre-save middleware for password hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    
    try {
        console.log("Hashing password for user:", this._id);
        this.password = await bcrypt.hash(this.password, 10);
        console.log("Password hashed successfully");
        next();
    } catch (error) {
        console.error("Error in password hashing:", error);
        next(error);
    }
});

// Improved password comparison method with error handling
userSchema.methods.isPasswordCorrect = async function (password) {
    try {
        // Make sure both password and hash exist before comparison
        if (!password || !this.password) {
            console.error("Password comparison failed: Missing password or hash");
            return false;
        }
        
        // Make sure the hash is in the expected format
        if (typeof this.password !== 'string' || !this.password.trim()) {
            console.error("Password hash is invalid");
            return false;
        }
        
        // Use await to properly handle the promise
        const result = await bcrypt.compare(password, this.password);
        console.log("Password comparison result:", result);
        return result;
    } catch (error) {
        console.error("Error in password comparison:", error.message);
        return false; // Return false instead of throwing error to prevent app crash
    }
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            walletAddress: this.walletAddress,
            email: this.email,
            username: this.username,
            referralCode: this.referralCode,
            twitterId: this.twitterId
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model('User', userSchema);