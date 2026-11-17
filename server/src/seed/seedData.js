// Initial SOFRA menu. Prices are editable demo prices (USD).
// Photos: NO placeholder artwork is used. Real photo URLs live in dishImages.json
// (dish name -> URL) and categoryImages.json (category name -> URL). Leave an entry
// empty and that dish simply shows a clean typographic card until a verified
// photo is added. See README -> "Real food photography".
import { readFileSync } from 'fs';

const load = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
const dishImages = load('./dishImages.json');
const categoryImages = load('./categoryImages.json');

const baseCategories = [
  { name: 'Cold Mezza', nameAr: 'المقبلات الباردة', tagline: 'A Fresh Start', description: 'Cool, bright plates to begin the table: dips, salads and labneh drizzled with olive oil.', order: 1 },
  { name: 'Hot Mezza', nameAr: 'المقبلات الساخنة', tagline: 'Straight from Our Kitchen', description: 'Golden, sizzling bites that arrive hot and disappear fast.', order: 2 },
  { name: 'Lebanese Grill', nameAr: 'المشاوي', tagline: 'From the Fire to Your Table', description: 'Charcoal-kissed skewers and platters served with garlic sauce, pickles and warm bread.', order: 3 },
  { name: 'Main Courses', nameAr: 'الأطباق الرئيسية', tagline: 'From Our Heritage', description: 'Slow-cooked family recipes, the dishes Lebanese grandmothers are proud of.', order: 4 },
  { name: 'Manakish', nameAr: 'المناقيش', tagline: 'Fresh from the Oven', description: 'Warm Lebanese flatbreads baked to order. One photo, five toppings: choose your favourite.', order: 5, layout: 'shared' },
  { name: 'Lebanese Desserts', nameAr: 'الحلويات اللبنانية', tagline: 'A Sweet Lebanese Ending', description: 'Orange-blossom, pistachio and honey, the sweet close to every gathering.', order: 6 },
  { name: 'Fresh Drinks', nameAr: 'العصائر والمشروبات الباردة', tagline: 'A Taste of Refreshment', description: 'Traditional Lebanese coolers and yogurt drinks.', order: 7 },
  { name: 'Coffee & Hot Drinks', nameAr: 'القهوة والمشروبات الساخنة', tagline: 'Slow Sips', description: 'Lebanese coffee, espresso classics, hot chocolate and tea.', order: 8 },
  { name: 'Shisha', nameAr: 'الأرجيلة', tagline: 'Unwind Together', description: 'Choose your flavour. Served on the terrace.', order: 9, layout: 'shared' },
];

const garlic = { label: 'Extra garlic', price: 0 };
const bread = { label: 'Extra Lebanese bread', price: 1 };
const spicy = { label: 'Make it spicy', price: 0 };
const garlicSauce = { label: 'Extra garlic sauce (toum)', price: 1 };
const fries = { label: 'Side of fries', price: 3 };
const rice = { label: 'Side of vermicelli rice', price: 3 };
const cream = { label: 'Extra ashta cream', price: 1.5 };

