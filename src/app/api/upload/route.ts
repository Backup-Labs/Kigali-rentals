import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Support multipart/form-data file uploads
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files = formData.getAll('files');
      const singleFile = formData.get('file');
      const allFiles = [...files, ...(singleFile ? [singleFile] : [])].filter(
        (f): f is File => f instanceof File
      );

      if (allFiles.length === 0) {
        return NextResponse.json({ error: 'No files provided' }, { status: 400 });
      }

      const uploadedUrls: string[] = [];
      for (const file of allFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = file.type || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${base64}`;
        const result = await uploadImageToCloudinary(dataUri, {
          folder: 'kigali-rentals/uploads',
        });
        uploadedUrls.push(result.url);
      }

      return NextResponse.json({
        url: uploadedUrls[0],
        urls: uploadedUrls,
      });
    }

    // Support JSON body with { image } or { images } (base64 data URLs or remote URLs)
    const body = await req.json();
    const sources: string[] = Array.isArray(body.images)
      ? body.images
      : body.image
      ? [body.image]
      : [];

    if (sources.length === 0) {
      return NextResponse.json({ error: 'No image source provided' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    for (const src of sources) {
      if (typeof src === 'string' && src.includes('res.cloudinary.com')) {
        uploadedUrls.push(src);
        continue;
      }
      const result = await uploadImageToCloudinary(src, {
        folder: 'kigali-rentals/uploads',
      });
      uploadedUrls.push(result.url);
    }

    return NextResponse.json({
      url: uploadedUrls[0],
      urls: uploadedUrls,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cloudinary upload failed';
    console.error('[API /api/upload] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

