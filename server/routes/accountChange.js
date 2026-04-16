import { keysToCamel } from '@/common/utils';
import { getAuthenticatedUser } from '@/middleware';
import express from 'express';

import { db } from '../db/db-pgp';

const RESOLVER_ROLES = new Set(['Admin', 'Super Admin', 'Regional Director']);

function snapshotFromJsonb(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return null;
}

async function applyPendingProgramDirectorProfile(t, row) {
  const nv = snapshotFromJsonb(row.new_values);
  if (!nv || typeof nv !== 'object') return;

  const uid = row.user_id;
  const firstName = nv.first_name ?? nv.firstName;
  const lastName = nv.last_name ?? nv.lastName;
  const picture = Object.hasOwn(nv, 'picture') ? nv.picture : undefined;
  const bio = nv.bio ?? nv.biography;
  const prefLang = nv.preferred_language ?? nv.preferredLanguage;

  const gcfSets = [];
  const gcfVals = [];
  let i = 1;
  if (firstName !== undefined) {
    gcfSets.push(`first_name = $${i++}`);
    gcfVals.push(firstName);
  }
  if (lastName !== undefined) {
    gcfSets.push(`last_name = $${i++}`);
    gcfVals.push(lastName);
  }
  if (picture !== undefined) {
    gcfSets.push(`picture = $${i++}`);
    gcfVals.push(picture);
  }
  if (prefLang !== undefined) {
    gcfSets.push(`preferred_language = $${i++}`);
    gcfVals.push(prefLang);
  }
  if (gcfSets.length) {
    gcfVals.push(uid);
    await t.none(
      `UPDATE gcf_user SET ${gcfSets.join(', ')} WHERE id = $${i}`,
      gcfVals
    );
  }
  if (bio !== undefined) {
    await t.none(
      `UPDATE program_director SET bio = $1 WHERE user_id = $2`,
      [bio, uid]
    );
  }
}

const accountChangeRouter = express.Router();
accountChangeRouter.use(express.json());

accountChangeRouter.get('/', async (req, res) => {
  try {
    const { userId, resolved } = req.query;
    const conditions = [];
    const params = [];
    let i = 1;

    if (userId) {
      conditions.push(`ac.user_id = $${i++}`);
      params.push(userId);
    }
    if (resolved !== undefined) {
      conditions.push(`ac.resolved = $${i++}`);
      params.push(resolved === 'true');
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const data = await db.query(
      `SELECT
        ac.*,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name
      FROM account_change ac
      LEFT JOIN gcf_user u ON ac.author_id = u.id
      ${whereClause}
      ORDER BY ac.last_modified DESC`,
      params
    );

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

    const updatedRow = await db.tx(async (t) => {
      const existingRows = await t.manyOrNone(
        'SELECT * FROM account_change WHERE id = $1 FOR UPDATE',
        [id]
      );
      const existing = existingRows[0];
      if (!existing) {
        return null;
      }

      const incomingResolved =
        resolved !== undefined ? resolved : existing.resolved;
      const wasUnresolved = !existing.resolved;
      const becomesResolved = wasUnresolved && incomingResolved === true;

      if (becomesResolved) {
        const selfInitiated =
          existing.user_id &&
          existing.author_id &&
          String(existing.user_id) === String(existing.author_id);
        const isUpdate = String(existing.change_type) === 'Update';

        if (selfInitiated && isUpdate) {
          const target = await t.oneOrNone(
            'SELECT role FROM gcf_user WHERE id = $1',
            [existing.user_id]
          );
          const targetIsPd =
            target && String(target.role) === 'Program Director';

          if (targetIsPd) {
            let authUser;
            try {
              authUser = await getAuthenticatedUser(req, res);
            } catch {
              throw new Error('RESOLVE_UNAUTHORIZED');
            }
            if (!RESOLVER_ROLES.has(String(authUser.role))) {
              throw new Error('RESOLVE_FORBIDDEN');
            }
            await applyPendingProgramDirectorProfile(t, existing);
          }
        }
      }

      const updated = await t.manyOrNone(
        `UPDATE account_change SET user_id = COALESCE($1, user_id),
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
      return updated[0] ?? null;
    });

    if (!updatedRow) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(keysToCamel(updatedRow));
  } catch (err) {
    if (err?.message === 'RESOLVE_UNAUTHORIZED') {
      return res.status(401).send('Unauthorized');
    }
    if (err?.message === 'RESOLVE_FORBIDDEN') {
      return res
        .status(403)
        .send(
          'Only an admin or regional director can approve this profile update.'
        );
    }
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
