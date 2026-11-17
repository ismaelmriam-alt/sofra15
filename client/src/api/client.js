// Thin wrapper around fetch for the SOFRA REST API.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details || {};
  }
}

// Admin password lives only in this browser tab (sessionStorage) and is sent as x-admin-key.
const KEY_STORAGE = 'sofra_admin_key';
export const getAdminKey = () => { try { return sessionStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; } };
export const setAdminKey = (k) => { try { sessionStorage.setItem(KEY_STORAGE, k); } catch { /* ignore */ } };
export const clearAdminKey = () => { try { sessionStorage.removeItem(KEY_STORAGE); } catch { /* ignore */ } };

async function request(method, path, body, { formData } = {}) {
  let res;
  const key = getAdminKey();
  try {
    const headers = {};
    if (body && !formData) headers['Content-Type'] = 'application/json';
    if (key) headers['x-admin-key'] = key;
    res = await fetch(BASE + path, { method, headers, body: formData || (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new ApiError('Cannot reach the server. Please check that the backend is running.', 0);
  }
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (res.status === 401 && key && !path.startsWith('/admin/login')) window.dispatchEvent(new Event('sofra-admin-unauthorized'));
  if (!res.ok) throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.details);
  return data;
}

export const api = {
  // admin session + uploads
  adminLogin: (password) => request('POST', '/admin/login', { password }),
  adminVerify: () => request('GET', '/admin/verify'),
  uploadDishImage: (file) => { const f = new FormData(); f.append('image', file); return request('POST', '/uploads/dish-image', null, { formData: f }); },
  // categories
  getCategories: () => request('GET', '/categories'),
  createCategory: (d) => request('POST', '/categories', d),
  updateCategory: (id, d) => request('PUT', `/categories/${id}`, d),
  deleteCategory: (id) => request('DELETE', `/categories/${id}`),
  // dishes
  getDishes: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)).toString();
    return request('GET', `/dishes${q ? `?${q}` : ''}`);
  },
  getDish: (id) => request('GET', `/dishes/${id}`),
  createDish: (d) => request('POST', '/dishes', d),
  updateDish: (id, d) => request('PUT', `/dishes/${id}`, d),
  deleteDish: (id) => request('DELETE', `/dishes/${id}`),
  // orders
  createOrder: (d) => request('POST', '/orders', d),
  getOrders: () => request('GET', '/orders'),
  lookupOrder: (orderId) => request('GET', `/orders/lookup/${encodeURIComponent(orderId)}`),
  updateOrderStatus: (id, status) => request('PATCH', `/orders/${id}/status`, { status }),
  deleteOrder: (id) => request('DELETE', `/orders/${id}`),
  getStats: () => request('GET', '/orders/stats'),
};
