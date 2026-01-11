// for reference only
import { keysToCamel } from "@/common/utils";
import express from "express";
import { db } from "../db/db-pgp";

const mediaChangeRouter = express.Router();
mediaChangeRouter.use(express.json());

mediaChangeRouter.get("/", async (req, res) => {
  try {
    // Query database
    const data = await db.query(`SELECT * FROM media_change`);
    res.status(200).json(keysToCamel(data[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

mediaChangeRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // rename entry to something relevant to the route
    const mediaChange = await db.query(
      `SELECT ALL * FROM media_change WHERE id = $1`,
      [id]
    );

    if (mediaChange.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(mediaChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

mediaChangeRouter.post("/", async (req, res) => {
  try {
    // Destructure req.body
    console.log("Req Body: ", req.body);
    const { update_id, s3_key, file_name, file_type, is_thumbnail } = req.body;
    // rename newEntry to something relevant to the route
    const newMediaChange = await db.query(
      `INSERT INTO media_change (update_id, s3_key, file_name, file_type, is_thumbnail) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [update_id, s3_key, file_name, file_type, is_thumbnail]
    );
    res.status(201).json(keysToCamel(newMediaChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

mediaChangeRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { update_id, s3_key, file_name, file_type, is_thumbnail } = req.body;
    // rename updatedEntry to something relevant to the route
    const updatedMediaChange = await db.query(
      `UPDATE media_change SET
        update_id = COALESCE($1, update_id),
        s3_key = COALESCE($2, s3_key),
        file_name = COALESCE($3, file_name),
        file_type = COALESCE($4, file_type),
        is_thumbnail = COALESCE($5, is_thumbnail)
        WHERE id = $6
        RETURNING *;`,
      [update_id, s3_key, file_name, file_type, is_thumbnail, id]
    );

    if (updatedMediaChange.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(updatedMediaChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

mediaChangeRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // rename deletedEntry to something relevant to the route
    const deletedMediaChange = await db.query(
      `DELETE FROM media_change WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedMediaChange.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(deletedMediaChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export { mediaChangeRouter };