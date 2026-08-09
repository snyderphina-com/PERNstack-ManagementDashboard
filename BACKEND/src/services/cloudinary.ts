import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Upload a base64 or URL image to Cloudinary.
 * Returns the secure_url and public_id.
 */
export async function uploadImage(
  fileDataUri: string,
  folder = "snyder/avatars"
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder,
    resource_type: "image",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return {
    url:      result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Delete an image by its Cloudinary public_id.
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Generate a signed upload preset for direct browser → Cloudinary uploads.
 * This avoids sending the file through your server.
 */
export function generateSignedUploadParams(folder = "snyder/avatars") {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { folder, timestamp };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey:    process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
  };
}