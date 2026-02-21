import { keysToCamel } from "@/common/utils";
import express from "express";

import { db } from "../db/db-pgp";

const adminRouter = express.Router();
adminRouter.use(express.json());

// GET /admin/programs - returns all programs with student/instrument counts
adminRouter.get("/programs", async (req, res) => {
  try {
    const data = await db.query(
      `SELECT
        p.*,
        c.name AS country_name,
        COALESCE(ec.total_enrollment, 0) AS students,
        COALESCE(ic.total_instruments, 0) AS instruments
      FROM program p
      LEFT JOIN country c ON c.id = p.country
      LEFT JOIN (
        SELECT pu.program_id, SUM(ec.enrollment_change) - SUM(ec.graduated_change) AS total_enrollment
        FROM enrollment_change ec
        JOIN program_update pu ON pu.id = ec.update_id
        GROUP BY pu.program_id
      ) ec ON ec.program_id = p.id
      LEFT JOIN (
        SELECT u.program_id, SUM(ic.amount_changed) AS total_instruments
        FROM instrument_change ic
        JOIN program_update u ON u.id = ic.update_id
        GROUP BY u.program_id
      ) ic ON ic.program_id = p.id;`
    );
    res.json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /admin/stats - returns aggregated statistics
adminRouter.get("/stats", async (req, res) => {
  try {
    const stats = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM program) AS total_programs,
        (SELECT COALESCE(SUM(ec.enrollment_change), 0) - COALESCE(SUM(ec.graduated_change), 0)
         FROM enrollment_change ec) AS total_students,
        (SELECT COALESCE(SUM(ic.amount_changed), 0) 
         FROM instrument_change ic) AS total_instruments`
    );
    res.json(keysToCamel(stats[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export { adminRouter };
