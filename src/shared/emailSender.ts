import nodemailer from "nodemailer";

export const emailSender = async (
  to: string,
  html: string,
  subject: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 2525,
      secure: false,
      auth: {
        user: "88803c001@smtp-brevo.com",
        pass: "OzqM8PBhVxbNYEUt",
      },
    });
    const mailOptions = {
      from: `<akonhasan680@gmail.com>`,
      to,
      subject,
      text: html.replace(/<[^>]+>/g, ""),
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent: ${info.messageId}`);
    return info.messageId;
  } catch (error) {
    // @ts-ignore
    console.error(`Error sending email: ${error.message}`);
    throw new Error("Failed to send email. Please try again later.");
  }
};
