exports.accountVerificationTemplate = (name, otp) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Account Verification</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
    <div style="max-width:600px; margin:40px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 0 10px rgba(0,0,0,0.1);">
      <div style="padding:20px; background-color:#0f172a; color:white;">
        <h2 style="margin:0;">Quick Chat</h2>
      </div>
      <div style="padding:30px;">
        <h3>Hello ${name},</h3>
        <p style="font-size:16px; color:#333;">
          Thank you for signing up for <strong>Quick Chat</strong>. To verify your account, please use the following OTP:
        </p>
        <div style="text-align:center; margin:30px 0;">
          <span style="display:inline-block; background-color:#0f172a; color:white; padding:15px 30px; font-size:24px; border-radius:8px; letter-spacing:3px;">
            ${otp}
          </span>
        </div>
        <p style="font-size:14px; color:#666;">
          This OTP is valid for the next 10 minutes. If you didn’t request this, please ignore this email.
        </p>
        <p style="font-size:14px; color:#666;">
          Need help? Just reply to this email—we're here for you.
        </p>
        <p style="font-size:14px; color:#333; margin-top:40px;">
          Cheers,<br/>
          The Quick Chat Team
        </p>
      </div>
      <div style="padding:15px; background-color:#f0f0f0; text-align:center; font-size:12px; color:#999;">
        © ${new Date().getFullYear()} Quick Chat. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};
