import express from "express";
import nodemailer from "nodemailer";

const nodeMailerRouter = express.Router();
nodeMailerRouter.use(express.json());

nodeMailerRouter.post("/", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, isNewAccount } =
      req.body;

    if (!email || !firstName || !lastName || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const actionWord = isNewAccount ? "created" : "updated";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your ${role} Account Credentials`,
      text: `Hey ${firstName} ${lastName},

We just ${actionWord} your ${role} account for GCF. Your credentials are:

Email: ${email}
Password: ${password || "(unchanged)"}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending email" });
  }
});

export { nodeMailerRouter };
