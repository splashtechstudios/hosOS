// High-speed local image resolution for all Osieka Resort menu items (Chowdeck & Glovo UI architecture)
// Direct authentic Nigerian meals and official retail bottles
export function getItemImageUrl(itemId: string, name: string = '', category: string = ''): string {
  const map: Record<string, string> = {
    // Authentic Nigerian Swallow
    'swallow-1': '/menu/eba.jpg',
    'swallow-2': '/menu/semovita.jpg',
    'swallow-3': '/menu/fufu.jpg',
    'swallow-4': '/menu/pounded_yam.jpg',

    // Authentic Nigerian Soups
    'soup-1': '/menu/egusi_soup.jpg',
    'soup-2': '/menu/ogbono_soup.jpg',
    'soup-3': '/menu/vegetable_soup.jpg',
    'soup-4': '/menu/beans_soup.jpg',
    'soup-5': '/menu/groundnut_soup.jpg',
    'dyn-2': '/menu/catfish_peppersoup.jpg',

    // Authentic Nigerian Rice Meals
    'rice-1': '/menu/white_rice.jpg',
    'rice-2': '/menu/jollof_rice.jpg',
    'rice-3': '/menu/asun_rice.jpg',

    // Authentic Nigerian Proteins
    'protein-1': '/menu/beef.jpg',
    'protein-2': '/menu/goat_meat.jpg',
    'protein-3': '/menu/chicken.jpg',
    'protein-4': '/menu/fish.jpg',

    // Authentic Nigerian Pasta
    'pasta-1': '/menu/white_spaghetti.jpg',
    'pasta-2': '/menu/jollof_spaghetti.jpg',
    'pasta-3': '/menu/white_macaroni.jpg',
    'pasta-4': '/menu/jollof_macaroni.jpg',

    // Kitchen & Bar Specials
    'dyn-1': '/menu/grilled_croaker.jpg',
    'dyn-5': '/menu/chapman_pitcher.jpg',
    'dyn-6': '/menu/palm_wine.jpg',

    // Official Nigerian Bar Drink Bottles
    'bar-1': '/menu/five_alive.jpg',
    'bar-2': '/menu/exotic.jpg',
    'bar-3': '/menu/smirnoff_ice.jpg',
    'bar-4': '/menu/maltina.jpg',
    'bar-5': '/menu/guinness_stout.jpg',
    'bar-6': '/menu/life_beer.jpg',
    'bar-7': '/menu/legend_stout.jpg',
    'bar-8': '/menu/goldberg_beer.jpg',
    'bar-9': '/menu/33_export.jpg',
    'bar-10': '/menu/heineken_big.jpg',
    'bar-11': '/menu/heineken_med.jpg',
    'bar-12': '/menu/tiger_beer.jpg',
    'bar-13': '/menu/trophy_beer.jpg',
    'bar-14': '/menu/flying_fish.jpg',
    'bar-15': '/menu/gulder_beer.jpg',
    'bar-16': '/menu/desperados.jpg',
    'bar-17': '/menu/star_radler.jpg',
    'bar-18': '/menu/castle_lite.jpg',
    'bar-19': '/menu/budweiser.jpg',
    'bar-20': '/menu/star_beer.jpg',
    'bar-21': '/menu/legend_med.jpg',
    'bar-22': '/menu/goldberg_big.jpg',
    'bar-23': '/menu/guinness_big.jpg',
    'bar-24': '/menu/hero_beer.jpg',
    'bar-25': '/menu/coca_cola.jpg',
    'bar-26': '/menu/nutri_milk.jpg',
    'bar-27': '/menu/nutri_yo.jpg',
    'bar-28': '/menu/predator_energy.jpg',
    'bar-29': '/menu/orijin_bitters.jpg',
    'bar-30': '/menu/fayrouz.jpg',
    'bar-31': '/menu/hollandia_yogurt.jpg',
    'bar-32': '/menu/bottled_water.jpg',
    'bar-33': '/menu/bullet_energy.jpg',
    'bar-34': '/menu/climax_energy.jpg',
    'bar-35': '/menu/maltina_can.jpg',
    'bar-36': '/menu/bigmask.jpg',
  };

  if (map[itemId]) return map[itemId];
  const lower = name.toLowerCase();
  if (lower.includes('nutri milk') || lower.includes('nutri-milk')) return '/menu/nutri_milk.jpg';
  if (lower.includes('nutri yo') || lower.includes('nutri-yo') || lower.includes('nutria')) return '/menu/nutri_yo.jpg';
  if (lower.includes('beans soup') || lower.includes('gbegiri')) return '/menu/beans_soup.jpg';
  if (lower.includes('catfish')) return '/menu/catfish_peppersoup.jpg';
  if (lower.includes('white rice')) return '/menu/white_rice.jpg';
  if (lower.includes('rice') || lower.includes('jollof')) return '/menu/jollof_rice.jpg';
  if (lower.includes('soup') || lower.includes('egusi') || lower.includes('ogbono')) return '/menu/egusi_soup.jpg';
  if (lower.includes('yam') || lower.includes('eba') || lower.includes('fufu') || lower.includes('semovita') || lower.includes('swallow')) return '/menu/pounded_yam.jpg';
  if (lower.includes('croaker') || lower.includes('fish')) return '/menu/fish.jpg';
  if (lower.includes('meat') || lower.includes('beef') || lower.includes('goat') || lower.includes('chicken') || lower.includes('asun')) return '/menu/chicken.jpg';
  if (lower.includes('spaghetti') || lower.includes('macaroni') || lower.includes('pasta')) return '/menu/jollof_spaghetti.jpg';
  if (lower.includes('fayrouz')) return '/menu/fayrouz.jpg';
  if (lower.includes('radler')) return '/menu/star_radler.jpg';
  if (lower.includes('star')) return '/menu/star_beer.jpg';
  if (lower.includes('legend')) return '/menu/legend_stout.jpg';
  if (lower.includes('exotic')) return '/menu/exotic.jpg';
  if (category === 'Bar' || lower.includes('beer') || lower.includes('drink') || lower.includes('stout')) return '/menu/maltina.jpg';
  return '/menu/jollof_rice.jpg';
}
