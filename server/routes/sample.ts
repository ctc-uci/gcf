// TODO: delete sample router file

import { keysToCamel } from "@/common/utils";
import express from "express";

const sampleRouter = express.Router();
sampleRouter.use(express.json());

sampleRouter.get("/", async (req, res) => {
  try {
    // Query database
    const data = { message: "Hello, world!" };

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

sampleRouter.post("/", async (req, res) => {
  try {
    // Destructure req.body

    // Do something with request body
    const data = {};

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export { sampleRouter };
