import { keysToCamel, asyncHandler } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const partnerOrganizationRouter = express.Router();
partnerOrganizationRouter.use(express.json());

partnerOrganizationRouter.get('/', asyncHandler(async (req, res) => {
  const partnerOrganization = await db.query(
    `SELECT * FROM partner_organization`
  );
  res.status(200).json(keysToCamel(partnerOrganization));
}));

partnerOrganizationRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partnerOrganization = await db.query(
    `SELECT * FROM partner_organization WHERE id = $1`,
    [id]
  );

  if (partnerOrganization.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(partnerOrganization[0]));
}));

partnerOrganizationRouter.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;

  const newPartnerOrganization = await db.query(
    `
    INSERT INTO partner_organization (
      name
    )
    VALUES (
      $1
    )
    RETURNING *;
    `,
    [name]
  );

  res.status(201).json(keysToCamel(newPartnerOrganization[0]));
}));

partnerOrganizationRouter.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const updatedPartnerOrganization = await db.query(
    `
    UPDATE partner_organization
    SET name = COALESCE($1, name)
    WHERE id = $2
    RETURNING *;
    `,
    [name, id]
  );

  if (updatedPartnerOrganization.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(updatedPartnerOrganization[0]));
}));

partnerOrganizationRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedPartnerOrganization = await db.query(
    `DELETE FROM partner_organization WHERE id = $1 RETURNING *`,
    [id]
  );

  if (deletedPartnerOrganization.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(deletedPartnerOrganization[0]));
}));

export { partnerOrganizationRouter };
