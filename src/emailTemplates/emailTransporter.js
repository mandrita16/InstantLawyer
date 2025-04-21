// utils/sendEmail.js
import nodemailer from 'nodemailer';

export const sendEmail = async ({ sendTo, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // This should be an App Password
            }
        });

        const mailOptions = {
            from: `"Your Platform Name" <${process.env.EMAIL_USER}>`, // Changed to EMAIL_USER for consistency
            to: sendTo,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.response);
        return true; // Return a value to indicate success
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        if (error.code === 'EAUTH') {
            console.error("Authentication failed. Check your Gmail credentials and security settings.");
        }
        return false; // Return a value to indicate failure
    }
};