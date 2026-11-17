import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import useFetch from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import { ConfirmDialog, Field, Modal, StateBlock, useToast } from './AdminUI.jsx';

const EMPTY = { name: '', nameAr: '', layout: 'cards', tagline: '', description: '', image: '', order: 0 };

function CategoryForm({ initial, onSaved, onClose }) {
  const toast = useToast();
  const editing = Boolean(initial?._id);
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const onFile = async (ev) => {
    const file = ev.target.files?.[0]; ev.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return setErrors((x) => ({ ...x, image: 'Choose a JPG, PNG, WebP or AVIF image' }));
    if (file.size > 5 * 1024 * 1024) return setErrors((x) => ({ ...x, image: 'Image is too large (max 5 MB)' }));
    setUploading(true);
    try { const { path } = await api.uploadDishImage(file); setForm((f) => ({ ...f, image: path })); setErrors((x) => ({ ...x, image: undefined })); toast('Photo uploaded'); }
    catch (err) { setErrors((x) => ({ ...x, image: err.message })); } finally { setUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.name.length > 60) errs.name = 'Max 60 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const payload = { name: form.name, nameAr: form.nameAr, layout: form.layout, tagline: form.tagline, description: form.description, image: form.image, order: Number(form.order) || 0 };
      const saved = editing ? await api.updateCategory(initial._id, payload) : await api.createCategory(payload);
      toast(editing ? 'Category updated' : 'Category created');
      onSaved(saved);
    } catch (err) {
      setErrors(err.details || {});
      toast(err.message, 'err');
    } finally { setBusy(false); }
  };

  return (
    <Modal title={editing ? 'Edit category' : 'New category'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="a-form">
        <Field label="Name *" error={errors.name}><input value={form.name} onChange={set('name')} autoFocus /></Field>
 <Field label="Arabic name" error={errors.nameAr}><input className="rtl-input" lang="ar" dir="rtl" value={form.nameAr} onChange={set('nameAr')} /></Field>
        <Field label="Layout" hint="Shared photo = one photo for the whole category with every item listed under it (used for Manakish and Shisha)."><select value={form.layout} onChange={set('layout')}><option value="cards">One photo per dish</option><option value="shared">One shared photo for all items</option></select></Field>
        <Field label="Tagline" error={errors.tagline}><input value={form.tagline} onChange={set('tagline')} placeholder="e.g. A Fresh Start" /></Field>
        <Field label="Description" error={errors.description}><textarea rows={3} value={form.description} onChange={set('description')} /></Field>
        <Field label="Category photo" hint="Upload a real photo (JPG, PNG, WebP, AVIF · max 5 MB) or paste an https:// link. Leave empty to show a text card." error={errors.image}>
          <span className="a-photo-row">
            <input value={form.image} onChange={set('image')} placeholder="/assets/images/categories/… or https://…" />
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onFile} hidden />
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload photo'}</button>
            {form.image && <button type="button" className="link-btn danger" onClick={() => setForm((f) => ({ ...f, image: '' }))}>Remove</button>}
          </span>
        </Field>
        <Field label="Sort order" error={errors.order}><input type="number" value={form.order} onChange={set('order')} /></Field>
        <div className="a-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save category'}</button></div>
      </form>
    </Modal>
  );
}

export default function CategoriesAdmin() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.getCategories(), []);
  const [editing, setEditing] = useState(null); // category | {} for new
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const doDelete = async () => {
    setBusy(true);
    try { await api.deleteCategory(deleting._id); toast(`Deleted "${deleting.name}"`); setDeleting(null); reload(); }
    catch (e) { toast(e.message, 'err'); setDeleting(null); }
    finally { setBusy(false); }
  };

  return (
    <>
      <header className="a-head row"><div><h1>Categories</h1><p className="muted">A category can only be deleted when it has no dishes.</p></div><button className="btn btn-primary" onClick={() => setEditing({})}>+ New category</button></header>
      <StateBlock loading={loading} error={error} onRetry={reload} empty={data && data.length === 0} emptyText="No categories yet." />
      {data && data.length > 0 && (
        <section className="a-card"><div className="a-table-wrap"><table className="a-table">
          <thead><tr><th>#</th><th>Name</th><th>Layout</th><th>Slug</th><th>Dishes</th><th /></tr></thead>
          <tbody>{data.map((c) => (
            <tr key={c._id}>
              <td data-label="Order">{c.order}</td><td data-label="Name"><strong>{c.name}</strong>{c.nameAr && <span className="a-ar" lang="ar" dir="rtl">{c.nameAr}</span>}</td><td data-label="Layout">{c.layout === 'shared' ? 'Shared photo' : 'Photo per dish'}</td><td data-label="Slug"><code>{c.slug}</code></td><td data-label="Dishes">{c.dishCount}</td>
              <td className="a-row-actions"><button className="link-btn" onClick={() => setEditing(c)}>Edit</button><button className="link-btn danger" onClick={() => setDeleting(c)}>Delete</button></td>
            </tr>))}</tbody>
        </table></div></section>
      )}
      <AnimatePresence>{editing && <CategoryForm key={editing._id || 'new'} initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}</AnimatePresence>
      <AnimatePresence>{deleting && <ConfirmDialog title="Delete category?" message={`"${deleting.name}" will be permanently removed.${deleting.dishCount ? ` It still has ${deleting.dishCount} dishes, so the server will refuse until they are moved or deleted.` : ''}`} busy={busy} onConfirm={doDelete} onCancel={() => setDeleting(null)} />}</AnimatePresence>
    </>
  );
}
