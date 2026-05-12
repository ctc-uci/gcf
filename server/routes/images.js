import express from 'express';
import { asyncHandler } from '@/common/utils';

import { deleteFromS3, getS3ImageURL, getS3UploadURL } from '../common/s3';
import { db } from '../db/db-pgp';

export const imagesRouter = express.Router();
imagesRouter.use(express.json());

/**
 * POST /images/upload-url
 * Generate a presigned URL for uploading an image directly to S3
 * Body: { fileName (optional), contentType (optional, defaults to "image/jpeg") }
 * Returns: { success: true, uploadUrl: string, key: string, bucket: string }
 */
imagesRouter.post('/upload-url', asyncHandler(async (req, res) => {
  const { fileName, contentType = 'image/jpeg' } = req.body;

  const result = await getS3UploadURL(fileName, contentType);

  res.status(200).json({
    success: true,
    ...result,
  });
}));

/**
 * GET /images/url/:key
 * Get a presigned URL for viewing/downloading an image
 * Params: key - S3 object key
 * Query: expiresIn (optional) - expiration time in seconds (default: 3600)
 * Returns: { success: true, url: string, key: string }
 */
imagesRouter.get('/url/:key', asyncHandler(async (req, res) => {
  const { key } = req.params;
  const expiresIn = req.query.expiresIn
    ? parseInt(req.query.expiresIn)
    : 3600;

  // Decode the key in case it's URL encoded
  const decodedKey = decodeURIComponent(key);
  const url = getS3ImageURL(decodedKey, expiresIn);

  res.status(200).json({
    success: true,
    url,
    key: decodedKey,
  });
}));

/**
 * DELETE /images/:key
 * Delete an image from S3
 * Params: key - S3 object key
 * Returns: { success: true, message: string }
 */
imagesRouter.delete('/:key', asyncHandler(async (req, res) => {
  const { key } = req.params;
  const decodedKey = decodeURIComponent(key);

  await deleteFromS3(decodedKey);

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
  });
}));

/**
 * POST /images/profile-picture
 * Add profile picture url to user column
 * Params: None
 * Returns: { success: true, message: string }
 */

imagesRouter.post('/profile-picture', asyncHandler(async (req, res) => {
  const { key, userId } = req.body;

  await db.none(`UPDATE gcf_user SET picture = $1 WHERE id = $2`, [
    key,
    userId,
  ]);

  res.status(200).json({ success: true });
}));
