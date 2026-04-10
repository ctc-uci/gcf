import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const regionalDirectorRouter = express.Router();
regionalDirectorRouter.use(express.json());

regionalDirectorRouter.get('/all', async (req, res) => {
  try {
    const data = await db.query(
      `SELECT *
       FROM gcf_user u WHERE u.id IN (SELECT user_id FROM regional_director)`
    );
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error('Error in /all', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

regionalDirectorRouter.get('/region/:region_id', async (req, res) => {
  try {
    const { region_id } = req.params;
    const director = await db.query(
      `SELECT rd.*, u.first_name, u.last_name, u.picture
       FROM regional_director rd
       JOIN gcf_user u ON u.id = rd.user_id
       WHERE rd.region_id = $1
       LIMIT 1`,
      [region_id]
    );
    if (!director?.length) return res.status(200).json(null);
    res.status(200).json(keysToCamel(director[0]));
  } catch (err) {
    console.error('Error in /region/:region_id', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

regionalDirectorRouter.get('/me/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const director = await db.query(
      'SELECT * FROM regional_director WHERE user_id = $1 LIMIT 1',
      [id]
    );
    if (!director?.length)
      return res.status(404).json({ error: 'Regional director not found' });
    res.status(200).json(keysToCamel(director[0]));
  } catch (err) {
    console.error('Error in /me/:id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

regionalDirectorRouter.get('/me/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const director = await db.query(
      'SELECT region_id FROM regional_director WHERE user_id = $1 LIMIT 1',
      [id]
    );
    if (!director?.length)
      return res.status(404).json({ error: 'Regional director not found' });
    const regionId = director[0].region_id;
    const stats = await db.query(
      `SELECT
          (SELECT COUNT(DISTINCT p.id) FROM program p JOIN country c ON c.id = p.country WHERE c.region_id = $1) AS total_programs,
          (SELECT COALESCE(SUM(ec.enrollment_change), 0) - COALESCE(SUM(ec.graduated_change), 0) FROM enrollment_change ec
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
    console.error('Error in /me/:id/stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

regionalDirectorRouter.get('/me/:id/programs', async (req, res) => {
  try {
    const { id } = req.params;
    const director = await db.query(
      'SELECT region_id FROM regional_director WHERE user_id = $1 LIMIT 1',
      [id]
    );
    if (!director?.length)
      return res.status(404).json({ error: 'Regional director not found' });
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
    console.error('Error in /me/:id/programs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

regionalDirectorRouter.post('/', async (req, res) => {
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
    res.status(500).send('Internal Server Error');
  }
});

regionalDirectorRouter.get('/', async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM regional_director`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionalDirectorRouter.get(
  '/regional-director-region/:id',
  async (req, res) => {
    try {
      const { id } = req.params;
      const data = await db.query(
        `SELECT name
          FROM region
          INNER JOIN regional_director ON regional_director.user_id = $1
          WHERE region.id = regional_director.region_id`,
        [id]
      );
      res.status(200).json(keysToCamel(data));
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  }
);

regionalDirectorRouter.get('/:user_id/program-directors', async (req, res) => {
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
    res.status(500).send('Internal Server Error');
  }
});

regionalDirectorRouter.get('/:user_id/programs', async (req, res) => {
  try {
    const { user_id } = req.params;

    const data = await db.query(
      `SELECT 
        program.*
      FROM program
      INNER JOIN country ON country.id = program.country
      INNER JOIN region ON region.id = country.region_id
      INNER JOIN regional_director ON regional_director.region_id = region.id AND regional_director.user_id = $1`,
      [user_id]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionalDirectorRouter.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const regionalDirector = await db.query(
      `SELECT ALL * FROM regional_director WHERE user_id = $1`,
      [user_id]
    );

    if (regionalDirector.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(regionalDirector[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Remove a specific region association from a director
regionalDirectorRouter.delete('/:id/region/:region_id', async (req, res) => {
  try {
    const { id, region_id } = req.params;
    const deleted = await db.query(
      `DELETE FROM regional_director WHERE user_id = $1 AND region_id = $2 RETURNING *`,
      [id, region_id]
    );

    if (deleted.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deleted[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Add a region association to a director
regionalDirectorRouter.put('/:id/region', async (req, res) => {
  try {
    const { id } = req.params;
    const { region_id } = req.body;
    const newAssociation = await db.query(
      `INSERT INTO regional_director (user_id, region_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, region_id) DO NOTHING
       RETURNING *`,
      [id, region_id]
    );

    res.status(200).json(keysToCamel(newAssociation[0] || {}));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionalDirectorRouter.put('/:id/region', async (req, res) => {
  try {
    const { id } = req.params;
    const { region_id } = req.body;
    const updatedRegionalDirector = await db.query(
      `UPDATE regional_director SET
          region_id = $1
          WHERE user_id = $2
          RETURNING *;`,
      [region_id, id]
    );

    if (updatedRegionalDirector.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedRegionalDirector[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionalDirectorRouter.put('/:id', async (req, res) => {
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
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedRegionalDirector[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionalDirectorRouter.delete('/:id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const deletedRegionalDirector = await db.query(
      `DELETE FROM regional_director WHERE user_id = $1 RETURNING *`,
      [user_id]
    );

    if (deletedRegionalDirector.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deletedRegionalDirector[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { regionalDirectorRouter };
