export type TemplateCategory = 'wedding' | 'greeting' | 'gift';
export type PriceTier = 'basic' | 'premium' | 'exclusive';

export interface TemplateField {
  id: string;
  type: 'text' | 'textarea' | 'date' | 'photo' | 'audio' | 'color';
  label: { id: string; en: string };
  required: boolean;
  maxLength?: number;
  placeholder?: { id: string; en: string };
}

export interface Template {
  id: string;
  name: { id: string; en: string };
  description: { id: string; en: string };
  category: TemplateCategory;
  tier: PriceTier;
  price: number;
  originalPrice?: number;
  discount?: number;
  previewImage: string;
  colorSchemes: Array<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  }>;
  fields: TemplateField[];
  features: Array<{ id: string; en: string }>;
}

export const templates: Template[] = [
  {
    id: 'sakura-gift',
    name: { id: 'Sakura Gift 🌸', en: 'Sakura Gift 🌸' },
    description: {
      id: 'Template hadiah ulang tahun bertema sakura Jepang dengan animasi kotak kado ajaib, 4 section interaktif: kenangan foto, buket cinta, cerita slide, dan pemutar musik.',
      en: 'Japanese sakura birthday gift template with magical gift box animation and 4 interactive sections: photo memories, love bucket, story slides, and music player.',
    },
    category: 'gift',
    tier: 'premium',
    price: 79900,
    originalPrice: 149000,
    discount: 46,
    previewImage: '/images/templates/sakura-gift.jpg',
    colorSchemes: [
      { primary: '#E8547A', secondary: '#F4A0B5', accent: '#FFD6E7', background: '#1A0A0F', text: '#FFE8F0' },
      { primary: '#C77DFF', secondary: '#9B5DE5', accent: '#F7C1FF', background: '#0D0015', text: '#F0E0FF' },
      { primary: '#FF9F1C', secondary: '#FFBF69', accent: '#FFE66D', background: '#1A0F00', text: '#FFF5E0' },
    ],
    fields: [
      { id: 'recipient_name', type: 'text',     label: { id: 'Nama Penerima', en: "Recipient's Name" }, required: true, maxLength: 40 },
      { id: 'from_name',      type: 'text',     label: { id: 'Dari (Nama Pengirim)', en: 'From (Sender Name)' }, required: true, maxLength: 40 },
      { id: 'opening_message', type: 'textarea', label: { id: 'Pesan Pembuka Kotak Kado', en: 'Gift Box Opening Message' }, required: false, maxLength: 120 },
      { id: 'memory_photo_1', type: 'photo',    label: { id: 'Foto Kenangan 1', en: 'Memory Photo 1' }, required: false },
      { id: 'memory_photo_2', type: 'photo',    label: { id: 'Foto Kenangan 2', en: 'Memory Photo 2' }, required: false },
      { id: 'memory_photo_3', type: 'photo',    label: { id: 'Foto Kenangan 3', en: 'Memory Photo 3' }, required: false },
      { id: 'memory_photo_4', type: 'photo',    label: { id: 'Foto Kenangan 4', en: 'Memory Photo 4' }, required: false },
      { id: 'memory_photo_5', type: 'photo',    label: { id: 'Foto Kenangan 5', en: 'Memory Photo 5' }, required: false },
      { id: 'memory_photo_6', type: 'photo',    label: { id: 'Foto Kenangan 6', en: 'Memory Photo 6' }, required: false },
      { id: 'memory_photo_7', type: 'photo',    label: { id: 'Foto Kenangan 7', en: 'Memory Photo 7' }, required: false },
      { id: 'memory_photo_8', type: 'photo',    label: { id: 'Foto Kenangan 8', en: 'Memory Photo 8' }, required: false },
      { id: 'memories_caption', type: 'textarea', label: { id: 'Keterangan Foto Kenangan', en: 'Memories Caption' }, required: false, maxLength: 200 },
      { id: 'love_msg_1', type: 'text', label: { id: 'Pesan Kasih 1 (Balon Chat)', en: 'Love Message 1 (Chat Bubble)' }, required: false, maxLength: 60 },
      { id: 'love_msg_2', type: 'text', label: { id: 'Pesan Kasih 2 (Balon Chat)', en: 'Love Message 2 (Chat Bubble)' }, required: false, maxLength: 60 },
      { id: 'love_msg_3', type: 'text', label: { id: 'Pesan Kasih 3 (Balon Chat)', en: 'Love Message 3 (Chat Bubble)' }, required: false, maxLength: 60 },
      { id: 'love_msg_4', type: 'text', label: { id: 'Pesan Kasih 4 (Balon Chat)', en: 'Love Message 4 (Chat Bubble)' }, required: false, maxLength: 60 },
      { id: 'love_msg_5', type: 'text', label: { id: 'Pesan Kasih 5 (Balon Chat)', en: 'Love Message 5 (Chat Bubble)' }, required: false, maxLength: 60 },
      { id: 'love_msg_6', type: 'text', label: { id: 'Pesan Kasih 6 (Balon Chat)', en: 'Love Message 6 (Chat Bubble)' }, required: false, maxLength: 60 },
      { id: 'love_msg_7', type: 'text', label: { id: 'Pesan Kasih 7 (Balon Chat)', en: 'Love Message 7 (Chat Bubble)' }, required: false, maxLength: 60 },
      { id: 'love_msg_8', type: 'text', label: { id: 'Pesan Kasih 8 (Balon Chat)', en: 'Love Message 8 (Chat Bubble)' }, required: false, maxLength: 60 },
      { id: 'bucket_flower',  type: 'photo',    label: { id: 'Bunga Tengah Buket (foto objek)', en: 'Center Bucket Flower (object photo)' }, required: false },
      { id: 'slide_1_photo', type: 'photo',    label: { id: 'Foto Slide 1', en: 'Slide 1 Photo' }, required: false },
      { id: 'slide_1_text',  type: 'textarea', label: { id: 'Teks Slide 1', en: 'Slide 1 Text' }, required: false, maxLength: 300 },
      { id: 'slide_2_photo', type: 'photo',    label: { id: 'Foto Slide 2', en: 'Slide 2 Photo' }, required: false },
      { id: 'slide_2_text',  type: 'textarea', label: { id: 'Teks Slide 2', en: 'Slide 2 Text' }, required: false, maxLength: 300 },
      { id: 'slide_3_photo', type: 'photo',    label: { id: 'Foto Slide 3', en: 'Slide 3 Photo' }, required: false },
      { id: 'slide_3_text',  type: 'textarea', label: { id: 'Teks Slide 3', en: 'Slide 3 Text' }, required: false, maxLength: 300 },
      { id: 'song',          type: 'audio',    label: { id: 'Lagu Favorit (Audio)', en: 'Favorite Song (Audio)' }, required: false },
      { id: 'song_title',    type: 'text',     label: { id: 'Judul Lagu', en: 'Song Title' }, required: false, maxLength: 60 },
      { id: 'menu_icon_1',   type: 'photo',    label: { id: 'Ikon Menu 1 (Kenangan Kita)', en: 'Menu Icon 1 (Our Memories)' }, required: false },
      { id: 'menu_icon_2',   type: 'photo',    label: { id: 'Ikon Menu 2 (Buket Cinta)', en: 'Menu Icon 2 (Love Bucket)' }, required: false },
      { id: 'menu_icon_3',   type: 'photo',    label: { id: 'Ikon Menu 3 (Cerita Kita)', en: 'Menu Icon 3 (Our Story)' }, required: false },
      { id: 'menu_icon_4',   type: 'photo',    label: { id: 'Ikon Menu 4 (Lagu)', en: 'Menu Icon 4 (Song)' }, required: false },
    ],
    features: [
      { id: 'Animasi Kotak Kado Berdenyut', en: 'Pulsing Gift Box Animation' },
      { id: 'Transisi Tirai Bunga Sakura', en: 'Sakura Curtain Transition' },
      { id: '4 Section Interaktif', en: '4 Interactive Sections' },
      { id: 'Galeri Foto Kenangan', en: 'Memory Photo Gallery' },
      { id: 'Buket Bunga dengan Balon Chat', en: 'Flower Bucket with Chat Bubbles' },
      { id: 'Slideshow Foto + Cerita', en: 'Photo + Story Slideshow' },
      { id: 'Pemutar Musik Interaktif', en: 'Interactive Music Player' },
      { id: 'Tema Sakura Jepang', en: 'Japanese Sakura Theme' },
    ],
  },
  {
    id: 'starlight-celebration',
    name: { id: 'Starlight Celebration ✨', en: 'Starlight Celebration ✨' },
    description: {
      id: 'Template perayaan universal dengan konsep perjalanan linear. Dilengkapi animasi kembang api interaktif, foto polaroid yang bisa dibalik (3D flip), dan pesan bertabur bintang.',
      en: 'Universal celebration template with a linear journey concept. Features interactive fireworks, 3D flip polaroid photos, and star-studded wishes.',
    },
    category: 'gift',
    tier: 'premium',
    price: 89900,
    originalPrice: 159000,
    discount: 43,
    previewImage: '/images/templates/starlight-celebration.jpg',
    colorSchemes: [
      { primary: '#FFD700', secondary: '#FFA500', accent: '#FF6B35', background: '#0A0A1A', text: '#FFF8E8' },
      { primary: '#F5E6CC', secondary: '#D4A574', accent: '#B8860B', background: '#1A0F05', text: '#FFF5E6' },
      { primary: '#4169E1', secondary: '#6495ED', accent: '#87CEEB', background: '#060620', text: '#E8F0FF' },
    ],
    fields: [
      { id: 'intro_text',       type: 'text',     label: { id: 'Teks Intro (Layar Awal)', en: 'Intro Text (First Screen)' }, required: false, maxLength: 60, placeholder: { id: "Let's celebrate your special day", en: "Let's celebrate your special day" } },
      { id: 'recipient_name',   type: 'text',     label: { id: 'Nama Penerima', en: "Recipient's Name" }, required: true, maxLength: 40 },
      { id: 'sender_name',      type: 'text',     label: { id: 'Dari (Nama Pengirim)', en: 'From (Sender Name)' }, required: true, maxLength: 40 },
      { id: 'opening_subtitle', type: 'text',     label: { id: 'Pesan Subtitle (contoh: welcome to your...)', en: 'Subtitle Message' }, required: false, maxLength: 60 },
      
      { id: 'photo_1',          type: 'photo',    label: { id: 'Foto 1', en: 'Photo 1' }, required: false },
      { id: 'photo_1_msg',      type: 'textarea', label: { id: 'Pesan di Belakang Foto 1', en: 'Message behind Photo 1' }, required: false, maxLength: 100 },
      { id: 'photo_2',          type: 'photo',    label: { id: 'Foto 2', en: 'Photo 2' }, required: false },
      { id: 'photo_2_msg',      type: 'textarea', label: { id: 'Pesan di Belakang Foto 2', en: 'Message behind Photo 2' }, required: false, maxLength: 100 },
      { id: 'photo_3',          type: 'photo',    label: { id: 'Foto 3', en: 'Photo 3' }, required: false },
      { id: 'photo_3_msg',      type: 'textarea', label: { id: 'Pesan di Belakang Foto 3', en: 'Message behind Photo 3' }, required: false, maxLength: 100 },
      { id: 'photo_4',          type: 'photo',    label: { id: 'Foto 4', en: 'Photo 4' }, required: false },
      { id: 'photo_4_msg',      type: 'textarea', label: { id: 'Pesan di Belakang Foto 4', en: 'Message behind Photo 4' }, required: false, maxLength: 100 },
      { id: 'photo_5',          type: 'photo',    label: { id: 'Foto 5', en: 'Photo 5' }, required: false },
      { id: 'photo_5_msg',      type: 'textarea', label: { id: 'Pesan di Belakang Foto 5', en: 'Message behind Photo 5' }, required: false, maxLength: 100 },
      { id: 'photo_6',          type: 'photo',    label: { id: 'Foto 6', en: 'Photo 6' }, required: false },
      { id: 'photo_6_msg',      type: 'textarea', label: { id: 'Pesan di Belakang Foto 6', en: 'Message behind Photo 6' }, required: false, maxLength: 100 },
      { id: 'photo_7',          type: 'photo',    label: { id: 'Foto 7', en: 'Photo 7' }, required: false },
      { id: 'photo_7_msg',      type: 'textarea', label: { id: 'Pesan di Belakang Foto 7', en: 'Message behind Photo 7' }, required: false, maxLength: 100 },
      { id: 'photo_8',          type: 'photo',    label: { id: 'Foto 8', en: 'Photo 8' }, required: false },
      { id: 'photo_8_msg',      type: 'textarea', label: { id: 'Pesan di Belakang Foto 8', en: 'Message behind Photo 8' }, required: false, maxLength: 100 },
      
      { id: 'wish_1',           type: 'textarea', label: { id: 'Harapan/Pesan 1', en: 'Wish 1' }, required: false, maxLength: 150 },
      { id: 'wish_2',           type: 'textarea', label: { id: 'Harapan/Pesan 2', en: 'Wish 2' }, required: false, maxLength: 150 },
      { id: 'wish_3',           type: 'textarea', label: { id: 'Harapan/Pesan 3', en: 'Wish 3' }, required: false, maxLength: 150 },
      { id: 'wish_4',           type: 'textarea', label: { id: 'Harapan/Pesan 4', en: 'Wish 4' }, required: false, maxLength: 150 },
      { id: 'wish_5',           type: 'textarea', label: { id: 'Harapan/Pesan 5', en: 'Wish 5' }, required: false, maxLength: 150 },
      { id: 'wish_6',           type: 'textarea', label: { id: 'Harapan/Pesan 6', en: 'Wish 6' }, required: false, maxLength: 150 },
      { id: 'wish_7',           type: 'textarea', label: { id: 'Harapan/Pesan 7', en: 'Wish 7' }, required: false, maxLength: 150 },
      { id: 'wish_8',           type: 'textarea', label: { id: 'Harapan/Pesan 8', en: 'Wish 8' }, required: false, maxLength: 150 },
      { id: 'wish_9',           type: 'textarea', label: { id: 'Harapan/Pesan 9', en: 'Wish 9' }, required: false, maxLength: 150 },
      { id: 'wish_10',          type: 'textarea', label: { id: 'Harapan/Pesan 10', en: 'Wish 10' }, required: false, maxLength: 150 },
      
      { id: 'finale_title',     type: 'text',     label: { id: 'Judul Puncak Acara (Misal: Happy Birthday!)', en: 'Finale Title (e.g., Happy Birthday!)' }, required: true, maxLength: 60 },
      { id: 'finale_quote',     type: 'textarea', label: { id: 'Quote/Pesan Penutup', en: 'Closing Quote/Message' }, required: false, maxLength: 150 },
      { id: 'song',             type: 'audio',    label: { id: 'Lagu Pengiring', en: 'Background Song' }, required: false },
    ],
    features: [
      { id: 'Kembang Api Canvas Interaktif', en: 'Interactive Canvas Fireworks' },
      { id: 'Alur Perjalanan Cerita (Linear)', en: 'Linear Storytelling Flow' },
      { id: 'Foto Polaroid 3D (Bisa dibalik)', en: '3D Flip Polaroid Photos' },
      { id: 'Pesan Harapan di Bintang Jatuh', en: 'Wishes on Shooting Stars' },
      { id: 'Animasi Countdown Malam Perayaan', en: 'Celebration Night Countdown' },
      { id: 'Pemutar Musik Otomatis', en: 'Auto-play Music Player' },
    ],
  },
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return templates.filter(t => t.category === category);
}

export function getTemplatesByTier(tier: PriceTier): Template[] {
  return templates.filter(t => t.tier === tier);
}
