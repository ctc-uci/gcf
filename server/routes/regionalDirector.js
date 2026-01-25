import { keysToCamel } from "@/common/utils";
import express from "express";

import { db } from "../db/db-pgp";

const regionalDirectorRouter = express.Router();
regionalDirectorRouter.use(express.json());

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

regionalDirectorRouter.get("/summary", async (req, res) => {
  try {
    const data = await db.query(`
            SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.role,
                rd.region_id
            FROM regional_director rd
            JOIN gcf_user u ON rd.user_id = u.id
            ORDER BY u.last_name ASC
        `);

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
