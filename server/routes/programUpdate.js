import { keysToCamel } from '@/common/utils';
import { db } from '@/db/db-pgp';
import { json, Router } from 'express';

const programUpdateRouter = Router();
programUpdateRouter.use(json());

// Reading all program updates
programUpdateRouter.get('/', async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM program_update`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Reading a program update
programUpdateRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await db.query(
      `
            SELECT * FROM program_update 
            WHERE id = $1`,
      [id]
    );

    if (entry.length === 0) {
      return res.status(404).send('Program update not found');
    }

    res.status(200).json(keysToCamel(entry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Creating a program update
programUpdateRouter.post('/', async (req, res) => {
  const { title, program_id, created_by, update_date, note } = req.body;
  try {
    const newEntry = await db.query(
      `INSERT INTO program_update (title, program_id, created_by, update_date, note)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
      [title, program_id, created_by, update_date, note]
    );
    res.status(201).json(keysToCamel(newEntry[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Updating a program update
programUpdateRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, program_id, created_by, update_date, note } = req.body;

    const newProgramUpdate = await db.query(
      `UPDATE program_update SET
            title = COALESCE($1, title),
            program_id = COALESCE($2, program_id),
            created_by = COALESCE($3, created_by),
            update_date = COALESCE($4, update_date),
            note = COALESCE($5, note)
            WHERE id = $6
            RETURNING *`,
      [title, program_id, created_by, update_date, note, id]
    );

    if (newProgramUpdate.length === 0) {
      return res.status(404).send('Program update not found');
    }

    res.status(200).json(keysToCamel(newProgramUpdate[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Deleting a program update
programUpdateRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProgramUpdate = await db.query(
      `DELETE FROM program_update
            WHERE id = $1
            RETURNING *`,
      [id]
    );

    if (deletedProgramUpdate.length === 0) {
      return res.status(404).send('Program update not found');
    }

    res.status(200).json(keysToCamel(deletedProgramUpdate[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

export { programUpdateRouter };
