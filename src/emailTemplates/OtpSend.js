export const getOtpEmailTemplate = (fullname, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .header {
                text-align: center;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
                margin-bottom: 20px;
            }
            .otp-box {
                text-align: center;
                padding: 15px;
                background-color: #e8eaf6;
                border-radius: 5px;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 5px;
                margin: 20px 0;
                color: #3f51b5;
            }
            .warning {
                color: #d32f2f;
                font-size: 12px;
                margin-top: 15px;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Your One-Time Password</h2>
            </div>
            
            <p>Hello ${fullname},</p>
            
            <p>Here is your one-time password (OTP) for verification:</p>
            
            <div class="otp-box">
                ${otp}
            </div>
            
            <p>This OTP will expire in 10 minutes. Please do not share this code with anyone.</p>
            
            <p class="warning">If you did not request this code, please ignore this email or contact support immediately.</p>
            
            <p>Best regards,<br>The Team</p>
            
            <div class="footer">
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};