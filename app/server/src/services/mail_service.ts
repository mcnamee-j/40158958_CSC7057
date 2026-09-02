import nodemailer from "nodemailer";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, // use STARTTLS (upgrade connection to TLS AFTER connecting)
  auth: process.env.MAIL_USER //handles empty credentials or if there is a mail user
    ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    : undefined,
});

export const send_password_reset_email = async (
  email: string,
  first_name: string,
  reset_token: string,
) => {
  // Skip sending email in test environment
  if (process.env.NODE_ENV === "test") {
    console.log(`[TEST] Password reset email would be sent to ${email}`);
    console.log(`[TEST] Reset token: ${reset_token}`);
    return;
  }

  const reset_URL = `${process.env.APP_URL}/reset_password?token=${reset_token}`; //uses query string paramters to pass to API (frontend) whenever I create it

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Loop - Password Reset Request",
    html: `
        <p>Hi ${first_name},</p>
        <p>We have received a request to reset the password for your Loop account.</p>
        <p>To reset your password click the following link:</p>
        <a href="${reset_URL}">Click Here to reset your password</a>
        <p>If you did not request to reset your password, ignore this email</p>
        `,
  });
};

// reuses the reset-password flow/route since both cases are "set a new password via token"
export const send_invitation_email = async (
  email: string,
  first_name: string,
  invite_token: string,
) => {
  if (process.env.NODE_ENV === "test") {
    console.log(`[TEST] Staff invitation email would be sent to ${email}`);
    console.log(`[TEST] Invite token: ${invite_token}`);
    return;
  }

  const invitation_URL = `${process.env.APP_URL}/reset_password?token=${invite_token}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Loop - You have been invited to sign up to Loop",
    html: `
    <p>Hi ${first_name},</p>
    <p>You have been added as a user on Loop. To get started, set your password by clicking the link below.
    <a href="${invitation_URL}">Get Started here!</a>
    <p>This link expires in 48 hours</p>
    `,
  });
};
