import { randomBytes } from 'crypto';

import { keysToCamel, asyncHandler } from '@/common/utils';
import express from 'express';

import { deleteFromS3 } from '../common/s3';
import { admin } from '../config/firebase';
import { db } from '../db/db-pgp';

const gcfUserRouter = express.Router();
gcfUserRouter.use(express.json());

gcfUserRouter.post('/', asyncHandler(async (req, res) => {
  const { id, role, first_name, last_name, created_by } = req.body;

  const newGcfUser = await db.query(
    `INSERT INTO gcf_user (id, role, first_name, last_name, created_by) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
    [id, role, first_name, last_name, created_by]
  );
  res.status(201).json(keysToCamel(newGcfUser[0]));
}));

gcfUserRouter.get('/admin/get-user/:targetUserId', asyncHandler(async (req, res) => {
  const { targetUserId } = req.params;
  const user = await admin.auth().getUser(targetUserId);
  res.status(200).json({
    email: user.email,
  });
}));

gcfUserRouter.post('/admin/create-user', asyncHandler(async (req, res) => {
  const {
    email,
    firstName,
    lastName,
    role,
    currentUserId,
    programId,
    regionId,
  } = req.body;

  const tempPassword = randomBytes(16).toString('hex');

  const userRecord = await admin.auth().createUser({
    email: email,
    password: tempPassword,
    displayName: `${firstName} ${lastName}`,
  });

  const firebaseUid = userRecord.uid;

  const newGcfUser = await db.query(
    `INSERT INTO gcf_user (id, role, first_name, last_name, created_by) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *`,
    [firebaseUid, role, firstName, lastName, currentUserId]
  );

  if (role === 'Program Director' && programId) {
    await db.query(
      `INSERT INTO program_director (user_id, program_id) 
      VALUES ($1, $2)`,
      [firebaseUid, programId]
    );
  }

  if (role === 'Regional Director' && regionId) {
    await db.query(
      `INSERT INTO regional_director (user_id, region_id) 
      VALUES ($1, $2)`,
      [firebaseUid, regionId]
    );
  }

  res.status(201).json({
    uid: firebaseUid,
    user: keysToCamel(newGcfUser[0]),
    message: 'User created successfully',
  });
}));

gcfUserRouter.put('/admin/update-user', asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    targetId,
    programId,
    regionId,
  } = req.body;

  await admin.auth().updateUser(targetId, {
    ...(email && { email }),
    ...(password && { password }),
    displayName: `${firstName} ${lastName}`,
  });

  const oldRoleResponse = await db.query(
    `SELECT role FROM gcf_user WHERE id = $1`,
    [targetId]
  );

  if (!oldRoleResponse[0]) {
    return res.status(404).json({ error: 'User not found' });
  }

  const oldRole = oldRoleResponse[0].role;

  const updatedGcfUser = await db.query(
    `UPDATE gcf_user SET 
      role =  COALESCE($1, role),
      first_name = COALESCE($2, first_name),
      last_name = COALESCE($3, last_name)
      WHERE id = $4
      RETURNING *;`,
    [role, firstName, lastName, targetId]
  );

  if (role !== oldRole) {
    if (oldRole === 'Program Director') {
      await db.query(
        `DELETE FROM program_director WHERE user_id = $1 RETURNING *`,
        [targetId]
      );
    }
    else if (oldRole === 'Regional Director') {
      await db.query(
        `DELETE FROM regional_director WHERE user_id = $1 RETURNING *`,
        [targetId]
      );
    }

    if (role === 'Program Director' && programId) {
      await db.query(
        `INSERT INTO program_director (user_id, program_id) 
        VALUES ($1, $2)`,
        [targetId, programId]
      );
    }
    if (role === 'Regional Director' && regionId) {
      await db.query(
        `INSERT INTO regional_director (user_id, region_id) 
        VALUES ($1, $2)`,
        [targetId, regionId]
      );
    }
  } else {
    if (role === 'Program Director' && programId) {
      await db.query(`DELETE FROM program_director WHERE user_id = $1`, [
        targetId,
      ]);
      await db.query(
        `INSERT INTO program_director (user_id, program_id) 
        VALUES ($1, $2)`,
        [targetId, programId]
      );
    }
    else if (role === 'Regional Director' && regionId) {
      await db.query(`DELETE FROM regional_director WHERE user_id = $1`, [
        targetId,
      ]);
      await db.query(
        `INSERT INTO regional_director (user_id, region_id) 
        VALUES ($1, $2)`,
        [targetId, regionId]
      );
    }
  }

  res.status(200).json({
    uid: targetId,
    user: keysToCamel(updatedGcfUser[0]),
    message: 'User updated successfully',
  });
}));

gcfUserRouter.get('/', asyncHandler(async (req, res) => {
  const data = await db.query(`SELECT * FROM gcf_user`);
  res.status(200).json(keysToCamel(data));
}));

gcfUserRouter.get('/role/:role', asyncHandler(async (req, res) => {
  const { role } = req.params;
  const gcfUser = await db.query(
    `SELECT ALL * FROM gcf_user WHERE role = $1`,
    [role]
  );

  if (gcfUser.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(gcfUser));
}));

gcfUserRouter.get('/:id/accounts', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.query;

  let accounts;

  if (role === 'Super Admin') {
    accounts = await db.query(
      `SELECT
        u.id,
        u.first_name,
        u.last_name,
        COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS region,
        u.role,
        u.picture,
        cb.picture AS created_by_picture,
        MAX(TRIM(CONCAT_WS(' ', cb.first_name, cb.last_name))) AS created_by_name,
        COALESCE(
          array_cat(
            COALESCE(
              array_agg(DISTINCT p_rd.name) FILTER (WHERE p_rd.id IS NOT NULL),
              '{}'
            ),
            COALESCE(
              array_agg(DISTINCT p_pd.name) FILTER (WHERE p_pd.id IS NOT NULL),
              '{}'
            )
          ),
          '{}'
        ) AS programs
      FROM gcf_user u
      LEFT JOIN regional_director rd ON u.id = rd.user_id
      LEFT JOIN country c ON rd.region_id = c.region_id
      LEFT JOIN region r ON rd.region_id = r.id
      LEFT JOIN program p_rd ON c.id = p_rd.country
      LEFT JOIN program_director pd ON u.id = pd.user_id
      LEFT JOIN program p_pd ON pd.program_id = p_pd.id
      LEFT JOIN gcf_user cb ON cb.id = u.created_by
      GROUP BY u.id, u.first_name, u.last_name, u.role, u.picture, cb.picture
      ORDER BY u.last_name ASC`
    );
  }

  else if (role === 'Admin') {
    accounts = await db.query(
      `SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        u.picture,
        COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS region,
        cb.picture AS created_by_picture,
        MAX(TRIM(CONCAT_WS(' ', cb.first_name, cb.last_name))) AS created_by_name,
        COALESCE(
          array_cat(
            COALESCE(
              array_agg(DISTINCT p_rd.name) FILTER (WHERE p_rd.id IS NOT NULL),
              '{}'
            ),
            COALESCE(
              array_agg(DISTINCT p_pd.name) FILTER (WHERE p_pd.id IS NOT NULL),
              '{}'
            )
          ),
          '{}'
        ) AS programs
      FROM gcf_user u
      LEFT JOIN regional_director rd ON u.id = rd.user_id
      LEFT JOIN country c ON rd.region_id = c.region_id
      LEFT JOIN program p_rd ON c.id = p_rd.country
      LEFT JOIN program_director pd ON u.id = pd.user_id
      LEFT JOIN program p_pd ON pd.program_id = p_pd.id
      LEFT JOIN gcf_user cb ON cb.id = u.created_by
      LEFT JOIN region r ON rd.region_id = r.id
      WHERE u.role = 'Regional Director' OR u.role = 'Program Director'
      GROUP BY u.id, u.first_name, u.last_name, u.role, u.picture, cb.picture
      ORDER BY u.last_name ASC`
    );
  }
  else if (role === 'Regional Director') {
    accounts = await db.query(
      `SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        u.picture,
        cb.picture AS created_by_picture,
        MAX(TRIM(CONCAT_WS(' ', cb.first_name, cb.last_name))) AS created_by_name,
        COALESCE(
          array_agg(DISTINCT p.name) FILTER (WHERE p.id IS NOT NULL),
          '{}'
        ) AS programs
      FROM regional_director rd
      JOIN country c ON rd.region_id = c.region_id
      JOIN program p ON c.id = p.country
      JOIN program_director pd ON p.id = pd.program_id
      JOIN gcf_user u ON pd.user_id = u.id
      LEFT JOIN gcf_user cb ON cb.id = u.created_by
      WHERE rd.user_id = $1
      GROUP BY u.id, u.first_name, u.last_name, u.role, u.picture, cb.picture
      ORDER BY u.last_name ASC`,
      [id]
    );
  }

  if (accounts?.length > 0) {
    const auth = admin.auth();
    const identifiers = accounts.map((row) => ({ uid: row.id }));
    const batchSize = 100;
    const emailByUid = {};
    for (let i = 0; i < identifiers.length; i += batchSize) {
      const chunk = identifiers.slice(i, i + batchSize);
      const result = await auth.getUsers(chunk);
      for (const user of result.users) {
        emailByUid[user.uid] = user.email ?? null;
      }
    }
    accounts = accounts.map((row) => ({
      ...row,
      email: emailByUid[row.id] ?? null,
    }));
  }

  res.status(200).json(keysToCamel(accounts));
}));

const ALLOWED_PREFERRED_LANGUAGES = new Set(['en', 'es', 'fr', 'zh']);

function normalizePreferredLanguage(raw) {
  if (raw === null) return '';
  const s = String(raw).trim().toLowerCase();
  return s;
}

gcfUserRouter.patch('/:id/preferred-language', asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const tokenUid = res.locals.decodedToken?.uid;
  if (tokenUid !== null && tokenUid !== id) {
    return res.status(403).json({
      error: "Cannot change another user's language preference",
    });
  }

  const lang = normalizePreferredLanguage(
    req.body.preferredLanguage ?? req.body.preferred_language
  );
  if (!ALLOWED_PREFERRED_LANGUAGES.has(lang)) {
    return res.status(400).json({
      error: 'Invalid preferredLanguage',
      allowed: [...ALLOWED_PREFERRED_LANGUAGES],
    });
  }

  const updated = await db.query(
    `UPDATE gcf_user SET preferred_language = $1 WHERE id = $2 RETURNING *`,
    [lang, id]
  );
  if (updated.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(keysToCamel(updated[0]));
}));

gcfUserRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const gcfUser = await db.query(
    `SELECT u.*, COALESCE(array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS region
     FROM gcf_user u
     LEFT JOIN regional_director rd ON u.id = rd.user_id
     LEFT JOIN region r ON rd.region_id = r.id
     WHERE u.id = $1
     GROUP BY u.id`,
    [id]
  );

  if (gcfUser.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(gcfUser[0]));
}));

gcfUserRouter.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, first_name, last_name } = req.body;
  const updatedGcfUser = await db.query(
    `UPDATE gcf_user SET
      role = COALESCE($1, role),
      first_name = COALESCE($2, first_name),
      last_name = COALESCE($3, last_name)    
      WHERE id = $4
      RETURNING *;`,
    [role, first_name, last_name, id]
  );

  if (updatedGcfUser.length === 0) {
    return res.status(404).send('Item not found');
  }

  res.status(200).json(keysToCamel(updatedGcfUser[0]));
}));

gcfUserRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedRow = await db.tx(async (t) => {
    const existing = await t.oneOrNone(
      `SELECT id FROM gcf_user WHERE id = $1`,
      [id]
    );
    if (!existing) {
      return null;
    }

    await t.none(`DELETE FROM program_director WHERE user_id = $1`, [id]);
    await t.none(`DELETE FROM regional_director WHERE user_id = $1`, [id]);

    const deletedGcfUser = await t.any(
      `DELETE FROM gcf_user WHERE id = $1 RETURNING *`,
      [id]
    );
    return deletedGcfUser[0] ?? null;
  });

  if (!deletedRow) {
    return res.status(404).send('Item not found');
  }

  const pictureKey =
    typeof deletedRow.picture === 'string' ? deletedRow.picture.trim() : '';
  if (pictureKey) {
    try {
      await deleteFromS3(pictureKey);
    } catch (s3Err) {
      console.error('S3 delete profile picture:', s3Err);
    }
  }

  let firebaseAuthDeleted = true;
  try {
    await admin.auth().deleteUser(id);
  } catch (firebaseErr) {
    if (firebaseErr.code === 'auth/user-not-found') {
      firebaseAuthDeleted = true;
    } else {
      firebaseAuthDeleted = false;
      console.error('Firebase deleteUser:', firebaseErr);
    }
  }

  if (!firebaseAuthDeleted) {
    return res.status(503).json({
      error:
        'Database user was deleted but Firebase authentication could not be removed.',
      gcfUserDeleted: true,
      firebaseAuthDeleted: false,
      user: keysToCamel(deletedRow),
    });
  }

  res.status(200).json(keysToCamel(deletedRow));
}));

gcfUserRouter.post('/verify-email', asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    await admin.auth().getUserByEmail(email);
    res.status(200).send();
  } catch (err) {
    res.status(400).send(err.message);
  }
}));

export { gcfUserRouter };
