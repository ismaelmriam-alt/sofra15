import { Reveal, MaskReveal, WordReveal } from './Reveal.jsx';
import SmoothImage from './SmoothImage.jsx';
import { HeadingOrnament } from './Ornaments.jsx';
import Decor from './Decor.jsx';
import { PHOTOS } from '../config/photos.js';

const VALUES = [
  ['Hospitality first', 'A guest is never a customer. Someone always pulls up another chair.'],
  ['Made to be shared', 'Mezza is meant to travel across the table, from hand to hand.'],
  ['Recipes with memory', 'Slow-cooked, hand-rolled and seasoned the way it was done at home.'],
];

export default function Story() {
  const hasPhoto = Boolean(PHOTOS.story.src);
  return (
    <section className="story" id="story">
      <Decor kind="jug" size={58} className="story-decor" depth={34} delay={0.4} />
      <div className={`container story-grid ${hasPhoto ? '' : 'no-photo'}`}>
        {hasPhoto && (
          <MaskReveal className="story-media" direction="left">
            <SmoothImage src={PHOTOS.story.src} alt={PHOTOS.story.alt} name="Our story" />
          </MaskReveal>
        )}
        <div className="story-copy">
          <HeadingOrnament />
          <p className="eyebrow">Our story</p>
          <WordReveal text="Every meal begins with “Tfaddal”" />
          <Reveal as="p" delay={0.1}>
            In Lebanon, food is how we say welcome. SOFRA was imagined as that table: a place where plates arrive in the middle, conversation stretches past dessert, and nobody leaves hungry.
          </Reveal>
          <Reveal as="p" delay={0.2}>
            Our menu keeps to the dishes families have cooked for generations, from a cool plate of hummus to a bubbling tray of kibbeh, finished with something sweet and a cup of coffee.
          </Reveal>
          <ul className="values">
            {VALUES.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={0.1 * i} direction="right"><strong>{t}</strong><span>{d}</span></Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
