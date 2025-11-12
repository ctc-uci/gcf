// TODO: keep file only if using mongodb
import mongoose from "mongoose";

const mongoURI =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_DB_URI
    : process.env.PROD_DB_URI;

if (!mongoURI) {
  throw Error("MongoURI not provided");
}

mongoose.connect(mongoURI);

const mongoConnection = mongoose.connection;
mongoConnection.once("open", () => {
  console.info("MongoDB database connection established successfully");
});
