import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import FeaturedDishes from '../components/FeaturedDishes.jsx';
import CategoryShowcase from '../components/CategoryShowcase.jsx';
import TasteOfLebanon from '../components/TasteOfLebanon.jsx';
import Story from '../components/Story.jsx';
import FinalCTA from '../components/FinalCTA.jsx';
import { GeometricDivider } from '../components/Ornaments.jsx';
import useFetch from '../hooks/useFetch.js';
import { api } from '../api/client.js';

export default function Home() {
  const dishes = useFetch(() => api.getDishes(), []);
  const cats = useFetch(() => api.getCategories(), []);
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 300);
  }, [hash]);

  return (
    <>
      <Hero />
      <TasteOfLebanon dishes={dishes.data} />
      <GeometricDivider />
      <FeaturedDishes dishes={dishes.data} loading={dishes.loading} error={dishes.error} />
      <GeometricDivider flip />
      <CategoryShowcase categories={cats.data} loading={cats.loading} error={cats.error} />
      <GeometricDivider />
      <Story />
      <FinalCTA />
    </>
  );
}
