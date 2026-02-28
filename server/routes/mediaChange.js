import { keysToCamel } from "@/common/utils";
import express from "express";

import { db } from "../db/db-pgp";

const mediaChangeRouter = express.Router();
mediaChangeRouter.use(express.json());

mediaChangeRouter.get("/", async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM media_change`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

mediaChangeRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const mediaChange = await db.query(
      `SELECT ALL * FROM media_change WHERE id = $1`,
      [id]
    );

    if (mediaChange.length === 0) {
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
    const { update_id, s3_key, file_name, file_type, is_thumbnail, instrument_id } = req.body;
    const newMediaChange = await db.query(
      `INSERT INTO media_change (update_id, s3_key, file_name, file_type, is_thumbnail, instrument_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [update_id, s3_key, file_name, file_type, is_thumbnail, instrument_id || null]
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
    const { update_id, s3_key, file_name, file_type, is_thumbnail, instrument_id } = req.body;
    const updatedMediaChange = await db.query(
      `UPDATE media_change SET
        update_id = COALESCE($1, update_id),
        s3_key = COALESCE($2, s3_key),
        file_name = COALESCE($3, file_name),
        file_type = COALESCE($4, file_type),
        is_thumbnail = COALESCE($5, is_thumbnail),
        instrument_id = COALESCE($6, instrument_id)
        WHERE id = $7
        RETURNING *;`,
      [update_id, s3_key, file_name, file_type, is_thumbnail, instrument_id, id]
    );

    if (updatedMediaChange.length === 0) {
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
    const deletedMediaChange = await db.query(
      `DELETE FROM media_change WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedMediaChange.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(deletedMediaChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//this route gets all the media associated with a given program director
//also gets program name given the program director
mediaChangeRouter.get("/:userId/media", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query(`
      SELECT 
        mc.id,
        mc.s3_key,
        mc.file_name,
        mc.file_type,
        mc.is_thumbnail,
        p.id as program_id,
        p.name as program_name
      FROM program_director pd
      JOIN program p ON pd.program_id = p.id
      LEFT JOIN program_update pu ON pu.program_id = pd.program_id
      LEFT JOIN media_change mc ON mc.update_id = pu.id
      WHERE pd.user_id = $1
      ORDER BY mc.id DESC NULLS LAST
    `, [userId]);

    if (!result || result.length === 0) {
      return res.status(200).json({ 
        media: [],
        programName: null,
        programId: null
      });
    }

    //in the case theres no media we still want to get the program name
    //so this filters out null results
    const programName = result[0].program_name;
    const programId = result[0].program_id;
    const mediaItems = result.filter(row => row.id !== null);

    res.status(200).json({
      media: keysToCamel(mediaItems),
      programName: programName,
      programId: programId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export { mediaChangeRouter };
