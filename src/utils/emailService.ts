import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

  const mailOptions = {
    from: `"SkillLync" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your email address',
    html: `
      <p>Welcome! Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}" target="_blank">Verify Email</a>
      <p>If you didn't create an account, please ignore this message.</p>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
};
