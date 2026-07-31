import { keysToCamel, asyncHandler } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';
import { deleteFromS3 } from '../common/s3';

const fileChangeRouter = express.Router();
fileChangeRouter.use(express.json());

fileChangeRouter.post('/', asyncHandler(async (req, res) => {
  const { update_id, s3_key, file_name, file_type } = req.body;
  const newFileChange = await db.query(
    `INSERT INTO file_change (update_id, s3_key, file_name, file_type) VALUES ($1, $2, $3, $4) RETURNING *`,
    [update_id, s3_key, file_name, file_type]
  );
  res.status(201).json(keysToCamel(newFileChange[0]));
}));

/** All `file_change` rows linked to a program (via `program_update`). */
fileChangeRouter.get('/program/:programId', asyncHandler(async (req, res) => {
  const { programId } = req.params;

  const result = await db.query(
    `
    SELECT fc.id, fc.s3_key, fc.file_name, fc.file_type, fc.description
    FROM file_change fc
    JOIN program_update pu ON fc.update_id = pu.id
    WHERE pu.program_id = $1;
    `,
    [programId]
  );

  const files = result.map((row) => ({
    id: row.id,
    s3_key: row.s3_key,
    file_name: row.file_name,
    file_type: row.file_type,
    description: row.description,
  }));

  res.status(200).json(files);
}));

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

fileChangeRouter.get('/:userId/files', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const data = await fetchUserFiles(userId);
  res.status(200).json(data);
}));

fileChangeRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedFileChange = await db.query(
    `DELETE FROM file_change WHERE id = $1 RETURNING *`,
    [id]
  );

  if (deletedFileChange.length === 0) {
    return res.status(404).send('Item not found');
  }

  await deleteFromS3(deletedFileChange[0].s3_key);
  res.status(200).json(keysToCamel(deletedFileChange[0]));
}));

export { fileChangeRouter };
