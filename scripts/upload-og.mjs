import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function uploadOgImages() {
  console.log('Uploading Open Graph images to Cloudinary with cloud:', process.env.CLOUDINARY_CLOUD_NAME);

  const resJpg = await cloudinary.uploader.upload('public/og-image.jpg', {
    folder: 'kigali-rentals/og',
    public_id: 'kigali-rentals-og-banner',
    overwrite: true,
    resource_type: 'image',
  });
  console.log('Uploaded OG JPG:', resJpg.secure_url);

  const resPng = await cloudinary.uploader.upload('public/og-image.png', {
    folder: 'kigali-rentals/og',
    public_id: 'kigali-rentals-og-banner-png',
    overwrite: true,
    resource_type: 'image',
  });
  console.log('Uploaded OG PNG:', resPng.secure_url);

  const resSquare = await cloudinary.uploader.upload('public/dark-white.jpeg', {
    folder: 'kigali-rentals/og',
    public_id: 'kigali-rentals-og-square',
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: 800, height: 800, crop: 'pad', background: '#000000' }
    ]
  });
  console.log('Uploaded OG Square:', resSquare.secure_url);
}

uploadOgImages().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});

