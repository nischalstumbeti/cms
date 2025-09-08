import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST || 'nextlinker.in',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'worldtourismday.nlr@nextlinker.in',
    pass: process.env.SMTP_PASS || '99230041300@nlr',
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

const createOtpEmailTemplate = (otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your One-Time Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { font-size: 24px; font-weight: bold; text-align: center; color: #27AE60; }
        .otp-code { font-size: 36px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 5px; color: #359169; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">ContestZen Verification</div>
        <p>Hello,</p>
        <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This OTP is valid for 10 minutes.</p>
        <div class="otp-code">${otp}</div>
        <p>If you did not request this verification, please ignore this email.</p>
        <p>Best regards,<br>The ContestZen Team</p>
        <div class="footer">
            This is an automated message. Please do not reply.
        </div>
    </div>
</body>
</html>
`;

const createMagicLinkEmailTemplate = (name: string, magicLinkUrl: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Login Link</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { font-size: 24px; font-weight: bold; text-align: center; color: #27AE60; }
        .login-button { 
            display: inline-block; 
            background-color: #27AE60; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
            text-align: center;
        }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">ContestZen Login</div>
        <p>Hello ${name},</p>
        <p>You requested to login to your ContestZen account. Click the button below to access your account. This link is valid for 15 minutes.</p>
        <div style="text-align: center;">
            <a href="${magicLinkUrl}" class="login-button">Login to ContestZen</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${magicLinkUrl}</p>
        <p>If you did not request this login link, please ignore this email.</p>
        <p>Best regards,<br>The ContestZen Team</p>
        <div class="footer">
            This is an automated message. Please do not reply.
        </div>
    </div>
</body>
</html>
`;

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"ContestZen" <${smtpConfig.auth.user}>`,
    to: to,
    subject: 'Your OTP for ContestZen Registration',
    html: createOtpEmailTemplate(otp),
  };

  await transporter.sendMail(mailOptions);
};

export const sendMagicLinkEmail = async (to: string, name: string, magicLinkUrl: string) => {
  const mailOptions = {
    from: `"ContestZen" <${smtpConfig.auth.user}>`,
    to: to,
    subject: 'Your ContestZen Login Link',
    html: createMagicLinkEmailTemplate(name, magicLinkUrl),
  };

  await transporter.sendMail(mailOptions);
};
