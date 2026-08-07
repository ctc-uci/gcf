import { keysToCamel, asyncHandler } from '@/common/utils';
import { verifyToken } from '@/middleware';
import express from 'express';

import { db } from '../db/db-pgp';

const REGION_NAME_MAX_LENGTH = 70;

const validateRegionName = (name) => {
  if (typeof name !== 'string') {
    return {
      isValid: false,
      message: 'Region name is required.',
    };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return {
      isValid: false,
      message: 'Region name is required.',
    };
  }

  if (trimmedName.length > REGION_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Region name must be ${REGION_NAME_MAX_LENGTH} characters or fewer.`,
    };
  }

  return {
    isValid: true,
    trimmedName,
  };
};

const regionRouter = express.Router();
regionRouter.use(express.json());
regionRouter.post('*', verifyToken);
regionRouter.put('*', verifyToken);
regionRouter.delete('*', verifyToken);

regionRouter.get('/', asyncHandler(async (req, res) => {
  const data = await db.query(`SELECT * FROM region`);
  res.status(200).json(keysToCamel(data));
}));

regionRouter.get('/countries-by-region', asyncHandler(async (req, res) => {
  const countries = await db.query(
    `SELECT * FROM country ORDER BY region_id, name`
  );
  const countriesByRegion = countries.reduce((acc, country) => {
    if (!acc[country.region_id]) {
      acc[country.region_id] = [];
    }
    acc[country.region_id].push(country);
    return acc;
  }, {});
  res.status(200).json(keysToCamel(countriesByRegion));
}));

regionRouter.get('/get-region-name/:id', asyncHandler(async (req, res) => {
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

  res.status(200).json(keysToCamel(region));
}));

regionRouter.get('/:id/countries', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const countries = await db.query(
    `SELECT * FROM country WHERE region_id = $1`,
    [id]
  );

  res.status(200).json(keysToCamel(countries));
}));

regionRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const region = await db.query(`SELECT ALL * FROM region WHERE id = $1`, [
    id,
  ]);

  if (region.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(region[0]));
}));

regionRouter.post('/', asyncHandler(async (req, res) => {
  const { name, last_modified } = req.body;
  const validation = validateRegionName(name);

  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: {
        name: validation.message,
      },
    });
  }

  const newRegion = await db.query(
    `INSERT INTO region (name, last_modified) 
    VALUES ($1, $2) 
    RETURNING *`,
    [validation.trimmedName, last_modified]
  );
  res.status(201).json(keysToCamel(newRegion[0]));
}));

regionRouter.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, last_modified } = req.body;
  const validation = validateRegionName(name);

  if (!validation.isValid) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: {
        name: validation.message,
      },
    });
  }

  const updatedRegion = await db.query(
    `UPDATE region SET
      name = COALESCE($1, name),
      last_modified = COALESCE($2, last_modified)
      WHERE id = $3
      RETURNING *;`,
    [validation.trimmedName, last_modified, id]
  );

  if (updatedRegion.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(updatedRegion[0]));
}));

regionRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedRegion = await db.query(
    `DELETE FROM region WHERE id = $1 RETURNING *`,
    [id]
  );

  if (deletedRegion.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(deletedRegion[0]));
}));

export { regionRouter };
