import { User, Site, Payment, Language } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export const STORAGE_KEYS = {
  USERS: 'akuila_users',
  CURRENT_USER: 'akuila_current_user',
  SITES: 'akuila_sites',
  PAYMENTS: 'akuila_payments',
  LANGUAGE: 'akuila_language',
  DRAFT_SITE: 'akuila_draft_site',
} as const;

// Helper function to generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

// Generic CRUD operations for localStorage
export const getItem = <T>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) as T : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

export const setItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

export const removeItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

// User operations
export const isCloud = (): boolean => isSupabaseConfigured;

export const getUsers = (): User[] => {
  return getItem<User[]>(STORAGE_KEYS.USERS) || [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  setItem(STORAGE_KEYS.USERS, users);

  if (isSupabaseConfigured) {
    supabase.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      created_at: user.createdAt || new Date().toISOString(),
      language: user.language || 'id'
    }).then(({ error }) => {
      if (error) console.error('⚠️ [Supabase] Gagal menyimpan user ke cloud:', error.message);
    });
  }
};

export const getCurrentUser = (): User | null => {
  return getItem<User>(STORAGE_KEYS.CURRENT_USER);
};

export const setCurrentUser = (user: User): void => {
  setItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const clearCurrentUser = (): void => {
  removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Site operations
export const getSites = (): Site[] => {
  return getItem<Site[]>(STORAGE_KEYS.SITES) || [];
};

export const getUserSites = (userId: string): Site[] => {
  const sites = getSites();
  return sites.filter(site => site.userId === userId);
};

export const getSiteBySlug = (slug: string): Site | undefined => {
  const sites = getSites();
  const site = sites.find(site => site.slug === slug);
  return site ? mergeMedia(site) : undefined;
};

export const getSiteById = (id: string): Site | undefined => {
  const sites = getSites();
  const site = sites.find(site => site.id === id);
  return site ? mergeMedia(site) : undefined;
};

// Helper mapping untuk Supabase SQL
const mapRowToSite = (row: any): Site => ({
  id: row.id,
  slug: row.slug,
  templateId: row.template_id,
  userId: row.user_id,
  status: row.status || 'draft',
  createdAt: row.created_at || new Date().toISOString(),
  publishedAt: row.published_at || undefined,
  views: row.views || 0,
  customization: row.customization || {},
  colorScheme: row.color_scheme || {
    primary: '#D4AF37',
    secondary: '#F5E6CC',
    accent: '#8B7355',
    background: '#0F0E17',
    text: '#FFFFFE',
  },
  font: row.font || 'Outfit',
  qrConfig: row.qr_config || {
    shape: 'rounded',
    foreground: '#000000',
    background: '#FFFFFF',
    cornerColor: '#000000',
  },
});

const mapSiteToRow = (site: Site): any => {
  const derivedTitle = site.customization?.couple_names || site.customization?.title || site.customization?.name || site.slug || 'Undangan Akuila';
  return {
    id: site.id,
    slug: site.slug,
    title: String(derivedTitle),
    template_id: site.templateId,
    user_id: site.userId,
    status: site.status || 'draft',
    created_at: site.createdAt || new Date().toISOString(),
    published_at: site.publishedAt || null,
    views: site.views || 0,
    customization: site.customization || {},
    color_scheme: site.colorScheme,
    font: site.font,
    qr_config: site.qrConfig,
  };
};

// Async Cloud Supabase Sync methods (Zero-latency Hybrid Offline-First)
export const syncUserSitesFromCloud = async (userId: string): Promise<Site[]> => {
  if (!isSupabaseConfigured || typeof window === 'undefined') return getUserSites(userId);
  try {
    const { data, error } = await supabase.from('sites').select('*').eq('user_id', userId);
    if (data && !error && data.length > 0) {
      const cloudSites: Site[] = data.map(mapRowToSite);
      const allSites = getSites();
      const otherSites = allSites.filter(s => s.userId !== userId);
      setItem(STORAGE_KEYS.SITES, [...otherSites, ...cloudSites]);
      return cloudSites;
    }
  } catch (err) {
    console.error('⚠️ [Supabase] Gagal menyinkronkan daftar situs dari cloud:', err);
  }
  return getUserSites(userId);
};

export const syncSiteBySlugFromCloud = async (slug: string): Promise<Site | undefined> => {
  if (!isSupabaseConfigured || typeof window === 'undefined') return getSiteBySlug(slug);
  try {
    const { data, error } = await supabase.from('sites').select('*').eq('slug', slug).single();
    if (data && !error) {
      const cloudSite = mapRowToSite(data);
      updateSite(cloudSite);
      return cloudSite;
    }
  } catch (err) {
    console.error('⚠️ [Supabase] Gagal menyinkronkan situs berdasarkan slug:', err);
  }
  return getSiteBySlug(slug);
};

export const syncSiteByIdFromCloud = async (id: string): Promise<Site | undefined> => {
  if (!isSupabaseConfigured || typeof window === 'undefined') return getSiteById(id);
  try {
    const { data, error } = await supabase.from('sites').select('*').eq('id', id).single();
    if (data && !error) {
      const cloudSite = mapRowToSite(data);
      updateSite(cloudSite);
      return cloudSite;
    }
  } catch (err) {
    console.error('⚠️ [Supabase] Gagal menyinkronkan situs berdasarkan id:', err);
  }
  return getSiteById(id);
};

// All known base64 media fields across all templates
const MEDIA_FIELDS = [
  'couple_photo', 'photo', 'song', 'audio',
  'memory_photo_1', 'memory_photo_2', 'memory_photo_3',
  'memory_photo_4', 'memory_photo_5', 'memory_photo_6',
  'slide_1_photo', 'slide_2_photo', 'slide_3_photo',
];

/** Strip base64 from site.customization and save media to sessionStorage. Returns stripped site. */
const saveMediaSeparately = (site: Site): Site => {
  if (typeof window === 'undefined') return site;
  const media: Record<string, string> = {};
  const cleanCustomization = { ...site.customization };
  for (const f of MEDIA_FIELDS) {
    const val = String(cleanCustomization[f] ?? '');
    if (val.startsWith('data:')) {
      media[f] = val;
      delete cleanCustomization[f];
    }
  }
  try {
    if (Object.keys(media).length > 0) {
      sessionStorage.setItem(`akuila_media_${site.id}`, JSON.stringify(media));
    }
  } catch (e) { console.warn('sessionStorage media save failed:', e); }
  return { ...site, customization: cleanCustomization };
};

/** Merge sessionStorage media back into a site object when reading. */
const mergeMedia = (site: Site): Site => {
  if (typeof window === 'undefined') return site;
  try {
    const raw = sessionStorage.getItem(`akuila_media_${site.id}`);
    if (!raw) return site;
    const media = JSON.parse(raw) as Record<string, string>;
    return { ...site, customization: { ...site.customization, ...media } };
  } catch { return site; }
};

export const saveSite = (site: Site): void => {
  const sites = getSites();
  const stripped = saveMediaSeparately(site);
  sites.push(stripped);
  setItem(STORAGE_KEYS.SITES, sites);

  if (isSupabaseConfigured) {
    const row = mapSiteToRow(site);
    supabase.from('sites').upsert(row).then(({ error }) => {
      if (error) {
        console.warn('⚠️ [Supabase] Gagal menyimpan dengan foto penuh, mencoba tanpa base64:', error.message);
        const strippedRow = mapSiteToRow(stripped);
        supabase.from('sites').upsert(strippedRow).then(({ error: err2 }) => {
          if (err2) console.error('⚠️ [Supabase] Gagal menyimpan versi tanpa base64:', err2.message);
        });
      }
    });
  }
};

export const updateSite = (updatedSite: Site): void => {
  const sites = getSites();
  const index = sites.findIndex(site => site.id === updatedSite.id);
  const stripped = saveMediaSeparately(updatedSite);
  if (index >= 0) {
    sites[index] = stripped;
  } else {
    sites.push(stripped);
  }
  setItem(STORAGE_KEYS.SITES, sites);

  if (isSupabaseConfigured) {
    const row = mapSiteToRow(updatedSite);
    supabase.from('sites').upsert(row).then(({ error }) => {
      if (error) {
        const strippedRow = mapSiteToRow(stripped);
        supabase.from('sites').upsert(strippedRow).then(({ error: err2 }) => {
          if (err2) console.error('⚠️ [Supabase] Gagal update versi tanpa base64:', err2.message);
        });
      }
    });
  }
};

export const deleteSite = (id: string): void => {
  const sites = getSites();
  const filteredSites = sites.filter(site => site.id !== id);
  setItem(STORAGE_KEYS.SITES, filteredSites);

  if (isSupabaseConfigured) {
    supabase.from('sites').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('⚠️ [Supabase] Gagal menghapus situs dari cloud:', error.message);
    });
  }
};

