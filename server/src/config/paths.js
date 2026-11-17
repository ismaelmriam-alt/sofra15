import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Static images committed with the frontend; admin uploads are stored in Cloudinary.
export const IMAGES_DIR = path.resolve(here, '../../../client/public/assets/images');
