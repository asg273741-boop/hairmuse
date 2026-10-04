// Site-wide settings. Update these before going live.
export const SITE = {
  name: 'HairMuse',
  url: 'https://www.hairmusedaily.com',
  title: 'HairMuse — Hairstyle Ideas, Tutorials & Hair Inspiration',
  description:
    'A hairstyle journal for Pinterest lovers: step-by-step hair tutorials, updos, braids, waves, bangs and color ideas you can actually recreate at home.',
  author: 'The HairMuse Team',
  pinterest: 'https://www.pinterest.com/hairmuse/',
  pinterestHandle: '@hairmuse',
  email: 'hello@hairmuse.com',
  ogImage: '/images/pins/soft-bobby-pin-updos.jpg',
} as const;

export const NAV_CATEGORIES = [
  'Updos & Buns',
  'Waves & Curls',
  'Braids',
  'Bangs & Bobs',
] as const;
