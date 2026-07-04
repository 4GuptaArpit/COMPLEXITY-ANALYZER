import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  console.log(`[OTP Verification Code] to ${email}: ${otp}`);

  if (!user || user === "mock-email@gmail.com" || !pass || pass === "mock-pass") {
    console.log("Using Mock OTP delivery fallback. (No valid EMAIL_USER / EMAIL_PASS found in .env)");
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  const mailOptions = {
    from: `"BigO.ai Verification" <${user}>`,
    to: email,
    subject: "Your BigO.ai Verification OTP Code",
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #1e1b4b; background: #fafafd; border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.15); max-width: 500px; margin: auto;">
        <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">BigO.ai Authentication</h2>
        <p>You requested a login verification code for your BigO.ai account.</p>
        <div style="font-size: 24px; font-weight: bold; background: #f0f2ff; padding: 15px; text-align: center; border-radius: 8px; letter-spacing: 4px; color: #4f46e5; margin: 20px 0;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #64748b;">This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid rgba(99, 102, 241, 0.1); margin-top: 25px;" />
        <p style="font-size: 11px; text-align: center; color: #94a3b8;">© 2026 BigO.ai. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Nodemailer failed to send email:", error.message);
    return false;
  }
};
