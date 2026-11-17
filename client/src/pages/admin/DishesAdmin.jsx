import { useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import useFetch from '../../hooks/useFetch.js';
import { api } from '../../api/client.js';
import SmoothImage from '../../components/SmoothImage.jsx';
import { money } from '../../utils/format.js';
import { ConfirmDialog, Field, Modal, StateBlock, useToast } from './AdminUI.jsx';

const EMPTY = { name: '', nameAr: '', description: '', price: '', category: '', ingredients: '', image: '', isAvailable: true, isFeatured: false, customizations: [] };

function DishForm({ initial, categories, onSaved, onClose }) {
  const toast = useToast();
  const editing = Boolean(initial?._id);
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...initial,
    category: initial?.category?._id || initial?.category || categories[0]?._id || '',
    ingredients: (initial?.ingredients || []).join(', '),
    customizations: (initial?.customizations || []).map((c) => ({ label: c.label, price: c.price })),
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm((f) => ({ ...f, [k]: v })); setErrors((x) => ({ ...x, [k]: undefined })); };
  const setCust = (i, k, v) => setForm((f) => ({ ...f, customizations: f.customizations.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    const p = Number(form.price);
    if (form.price === '' || Number.isNaN(p) || p <= 0) e.price = 'Enter a price greater than 0';
    if (!form.category) e.category = 'Choose a category';
    if (form.image && !/^(https?:\/\/\S+|\/assets\/images\/[\w\-./]+)$/i.test(form.image.trim())) e.image = 'Upload a photo, or paste a full https:// URL';
    if (form.customizations.some((c) => !c.label.trim())) e.customizations = 'Every option needs a label';
    return e;
  };

  const onFile = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return setErrors((x) => ({ ...x, image: 'Choose a JPG, PNG, WebP or AVIF image' }));
    if (file.size > 5 * 1024 * 1024) return setErrors((x) => ({ ...x, image: 'Image is too large (max 5 MB)' }));
    setUploading(true);
    try {
      const { path } = await api.uploadDishImage(file);
      setForm((f) => ({ ...f, image: path }));
      setErrors((x) => ({ ...x, image: undefined }));
      toast('Photo uploaded');
    } catch (err) {
      setErrors((x) => ({ ...x, image: err.message }));
    } finally { setUploading(false); }
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const payload = {
        name: form.name, nameAr: form.nameAr, description: form.description, price: Number(form.price), category: form.category,
        ingredients: form.ingredients, image: form.image.trim(), isAvailable: form.isAvailable, isFeatured: form.isFeatured,
        customizations: form.customizations.map((c) => ({ label: c.label.trim(), price: Number(c.price) || 0 })),
      };
      const saved = editing ? await api.updateDish(initial._id, payload) : await api.createDish(payload);
      toast(editing ? 'Dish updated' : 'Dish created');
      onSaved(saved);
    } catch (err) {
      setErrors(err.details || {});
      toast(err.message, 'err');
    } finally { setBusy(false); }
  };

  return (
    <Modal title={editing ? `Edit ${initial.name}` : 'New dish'} onClose={onClose} wide>
      <form onSubmit={submit} noValidate className="a-form two-col">
        <Field label="Name *" error={errors.name}><input value={form.name} onChange={set('name')} autoFocus /></Field>
        <Field label="Arabic name" hint="e.g. حمص" error={errors.nameAr}><input className="rtl-input" lang="ar" dir="rtl" value={form.nameAr} onChange={set('nameAr')} /></Field>
        <Field label="Price (USD) *" hint={initial?.pricePlaceholder ? 'Placeholder price: change it and save to confirm the real price.' : undefined} error={errors.price}><input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} /></Field>
        <Field label="Category *" error={errors.category}>
          <select value={form.category} onChange={set('category')}>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
        </Field>
        {categories.find((c) => c._id === form.category)?.layout === 'shared' ? (
          <p className="span-2 muted a-note">This category uses <strong>one shared photo</strong> for all its items. Change it in Categories → Edit.</p>
        ) : (
        <div className="span-2 a-photo">
          <Field label="Dish photo" hint="Upload a real photo (JPG, PNG, WebP, AVIF · max 5 MB), or paste an https:// link." error={errors.image}>
            <span className="a-photo-row">
              <input value={form.image} onChange={set('image')} placeholder="/assets/images/dishes/… or https://…" />
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onFile} hidden />
              <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload photo'}</button>
              {form.image && <button type="button" className="link-btn danger" onClick={() => setForm((f) => ({ ...f, image: '' }))}>Remove</button>}
            </span>
          </Field>
        </div>
        )}
        <div className="span-2"><Field label="Description *" error={errors.description}><textarea rows={3} maxLength={500} value={form.description} onChange={set('description')} /></Field></div>
        <div className="span-2"><Field label="Ingredients" hint="Comma-separated" error={errors.ingredients}><input value={form.ingredients} onChange={set('ingredients')} placeholder="Chickpeas, Tahini, Lemon" /></Field></div>
        <div className="span-2 a-opts">
          <div className="a-opts-head"><strong>Customization options (optional)</strong><button type="button" className="link-btn" onClick={() => setForm((f) => ({ ...f, customizations: [...f.customizations, { label: '', price: 0 }] }))}>+ Add option</button></div>
          {errors.customizations && <small className="field-error">{errors.customizations}</small>}
          {form.customizations.map((c, i) => (
            <div className="a-opt-row" key={i}>
              <input aria-label="Option label" placeholder="e.g. Extra garlic" value={c.label} onChange={(e) => setCust(i, 'label', e.target.value)} />
              <input aria-label="Extra price" type="number" step="0.01" min="0" value={c.price} onChange={(e) => setCust(i, 'price', e.target.value)} />
              <button type="button" className="link-btn danger" onClick={() => setForm((f) => ({ ...f, customizations: f.customizations.filter((_, idx) => idx !== i) }))}>Remove</button>
            </div>
          ))}
        </div>
        <label className="a-check"><input type="checkbox" checked={form.isAvailable} onChange={set('isAvailable')} /> Available to order</label>
        <label className="a-check"><input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} /> Featured on homepage</label>
        <div className="span-2 a-preview"><SmoothImage src={form.image} alt="Preview" name={form.name || 'Image preview'} /></div>
        <div className="a-actions span-2"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save dish'}</button></div>
      </form>
    </Modal>
  );
}

