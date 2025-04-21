export const getConfirmationEmailTemplate = (fullname, username) => {
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
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #777;
            }
            .highlight {
                font-weight: bold;
                color: #4a6ee0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Registration Successful!</h2>
            </div>
            
            <p>Hello <span class="highlight">${fullname}</span>,</p>
            
            <p>Thank you for registering with our platform. Your account has been successfully created with the username: <span class="highlight">${username}</span>.</p>
            
            <p>You can now log in to your account and start exploring all the features we offer.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Team</p>
            
            <div class="footer">
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};