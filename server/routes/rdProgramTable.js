import { keysToCamel } from "@/common/utils";
import express from "express";
import { db } from "../db/db-pgp";

const rdProgramTableRouter = express.Router();
rdProgramTableRouter.use(express.json());

async function getData() {
    const allData =
    `SELECT
        r.id AS region_id,
        r.name AS region_name,

        p.id AS program_id,
        p.name AS program_name,
        p.status AS program_status,
        p.launch_date AS program_launch_date,

        c.name AS program_location,

        COALESCE(SUM(ec.enrollment_change), 0) AS total_students,
        COALESCE(SUM(ic.amount_changed), 0) AS total_instruments
    FROM region r
    LEFT JOIN country c
        ON c.region_id = r.id
    LEFT JOIN program p
        ON p.country = c.id
    LEFT JOIN program_update pu
        ON pu.program_id = p.id
    LEFT JOIN enrollment_change ec
        ON ec.update_id = pu.id
    LEFT JOIN instrument_change ic
        ON ic.update_id = pu.id
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
        p.name;`
    ;

    const[newTable] = await db.query(allData);
    return newTable;

}

rdProgramTableRouter.get("/", async (req, res) => {
  try {
    const data = await getData();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export { rdProgramTableRouter };