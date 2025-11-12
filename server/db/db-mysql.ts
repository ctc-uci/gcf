// TODO: keep file only if using mysql

import mysql from "mysql";

export const host =
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

export const db = mysql.createConnection({
  host,
  user,
  password,
  database,
});

db.connect();
