// Site-wide settings. Update these before going live.
export const SITE = {
  name: 'HairMuse',
  url: 'https://www.hairmusedaily.com',
  title: 'HairMuse — Hairstyle Ideas, Tutorials & Hair Inspiration',
  description:
    'A hairstyle journal with step-by-step guides for updos, braids, waves, bangs, bobs and occasion looks you can try at home.',
  author: 'HairMuse',
  pinterest: 'https://www.pinterest.com/hairmuseinspo/',
  pinterestHandle: '@hairmuseinspo',
  email: 'hello@hairmuse.com',
  ogImage: '/images/pins/soft-bobby-pin-updos-v2.jpg',
} as const;

export const NAV_CATEGORIES = [
  'Updos & Buns',
  'Waves & Curls',
  'Braids',
  'Bangs & Bobs',
  'Occasion Hairstyles',
] as const;
