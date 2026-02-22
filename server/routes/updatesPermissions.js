import { keysToCamel } from "@/common/utils";
import express from "express";

import { db } from "../db/db-pgp";

const updatesPermissionsRouter = express.Router();
updatesPermissionsRouter.use(express.json());

updatesPermissionsRouter.get("/media-updates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const roleResult = await db.query(
      `SELECT role FROM gcf_user WHERE gcf_user.id = $1;`,
      [id]
    );

    if (roleResult.length === 0) return res.status(404).send("User not found");

    const role = roleResult[0].role;
    let filterJoin = "";

    if (role === "Regional Director") {
      filterJoin = `
        INNER JOIN country ON program.country = country.id
        INNER JOIN region ON country.region_id = region.id
        INNER JOIN regional_director ON regional_director.region_id = region.id AND regional_director.user_id = $1`;
    } else if (role === "Program Director") {
      filterJoin = `INNER JOIN program_director ON program_director.program_id = program.id AND program_director.user_id = $1`;
    } else if (role !== "Admin" && role !== "Super Admin") {
      return res.status(403).send("Access denied");
    }

    const finalQuery = `
      SELECT DISTINCT
          program_update.id AS id,
          program_update.update_date,
          program_update.note,
          program.name AS program_name,
          creator.first_name,
          creator.last_name,
          creator.role,
          program.status
      FROM program_update
      INNER JOIN media_change ON media_change.update_id = program_update.id
      INNER JOIN program ON program_update.program_id = program.id
      LEFT JOIN gcf_user AS creator ON creator.id = program.created_by
      ${filterJoin}
      ORDER BY program_update.update_date DESC;
    `;
    const data = await db.query(finalQuery, [id]);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

updatesPermissionsRouter.get("/program-updates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const roleResult = await db.query(
      `SELECT role FROM gcf_user WHERE gcf_user.id = $1;`,
      [id]
    );

    if (roleResult.length === 0) return res.status(404).send("User not found");

    const role = roleResult[0].role;
    let filterJoin = "";

    if (role === "Regional Director") {
      filterJoin = `
        INNER JOIN country ON program.country = country.id
        INNER JOIN region ON country.region_id = region.id
        INNER JOIN regional_director ON regional_director.region_id = region.id AND regional_director.user_id = $1`;
    } else if (role === "Program Director") {
      filterJoin = `INNER JOIN program_director ON program_director.program_id = program.id AND program_director.user_id = $1`;
    } else if (role !== "Admin" && role !== "Super Admin") {
      return res.status(403).send("Access denied");
    }

    const finalQuery = `SELECT
          program_update.id,
          program_update.update_date, 
          program_update.note, 
          program.name, 
          creator.first_name, 
          creator.last_name, 
          creator.role, 
          program.status
      FROM program_update
      INNER JOIN program ON program_update.program_id = program.id
      LEFT JOIN gcf_user AS creator ON creator.id = program.created_by
      ${filterJoin}
      ORDER BY program_update.update_date DESC;`;

    const data = await db.query(finalQuery, [id]);
    if (data.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

updatesPermissionsRouter.get("/role/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(
      `SELECT role FROM gcf_user WHERE gcf_user.id = $1;`,
      [id]
    );

    if (data.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export { updatesPermissionsRouter };
