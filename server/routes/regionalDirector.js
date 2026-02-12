import { keysToCamel } from "@/common/utils";
import { admin } from "@/config/firebase";
import express from "express";

import { db } from "../db/db-pgp";

const regionalDirectorRouter = express.Router();
regionalDirectorRouter.use(express.json());

regionalDirectorRouter.get("/me/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const director = await db.query("SELECT * FROM regional_director WHERE user_id = $1 LIMIT 1", [id]);
    if (!director?.length) return res.status(404).json({ error: "Regional director not found" });
    res.status(200).json(keysToCamel(director[0]));
  } catch (err) {
    console.error("Error in /me/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

regionalDirectorRouter.get("/me/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;
    const director = await db.query("SELECT region_id FROM regional_director WHERE user_id = $1 LIMIT 1", [id]);
    if (!director?.length) return res.status(404).json({ error: "Regional director not found" });
    const regionId = director[0].region_id;
    const stats = await db.query(
      `SELECT
          (SELECT COUNT(DISTINCT p.id) FROM program p JOIN country c ON c.id = p.country WHERE c.region_id = $1) AS total_programs,
          (SELECT COALESCE(SUM(ec.enrollment_change), 0) FROM enrollment_change ec
           JOIN program_update pu ON pu.id = ec.update_id
           JOIN program p ON p.id = pu.program_id
           JOIN country c ON c.id = p.country
           WHERE c.region_id = $1) AS total_students,
          (SELECT COALESCE(SUM(ic.amount_changed), 0) FROM instrument_change ic
           JOIN program_update pu ON pu.id = ic.update_id
           JOIN program p ON p.id = pu.program_id
           JOIN country c ON c.id = p.country
           WHERE c.region_id = $1) AS total_instruments`,
      [regionId]
    );
    res.status(200).json(keysToCamel(stats[0]));
  } catch (err) {
    console.error("Error in /me/:id/stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

regionalDirectorRouter.get("/me/:id/programs", async (req, res) => {
  try {
    const { id } = req.params;
    const director = await db.query("SELECT region_id FROM regional_director WHERE user_id = $1 LIMIT 1", [id]);
    if (!director?.length) return res.status(404).json({ error: "Regional director not found" });
    const regionId = director[0].region_id;
    const programs = await db.query(
      `SELECT p.id, p.name
       FROM program p
       JOIN country c ON c.id = p.country
       WHERE c.region_id = $1
       ORDER BY p.name ASC`,
      [regionId]
    );
    res.status(200).json(keysToCamel(programs));
  } catch (err) {
    console.error("Error in /me/:id/programs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

regionalDirectorRouter.post("/", async (req, res) => {
  try {
    const { user_id, region_id } = req.body;
    const newRegionalDirector = await db.query(
      `INSERT INTO regional_director (user_id, region_id) 
        VALUES ($1, $2) 
        RETURNING *`,
      [user_id, region_id]
    );
    res.status(201).json(keysToCamel(newRegionalDirector[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

regionalDirectorRouter.get("/", async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM regional_director`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

regionalDirectorRouter.get("/:user_id/program-directors", async (req, res) => {
  try {
    const { user_id } = req.params;

    const data = await db.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        p.name as program_name
      FROM regional_director rd
      JOIN country c ON rd.region_id = c.region_id
      JOIN program p ON c.id = p.country
      JOIN program_director pd ON p.id = pd.program_id
      JOIN gcf_user u ON pd.user_id = u.id
      WHERE rd.user_id = $1
      ORDER BY u.last_name ASC`,
      [user_id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

regionalDirectorRouter.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const regionalDirector = await db.query(
      `SELECT ALL * FROM regional_director WHERE user_id = $1`,
      [user_id]
    );

    if (regionalDirector.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(regionalDirector[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

regionalDirectorRouter.put("/:id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { region_id } = req.body;
    const updatedRegionalDirector = await db.query(
      `UPDATE regional_director SET
          region_id = COALESCE($1, region_id)
          WHERE user_id = $2
          RETURNING *;`,
      [region_id, user_id]
    );

    if (updatedRegionalDirector.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(updatedRegionalDirector[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

regionalDirectorRouter.delete("/:id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const deletedRegionalDirector = await db.query(
      `DELETE FROM regional_director WHERE user_id = $1 RETURNING *`,
      [user_id]
    );

    if (deletedRegionalDirector.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(deletedRegionalDirector[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export { regionalDirectorRouter };
