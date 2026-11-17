import 'dotenv/config';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { usingDefaultPassword } from './middleware/auth.js';
import { assertCloudinaryConfigured } from './controllers/uploadController.js';

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  if (usingDefaultPassword()) {
    console.error('ADMIN_PASSWORD must be set to a strong, unique value in production.');
    process.exit(1);
  }
  try {
    assertCloudinaryConfigured();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

try {
  await connectDB();
} catch (err) {
  console.error('\n✖ Could not connect to MongoDB:', err.message);
  console.error('  Check that MongoDB is running and MONGODB_URI in server/.env is correct.\n');
  process.exit(1);
}

if (usingDefaultPassword()) console.warn('⚠ ADMIN_PASSWORD is unset or still a placeholder. Set a unique value before sharing the site.');

createApp().listen(PORT, () => console.log(`SOFRA API running on http://localhost:${PORT}/api`));
