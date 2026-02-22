import { keysToCamel } from "@/common/utils";
import express from "express";

import { db } from "../db/db-pgp";

const rdProgramTableRouter = express.Router();
rdProgramTableRouter.use(express.json());

async function getDataByUserId(userId) {
  const data = await db.query(
    `SELECT
            r.id AS region_id,
            r.name AS region_name,

            p.id AS program_id,
            p.name AS program_name,
            p.status AS program_status,
            p.launch_date AS program_launch_date,

            c.name AS program_location,

            COALESCE(SUM(ec.enrollment_change), 0) - COALESCE(SUM(ec.graduated_change), 0) AS total_students,
            COALESCE(SUM(ic.amount_changed), 0) AS total_instruments
        FROM program p
        LEFT JOIN country c
            ON c.id = p.country
        LEFT JOIN region r
            ON r.id = c.region_id
        LEFT JOIN program_update pu
            ON pu.program_id = p.id
        LEFT JOIN enrollment_change ec
            ON ec.update_id = pu.id
        LEFT JOIN instrument_change ic
            ON ic.update_id = pu.id
        WHERE r.id = (
            SELECT region_id FROM regional_director WHERE user_id = $1 LIMIT 1
        )
        GROUP BY
            r.id,
            r.name,
            p.id,
            p.name,
            p.status,
            p.launch_date,
            c.name
        ORDER BY
            r.name,
            p.name;`,
    [userId]
  );
  return data;
}

rdProgramTableRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await getDataByUserId(userId);
    res.json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export { rdProgramTableRouter };
