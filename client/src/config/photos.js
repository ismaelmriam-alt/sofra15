// Site-level photos. Do NOT edit by hand: put files in client/public/assets/images/site/
// (hero.jpg, story.jpg, rakwe.png, jarn.png, lantern.png, jug.png, cedar.png) and run `npm run photos:scan`.
// Empty value = nothing is shown (no placeholder, no fake imagery).
import site from './sitePhotos.json';

export const PHOTOS = {
  hero: { src: site.hero || '', alt: 'A Lebanese table set with tabbouleh, hummus, kibbeh, stuffed vine leaves and warm bread' },
  story: { src: site.story || '', alt: 'Friends and family sharing a Lebanese meal around one table' },
};

// Optional transparent PNG/WebP photos of real heritage objects (replace the drawn SVG versions).
export const OBJECT_PHOTOS = { rakwe: site.rakwe || '', jarn: site.jarn || '', lantern: site.lantern || '', jug: site.jug || '' };

// Optional photograph of a real Lebanese cedar (transparent PNG) for the menu cover.
export const COVER = { cedar: site.cedar || '' };
