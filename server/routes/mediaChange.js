import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const mediaChangeRouter = express.Router();
mediaChangeRouter.use(express.json());

mediaChangeRouter.get('/', async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM media_change`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mediaChange = await db.query(
      `SELECT ALL * FROM media_change WHERE id = $1`,
      [id]
    );

    if (mediaChange.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(mediaChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.post('/', async (req, res) => {
  try {
    const { update_id, s3_key, file_name, file_type, is_thumbnail } = req.body;
    const newMediaChange = await db.query(
      `INSERT INTO media_change (update_id, s3_key, file_name, file_type, is_thumbnail) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [update_id, s3_key, file_name, file_type, is_thumbnail]
    );
    res.status(201).json(keysToCamel(newMediaChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.post('/file-change', async (req, res) => {
  try {
    const { update_id, s3_key, file_name, file_type } = req.body;
    const newFileChange = await db.query(
      `INSERT INTO file_change (update_id, s3_key, file_name, file_type) VALUES ($1, $2, $3, $4) RETURNING *`,
      [update_id, s3_key, file_name, file_type]
    );
    res.status(201).json(keysToCamel(newFileChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { update_id, s3_key, file_name, file_type, is_thumbnail } = req.body;
    const updatedMediaChange = await db.query(
      `UPDATE media_change SET
        update_id = COALESCE($1, update_id),
        s3_key = COALESCE($2, s3_key),
        file_name = COALESCE($3, file_name),
        file_type = COALESCE($4, file_type),
        is_thumbnail = COALESCE($5, is_thumbnail),
        WHERE id = $6
        RETURNING *;`,
      [update_id, s3_key, file_name, file_type, is_thumbnail, id]
    );

    if (updatedMediaChange.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedMediaChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.put('/:updateId/approve', async (req, res) => {
  try {
    const { updateId } = req.params;
    const updated = await db.query(
      `
        UPDATE media_change SET status = 'Approved' WHERE update_id = $1 RETURNING *
      `,
      [updateId]
    );
    res.status(200).json(keysToCamel(updated));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.put('/:updateId/archive', async (req, res) => {
  try {
    const { updateId } = req.params;
    const updated = await db.query(
      `
        UPDATE media_change SET status = 'Archived' WHERE update_id = $1 RETURNING *
      `,
      [updateId]
    );
    res.status(200).json(keysToCamel(updated));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.delete('/:updateId/deny', async (req, res) => {
  try {
    const { updateId } = req.params;
    const updated = await db.query(
      `
        DELETE FROM media_change WHERE update_id = $1 RETURNING *
      `,
      [updateId]
    );
    res.status(200).json(keysToCamel(updated));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMediaChange = await db.query(
      `DELETE FROM media_change WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedMediaChange.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deletedMediaChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

async function fetchUserMedia(userId, fileType) {
  const fileTypeFilter =
    fileType === 'pdf'
      ? `AND (mc.file_name ILIKE '%.pdf' OR mc.file_name IS NULL)`
      : '';

  const result = await db.query(
    `
    SELECT
      mc.id,
      mc.s3_key,
      mc.file_name,
      mc.file_type,
      mc.is_thumbnail,
      p.id as program_id,
      p.name as program_name
    FROM program_director pd
    JOIN program p ON pd.program_id = p.id
    LEFT JOIN program_update pu ON pu.program_id = pd.program_id
    LEFT JOIN media_change mc ON mc.update_id = pu.id
    WHERE pd.user_id = $1
    ${fileTypeFilter}
    ORDER BY mc.id DESC NULLS LAST
  `,
    [userId]
  );

  if (!result || result.length === 0) {
    return { media: [], programName: null, programId: null };
  }

  const mediaItems = result.filter((row) => row.id !== null);

  return {
    media: keysToCamel(mediaItems),
    programName: result[0].program_name,
    programId: result[0].program_id,
  };
}

mediaChangeRouter.get('/:userId/media', async (req, res) => {
  try {
    const { userId } = req.params;
    const { fileType } = req.query;
    const data = await fetchUserMedia(userId, fileType);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.get('/:userId/media-updates', async (req, res) => {
  try {
    const { userId } = req.params;
    const roleResult = await db.query(
      `SELECT role FROM gcf_user WHERE gcf_user.id = $1;`,
      [userId]
    );

    if (roleResult.length === 0) return res.status(404).send('User not found');

    const role = roleResult[0].role;

    if (
      role !== 'Super Admin' &&
      role !== 'Admin' &&
      role !== 'Regional Director'
    ) {
      return res.status(403).send('Access denied');
    }

    let filterJoin = '';

    if (role === 'Regional Director') {
      filterJoin = `
        INNER JOIN country ON program.country = country.id
        INNER JOIN region ON country.region_id = region.id
        INNER JOIN regional_director ON regional_director.region_id = region.id AND regional_director.user_id = $1`;
    }

    const finalQuery = `
      SELECT * FROM (
        SELECT DISTINCT ON (program_update.id)
          program_update.id AS id,
          program_update.update_date,
          program_update.note,
          program.name AS program_name,
          creator.first_name,
          creator.last_name,
          creator.role,
          media_change.status
        FROM program_update
        INNER JOIN media_change ON media_change.update_id = program_update.id
        INNER JOIN program ON program_update.program_id = program.id
        LEFT JOIN gcf_user AS creator ON creator.id = program_update.created_by
        ${filterJoin}
        ORDER BY program_update.id, media_change.id
      ) sub
      ORDER BY update_date DESC;
    `;
    const queryParams = role === 'Regional Director' ? [userId] : [];
    const data = await db.query(finalQuery, queryParams);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

mediaChangeRouter.get('/update/:updateId', async (req, res) => {
  try {
    const { updateId } = req.params;
    const data = await db.query(
      `SELECT * FROM media_change WHERE update_id = $1`,
      [updateId]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { mediaChangeRouter };
