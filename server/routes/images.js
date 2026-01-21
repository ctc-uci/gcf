import express from "express";
import { getS3UploadURL, getS3ImageURL, deleteFromS3 } from "@/common/s3";

export const imagesRouter = express.Router();
imagesRouter.use(express.json());

/**
 * POST /images/upload-url
 * Generate a presigned URL for uploading an image directly to S3
 * Body: { fileName?: string, contentType?: string }
 * Returns: { uploadUrl: string, key: string, bucket: string }
 */
imagesRouter.post("/upload-url", async (req, res) => {
  try {
    const { fileName, contentType = "image/jpeg" } = req.body;

    const result = await getS3UploadURL(fileName, contentType);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error("Error generating upload URL:", err);
    res.status(500).json({
      success: false,
      error: "Failed to generate upload URL",
    });
  }
});

/**
 * GET /images/url/:key
 * Get a presigned URL for viewing/downloading an image
 * Params: key - S3 object key
 * Query: expiresIn (optional) - expiration time in seconds
 * Returns: { url: string }
 */
imagesRouter.get("/url/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const expiresIn = req.query.expiresIn
      ? parseInt(req.query.expiresIn as string)
      : 3600;

    // Decode the key in case it's URL encoded
    const decodedKey = decodeURIComponent(key);
    const url = getS3ImageURL(decodedKey, expiresIn);

    res.status(200).json({
      success: true,
      url,
      key: decodedKey,
    });
  } catch (err) {
    console.error("Error generating image URL:", err);
    res.status(500).json({
      success: false,
      error: "Failed to generate image URL",
    });
  }
});

/**
 * DELETE /images/:key
 * Delete an image from S3
 * Params: key - S3 object key
 * Returns: { success: boolean }
 */
imagesRouter.delete("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const decodedKey = decodeURIComponent(key);

    await deleteFromS3(decodedKey);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete image",
    });
  }
});
