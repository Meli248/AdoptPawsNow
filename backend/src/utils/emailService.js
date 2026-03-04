import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendPasswordResetEmail = async (to, resetUrl) => {
    try {
        const mailOptions = {
            from: `"AdoptPawsNow" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Password Reset Request - AdoptPawsNow',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a90e2;">Password Reset Request</h2>
          <p>Hi there,</p>
          <p>You recently requested to reset your password for your AdoptPawsNow account. Click the button below to reset it. <strong>This link is valid for 1 hour.</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for your account associated with this email address.</p>
          <p>Thanks,<br>The AdoptPawsNow Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:</p>
          <p style="font-size: 12px; color: #4a90e2; word-break: break-all;">${resetUrl}</p>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
