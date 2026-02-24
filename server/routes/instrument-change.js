import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const instrumentChangeRouter = express.Router();
instrumentChangeRouter.use(express.json());

instrumentChangeRouter.post('/', async (req, res) => {
  try {
    const { instrumentId, updateId, amountChanged } = req.body;
    console.log('POST /instrument-changes body:', req.body);

    const newChange = await db.query(
      `INSERT INTO instrument_change
        (instrument_id, update_id, amount_changed)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [instrumentId, updateId, amountChanged]
    );

    res.status(201).json(keysToCamel(newChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

instrumentChangeRouter.get('/', async (req, res) => {
  try {
    const changes = await db.query(`SELECT * FROM instrument_change;`);

    res.status(200).json(keysToCamel(changes));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

instrumentChangeRouter.get('/update/:updateId', async (req, res) => {
  try {
    const { updateId } = req.params;

    const change = await db.query(
      `SELECT * FROM instrument_change WHERE update_id = $1;`,
      [updateId]
    );


    res.status(200).json(change.map(keysToCamel));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

instrumentChangeRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const change = await db.query(
      `SELECT * FROM instrument_change WHERE id = $1;`,
      [id]
    );

    if (change.length === 0) {
      return res.status(404).send('Instrument change not found');
    }

    res.status(200).json(keysToCamel(change[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

instrumentChangeRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { instrumentId, updateId, amountChanged } = req.body;

    const updatedChange = await db.query(
      `UPDATE instrument_change SET
        instrument_id = COALESCE($1, instrument_id),
        update_id = COALESCE($2, update_id),
        amount_changed = COALESCE($3, amount_changed)
       WHERE id = $4
       RETURNING *;`,
      [instrumentId, updateId, amountChanged, id]
    );

    if (updatedChange.length === 0) {
      return res.status(404).send('Instrument change not found');
    }

    res.status(200).json(keysToCamel(updatedChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

instrumentChangeRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedChange = await db.query(
      `DELETE FROM instrument_change
       WHERE id = $1
       RETURNING *;`,
      [id]
    );

    if (deletedChange.length === 0) {
      return res.status(404).send('Instrument change not found');
    }

    res.status(200).json(keysToCamel(deletedChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

instrumentChangeRouter.delete('/update/:updateId', async (req, res) => {
  try {
    const { updateId } = req.params;

    const deletedChange = await db.query(
      `DELETE FROM instrument_change
       WHERE update_id = $1
       RETURNING *;`,
      [updateId]
    );

    if (deletedChange.length === 0) {
      return res.status(404).send('Instrument change not found');
    }

    res.status(200).json(keysToCamel(deletedChange[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { instrumentChangeRouter };
