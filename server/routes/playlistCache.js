import { keysToCamel } from '@/common/utils';
import express from 'express';

import { db } from '../db/db-pgp';

const playlistCacheRouter = express.Router();
playlistCacheRouter.use(express.json());

playlistCacheRouter.get('/:playlistId', async (req, res) => {
  const YOUTUBE_API_KEY = process.env.DEV_YOUTUBE_API_KEY;
  const allData = [];
  let nextPageToken = null;
  try {
    const { playlistId } = req.params;
    const cached = await db.query(
      `SELECT * FROM playlist_cache
            WHERE playlist_id = $1
            AND cache_time > NOW() - INTERVAL '24 hours'
            `,
      [playlistId]
    );
    if (cached.length > 0) {
      return res.json(cached[0].videos);
    }
    do {
        const youtubeRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}`: ''}`
        );
        if (!youtubeRes.ok) {
            return res.status(502).json({ error: 'Youtube API request failed' });
        }
        const data = await youtubeRes.json();
        if (data.error) {
            return res.status(502).json({error: data.error.message});
        }
        allData.push(...data.items);
        nextPageToken = data.nextPageToken;

    } while (nextPageToken);

    if (!allData || allData.length === 0) {
        return res
            .status(404)
            .json({ error: 'Empty playlist or playlist not found' });
    }

    const insert = await db.query(
      `INSERT INTO playlist_cache (playlist_id, videos, cache_time)
            VALUES ($1, $2, NOW())
            ON CONFLICT (playlist_id) DO UPDATE SET videos = $2, cache_time = NOW()
            RETURNING playlist_id
            `,
      [playlistId, JSON.stringify(allData)]
    );

    if (insert.length === 0) {
        return res.status(500).json({ error: 'Failed to cache playlist' });
    }
    return res.json(allData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

export { playlistCacheRouter };
