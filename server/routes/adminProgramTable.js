import { keysToCamel } from "@/common/utils";
import express from "express";
import { db } from "../db/db-pgp";

const adminProgramTableRouter = express.Router();
adminProgramTableRouter.use(express.json());

async function getData() {
    const allData =
    `SELECT
        p.*,
        c.name AS country_name,
        COALESCE(ec.total_enrollment, 0) AS students,
        COALESCE(ic.total_instruments, 0) AS instruments
    FROM program p
    LEFT JOIN country c ON c.id = p.country
    LEFT JOIN (
        SELECT pu.program_id, SUM(ec.enrollment_change) AS total_enrollment
        FROM enrollment_change ec
        JOIN program_update pu ON pu.id = ec.update_id
        GROUP BY pu.program_id
    ) ec ON ec.program_id = p.id
    LEFT JOIN (
        SELECT u.program_id, SUM(ic.amount_changed) AS total_instruments
        FROM instrument_change ic
        JOIN program_update u ON u.id = ic.update_id
        GROUP BY u.program_id
    ) ic ON ic.program_id = p.id;`;

    const newTable = await db.query(allData);
    return newTable;

}

adminProgramTableRouter.get("/", async (req, res) => {
  try {
    const data = await getData();
    res.json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export { adminProgramTableRouter };