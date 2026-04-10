import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const accountChangeRouter = express.Router();
accountChangeRouter.use(express.json());

accountChangeRouter.get('/', async (req, res) => {
  try {
    const data = await db.query(`
      SELECT 
        ac.*, 
        u.first_name AS author_first_name,
        u.last_name AS author_last_name
      FROM account_change ac
      LEFT JOIN gcf_user u ON ac.author_id = u.id
    `);
    
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

accountChangeRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const accountChange = await db.query(
      `SELECT 
        ac.*, 
        u.first_name AS author_first_name,
        u.last_name AS author_last_name
      FROM account_change ac
      LEFT JOIN gcf_user u ON ac.author_id = u.id
      WHERE ac.id = $1`,
      [id]
    );

    if (accountChange.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(accountChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

accountChangeRouter.post('/', async (req, res) => {
  try {
    const {
      user_id,
      author_id,
      change_type,
      old_values,
      new_values,
      resolved,
      last_modified,
    } = req.body;

    const newAccountChange = await db.query(
      `INSERT INTO account_change (user_id, author_id, change_type, old_values, new_values, resolved, last_modified)
      VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, COALESCE($6, FALSE), $7)
      RETURNING *`,
      [
        user_id,
        author_id,
        change_type,
        old_values ? JSON.stringify(old_values) : null,
        new_values ? JSON.stringify(new_values) : null,
        resolved,
        last_modified,
      ]
    );
    res.status(201).json(keysToCamel(newAccountChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

accountChangeRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      author_id,
      change_type,
      old_values,
      new_values,
      resolved,
      last_modified,
    } = req.body;

    const updatedAccountChange = await db.query(
      `UPDATE account_change SET
        user_id = COALESCE($1, user_id),
        author_id = COALESCE($2, author_id),
        change_type = COALESCE($3, change_type),
        old_values = COALESCE($4::jsonb, old_values),
        new_values = COALESCE($5::jsonb, new_values),
        resolved = COALESCE($6, resolved),
        last_modified = COALESCE($7, last_modified)
        WHERE id = $8
        RETURNING *;`,
      [
        user_id,
        author_id,
        change_type,
        old_values ? JSON.stringify(old_values) : null,
        new_values ? JSON.stringify(new_values) : null,
        resolved,
        last_modified,
        id,
      ]
    );

    if (updatedAccountChange.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedAccountChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

accountChangeRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAccountChange = await db.query(
      `DELETE FROM account_change WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedAccountChange.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deletedAccountChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { accountChangeRouter };
