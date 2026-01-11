// for reference only
import { keysToCamel } from "@/common/utils";
import express from "express";
import { db } from "../db/db-pgp";

const enrollmentChangeRouter = express.Router();
enrollmentChangeRouter.use(express.json());

enrollmentChangeRouter.get("/", async (req, res) => {
  try {
    // Query database
    const data = await db.query(`SELECT * FROM enrollment_change`);
    res.status(200).json(keysToCamel(data[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

enrollmentChangeRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const enrollmentChange = await db.query(
      `SELECT ALL * FROM enrollment_change WHERE id = $1`,
      [id]
    );

    if (enrollmentChange.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(enrollmentChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

enrollmentChangeRouter.post("/", async (req, res) => {
  try {
    // Destructure req.body
    const { update_id, enrollment_change, graduated_change } = req.body;
    const newEnrollmentChange = await db.query(
      `INSERT INTO enrollment_change (update_id, enrollment_change, graduated_change) VALUES ($1, $2, $3) RETURNING *`,
      [update_id, enrollment_change, graduated_change]
    );
    res.status(201).json(keysToCamel(newEnrollmentChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

enrollmentChangeRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { update_id, enrollment_change, graduated_change } = req.body;
    const updatedEnrollmentChange = await db.query(
      `UPDATE enrollment_change SET
        update_id = COALESCE($1, update_id),
        enrollment_change = COALESCE($2, enrollment_change),
        graduated_change = COALESCE($3, graduated_change)
        WHERE id = $4
        RETURNING *;`,
      [update_id, enrollment_change, graduated_change, id]
    );

    if (updatedEnrollmentChange.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(updatedEnrollmentChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

enrollmentChangeRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEnrollmentChange = await db.query(
      `DELETE FROM enrollment_change WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedEnrollmentChange.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(deletedEnrollmentChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export { enrollmentChangeRouter };