import nodemailer from 'nodemailer';

const smtpConfig = {
  host: 'mail.nextlinker.in',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'worldtourismday.nlr@nextlinker.in',
    pass: '99230041300', // IMPORTANT: Use environment variables in production
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

export const sendOtpEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: `"ContestZen" <${smtpConfig.auth.user}>`,
    to: to,
    subject: 'Your OTP for ContestZen Registration',
    html: createOtpEmailTemplate(otp),
  };

  await transporter.sendMail(mailOptions);
};