export default function DishesAdmin() {
  const toast = useToast();
  const dishes = useFetch(() => api.getDishes(), []);
  const cats = useFetch(() => api.getCategories(), []);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const shown = useMemo(() => (dishes.data || []).filter((d) => (!catFilter || d.category?._id === catFilter) && d.name.toLowerCase().includes(filter.toLowerCase())), [dishes.data, filter, catFilter]);

  const doDelete = async () => {
    setBusy(true);
    try { await api.deleteDish(deleting._id); toast(`Deleted "${deleting.name}"`); setDeleting(null); dishes.reload(); }
    catch (e) { toast(e.message, 'err'); } finally { setBusy(false); }
  };
  const toggle = async (d, field) => {
    try { await api.updateDish(d._id, { [field]: !d[field] }); dishes.reload(); toast('Saved'); } catch (e) { toast(e.message, 'err'); }
  };

  return (
    <>
      <header className="a-head row"><div><h1>Dishes</h1><p className="muted">{dishes.data ? `${dishes.data.length} dishes` : ''}</p></div>
        <button className="btn btn-primary" disabled={!cats.data?.length} onClick={() => setEditing({})}>+ New dish</button></header>
      {cats.data && cats.data.length === 0 && <p className="warn">Create a category first — dishes must belong to one.</p>}
      <div className="a-toolbar">
        <input placeholder="Filter by name…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter dishes" />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} aria-label="Filter by category"><option value="">All categories</option>{(cats.data || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
      </div>
      <StateBlock loading={dishes.loading && !dishes.data} error={dishes.error} onRetry={dishes.reload} empty={dishes.data && shown.length === 0} emptyText="No dishes match." />
      {shown.length > 0 && (
        <section className="a-card"><div className="a-table-wrap"><table className="a-table">
          <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Featured</th><th /></tr></thead>
          <tbody>{shown.map((d) => (
            <tr key={d._id}>
              <td data-label="Image"><SmoothImage src={d.image} alt={d.name} name={d.name} className="a-thumb" /></td>
              <td data-label="Name"><strong>{d.name}</strong>{d.nameAr && <span className="a-ar" lang="ar" dir="rtl">{d.nameAr}</span>}</td><td data-label="Category">{d.category?.name}</td><td data-label="Price">{money(d.price)}{d.pricePlaceholder && <span className="a-ph" title="Placeholder price: edit to confirm">placeholder</span>}</td>
              <td data-label="Available"><button className={`pill ${d.isAvailable ? 'delivered' : 'pending'}`} onClick={() => toggle(d, 'isAvailable')}>{d.isAvailable ? 'Available' : 'Unavailable'}</button></td>
              <td data-label="Featured"><button className={`pill ${d.isFeatured ? 'preparing' : 'off'}`} onClick={() => toggle(d, 'isFeatured')}>{d.isFeatured ? 'Featured' : 'No'}</button></td>
              <td className="a-row-actions"><button className="link-btn" onClick={() => setEditing(d)}>Edit</button><button className="link-btn danger" onClick={() => setDeleting(d)}>Delete</button></td>
            </tr>))}</tbody>
        </table></div></section>
      )}
      <AnimatePresence>{editing && cats.data && <DishForm key={editing._id || 'new'} initial={editing} categories={cats.data} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); dishes.reload(); }} />}</AnimatePresence>
      <AnimatePresence>{deleting && <ConfirmDialog title="Delete dish?" message={`"${deleting.name}" will be permanently removed from the menu.`} busy={busy} onConfirm={doDelete} onCancel={() => setDeleting(null)} />}</AnimatePresence>
    </>
  );
}
