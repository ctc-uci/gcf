import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const fileChangeRouter = express.Router();
fileChangeRouter.use(express.json());

fileChangeRouter.get('/', async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM file_change`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

fileChangeRouter.post('/', async (req, res) => {
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

fileChangeRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { update_id, s3_key, file_name, file_type, description } = req.body;
    const updatedFileChange = await db.query(
      `UPDATE file_change SET
        update_id = COALESCE($1, update_id),
        s3_key = COALESCE($2, s3_key),
        file_name = COALESCE($3, file_name),
        file_type = COALESCE($4, file_type),
        description = COALESCE($5, description)
        WHERE id = $6
        RETURNING *;`,
      [update_id, s3_key, file_name, file_type, description, id]
    );

    if (updatedFileChange.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedFileChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

fileChangeRouter.put('/:updateId/approve', async (req, res) => {
  try {
    const { updateId } = req.params;
    const updated = await db.query(
      `
        UPDATE file_change SET status = 'Approved' WHERE update_id = $1 RETURNING *
      `,
      [updateId]
    );
    res.status(200).json(keysToCamel(updated));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

fileChangeRouter.put('/:updateId/archive', async (req, res) => {
  try {
    const { updateId } = req.params;
    const updated = await db.query(
      `
        UPDATE file_change SET status = 'Archived' WHERE update_id = $1 RETURNING *
      `,
      [updateId]
    );
    res.status(200).json(keysToCamel(updated));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

fileChangeRouter.delete('/:updateId/deny', async (req, res) => {
  try {
    const { updateId } = req.params;
    const updated = await db.query(
      `
        DELETE FROM file_change WHERE update_id = $1 RETURNING *
      `,
      [updateId]
    );
    res.status(200).json(keysToCamel(updated));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

fileChangeRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFileChange = await db.query(
      `DELETE FROM file_change WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedFileChange.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deletedFileChange[0]));
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

fileChangeRouter.get('/:userId/media', async (req, res) => {
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

fileChangeRouter.get('/:userId/media-updates', async (req, res) => {
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

fileChangeRouter.get('/update/:updateId', async (req, res) => {
  try {
    const { updateId } = req.params;
    const data = await db.query(
      `SELECT * FROM file_change WHERE update_id = $1`,
      [updateId]
    );

    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

async function fetchUserFiles(userId) {
  const result = await db.query(
    `
    SELECT
      fc.id,
      fc.s3_key,
      fc.file_name,
      fc.file_type,
      fc.description,
      fc.status,
      p.id as program_id,
      p.name as program_name
    FROM program_director pd
    JOIN program p ON pd.program_id = p.id
    LEFT JOIN program_update pu ON pu.program_id = pd.program_id
    LEFT JOIN file_change fc ON fc.update_id = pu.id
    WHERE pd.user_id = $1
    ORDER BY fc.id DESC NULLS LAST
    `,
    [userId]
  );

  if (!result || result.length === 0) {
    return { files: [], programName: null, programId: null };
  }

  const fileItems = result.filter((row) => row.id !== null);

  return {
    files: keysToCamel(fileItems),
    programName: result[0].program_name,
    programId: result[0].program_id,
  };
}

fileChangeRouter.get('/:userId/files', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await fetchUserFiles(userId);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

fileChangeRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fileChange = await db.query(
      `SELECT ALL * FROM file_change WHERE id = $1`,
      [id]
    );

    if (fileChange.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(fileChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { fileChangeRouter };
