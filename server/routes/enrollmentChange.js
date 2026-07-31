import { keysToCamel, asyncHandler } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const enrollmentChangeRouter = express.Router();
enrollmentChangeRouter.use(express.json());

enrollmentChangeRouter.get('/', asyncHandler(async (req, res) => {
  const data = await db.query(`SELECT * FROM enrollment_change`);
  res.status(200).json(keysToCamel(data));
}));

enrollmentChangeRouter.get('/update/:updateId', asyncHandler(async (req, res) => {
  const { updateId } = req.params;
  const enrollmentChange = await db.query(
    `SELECT ALL * FROM enrollment_change WHERE update_id = $1`,
    [updateId]
  );

  res.status(200).json(keysToCamel(enrollmentChange));
}));

enrollmentChangeRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const enrollmentChange = await db.query(
    `SELECT ALL * FROM enrollment_change WHERE id = $1`,
    [id]
  );

  if (enrollmentChange.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(enrollmentChange));
}));

enrollmentChangeRouter.post('/', asyncHandler(async (req, res) => {
  const {
    update_id,
    enrollment_change,
    graduated_change,
    event_type,
    description,
  } = req.body;
  const newEnrollmentChange = await db.query(
    `INSERT INTO enrollment_change (update_id, enrollment_change, graduated_change, event_type, description) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [
      update_id,
      enrollment_change,
      graduated_change,
      event_type,
      description ?? null,
    ]
  );
  res.status(201).json(keysToCamel(newEnrollmentChange[0]));
}));

enrollmentChangeRouter.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    update_id,
    enrollment_change,
    graduated_change,
    event_type,
    description,
  } = req.body;
  const updatedEnrollmentChange = await db.query(
    `UPDATE enrollment_change SET
      update_id = COALESCE($1, update_id),
      enrollment_change = COALESCE($2, enrollment_change),
      graduated_change = COALESCE($3, graduated_change),
      event_type = COALESCE($4, event_type),
      description = COALESCE($5, description)
      WHERE id = $6
      RETURNING *;`,
    [
      update_id,
      enrollment_change,
      graduated_change,
      event_type,
      description,
      id,
    ]
  );

  if (updatedEnrollmentChange.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(updatedEnrollmentChange[0]));
}));

enrollmentChangeRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedEnrollmentChange = await db.query(
    `DELETE FROM enrollment_change WHERE id = $1 RETURNING *`,
    [id]
  );

  if (deletedEnrollmentChange.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(deletedEnrollmentChange[0]));
}));

export { enrollmentChangeRouter };
