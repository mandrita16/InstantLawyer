import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { ApiError } from './ApiError.js';
import nodemailer from 'nodemailer';

// Configure your email service
const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate a random 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to user record with 10-minute expiration
export const saveOTP = async (userId, otp) => {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // OTP valid for 10 minutes
    
    await User.findByIdAndUpdate(userId, {
        'otp.code': otp,
        'otp.expiresAt': expiryTime
    });
    
    return expiryTime;
};

// Verify OTP is valid and not expired
export const verifyOTP = async (userId, otpToVerify) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    
    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
        throw new ApiError(400, 'No OTP exists for this user');
    }
    
    if (new Date() > user.otp.expiresAt) {
        throw new ApiError(400, 'OTP has expired');
    }
    
    if (user.otp.code !== otpToVerify) {
        throw new ApiError(400, 'Invalid OTP');
    }
    
    return true;
};

// Send OTP via email
export const sendOTPEmail = async (email, otp) => {
    if (!email) {
        throw new ApiError(400, 'Email is required to send OTP');
    }
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #00bfff; text-align: center;">Verification Code</h2>
                <p style="font-size: 16px; line-height: 1.5;">Your verification code is:</p>
                <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
                </div>
                <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
                <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
            </div>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new ApiError(500, 'Failed to send verification email');
    }
};

// Clear OTP after successful verification
export const clearOTP = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        'otp.code': null,
        'otp.expiresAt': null
    });
};