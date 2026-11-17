import crypto from 'crypto';
import { HttpError } from './errorHandler.js';

// Simple shared-secret protection for the admin API (Task 1 scope: no JWT, no user accounts).
// The admin password lives only in server/.env (ADMIN_PASSWORD); the browser sends it in the x-admin-key header.
const DEFAULT_PASSWORD = 'sofra2026';
export const usingDefaultPassword = () => {
  const password = process.env.ADMIN_PASSWORD;
  return !password || password === DEFAULT_PASSWORD || /^(your-|replace-with-)/i.test(password);
};
const adminPassword = () => process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;

const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();
export const isValidAdminKey = (key) => typeof key === 'string' && crypto.timingSafeEqual(digest(key), digest(adminPassword()));

export function requireAdmin(req, res, next) {
  if (!isValidAdminKey(req.get('x-admin-key'))) {
    return next(new HttpError(401, 'Admin access required. Please sign in at /admin.'));
  }
  next();
}

export async function adminLogin(req, res, next) {
  if (!isValidAdminKey(req.body?.password)) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return next(new HttpError(401, 'Incorrect admin password'));
  }
  res.json({ ok: true });
}
