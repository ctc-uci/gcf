import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';
import { deleteFromS3 } from '../common/s3';

const instrumentChangePhotoRouter = express.Router();
instrumentChangePhotoRouter.use(express.json());

instrumentChangePhotoRouter.post('/', async (req, res) => {
    try {
        const { instrument_change_id, s3_key, file_name, file_type } = req.body;

        if (!instrument_change_id || !s3_key || !file_name || !file_type) {
            return res.status(400).send('Missing required fields for media.');
        }

        if (isNaN(instrument_change_id)) {
            return res.status(400).send('Invalid ID format.');
        }

        const newInstrumentChangePhoto = await db.query(
            `INSERT INTO instrument_change_photo (instrument_change_id, s3_key, file_name, file_type) VALUES ($1, $2, $3, $4) RETURNING *`,
            [instrument_change_id, s3_key, file_name, file_type]
        );
        res.status(201).json(keysToCamel(newInstrumentChangePhoto[0]));
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

instrumentChangePhotoRouter.get('/instrument-change/:instrumentChangeId', async (req, res) => {
    try {
        const { instrumentChangeId } = req.params;
        const data = await db.query(
            `SELECT * FROM instrument_change_photo WHERE instrument_change_id = $1`,
            [instrumentChangeId]
        );
        res.status(200).json(keysToCamel(data));
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

instrumentChangePhotoRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).send('Invalid ID format.');
        }

        const deletedInstrumentChangePhoto = await db.query(
            `DELETE FROM instrument_change_photo WHERE id = $1 RETURNING *`,
            [id]
        );

        if (deletedInstrumentChangePhoto.length === 0) {
            return res.status(404).send('Instrument change photo not found');
        }

        await deleteFromS3(deletedInstrumentChangePhoto[0].s3_key);
        res.status(200).json(keysToCamel(deletedInstrumentChangePhoto[0]));
    }
    catch (err) {
        console.error(err)
        res.status(500).send('Internal Server Error');
    }
});

export { instrumentChangePhotoRouter };