// Payment operations
export const getPayments = (): Payment[] => {
  return getItem<Payment[]>(STORAGE_KEYS.PAYMENTS) || [];
};

export const savePayment = (payment: Payment): void => {
  const payments = getPayments();
  payments.push(payment);
  setItem(STORAGE_KEYS.PAYMENTS, payments);

  if (isSupabaseConfigured) {
    supabase.from('payments').upsert({
      id: payment.id,
      site_id: payment.siteId,
      user_id: payment.userId,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      created_at: payment.createdAt || new Date().toISOString(),
      paid_at: payment.paidAt || null,
    }).then(({ error }) => {
      if (error) console.error('⚠️ [Supabase] Gagal menyimpan pembayaran:', error.message);
    });
  }
};

export const updatePaymentStatus = (id: string, status: Payment['status'], paidAt?: string): void => {
  const payments = getPayments();
  const payment = payments.find(p => p.id === id);
  
  if (payment) {
    payment.status = status;
    if (paidAt) {
      payment.paidAt = paidAt;
    }
    setItem(STORAGE_KEYS.PAYMENTS, payments);

    if (isSupabaseConfigured) {
      supabase.from('payments').update({
        status: status,
        paid_at: paidAt || new Date().toISOString()
      }).eq('id', id).then(({ error }) => {
        if (error) console.error('⚠️ [Supabase] Gagal memperbarui status pembayaran:', error.message);
      });
    }
  }
};

// Language operations
export const getLanguage = (): Language => {
  return getItem<Language>(STORAGE_KEYS.LANGUAGE) || 'en';
};

export const setLanguage = (lang: Language): void => {
  setItem(STORAGE_KEYS.LANGUAGE, lang);
};

// Draft operations
export const getDraftSite = (): Partial<Site> | null => {
  return getItem<Partial<Site>>(STORAGE_KEYS.DRAFT_SITE);
};

export const saveDraftSite = (siteData: Partial<Site>): void => {
  setItem(STORAGE_KEYS.DRAFT_SITE, siteData);
};

export const clearDraftSite = (): void => {
  removeItem(STORAGE_KEYS.DRAFT_SITE);
};

export const clearAllDraftsAndMedia = (): void => {
  if (typeof window === 'undefined') return;
  try {
    // Clear localStorage drafts
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('draft_') || key.startsWith('akuila_draft'))) {
        localStorage.removeItem(key);
      }
    }
    // Clear sessionStorage media
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('media_') || key.startsWith('akuila_media_'))) {
        sessionStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Failed to clear drafts/media:', e);
  }
};
