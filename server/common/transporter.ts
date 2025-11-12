// TODO: keep file only if using nodemailer

import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const user =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_EMAIL_USERNAME
    : process.env.PROD_EMAIL_USERNAME;
const pass =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_EMAIL_PASSWORD
    : process.env.PROD_EMAIL_PASSWORD;
const emailSender =
  process.env.NODE_ENV === "development"
    ? `${process.env.DEV_EMAIL_FIRSTNAME} ${process.env.DEV_EMAIL_LASTNAME}`
    : `${process.env.PROD_EMAIL_FIRSTNAMS} ${process.env.DEV_EMAIL_LASTNAME}`;

// sender information
const transport = {
  host: "smtp.gmail.com", // e.g. smtp.gmail.com
  auth: {
    user,
    pass,
  },
  from: user,
  secure: true,
};

const transporter = nodemailer.createTransport(transport);

export { transporter, emailSender };
