import { keysToCamel, asyncHandler } from '@/common/utils';
import { db } from '@/db/db-pgp';
import { json, Router } from 'express';
import { deleteFromS3 } from '../common/s3';

const programUpdateRouter = Router();
programUpdateRouter.use(json());

// Reading all program updates
programUpdateRouter.get('/', asyncHandler(async (req, res) => {
  const data = await db.query(`SELECT * FROM program_update`);
  res.status(200).json(keysToCamel(data));
}));

// Reading a program update
programUpdateRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const entry = await db.query(
    `
          SELECT *,
          EXISTS (
            SELECT 1 FROM instrument_change ic
            WHERE ic.update_id = program_update.id
              AND ic.special_request IS TRUE
          ) AS flagged
          FROM program_update 
          WHERE id = $1`,
    [id]
  );

  if (entry.length === 0) {
    return res.status(404).send('Program update not found');
  }

  res.status(200).json(keysToCamel(entry[0]));
}));

// More specific than `/:id` so `/123/date` is not captured as id=`123/date`.
programUpdateRouter.get('/:id/date', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const entry = await db.query(
    `
      SELECT update_date FROM program_update 
      WHERE id = $1`,
      [id]
  );

  if (entry.length === 0) {
      return res.status(404).send('Program update date not found');
  }

  res.status(200).json(keysToCamel(entry[0]));
}));

// Creating a program update
programUpdateRouter.post('/', asyncHandler(async (req, res) => {
  const {
    title,
    program_id,
    created_by,
    update_date,
    note,
    show_on_table,
    resolved,
  } =
    req.body;

  const newEntry = await db.query(
    `INSERT INTO program_update (title, program_id, created_by, update_date, note, show_on_table, resolved, updated_at)
          VALUES ($1, $2, $3, $4, $5, COALESCE($6, TRUE), COALESCE($7, FALSE), CURRENT_TIMESTAMP)
          RETURNING *`,
    [title, program_id, created_by, update_date, note, show_on_table, resolved]
  );
  res.status(201).json(keysToCamel(newEntry[0]));
}));

// Updating a program update
programUpdateRouter.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    program_id,
    created_by,
    update_date,
    note,
    show_on_table,
    resolved,
  } = req.body;

  const newProgramUpdate = await db.query(
    `UPDATE program_update SET
          title = COALESCE($1, title),
          program_id = COALESCE($2, program_id),
          created_by = COALESCE($3, created_by),
          update_date = COALESCE($4, update_date),
          note = COALESCE($5, note),
          show_on_table = COALESCE($6, show_on_table),
          resolved = COALESCE($7, resolved),
          updated_at = CURRENT_TIMESTAMP
          WHERE id = $8
          RETURNING *`,
    [
      title,
      program_id,
      created_by,
      update_date,
      note,
      show_on_table,
      resolved,
      id,
    ]
  );

  if (newProgramUpdate.length === 0) {
    return res.status(404).send('Program update not found');
  }

  res.status(200).json(keysToCamel(newProgramUpdate[0]));
}));

// Deleting a program update
programUpdateRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [mediaFiles, fileFiles] = await Promise.all([
    db.query(`SELECT s3_key FROM media_change WHERE update_id = $1`, [id]),
    db.query(`SELECT s3_key FROM file_change WHERE update_id = $1`, [id]),
  ]);

  const deletedProgramUpdate = await db.query(
    `DELETE FROM program_update
          WHERE id = $1
          RETURNING *`,
    [id]
  );

  if (deletedProgramUpdate.length === 0) {
    return res.status(404).send('Program update not found');
  }

  const s3Keys = [...mediaFiles, ...fileFiles].map((r) => r.s3_key).filter(Boolean);
  await Promise.all(s3Keys.map((key) => deleteFromS3(key)));

  res.status(200).json(keysToCamel(deletedProgramUpdate[0]));
}));

export { programUpdateRouter };