// [category, name, nameAr, price, description, ingredients, featured, customizations]
// EVERY price below is an editable PLACEHOLDER (flagged pricePlaceholder in the database). Set real prices in /admin.
// Only items that have a matching photo in the supplied ZIP are listed (Manakish and Shisha share one photo per category).
const rows = [
  ['Cold Mezza', 'Hummus', 'حمص', 6, 'Silky chickpea purée whipped with tahini and lemon, finished with olive oil.', ['Chickpeas', 'Tahini', 'Lemon', 'Garlic', 'Olive oil'], true, [bread, garlic]],
  ['Cold Mezza', 'Baba Ghanouj', 'بابا غنوج', 6.5, 'Smoky roasted eggplant dip with tahini, lemon and olive oil, garnished with fresh mint.', ['Eggplant', 'Tahini', 'Lemon', 'Olive oil', 'Mint'], false, [bread]],
  ['Cold Mezza', 'Tabbouleh', 'تبولة', 7, 'Finely chopped parsley, tomato, mint and fine bulgur, dressed with lemon and olive oil.', ['Parsley', 'Tomato', 'Mint', 'Bulgur', 'Lemon', 'Olive oil'], true, []],
  ['Cold Mezza', 'Fattoush', 'فتوش', 7, 'Crisp garden salad with toasted pita, radish, pomegranate and sumac-lemon dressing.', ['Lettuce', 'Cucumber', 'Tomato', 'Radish', 'Toasted pita', 'Sumac'], true, []],
  ['Cold Mezza', 'Warak Enab', 'ورق عنب', 8, 'Hand-rolled vine leaves stuffed with rice, tomato and herbs, served with lemon.', ['Vine leaves', 'Rice', 'Tomato', 'Parsley', 'Mint', 'Lemon'], false, []],
  ['Cold Mezza', 'Labneh', 'لبنة', 5, 'Thick strained yogurt with olive oil and zaatar, served with olives and tomatoes.', ['Strained yogurt', 'Olive oil', 'Zaatar', 'Olives'], false, [bread, garlic]],

  ['Hot Mezza', 'Kibbeh', 'كبة', 9, 'Crisp bulgur shells filled with spiced minced beef, onion and toasted pine nuts.', ['Bulgur', 'Beef', 'Onion', 'Pine nuts', 'Seven spice'], true, [spicy]],
  ['Hot Mezza', 'Sambousek', 'سمبوسك', 7, 'Half-moon pastries fried golden, filled with spiced beef and onion.', ['Pastry dough', 'Beef', 'Onion', 'Pine nuts'], false, []],
  ['Hot Mezza', 'Cheese Rakakat', 'رقاقات جبنة', 7.5, 'Thin crackly pastry rolls filled with melted cheese and parsley.', ['Phyllo pastry', 'Akkawi cheese', 'Parsley'], false, []],
  ['Hot Mezza', 'Batata Harra', 'بطاطا حرة', 6.5, 'Crispy potato cubes tossed with garlic, coriander, chili and lemon.', ['Potatoes', 'Garlic', 'Coriander', 'Chili', 'Lemon'], false, [spicy, garlic]],
  ['Hot Mezza', 'Soujouk', 'سجق', 9, 'Spiced sausage pan-fried in its own juices, served with bread.', ['Soujouk sausage', 'Garlic', 'Bread'], false, [bread]],
  ['Hot Mezza', 'Halloumi', 'حلوم', 8, 'Golden grilled halloumi with tomato and a fresh herb dressing.', ['Halloumi', 'Tomato', 'Herbs', 'Olive oil'], true, []],

  ['Lebanese Grill', 'Shish Tawook', 'شيش طاووق', 15, 'Garlic-lemon marinated chicken skewers, grilled over charcoal.', ['Chicken breast', 'Garlic', 'Lemon', 'Yogurt', 'Paprika'], true, [garlicSauce, fries]],
  ['Lebanese Grill', 'Kafta', 'كفتة', 15, 'Hand-minced beef kafta with parsley and onion, grilled on skewers.', ['Beef', 'Parsley', 'Onion', 'Seven spice'], false, [fries, bread]],
  ['Lebanese Grill', 'Shish Kebab', 'شيش كباب', 18, 'Tender marinated beef cubes grilled with peppers, zucchini and onion.', ['Beef', 'Peppers', 'Zucchini', 'Onion', 'Baharat'], false, [fries, bread]],
  ['Lebanese Grill', 'Mixed Grill', 'مشاوي مشكلة', 23, 'A generous platter of kafta, shish tawook and grilled meats with fries and grilled vegetables.', ['Chicken', 'Kafta', 'Beef', 'Tomato', 'Onion', 'Garlic sauce'], true, [garlicSauce, fries]],
  ['Lebanese Grill', 'Grilled Chicken', 'دجاج مشوي', 16, 'Lemon-herb marinated chicken, charcoal grilled and served with onion salad.', ['Chicken', 'Lemon', 'Garlic', 'Olive oil', 'Oregano'], false, [garlicSauce, fries]],

  ['Main Courses', 'Kibbeh Bil Sanieh', 'كبة بالصينية', 16, 'Baked layers of bulgur-beef kibbeh around a spiced meat and pine nut filling.', ['Bulgur', 'Beef', 'Onion', 'Pine nuts', 'Seven spice'], false, []],
  ['Main Courses', 'Sayadieh', 'صيادية', 19, 'Coastal fish over spiced caramelized-onion rice, topped with toasted almonds.', ['White fish', 'Rice', 'Caramelized onion', 'Cumin', 'Almonds'], true, []],
  ['Main Courses', 'Kafta Bil Sanieh', 'كفتة بالصينية', 15, 'Baked kafta with sliced potatoes and tomato in a rich tomato sauce.', ['Beef', 'Potatoes', 'Tomato', 'Onion', 'Parsley'], false, [rice]],
  ['Main Courses', 'Moghrabieh', 'مغربية', 17, 'Pearl couscous simmered with chicken, caramelized onions, chickpeas and caraway.', ['Pearl couscous', 'Chicken', 'Onion', 'Chickpeas', 'Caraway', 'Cinnamon'], false, []],
  ['Main Courses', 'Fatteh', 'فتة', 10, 'Crispy pita layered with spiced meat, garlicky yogurt, pomegranate and toasted pine nuts.', ['Pita', 'Meat', 'Yogurt', 'Tahini', 'Pine nuts', 'Pomegranate'], false, [garlic]],
  ['Main Courses', 'Lahm Bi Ajeen', 'لحم بعجين', 8, 'Baked Lebanese dough topped with spiced minced meat and pine nuts, with a squeeze of lemon.', ['Dough', 'Minced meat', 'Tomato', 'Onion', 'Pine nuts', 'Lemon'], false, []],

  // Manakish — ONE shared photo (categories/manakish.jpg), five varieties
  ['Manakish', 'Cheese Manakish', 'جبنة', 3, 'Soft baked flatbread with melted cheese.', ['Dough', 'Cheese'], false, []],
  ['Manakish', 'Zaatar Manakish', 'زعتر', 2.5, 'Baked flatbread topped with thyme, sesame and olive oil.', ['Dough', 'Zaatar', 'Olive oil'], true, []],
  ['Manakish', 'Kishk Manakish', 'كشك', 3, 'Baked flatbread with kishk, onion and tomato.', ['Dough', 'Kishk', 'Onion', 'Tomato'], false, []],
  ['Manakish', 'Onion & Tomato Manakish', 'بصل وبندورة', 3, 'Baked flatbread with fresh onion, tomato and herbs.', ['Dough', 'Onion', 'Tomato', 'Herbs'], false, []],
  ['Manakish', 'Cocktail Manakish', 'كوكتيل', 4, 'A mix of cheese, zaatar and toppings in one flatbread.', ['Dough', 'Cheese', 'Zaatar', 'Vegetables'], false, []],

  ['Lebanese Desserts', 'Knefeh', 'كنافة', 7, 'Warm sweet cheese beneath crisp golden semolina, soaked in orange-blossom syrup and pistachio.', ['Sweet cheese', 'Semolina', 'Orange-blossom syrup', 'Pistachio'], true, [cream]],
  ['Lebanese Desserts', 'Baklava', 'بقلاوة', 6, 'Layers of flaky phyllo with nuts in light syrup.', ['Phyllo', 'Pistachio', 'Walnut', 'Butter', 'Syrup'], false, []],
  ['Lebanese Desserts', 'Maamoul', 'معمول', 5, 'Buttery semolina cookies filled with dates, walnuts or pistachio.', ['Semolina', 'Dates', 'Walnuts', 'Butter', 'Orange-blossom water'], false, []],
  ['Lebanese Desserts', 'Sfouf', 'صفوف', 5, 'Tender turmeric-gold semolina cake topped with pine nuts and almonds.', ['Semolina', 'Turmeric', 'Sugar', 'Pine nuts', 'Almonds'], false, []],
  ['Lebanese Desserts', 'Meghli', 'مغلي', 6, 'Spiced rice pudding with cinnamon, caraway and anise, topped with nuts.', ['Rice flour', 'Cinnamon', 'Caraway', 'Anise', 'Pistachio', 'Walnut'], false, []],

  ['Fresh Drinks', 'Lemonade', 'ليموناضة', 4, 'Fresh lemon and mint, blended and served over ice.', ['Lemon', 'Mint', 'Sugar'], true, []],
  ['Fresh Drinks', 'Jallab', 'جلاب', 4, 'Date, grape molasses and rose water over crushed ice with pine nuts and raisins.', ['Date molasses', 'Grape molasses', 'Rose water', 'Pine nuts', 'Raisins'], false, []],
  ['Fresh Drinks', 'Tamarind', 'تمر هندي', 4, 'Sweet-tart tamarind cooler served over ice with lime.', ['Tamarind', 'Sugar', 'Water', 'Lime'], false, []],
  ['Fresh Drinks', 'Ayran', 'عيران', 3.5, 'Chilled salted yogurt drink with mint, light and refreshing.', ['Yogurt', 'Water', 'Salt', 'Mint'], false, []],

  ['Coffee & Hot Drinks', 'Lebanese Coffee', 'قهوة لبنانية', 2.5, 'Traditional cardamom-scented coffee served in small cups.', ['Coffee', 'Cardamom'], true, []],
  ['Coffee & Hot Drinks', 'Espresso', 'إسبريسو', 2.5, 'Rich, concentrated single shot.', ['Espresso'], false, []],
  ['Coffee & Hot Drinks', 'Nescafé', 'نسكافيه', 3, 'Milky instant coffee served hot.', ['Nescafé', 'Milk'], false, []],
  ['Coffee & Hot Drinks', 'Cappuccino', 'كابتشينو', 3.5, 'Espresso with steamed milk and thick foam, dusted with cinnamon.', ['Espresso', 'Milk'], false, []],
  ['Coffee & Hot Drinks', 'Latte', 'لاتيه', 3.5, 'Smooth espresso with plenty of steamed milk and latte art.', ['Espresso', 'Milk'], false, []],
  ['Coffee & Hot Drinks', 'Hot Chocolate', 'شوكولا ساخنة', 4, 'Rich hot chocolate topped with cream and chocolate shavings.', ['Chocolate', 'Milk', 'Cream'], false, []],
  ['Coffee & Hot Drinks', 'Tea', 'شاي', 2, 'Hot tea with fresh mint.', ['Tea', 'Mint'], false, []],

  // Shisha — ONE shared photo (categories/shisha.jpg), six flavours
  ['Shisha', 'Two Apples', 'تفاحتين', 8, 'Classic double-apple flavour.', [], false, []],
  ['Shisha', 'Mint', 'نعنع', 8, 'Cool, fresh mint.', [], false, []],
  ['Shisha', 'Grape Mint', 'عنب ونعنع', 9, 'Sweet grape with a cooling mint finish.', [], false, []],
  ['Shisha', 'Watermelon Mint', 'بطيخ ونعنع', 9, 'Juicy watermelon with mint.', [], false, []],
  ['Shisha', 'Lemon Mint', 'ليمون ونعنع', 9, 'Zesty lemon with mint.', [], false, []],
  ['Shisha', 'Mixed Flavors', 'نكهات مشكلة', 10, 'A house mix of flavours.', [], false, []],
];

export const categories = baseCategories.map((c) => ({ layout: 'cards', ...c, image: categoryImages[c.name] || '' }));

export const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const sharedCats = new Set(categories.filter((c) => c.layout === 'shared').map((c) => c.name));

export const dishes = rows.map(([category, name, nameAr, price, description, ingredients, isFeatured, customizations], i) => ({
  category,
  name,
  nameAr,
  price,
  pricePlaceholder: true,
  sortOrder: i + 1,
  description,
  ingredients,
  isFeatured,
  isAvailable: true,
  // dishes in a shared-photo category (Manakish, Shisha) use the category photo
  image: sharedCats.has(category) ? '' : dishImages[name] || '',
  customizations,
}));
