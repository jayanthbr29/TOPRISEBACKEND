const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Load from env or config
// const REGION = process.env.AWS_REGION;
const REGION = "eu-north-1"; // Example region, replace with your actual region
// const BUCKET = process.env.AWS_BUCKET_NAME;
const BUCKET = "toprisebucket";

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: "AKIAXVDSWFZ2PGB4F2PE",
    secretAccessKey: "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",
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Upload File Buffer to S3
// ✅ FIXED: Return object with Location (to match category controller usage)
const uploadFile = async (buffer, originalName, mimeType, folder = "") => {
  const ext = path.extname(originalName);
  const key = `${folder}/${uuidv4()}${ext}`;

  const uploadParams = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: "public-read", // 👈 make file publicly accessible
  };

  await s3.send(new PutObjectCommand(uploadParams));

  // 👇 Return consistent format
  return {
    Location: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`,
    Key: key,
  };
};

// ✅ Delete file from S3
const deleteFile = async (fileKey) => {
  const deleteParams = {
    Bucket: BUCKET,
    Key: fileKey,
  };
  await s3.send(new DeleteObjectCommand(deleteParams));
};

// ✅ Generate Pre-signed URL (optional)
const generatePresignedUploadUrl = async (key, mimeType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};

module.exports = {
  uploadFile,
  deleteFile,
  generatePresignedUploadUrl,
};
