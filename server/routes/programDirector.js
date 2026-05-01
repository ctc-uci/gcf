import { keysToCamel } from '@/common/utils';
import { db } from '@/db/db-pgp'; // TODO: replace this db with
import { Router } from 'express';

const directorRouter = Router();

directorRouter.get('/me/:userId/program', async (req, res) => {
  try {
    const { userId } = req.params;
    const director = await db.query(
      'SELECT program_id, bio FROM program_director WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (!director?.length)
      return res.status(404).json({ error: 'Program director not found' });
    const program = await db.query('SELECT * FROM program WHERE id = $1', [
      director[0].program_id,
    ]);
    if (!program?.length)
      return res.status(404).json({ error: 'Program not found' });
    res.status(200).json(keysToCamel({...program[0], bio: director[0].bio}));
  } catch (err) {
    console.error('Error in /me/:userId/program:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

directorRouter.get('/me/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const director = await db.query(
      'SELECT program_id FROM program_director WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (!director?.length)
      return res.status(404).json({ error: 'Program director not found' });
    const programId = director[0].program_id;
    
    const stats = await db.query(
      `SELECT
          (SELECT COALESCE(SUM(ec.enrollment_change), 0) - COALESCE(SUM(ec.graduated_change), 0) FROM enrollment_change ec
           JOIN program_update pu ON pu.id = ec.update_id WHERE pu.program_id = $1 AND (pu.resolved = TRUE OR pu.show_on_table IS FALSE)) AS students,
          (SELECT COALESCE(SUM(ic.amount_changed), 0) FROM instrument_change ic
           JOIN program_update pu ON pu.id = ic.update_id WHERE pu.program_id = $1 AND (pu.resolved = TRUE OR pu.show_on_table IS FALSE)) AS instruments`,
      [programId]
    );
    const row = stats[0];
    res.status(200).json(keysToCamel(row));
  } catch (err) {
    console.error('Error in /me/:userId/stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

directorRouter.get('/me/:userId/media', async (req, res) => {
  try {
    const { userId } = req.params;
    const director = await db.query(
      'SELECT program_id FROM program_director WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (!director?.length)
      return res.status(404).json({ error: 'Program director not found' });
    const programId = director[0].program_id;
    const media = await db.query(
      `SELECT mc.* FROM media_change mc
             JOIN program_update pu ON pu.id = mc.update_id
             WHERE pu.program_id = $1
             ORDER BY mc.id DESC`,
      [programId]
    );
    res.status(200).json(keysToCamel(media));
  } catch (err) {
    console.error('Error in /me/:userId/media:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

directorRouter.get('/me/:userId/playlist', async (req, res) => {
  try {
    const { userId } = req.params;
    const director = await db.query(
      'SELECT program_id FROM program_director WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    if (!director?.length)
      return res.status(404).json({ error: 'Program director not found' });
    const programId = director[0].program_id;
    const playlists = await db.query(
      `SELECT * FROM playlist WHERE program_id = $1 ORDER BY name ASC`,
      [programId]
    );
    res.status(200).json(keysToCamel(playlists));
  } catch (err) {
    console.error('Error in /me/:userId/playlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get director's region
directorRouter.get('/me/:userId/region', async (req, res) => {
  try {
    const { userId } = req.params;
    const director = await db.query(
      'SELECT program_id FROM program_director WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (!director?.length)
      return res.status(404).json({ error: 'Program director not found' });
    const region = await db.query(
      `SELECT r.id
            FROM program AS p
            INNER JOIN country AS c ON p.country = c.id
            INNER JOIN region AS r ON c.region_id = r.id
            INNER JOIN program_director AS pd ON pd.program_id = p.id
            WHERE pd.user_id = $1;`,
      [director]
    );

    res.status(200).json(keysToCamel(region));
  } catch (err) {
    console.error('Error in /me/:userId/region:', err);
  }
});

// create program director
directorRouter.post('/', async (req, res) => {
  try {
    const { userId, programId } = req.body;

    const director = await db.query(
      'INSERT INTO program_director (user_id, program_id) VALUES ($1, $2) RETURNING *',
      [userId, programId]
    );

    res.status(200).json(keysToCamel(director));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// read all program directors
directorRouter.get('/', async (req, res) => {
  try {
    const directors = await db.query(
      `SELECT * FROM program_director ORDER BY user_id ASC`
    );

    res.status(200).json(keysToCamel(directors));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// read names of all program directors

directorRouter.get('/program-director-names', async (req, res) => {
  try {
    const director_names = await db.query(
      `SELECT gu.id AS user_id, gu.first_name, gu.last_name, gu.picture
       FROM gcf_user AS gu
       WHERE gu.role = 'Program Director'
       ORDER BY gu.first_name ASC, gu.last_name ASC`
    );

    res.status(200).json(keysToCamel(director_names));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// read one program director
directorRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const director = await db.query(
      'SELECT * FROM program_director WHERE user_id = $1',
      [userId]
    );

    res.status(200).json(keysToCamel(director));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// update a program director
directorRouter.put('/:userId', async (req, res) => {
  try {
    const { userId, programId } = req.body;

    const director = await db.query(
      'UPDATE program_director SET program_id = $2 WHERE user_id = $1 RETURNING *',
      [userId, programId]
    );

    res.status(200).json(keysToCamel(director));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

directorRouter.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio } = req.body;

    const director = await db.query(
      'UPDATE program_director SET bio = $2 WHERE user_id = $1 RETURNING *',
      [userId, bio]
    );

    if (!director?.length)
      return res.status(404).json({ error: 'Program director not found' });

    res.status(200).json(keysToCamel(director[0]));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// delete a program director assignment for one program (composite PK is user_id + program_id)
directorRouter.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const programId = req.query.programId;

    if (programId === undefined || programId === null || programId === '') {
      return res.status(400).json({
        error: 'programId query parameter is required',
      });
    }

    const director = await db.query(
      'DELETE FROM program_director WHERE user_id = $1 AND program_id = $2 RETURNING *',
      [userId, programId]
    );

    res.status(200).json(keysToCamel(director));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

export { directorRouter };