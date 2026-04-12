import { keysToCamel } from '@/common/utils';
import { verifyToken } from '@/middleware';
import express from 'express';

import { db } from '../db/db-pgp';

const countryRouter = express.Router();
countryRouter.use(express.json());

countryRouter.post('*', verifyToken);
countryRouter.put('*', verifyToken);
countryRouter.delete('*', verifyToken);

countryRouter.get('/', async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM country`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

countryRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const country = await db.query(`SELECT ALL * FROM country WHERE id = $1`, [
      id,
    ]);

    if (country.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(country[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

countryRouter.get('/:id/region', async (req, res) => {
  try {
    const { id } = req.params;
    const regionName = await db.query(
      `SELECT r.name
      FROM region as r
      INNER JOIN country c ON c.region_id = r.id
      WHERE c.id = $1`,
      [id]
    );

    res.status(200).json(keysToCamel(regionName));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

countryRouter.post('/', async (req, res) => {
  try {
    const { region_id, name, last_modified, iso_code } = req.body;
    const newCountry = await db.query(
      `INSERT INTO country (region_id, name, last_modified, iso_code) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`,
      [region_id, name, last_modified, iso_code]
    );
    res.status(201).json(keysToCamel(newCountry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

countryRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { region_id, name, last_modified } = req.body;
    const updatedCountry = await db.query(
      `UPDATE country SET
        region_id = COALESCE($1, region_id),
        name = COALESCE($2, name),
        last_modified = COALESCE($3, last_modified)
        WHERE id = $4
        RETURNING *;`,
      [region_id, name, last_modified, id]
    );

    if (updatedCountry.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedCountry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

countryRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCountry = await db.query(
      `DELETE FROM country WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedCountry.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deletedCountry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

countryRouter.delete('/:id/region/:region_id', async (req, res) => {
  try {
    const { id, region_id } = req.params;
    const deletedCountry = await db.query(
      `DELETE FROM country WHERE id = $1 AND region_id = $2 RETURNING *`,
      [id, region_id]
    );
    if (deletedCountry.length === 0) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(deletedCountry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { countryRouter };
