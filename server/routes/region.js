import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const regionRouter = express.Router();
regionRouter.use(express.json());

regionRouter.get('/', async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM region`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const region = await db.query(`SELECT ALL * FROM region WHERE id = $1`, [
      id,
    ]);

    if (region.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(region[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionRouter.get('/get-region-name/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const region = await db.query(
      `SELECT name
      FROM region
      INNER JOIN regional_director ON region.id = regional_director.region_id
      INNER JOIN gcf_user ON regional_director.user_id = gcf_user.id
      WHERE gcf_user.id = $1`,
      [id]
    );

    if (region.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(region[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionRouter.post('/', async (req, res) => {
  try {
    const { name, last_modified } = req.body;
    const newRegion = await db.query(
      `INSERT INTO region (name, last_modified) 
      VALUES ($1, $2) 
      RETURNING *`,
      [name, last_modified]
    );
    res.status(201).json(keysToCamel(newRegion[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, last_modified } = req.body;
    const updatedRegion = await db.query(
      `UPDATE region SET
        name = COALESCE($1, name),
        last_modified = COALESCE($2, last_modified)
        WHERE id = $3
        RETURNING *;`,
      [name, last_modified, id]
    );

    if (updatedRegion.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedRegion[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRegion = await db.query(
      `DELETE FROM region WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedRegion.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deletedRegion[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

regionRouter.get('/:id/countries', async (req, res) => {
  try {
    const { id } = req.params;

    const countries = await db.query(
      `SELECT * FROM country WHERE region_id = $1`,
      [id]
    );

    res.status(200).json(keysToCamel(countries));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { regionRouter };
