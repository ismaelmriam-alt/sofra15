import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import useFetch from '../hooks/useFetch.js';
import { api } from '../api/client.js';
import DishCard from '../components/DishCard.jsx';
import DishModal from '../components/DishModal.jsx';
import SharedGroup from '../components/SharedGroup.jsx';
import { Reveal, WordReveal } from '../components/Reveal.jsx';
import { HeadingOrnament } from '../components/Ornaments.jsx';

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const active = params.get('category') || 'all';
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(null);

  const cats = useFetch(() => api.getCategories(), []);
  const dishes = useFetch(() => api.getDishes({ category: active === 'all' ? '' : active, search: debounced }), [active, debounced]);

  useEffect(() => { const t = setTimeout(() => setDebounced(query.trim()), 250); return () => clearTimeout(t); }, [query]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const current = useMemo(() => (cats.data || []).find((c) => c.slug === active), [cats.data, active]);
  const showGroups = active === 'all' && !debounced && Boolean(cats.data) && Boolean(dishes.data);
  const catById = useMemo(() => new Map((cats.data || []).map((c) => [c._id, c])), [cats.data]);
  const isShared = (d) => catById.get(d.category?._id)?.layout === 'shared';
  const cardDishes = (dishes.data || []).filter((d) => !isShared(d));
  const sharedGroups = (cats.data || []).filter((c) => c.layout === 'shared').map((c) => ({ c, items: (dishes.data || []).filter((d) => d.category?._id === c._id) })).filter((g) => g.items.length);
  const setCat = (slug) => setParams(slug === 'all' ? {} : { category: slug });

  return (
    <main className="menu-page">
      <header className="menu-head container">
        <HeadingOrnament />
        <p className="eyebrow">Our menu</p>
        <WordReveal as="h1" text={current ? current.name : 'Everything on the table'} key={current?.slug || 'all'} onMount />
        <AnimatePresence mode="wait">
          <motion.p key={current?.slug || 'all'} className="menu-sub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {current ? `${current.tagline} — ${current.description}` : 'Browse by course or search for a favourite.'}
          </motion.p>
        </AnimatePresence>
      </header>

      <div className="container menu-controls">
        <LayoutGroup>
          <div className="chips-bar" role="tablist" aria-label="Menu categories">
            {[{ _id: 'all', slug: 'all', name: 'All' }, ...(cats.data || [])].map((c) => (
              <button key={c._id} role="tab" aria-selected={active === c.slug} className={`cat-chip ${active === c.slug ? 'on' : ''}`} onClick={() => setCat(c.slug)}>
                {active === c.slug && <motion.span layoutId="chip-bg" className="chip-bg" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        <label className="search">
          <span className="sr-only">Search dishes</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" placeholder="Search dishes…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="container">
        {cats.error && <p className="warn">Couldn't load categories: {cats.error.message}</p>}
        {dishes.error && (
          <div className="state-box"><p className="warn">Couldn't load the menu: {dishes.error.message}</p><button className="btn btn-primary" onClick={dishes.reload}>Try again</button></div>
        )}
        {dishes.loading && !dishes.data && <div className="state-box"><span className="spinner" /><p className="muted">Loading the menu…</p></div>}
        {dishes.data && dishes.data.length === 0 && (
          <div className="state-box"><p className="serif big">No dishes found</p><p className="muted">Try another search or category.</p>
            <button className="btn btn-ghost" onClick={() => { setQuery(''); setCat('all'); }}>Clear filters</button></div>
        )}
        {showGroups ? (
          (cats.data || []).map((c, gi) => {
            const items = dishes.data.filter((d) => d.category?._id === c._id);
            if (!items.length) return null;
            return (
              <section key={c._id} className="menu-group" id={c.slug}>
                <Reveal className="group-head">
                  <span className="group-num">0{gi + 1}</span>
                  <div><h2>{c.name}</h2><p>{c.tagline}</p></div>
                </Reveal>
                {c.layout === 'shared' ? <SharedGroup category={c} items={items} /> : <div className="dish-grid">{items.map((d, i) => <DishCard key={d._id} dish={d} index={i} onOpen={setOpen} />)}</div>}
              </section>
            );
          })
        ) : (
          <>
            {cardDishes.length > 0 && (
              <motion.div layout className="dish-grid">
                <AnimatePresence mode="popLayout">
                  {cardDishes.map((d, i) => <DishCard key={d._id} dish={d} index={i} onOpen={setOpen} />)}
                </AnimatePresence>
              </motion.div>
            )}
            {sharedGroups.map(({ c, items }) => (
              <section key={c._id} className="menu-group" id={c.slug}>
                {active === 'all' && <Reveal className="group-head"><div><h2>{c.name}</h2><p>{c.tagline}</p></div></Reveal>}
                <SharedGroup category={c} items={items} />
              </section>
            ))}
          </>
        )}
      </div>
      <DishModal dish={open} onClose={() => setOpen(null)} />
    </main>
  );
}
