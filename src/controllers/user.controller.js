import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, 'Something Went Wrong While Generating Refresh and Access Token');
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password, username, walletAddress } = req.body;

    // Log registration attempt
    console.log("Registration attempt:", { 
        fullname: !!fullname, 
        email: email || "not provided", 
        username: username || "not provided",
        walletAddress: walletAddress || "not provided",
        passwordProvided: !!password
    });

    // Check required fields based on your application's needs
    // For Web3 app, walletAddress might be the primary identifier
    if (!password || (!walletAddress && !username && !email)) {
        throw new ApiError(400, 'Password and at least one identifier (walletAddress, username, or email) are required');
    }

    // Check for existing user with any of the provided identifiers
    const queryConditions = [];
    if (walletAddress) queryConditions.push({ walletAddress });
    if (username) queryConditions.push({ username });
    if (email) queryConditions.push({ email });

    const existingUser = queryConditions.length > 0 ? 
        await User.findOne({ $or: queryConditions }) : null;

    if (existingUser) {
        throw new ApiError(409, 'User with provided identifier already exists');
    }

    // Create user with provided fields
    try {
        const userData = {
            password,
            // Only include fields if they are provided
            ...(fullname ? { fullname } : {}),
            ...(email ? { email } : {}),
            ...(username ? { username: username.toLowerCase() } : {}),
            ...(walletAddress ? { walletAddress } : {})
        };

        const user = await User.create(userData);
        
        console.log("User created with ID:", user._id);
        console.log("User has fields:", {
            walletAddress: !!user.walletAddress,
            username: !!user.username,
            email: !!user.email,
            passwordHash: !!user.password
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        if (!createdUser) {
            throw new ApiError(500, 'Something went wrong while creating user');
        }

        return res.status(201).json(
            new ApiResponse(201, createdUser, "User Registered Successfully")
        );
    } catch (error) {
        console.error("Registration error:", error);
        
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            throw new ApiError(409, `User with this ${field} already exists`);
        }
        
        throw new ApiError(500, `Registration failed: ${error.message}`);
    }
});

export const loginUser = asyncHandler(async (req, res) => {
    // Accept a generic identifier which could be username, email, walletAddress, etc.
    const { identifier, password } = req.body;

    // For backward compatibility, also accept username/email
    const username = req.body.username || identifier;
    const email = req.body.email || identifier;

    console.log("Login attempt with:", {
        identifier: identifier || "not provided",
        username: username || "not provided",
        email: email || "not provided",
        passwordProvided: !!password
    });

    if (!identifier && !username && !email || !password) {
        throw new ApiError(400, 'Identifier and password are required');
    }

    // Test bcrypt functionality to ensure it's working
    try {
        const testHash = await bcrypt.hash('test', 10);
        const testCompare = await bcrypt.compare('test', testHash);
        console.log("Bcrypt self-test:", testCompare === true ? "PASSED" : "FAILED");
    } catch (e) {
        console.error("Bcrypt self-test error:", e.message);
    }

    // Find user by any possible identifier
    const queryConditions = [];
    if (identifier) {
        queryConditions.push({ walletAddress: identifier });
        queryConditions.push({ username: identifier });
        queryConditions.push({ email: identifier });
        queryConditions.push({ twitterId: identifier });
        queryConditions.push({ referralCode: identifier });
    } else {
        if (username) queryConditions.push({ username });
        if (email) queryConditions.push({ email });
    }

    // Find the user
    const user = await User.findOne({ $or: queryConditions });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    console.log("User found with ID:", user._id);
    console.log("User identifiers:", {
        walletAddress: user.walletAddress || "not set",
        username: user.username || "not set",
        email: user.email || "not set",
        twitterId: user.twitterId || "not set",
        referralCode: user.referralCode || "not set"
    });
    console.log("Password hash exists:", !!user.password);
    
    // Check for missing password hash
    if (!user.password) {
        console.log("User has no password hash. Setting a new one.");
        user.password = await bcrypt.hash(password, 10);
        await user.save({ validateBeforeSave: false });
        console.log("New password hash saved.");
    }
    
    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid user credentials');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie('AccessToken', accessToken, options)
        .cookie('RefreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                'User Logged In Successfully'
            )
        );
});

// Additional utility functions

export const fixDuplicateEmails = asyncHandler(async (req, res) => {
    // This function fixes the duplicate null email issue
    // by updating users with null emails to have unique placeholder emails
    
    // Find all users with null email
    const usersWithNullEmail = await User.find({ email: null });
    
    console.log(`Found ${usersWithNullEmail.length} users with null email`);
    
    // For each user except the first one, set a unique email
    let updatedCount = 0;
    for (let i = 1; i < usersWithNullEmail.length; i++) {
        const user = usersWithNullEmail[i];
        // Generate a placeholder email based on ID
        const placeholderEmail = `user-${user._id}@placeholder.com`;
        
        await User.updateOne(
            { _id: user._id },
            { $set: { email: placeholderEmail } }
        );
        updatedCount++;
    }
    
    return res.status(200).json({
        success: true,
        message: `Fixed ${updatedCount} users with null email`
    });
});

export const findUserByIdentifier = asyncHandler(async (req, res) => {
    const { identifier } = req.params;
    
    // Try all possible fields that might be used for identification
    const user = await User.findOne({
        $or: [
            { walletAddress: identifier },
            { username: identifier },
            { email: identifier },
            { twitterId: identifier },
            { referralCode: identifier }
        ]
    }).select("-password -refreshToken");
    
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found with this identifier"
        });
    }
    
    return res.status(200).json({
        success: true,
        message: "User found",
        data: user
    });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
        return res.status(400).json({ 
            success: false,
            message: "User ID and new password are required" 
        });
    }
    
    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Update the password
        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();
        
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
            user: {
                _id: user._id,
                walletAddress: user.walletAddress,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Password reset error:", error);
        return res.status(500).json({
            success: false,
            message: "Error resetting password",
            error: error.message
        });
    }
});