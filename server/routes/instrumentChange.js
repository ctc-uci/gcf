import { keysToCamel } from "@/common/utils";
import express from "express";

import { db } from "../db/db-pgp";

const instrumentChangeRouter = express.Router();
instrumentChangeRouter.use(express.json());

instrumentChangeRouter.post("/", async (req, res) => {
  try {
    const { instrument_id, update_id, amount_changed } = req.body;

    const instrumentChangeEntry = await db.query(
      `INSERT INTO instrument_change 
        (instrument_id, update_id, amount_changed) 
        VALUES ($1, $2, $3) 
        RETURNING *`,
      [instrument_id, update_id, amount_changed]
    );

    res.status(201).json(keysToCamel(instrumentChangeEntry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

instrumentChangeRouter.get("/", async (req, res) => {
  try {
    const instrumentChanges = await db.any(`SELECT * FROM instrument_change`);
    res.status(200).json(keysToCamel(instrumentChanges));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

instrumentChangeRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const instrumentChange = await db.query(
      `SELECT ALL * FROM instrument_change WHERE id = $1`,
      [id]
    );

    if (instrumentChange.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(instrumentChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

instrumentChangeRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { instrument_id, update_id, amount_changed } = req.body;

    const updatedInstrumentChange = await db.query(
      `UPDATE instrument_change 
             SET instrument_id = $1, update_id = $2, amount_changed = $3 
             WHERE id = $4 
             RETURNING *`,
      [instrument_id, update_id, amount_changed, id]
    );

    if (updatedInstrumentChange.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(keysToCamel(updatedInstrumentChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

instrumentChangeRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInstrumentChange = await db.query(
      `DELETE FROM instrument_change WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedInstrumentChange.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(deletedInstrumentChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export { instrumentChangeRouter };
