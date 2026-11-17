import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { HttpError, notFound, errorHandler } from './middleware/errorHandler.js';
import { IMAGES_DIR } from './config/paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(
    (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      callback(new HttpError(403, 'Origin not allowed by CORS'));
    },
    allowedHeaders: ['Content-Type', 'x-admin-key'],
  }));
  app.use(express.json({ limit: '200kb' }));

  // Serve static photos bundled with the frontend; admin uploads use Cloudinary.
  app.use('/assets/images', express.static(IMAGES_DIR));

  app.use('/api', routes);
  app.use('/api', notFound);

  // Optional: serve the built React app from Express (npm run build in /client)
  const dist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
