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
        partner_org,
        status,
        launch_date
      )
      VALUES (
        $1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9
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
        partner_org = COALESCE($6, partner_org),
        status = COALESCE($7, status),
        launch_date = COALESCE($8, launch_date)
      WHERE id = $9
      RETURNING *;
      `,
      [
        name,
        country,
        title,
        description,
        primaryLanguage,
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

programRouter.get("/:id/regional-directors", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `
      SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name
      FROM program p
      JOIN country c ON p.country = c.id
      JOIN regional_director rd ON c.region_id = rd.region_id
      JOIN gcf_user u ON rd.user_id = u.id
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.length === 0) {
      return res.status(200).json([]);
    }

    const regional_directors = result.map(row => ({
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
    }));

    res.status(200).json(regional_directors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

programRouter.get("/:id/playlists", async (req, res) => {
  try {
    const { id } = req.params;

    const playlists = await db.query(
      `SELECT * FROM playlist WHERE program_id = $1`,
      [id]
    );

    res.status(200).json(keysToCamel(playlists));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// aggregated instruments (by instrument) for a program
programRouter.get("/:id/instruments", async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await db.query(
      `
      SELECT
        i.id AS instrument_id,
        i.name,
        COALESCE(SUM(ic.amount_changed), 0) AS quantity
      FROM program p
      JOIN program_update pu ON pu.program_id = p.id
      JOIN instrument_change ic ON ic.update_id = pu.id
      JOIN instrument i ON i.id = ic.instrument_id
      WHERE p.id = $1
      GROUP BY i.id, i.name
      ORDER BY i.name ASC;
      `,
      [id]
    );

    res.status(200).json(keysToCamel(rows));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

programRouter.get("/:id/program-directors", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name
      FROM program_director pd
      JOIN gcf_user u ON pd.user_id = u.id
      WHERE pd.program_id = $1
      `,
      [id]
    );

    const directors = result.map(row => ({
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
    }));

    res.status(200).json(directors);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});



export { programRouter };