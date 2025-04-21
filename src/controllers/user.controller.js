import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {getConfirmationEmailTemplate} from "../emailTemplates/ConfirmationMail.js";
import {getOtpEmailTemplate} from "../emailTemplates/OtpSend.js";
import nodemailer from "nodemailer";
import {sendEmail} from "../emailTemplates/emailTransporter.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {

        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateAccessToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, 'Something Went Wrong While Generating Refresh and Access Token')
    }
}


export const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password, username } = req.body;

    if ([fullname, email, password, username].some(field => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required');
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (existingUser) {
        throw new ApiError(409, 'User with email or username already exists');
    }

    const user = await User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, 'Something went wrong while creating user');
    }

    const emailTemplate = getConfirmationEmailTemplate(fullname, username);

    console.log("Trying to send confirmation email to:", email);
    const emailSent = await sendEmail({
        sendTo: email,
        subject: "Registration Successful - Welcome to Our Platform",
        html: emailTemplate
    });

    if (!emailSent) {
        return res.status(201).json(
            new ApiResponse(
                201,
                createdUser,
                "User Registered Successfully, but confirmation email failed to send"
            )
        );
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User Registered Successfully")
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Check if either username OR email is provided, not both required
    if ((!username && !email) || !password) {
        throw new ApiError(400, 'username/email and password are required')
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, 'User does not exist')
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid user credentials')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Fix: Use findById instead of findOne and fix the select syntax
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie('AccessToken', accessToken, options) // Removed the colon
        .cookie('RefreshToken', refreshToken, options) // Removed the colon
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
        )
})

