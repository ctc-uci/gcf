// for reference only
import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const sampleRouter = express.Router();
sampleRouter.use(express.json());

sampleRouter.get('/', async (req, res) => {
  try {
    // Query database
    const data = await db.query(`SELECT * FROM table`);
    res.status(200).json(keysToCamel(data[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

sampleRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // rename entry to something relevant to the route
    const entry = await db.query(`SELECT ALL * FROM table WHERE id = $1`, [id]);

    if (entry.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(entry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

sampleRouter.post('/', async (req, res) => {
  try {
    // Destructure req.body
    const { data } = req.body;
    // rename newEntry to something relevant to the route
    const newEntry = await db.query(
      `INSERT INTO table (table_data) VALUES ($1) RETURNING *`,
      [data]
    );
    res.status(201).json(keysToCamel(newEntry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

sampleRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    // rename updatedEntry to something relevant to the route
    const updatedEntry = await db.query(
      `UPDATE table SET
        table_data = COALESCE($1, table_data)
        WHERE id = $2
        RETURNING *;`,
      [data, id]
    );

    if (updatedEntry.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedEntry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

sampleRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // rename deletedEntry to something relevant to the route
    const deletedEntry = await db.query(
      `DELETE FROM table WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedEntry.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deletedEntry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { sampleRouter };
