import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { HttpError } from '../middleware/errorHandler.js';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_FOLDER = 'sofra/uploads';

function cloudinaryCredentials() {
  const credentials = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };
  const missing = Object.entries(credentials)
    .filter(([, value]) => !value || /^(your-|replace-with-)/i.test(value))
    .map(([key]) => key);
  if (missing.length) throw new Error(`Missing Cloudinary environment variables: ${missing.join(', ')}`);
  return credentials;
}

function configureCloudinary() {
  cloudinary.config({ ...cloudinaryCredentials(), secure: true });
}

export function assertCloudinaryConfigured() {
  configureCloudinary();
}

const signatureOk = (buffer) =>
  (buffer[0] === 0xff && buffer[1] === 0xd8) ||
  (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) ||
  (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') ||
  buffer.subarray(4, 12).toString().includes('ftypavif');

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) =>
    IMAGE_TYPES.has(file.mimetype) ? cb(null, true) : cb(new HttpError(400, 'Only JPG, PNG, WebP or AVIF images are allowed')),
}).single('image');

function uploadToCloudinary(buffer, originalName) {
  try {
    configureCloudinary();
  } catch (error) {
    throw new HttpError(503, 'Image uploads are not configured on the server');
  }

  const base = originalName
    .replace(/\.[^.]*$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'image';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      public_id: `${UPLOAD_FOLDER}/upload-${base}-${randomUUID()}`,
      overwrite: false,
      resource_type: 'image',
    }, (error, result) => {
      if (error) {
        console.error('Cloudinary image upload failed:', error.message);
        reject(new HttpError(502, 'Image upload failed in Cloudinary'));
      } else if (!result?.secure_url) {
        console.error('Cloudinary image upload returned no secure URL');
        reject(new HttpError(502, 'Image storage returned an invalid response'));
      } else {
        resolve(result);
      }
    });

    stream.on('error', (error) => {
      console.error('Cloudinary image upload stream failed:', error.message);
      reject(new HttpError(502, 'Image upload failed in Cloudinary'));
    });
    Readable.from([buffer]).pipe(stream);
  });
}

export async function handleUpload(req, res) {
  if (!req.file) throw new HttpError(400, 'No image received. Choose a file first.');
  if (!signatureOk(req.file.buffer)) throw new HttpError(400, 'That file is not a valid image');

  const uploaded = await uploadToCloudinary(req.file.buffer, req.file.originalname);
  res.status(201).json({ path: uploaded.secure_url, size: req.file.size });
}

function uploadedImage(imageUrl) {
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') return null;

    const parts = url.pathname.split('/').filter(Boolean);
    if (!parts[0] || parts[1] !== 'image' || parts[2] !== 'upload') return null;
    const publicParts = parts.slice(3);
    if (/^v\d+$/.test(publicParts[0] || '')) publicParts.shift();
    const file = publicParts.pop();
    if (!file) return null;

    const publicId = [...publicParts, file.replace(/\.[^.]+$/, '')].join('/');
    return publicId.startsWith(`${UPLOAD_FOLDER}/upload-`) ? { cloudName: parts[0], publicId } : null;
  } catch {
    return null;
  }
}

export async function removeUploadedImage(imageUrl) {
  const uploaded = uploadedImage(imageUrl);
  if (!uploaded) return false;

  let credentials;
  try {
    credentials = cloudinaryCredentials();
  } catch (error) {
    console.error('Cloudinary image cleanup skipped:', error.message);
    return false;
  }

  if (uploaded.cloudName !== credentials.cloud_name) return false;

  try {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(uploaded.publicId, { resource_type: 'image' });
    if (!['ok', 'not found'].includes(result?.result)) {
      console.error(`Cloudinary did not delete uploaded image ${uploaded.publicId}: ${result?.result || 'unknown result'}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Cloudinary image cleanup failed for ${uploaded.publicId}:`, error.message);
    return false;
  }
}
