import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const rdProgramTableRouter = express.Router();
rdProgramTableRouter.use(express.json());

async function getDataByUserId(userId) {
  const data = await db.query(
    `WITH target_region AS (
            SELECT region_id
            FROM regional_director
            WHERE user_id = $1
            LIMIT 1
        ),
        region_programs AS (
            SELECT
                p.id AS program_id,
                p.name AS program_name,
                p.status AS program_status,
                p.launch_date AS program_launch_date,
                p.city,
                p.state,
                p.country AS country_id,
                p.partner_org,
                p.languages,
                c.iso_code,
                c.name AS program_location,
                r.id AS region_id,
                r.name AS region_name
            FROM program p
            JOIN country c ON c.id = p.country
            JOIN region r ON r.id = c.region_id
            WHERE r.id = (SELECT region_id FROM target_region)
        ),
        enrollment_totals AS (
            SELECT
                pu.program_id,
                COALESCE(SUM(ec.enrollment_change), 0) - COALESCE(SUM(ec.graduated_change), 0) AS total_students
            FROM program_update pu
            JOIN enrollment_change ec ON ec.update_id = pu.id
            WHERE pu.program_id IN (SELECT program_id FROM region_programs)
            GROUP BY pu.program_id
        ),
        instrument_totals AS (
            SELECT
                pu.program_id,
                COALESCE(SUM(ic.amount_changed), 0) AS total_instruments
            FROM program_update pu
            JOIN instrument_change ic ON ic.update_id = pu.id
            WHERE pu.program_id IN (SELECT program_id FROM region_programs)
            GROUP BY pu.program_id
        )
        SELECT
            rp.region_id,
            rp.region_name,
            rp.city,
            rp.state,
            rp.program_id,
            rp.program_name,
            rp.program_status,
            rp.program_launch_date,
            rp.country_id,
            rp.partner_org,
            rp.iso_code,
            rp.program_location,
            rp.languages,
            COALESCE(et.total_students, 0) AS total_students,
            COALESCE(it.total_instruments, 0) AS total_instruments
        FROM region_programs rp
        LEFT JOIN enrollment_totals et ON et.program_id = rp.program_id
        LEFT JOIN instrument_totals it ON it.program_id = rp.program_id
        ORDER BY rp.region_name, rp.program_name;`,
    [userId]
  );
  return data;
}

rdProgramTableRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await getDataByUserId(userId);
    res.json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export { rdProgramTableRouter };
