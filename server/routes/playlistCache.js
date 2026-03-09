import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const playlistCacheRouter = express.Router();
playlistCacheRouter.use(express.json());

const YOUTUBE_API_KEY = process.env.DEV_YOUTUBE_API_KEY;

playlistCacheRouter.get('/:playlistId', async (req, res) => {
    try {
        const {playlistId} = req.params;
        const cached = await db.query(
            `SELECT * FROM playlist_cache
            WHERE playlist_id = $1
            AND cache_time > NOW() - INTERVAL '24 hours'
            `,
            [playlistId]
        );

        if (cached.rows) {
            return res.json(cached.rows[0].videos);
        }

        const youtubeRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=10&key=${YOUTUBE_API_KEY}`
        );
        const data = await youtubeRes.json();

        await db.query(
            `INSERT INTO playlist_cache (playlist_id, videos, cache_time)
            VALUES ($1, $2, NOW())
            ON CONFLICT (playlist_id) DO UPDATE SET videos = $2, cache_time = NOW()
            `,
            [playlistId, JSON.stringify(data.items)]
        );

        return res.json(data.items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
    


})

export { playlistCacheRouter }