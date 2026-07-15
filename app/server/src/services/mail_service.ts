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

const passwordResetEmail = async (email: string, first_name: string) => {
  const reset_URL = "";

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Loop - Password Reset Request",
    html: `
        <p>Hi ${first_name},</p>
        <p>We have recieved a request to reset the password for your Loop account.</p>
        <p>To reset your password click the following link:</p>
        <a href="${reset_URL}">Click Here to reset your password</a>
        <p>If you did not request to reset your password, ignore this email</p>
        `,
  });
};
