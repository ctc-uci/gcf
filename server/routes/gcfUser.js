import { keysToCamel } from "@/common/utils";
import express from "express";

import { db } from "../db/db-pgp";

const gcfUserRouter = express.Router();
gcfUserRouter.use(express.json());
gcfUserRouter.post("/", async (req, res) => {
  try {
    const { id, role, first_name, last_name, created_by } = req.body;

    const newGcfUser = await db.query(
      `INSERT INTO gcf_user (id, role, first_name, last_name, created_by) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [id, role, first_name, last_name, created_by]
    );
    res.status(201).json(keysToCamel(newGcfUser[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.get("/", async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM gcf_user`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.get("/:id/accounts", async (req, res) => {
  try {
    const { id } = req.params;

    const accounts = await db.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        rd.region_id,
        COALESCE(
          array_agg(p_rd.name) FILTER (WHERE p_rd.id IS NOT NULL), 
          '{}'
        ) as programs,
        p_pd.name as program_name
      FROM gcf_user u
      LEFT JOIN regional_director rd ON u.id = rd.user_id
      LEFT JOIN country c ON rd.region_id = c.region_id
      LEFT JOIN program p_rd ON c.id = p_rd.country
      LEFT JOIN program_director pd ON u.id = pd.user_id
      LEFT JOIN program p_pd ON pd.program_id = p_pd.id
      WHERE u.created_by = $1
      GROUP BY u.id, u.first_name, u.last_name, u.role, rd.region_id, p_pd.name
      ORDER BY u.last_name ASC`,
      [id]
    );

    res.status(200).json(keysToCamel(accounts));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const gcfUser = await db.query(`SELECT ALL * FROM gcf_user WHERE id = $1`, [
      id,
    ]);

    if (gcfUser.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(gcfUser[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, first_name, last_name } = req.body;
    const updatedGcfUser = await db.query(
      `UPDATE gcf_user SET
        role = COALESCE($1, role),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),     
        WHERE id = $4
        RETURNING *;`,
      [role, first_name, last_name, id]
    );

    if (updatedGcfUser.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(updatedGcfUser[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGcfUser = await db.query(
      `DELETE FROM gcf_user WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedGcfUser.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(deletedGcfUser[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export { gcfUserRouter };
