import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

export function getCloudinary() {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    isConfigured = true;
  }
  return cloudinary;
}

export async function uploadImageToCloudinary(
  source: string,
  options?: { folder?: string; publicId?: string }
): Promise<{ url: string; publicId: string }> {
  const cld = getCloudinary();
  const folder = options?.folder || 'kigali-rentals';

  const result = await cld.uploader.upload(source, {
    folder,
    ...(options?.publicId ? { public_id: options.publicId, overwrite: true } : {}),
    resource_type: 'image',
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

