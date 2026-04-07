import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const programRouter = express.Router();
programRouter.use(express.json());

function normalizeLanguages(languages, primaryLanguage) {
  const candidateCodes = Array.isArray(languages)
    ? languages
    : primaryLanguage
      ? [primaryLanguage]
      : [];

  return [
    ...new Set(
      candidateCodes
        .map((value) => String(value).trim().toLowerCase())
        .filter((value) => /^[a-z]{2}$/.test(value))
    ),
  ];
}

programRouter.get('/', async (req, res) => {
  try {
    const program = await db.query(`SELECT * FROM program`);
    res.status(200).json(keysToCamel(program));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const program = await db.query(`SELECT * FROM program WHERE id = $1`, [id]);

    if (program.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(program[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

/** Cumulative enrollment_change and graduated_change totals for a program (via program_update). */
programRouter.get('/:id/enrollment-aggregates', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT
         COALESCE(SUM(ec.enrollment_change), 0) AS sum_enrollment,
         COALESCE(SUM(ec.graduated_change), 0) AS sum_graduated
       FROM enrollment_change ec
       INNER JOIN program_update pu ON pu.id = ec.update_id
       WHERE pu.program_id = $1`,
      [id]
    );

    const row = result[0] ?? { sum_enrollment: 0, sum_graduated: 0 };
    res.status(200).json(keysToCamel(row));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const program = await db.query(
      `
      SELECT ec.enrollment_change, ec.graduated_change FROM program AS p
      INNER JOIN program_update AS pu ON pu.program_id = p.id
      INNER JOIN enrollment_change AS ec ON ec.update_id = pu.id
      WHERE p.id = $1
      `,
      [id]
    );

    if (program.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(program));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/region/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const program = await db.query(
      `
      SELECT 
        p.id,
        p.city,
        p.country,
        p.launch_date,
        p.state,
        p.status,
        p.title,
        p.primary_language,
        r.id AS region_id,
        c.iso_code
      FROM program AS p
      INNER JOIN country AS c ON c.id = p.country
      INNER JOIN region AS r ON r.id = c.region_id
      WHERE r.id = $1`,
      [id]
    );

    res.status(200).json(keysToCamel(program));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/city/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const program = await db.query(`SELECT city FROM program WHERE id = $1`, [
      id,
    ]);

    if (program.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(program[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/state/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const program = await db.query(`SELECT state FROM program WHERE id = $1`, [
      id,
    ]);

    if (program.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(program[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/get-program-name/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const program = await db.query(
      `SELECT name
      FROM program
      INNER JOIN program_director ON program_director.user_id = $1
      WHERE program.id = program_director.program_id`,
      [id]
    );

    if (program.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(program[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.post('/', async (req, res) => {
  try {
    const {
      createdBy,
      name,
      country,
      state,
      city,
      title,
      description,
      languages,
      primaryLanguage,
      partnerOrg,
      status,
      launchDate,
    } = req.body;
    const normalizedLanguages = normalizeLanguages(languages, primaryLanguage);

    const newProgram = await db.query(
      `
      INSERT INTO program (
        created_by,
        name,
        date_created,
        country,
        state,
        city,
        title,
        description,
        languages,
        partner_org,
        status,
        launch_date
      )
      VALUES (
        $1, $2, NOW(), $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING *;
      `,
      [
        createdBy,
        name,
        country,
        state,
        city,
        title,
        description ?? null,
        normalizedLanguages.length > 0 ? normalizedLanguages : null,
        partnerOrg,
        status,
        launchDate,
      ]
    );

    res.status(201).json(keysToCamel(newProgram[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      country,
      state,
      city,
      title,
      description,
      languages,
      primaryLanguage,
      partnerOrg,
      status,
      launchDate,
    } = req.body;
    const normalizedLanguages = normalizeLanguages(languages, primaryLanguage);

    const updatedProgram = await db.query(
      `
      UPDATE program
      SET
        name = COALESCE($1, name),
        country = COALESCE($2, country),
        state = COALESCE($3, state),
        city = COALESCE($4, city),
        title = COALESCE($5, title),
        description = COALESCE($6, description),
        languages = COALESCE($7, languages),
        partner_org = COALESCE($8, partner_org),
        status = COALESCE($9, status),
        launch_date = COALESCE($10, launch_date)
      WHERE id = $11
      RETURNING *;
      `,
      [
        name,
        country,
        state,
        city,
        title,
        description,
        normalizedLanguages.length > 0 ? normalizedLanguages : null,
        partnerOrg,
        status,
        launchDate,
        id,
      ]
    );

    if (updatedProgram.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedProgram[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProgram = await db.query(
      `DELETE FROM program WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedProgram.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deletedProgram[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/:id/regional-directors', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.picture
      FROM program p
      JOIN country c ON p.country = c.id
      JOIN regional_director rd ON c.region_id = rd.region_id
      JOIN gcf_user u ON rd.user_id = u.id
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.length === 0) {
      return res.status(200).json([]);
    }

    const regional_directors = result.map((row) => ({
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      picture: row.picture,
    }));

    res.status(200).json(regional_directors);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/:id/playlists', async (req, res) => {
  try {
    const { id } = req.params;

    const playlists = await db.query(
      `SELECT * FROM playlist WHERE program_id = $1`,
      [id]
    );

    res.status(200).json(keysToCamel(playlists));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.post('/:id/playlists', async (req, res) => {
  try {
    const { id } = req.params;
    const { link, name, instrumentId } = req.body;

    if (!link || !name) {
      return res.status(400).json({ error: 'link and name are required' });
    }
    if (instrumentId === null) {
      return res.status(400).json({ error: 'instrumentId is required' });
    }

    const normalizedLink =
      link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `https://${link}`;

    await db.query(
      `INSERT INTO playlist (program_id, instrument_id, link, name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (program_id, instrument_id, link) DO UPDATE SET name = EXCLUDED.name`,
      [id, instrumentId, normalizedLink, name]
    );

    const [inserted] = await db.query(
      `SELECT * FROM playlist WHERE program_id = $1 AND instrument_id = $2 AND link = $3`,
      [id, instrumentId, normalizedLink]
    );
    res.status(201).json(keysToCamel(inserted[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.delete('/:id/playlists', async (req, res) => {
  try {
    const { id } = req.params;
    const { link, instrumentId } = req.body;

    if (!link) {
      return res.status(400).json({ error: 'link is required' });
    }
    if (instrumentId === null) {
      return res.status(400).json({ error: 'instrumentId is required' });
    }

    const result = await db.query(
      `DELETE FROM playlist WHERE program_id = $1 AND instrument_id = $2 AND link = $3 RETURNING *`,
      [id, instrumentId, link]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.status(200).json(keysToCamel(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// aggregated instruments (by instrument) for a program
programRouter.get('/:id/instruments', async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await db.query(
      `
      SELECT
        i.id AS instrument_id,
        i.name,
        COALESCE(SUM(ic.amount_changed), 0) AS quantity
      FROM program p
      JOIN program_update pu ON pu.program_id = p.id
      JOIN instrument_change ic ON ic.update_id = pu.id
      JOIN instrument i ON i.id = ic.instrument_id
      WHERE p.id = $1
      GROUP BY i.id, i.name
      HAVING COALESCE(SUM(ic.amount_changed), 0) <> 0
      ORDER BY i.name ASC;
      `,
      [id]
    );

    res.status(200).json(keysToCamel(rows));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/:id/program-directors', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.picture
      FROM program_director pd
      JOIN gcf_user u ON pd.user_id = u.id
      WHERE pd.program_id = $1
      `,
      [id]
    );

    const directors = result.map((row) => ({
      userId: row.user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      picture: row.picture,
    }));

    res.status(200).json(directors);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/:id/media', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT m.id, m.s3_key, m.file_name, m.file_type, m.is_thumbnail, m.instrument_id
      FROM media_change m
      JOIN program_update pu ON m.update_id = pu.id
      WHERE program_id = $1;
      `,
      [id]
    );

    const media = result.map((row) => ({
      id: row.id,
      s3_key: row.s3_key,
      file_name: row.file_name,
      file_type: row.file_type,
      is_thumbnail: row.is_thumbnail,
      instrument_id: row.instrument_id,
    }));

    res.status(200).json(media);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

programRouter.get('/:id/partner-organization', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT g.name
      FROM partner_organization g
      JOIN program p ON g.id = p.partner_org
      WHERE p.id = $1;
      `,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).send('Partner organization not found');
    }

    res.status(200).json(result[0].name);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { programRouter };
