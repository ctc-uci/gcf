import { keysToCamel } from "@/common/utils";
import express from "express";
import { db } from "../db/db-pgp";

const programRouter = express.Router();
programRouter.use(express.json());

programRouter.get("/", async (req, res) => {
  try {
    const program = await db.query(`SELECT * FROM program`);
    res.status(200).json(keysToCamel(program));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

programRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const program = await db.query(
      `SELECT * FROM program WHERE id = $1`,
      [id]
    );

    if (program.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(program[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

programRouter.post("/", async (req, res) => {
  try {
    const {
      createdBy,
      name,
      country,
      title,
      description,
      primaryLanguage,
      playlistLink,
      partnerOrg,
      status,
      launchDate,
    } = req.body;
    
    const newProgram = await db.query(
      `
      INSERT INTO program (
        created_by,
        name,
        date_created,
        country,
        title,
        description,
        primary_language,
        playlist_link,
        partner_org,
        status,
        launch_date
      )
      VALUES (
        $1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING *;
      `,
      [
        createdBy,
        name,
        country,
        title,
        description ?? null,
        primaryLanguage ?? null,
        playlistLink ?? null,
        partnerOrg,
        status,
        launchDate,
      ]
    );

    res.status(201).json(keysToCamel(newProgram[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

programRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      country,
      title,
      description,
      primaryLanguage,
      playlistLink,
      partnerOrg,
      status,
      launchDate
    } = req.body;

    const updatedProgram = await db.query(
      `
      UPDATE program
      SET
        name = COALESCE($1, name),
        country = COALESCE($2, country),
        title = COALESCE($3, title),
        description = COALESCE($4, description),
        primary_language = COALESCE($5, primary_language),
        playlist_link = COALESCE($6, playlist_link),
        partner_org = COALESCE($7, partner_org),
        status = COALESCE($8, status),
        launch_date = COALESCE($9, launch_date)
      WHERE id = $10
      RETURNING *;
      `,
      [
        name,
        country,
        title,
        description,
        primaryLanguage,
        playlistLink,
        partnerOrg,
        status,
        launchDate,
        id
      ]
    );

    if (updatedProgram.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(updatedProgram[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

programRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProgram = await db.query(
      `DELETE FROM program WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedProgram.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(deletedProgram[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export { programRouter };