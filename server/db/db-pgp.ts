// TODO: keep file only if using postgresql

import dotenv from "dotenv";
import pgPromise from "pg-promise";

dotenv.config();

const host =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_DB_HOSTNAME
    : process.env.PROD_DB_HOSTNAME;
const user =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_DB_USERNAME
    : process.env.PROD_DB_USERNAME;
const password =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_DB_PASSWORD
    : process.env.PROD_DB_PASSWORD;
const database =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_DB_NAME
    : process.env.PROD_DB_NAME;
const port =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_DB_PORT
    : process.env.PROB_DB_PORT;

export const pgp = pgPromise({});

export const db = pgp({
  host,
  user,
  password,
  database,
  port: Number(port),
  ssl: {
    rejectUnauthorized: false,
  },
});
