// TODO: keep file only if using s3 file upload

import crypto from 'crypto';

import aws from 'aws-sdk';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config();

const region =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_S3_REGION
    : process.env.PROD_S3_REGION;
const accessKeyId =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_S3_ACCESS_KEY_ID
    : process.env.PROD_S3_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_S3_SECRET_ACCESS_KEY
    : process.env.PROD_S3_SECRET_ACCESS_KEY;

const bucketName =
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_S3_BUCKET_NAME
    : process.env.PROD_S3_BUCKET_NAME;

// Initialize S3 instance
const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4',
});

/**
 * Generate a presigned URL for uploading an image directly from the client
 * @param fileName - Optional custom file name, otherwise generates random name
 * @param contentType - MIME type of the file (e.g., 'image/jpeg', 'image/png')
 * @param expiresIn - URL expiration time in seconds (default: 300 = 5 minutes)
 * @returns Object with uploadUrl and key (S3 object key)
 */
const getS3UploadURL = async (
  fileName?: string,
  contentType: string = 'image/jpeg',
  expiresIn: number = 300
) => {
  // Generate a unique name for image if not provided
  const imageName = fileName || `${crypto.randomBytes(16).toString('hex')}.jpg`;

  // Set up S3 params
  const params = {
    Bucket: bucketName,
    Key: imageName,
    ContentType: contentType,
    Expires: expiresIn,
  };

  // Get a presigned URL for PUT operation
  const uploadURL = s3.getSignedUrl('putObject', params);

  return {
    uploadUrl: uploadURL,
    key: imageName,
    bucket: bucketName,
  };
};

/**
 * Get a presigned URL for viewing/downloading an image
 * @param key - S3 object key (file name/path)
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL string
 */
const getS3ImageURL = (key: string, expiresIn: number = 3600): string => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expiresIn,
  };

  return s3.getSignedUrl('getObject', params);
};

/**
 * Upload a file buffer directly to S3 (server-side upload)
 * @param buffer - File buffer
 * @param key - S3 object key (file name/path)
 * @param contentType - MIME type of the file
 * @returns S3 upload result
 */
const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string = 'image/jpeg'
) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  return s3.upload(params).promise();
};

/**
 * Delete an object from S3
 * @param key - S3 object key (file name/path)
 * @returns S3 delete result
 */
const deleteFromS3 = async (key: string) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  return s3.deleteObject(params).promise();
};

export { s3, getS3UploadURL, getS3ImageURL, uploadToS3, deleteFromS3 };
