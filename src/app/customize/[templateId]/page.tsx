'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './customize.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { getTemplateById } from '@/data/templates';
import type { TemplateField } from '@/data/templates';
import SakuraGift from '@/app/s/[slug]/templates/SakuraGift';
import StarlightCelebration from '@/app/s/[slug]/templates/StarlightCelebration';
import * as storage from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Site } from '@/types';

/* ──────────────────────────────────────────────
   QR Code renderer with SVG clip-path shapes
   ────────────────────────────────────────────── */
const QR_SHAPES = [
  { id: 'square',   label: 'Kotak',    emoji: '⬛' },
  { id: 'rounded',  label: 'Bulat',    emoji: '🔘' },
  { id: 'heart',    label: 'Love',     emoji: '❤️' },
  { id: 'star',     label: 'Bintang',  emoji: '⭐' },
  { id: 'diamond',  label: 'Berlian',  emoji: '💎' },
  { id: 'circle',   label: 'Lingkaran',emoji: '⭕' },
] as const;
type QrShapeId = typeof QR_SHAPES[number]['id'];

// SVG clip-path definitions for each shape
const SHAPE_CLIP_PATHS: Record<QrShapeId, string> = {
  square: 'M0,0 H200 V200 H0 Z',
  rounded: 'M20,0 H180 Q200,0 200,20 V180 Q200,200 180,200 H20 Q0,200 0,180 V20 Q0,0 20,0 Z',
  heart: 'M100,180 C60,160 0,130 0,80 C0,50 20,30 50,30 C65,30 80,38 100,55 C120,38 135,30 150,30 C180,30 200,50 200,80 C200,130 140,160 100,180 Z',
  star: 'M100,10 L122,72 L190,72 L133,110 L155,172 L100,135 L45,172 L67,110 L10,72 L78,72 Z',
  diamond: 'M100,5 L195,100 L100,195 L5,100 Z',
  circle: 'M100,0 A100,100 0 1,1 100,200 A100,100 0 1,1 100,0 Z',
};

function QrPreview({ text, shape, fg, bg }: { text: string; shape: QrShapeId; fg: string; bg: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');

  useEffect(() => {
    const size = 200;
    const modules = 21; // 21x21 QR version 1
    const cell = size / modules;

    // Deterministic "QR-like" pattern from text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;

    let rects = '';
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        // Finder patterns (corners) — always filled per QR spec
        const isFinderTL = r < 7 && c < 7;
        const isFinderTR = r < 7 && c >= modules - 7;
        const isFinderBL = r >= modules - 7 && c < 7;
        const isFinderInner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                              (r >= 2 && r <= 4 && c >= modules - 5 && c <= modules - 3) ||
                              (r >= modules - 5 && r <= modules - 3 && c >= 2 && c <= 4);
        const isBorderOuter = isFinderTL || isFinderTR || isFinderBL;
        const filled = isFinderInner || isBorderOuter
          ? !(r >= 1 && r <= 5 && c >= 1 && c <= 5 && !isFinderInner && !(r === 0 || r === 6 || c === 0 || c === 6))
          : (Math.abs(hash + r * 31 + c * 17) % 3 !== 0);

        if (filled) {
          const x = c * cell;
          const y = r * cell;
          const rx = shape === 'square' ? 0 : cell * 0.25;
          rects += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cell.toFixed(1)}" height="${cell.toFixed(1)}" rx="${rx.toFixed(1)}" fill="${fg}"/>`;
        }
      }
    }

    // Single full-size QR — clipped to shape. NO tiling/duplication.
    const clipId = `qr-clip-${shape}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <clipPath id="${clipId}">
          <path d="${SHAPE_CLIP_PATHS[shape]}"/>
        </clipPath>
      </defs>
      <rect width="200" height="200" fill="${bg}" rx="4"/>
      <g clip-path="url(#${clipId})">${rects}</g>
    </svg>`;

    setSvgDataUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  }, [text, shape, fg, bg]);

    if (!svgDataUrl) return <div style={{ width: 200, height: 200, background: '#f0f0f5', borderRadius: 12, border: '1.5px solid #e5e7eb' }} />;
  return <img src={svgDataUrl} alt="QR Preview" style={{ width: 200, height: 200, borderRadius: 12 }} />;

}

/* ──────────────────────────────────────────────
   Build mock Site for live preview
   ────────────────────────────────────────────── */
function buildMockSite(templateId: string, formData: Record<string, any>, fieldFonts: Record<string, string>): Site {
  const template = getTemplateById(templateId);
  const schemeIdx = typeof formData.colorScheme === 'number' ? formData.colorScheme : 0;
  const scheme = template?.colorSchemes[schemeIdx] ?? {
    primary: '#D4AF37', secondary: '#8B6914', accent: '#FFE066', background: '#0A0806', text: '#F5EDD6',
  };
  return {
    id: 'preview-mock',
    userId: 'preview',
    templateId,
    slug: 'preview',
    customization: { ...formData, fieldFonts },
    colorScheme: scheme,
    font: formData.fontFamily ?? 'Outfit',
    qrConfig: {
      shape: formData.qrShape ?? 'rounded',
      foreground: formData.qrFg ?? '#000000',
      background: formData.qrBg ?? '#ffffff',
      cornerColor: formData.qrFg ?? '#000000',
    },
    status: 'published',
    views: 0,
    createdAt: new Date().toISOString(),
  };
}

function LiveTemplatePreview({ templateId, site }: { templateId: string; site: Site }) {
  if (templateId === 'sakura-gift') return <SakuraGift site={site} />;
  if (templateId === 'starlight-celebration') return <StarlightCelebration site={site} />;
  const col = site.colorScheme;
  const c = site.customization;
  return (
    <div style={{ minHeight: '100vh', background: col.background, color: col.text, fontFamily: `'${site.font}',sans-serif`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'clamp(2rem,8vw,4rem)', fontWeight: 800, lineHeight: 1.1, background: `linear-gradient(135deg,${col.primary},${col.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {String(c.groom_name || c.title || 'Nama Anda')}
        {c.bride_name && <><br /><span style={{ fontSize: '0.5em', WebkitTextFillColor: 'rgba(255,255,255,0.5)' }}>&amp;</span><br />{String(c.bride_name)}</>}
      </h1>
      {(c.wedding_date || c.date) && <p style={{ opacity: 0.6, marginTop: '1rem' }}>{String(c.wedding_date || c.date)}</p>}
      <p style={{ marginTop: '3rem', opacity: 0.15, fontSize: '0.7rem' }}>Preview • Akuila</p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Media & Font options
   ────────────────────────────────────────────── */
const isUploadedMedia = (val: any): boolean =>
  typeof val === 'string' && val.length > 0 && (val.startsWith('data:') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'));
const FONT_OPTIONS = [
  // Modern Clean
  { label: 'Outfit (Default)', value: 'Outfit' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' },
  { label: 'DM Sans', value: 'DM Sans' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Raleway', value: 'Raleway' },
  // Elegant Serif
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
  { label: 'Lora', value: 'Lora' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville' },
  { label: 'EB Garamond', value: 'EB Garamond' },
  { label: 'Cinzel', value: 'Cinzel' },
  // Script & Romantic
  { label: 'Great Vibes', value: 'Great Vibes' },
  { label: 'Dancing Script', value: 'Dancing Script' },
  { label: 'Pacifico', value: 'Pacifico' },
  { label: 'Sacramento', value: 'Sacramento' },
  { label: 'Satisfy', value: 'Satisfy' },
  { label: 'Caveat', value: 'Caveat' },
  { label: 'Allura', value: 'Allura' },
  // Fun & Display
  { label: 'Bebas Neue', value: 'Bebas Neue' },
  { label: 'Righteous', value: 'Righteous' },
  { label: 'Comfortaa', value: 'Comfortaa' },
  { label: 'Indie Flower', value: 'Indie Flower' },
  { label: 'Permanent Marker', value: 'Permanent Marker' },
];

function FontDropdown({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Load font for preview
  useEffect(() => {
    const toLoad = FONT_OPTIONS.map(f => f.value).filter(
      f => f !== 'Outfit' && f !== 'Inter'
    );
    const params = toLoad.map(f => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400`).join('&');
    const id = 'akuila-fontdropdown-preview';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
      document.head.appendChild(link);
    }
  }, []);

  const current = FONT_OPTIONS.find(f => f.value === value) ?? FONT_OPTIONS[0];

  return (
    <div style={{ marginBottom: label ? '1.5rem' : '0', position: 'relative' }} ref={ref}>
      {label && <label className={styles.label}>{label}</label>}
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#ffffff', border: '1.5px solid #e5e7eb',
          borderRadius: 10, padding: '0.7rem 1rem', color: '#111827', cursor: 'pointer',
          fontFamily: `'${current.value}', sans-serif`, fontSize: '1rem',
        }}
      >
        <span>{current.label}</span>
        <span style={{ opacity: 0.5, fontSize: '0.75rem', marginLeft: '0.5rem' }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 9999,
          background: '#ffffff', border: '1.5px solid #e5e7eb',
          borderRadius: 12, overflow: 'hidden auto', maxHeight: 300,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }} className="font-dropdown-list">
          {FONT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                width: '100%', display: 'block', padding: '0.65rem 1rem',
                background: opt.value === value ? 'rgba(79,70,229,0.08)' : 'transparent',
                border: 'none', borderBottom: '1px solid #f3f4f6',
                color: opt.value === value ? 'var(--primary)' : '#374151',
                cursor: 'pointer', textAlign: 'left',
                fontFamily: `'${opt.value}', sans-serif`, fontSize: '1rem',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,70,229,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = opt.value === value ? 'rgba(79,70,229,0.08)' : 'transparent')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Slug validator
   ────────────────────────────────────────────── */
function SlugInput({ value, onChange, userId }: { value: string; onChange: (v: string) => void; userId: string }) {
  const [status, setStatus] = useState<'idle' | 'ok' | 'taken' | 'invalid'>('idle');

  useEffect(() => {
    let mounted = true;
    const checkSlug = async () => {
      const v = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (v !== value) { onChange(v); return; }
      if (!v) { setStatus('idle'); return; }
      if (v.length < 3) { setStatus('invalid'); return; }
      let existing = storage.getSiteBySlug(v);
      if (!existing && storage.isCloud()) {
        existing = await storage.syncSiteBySlugFromCloud(v);
      }
      if (!mounted) return;
      if (existing && existing.userId !== userId) setStatus('taken');
      else setStatus('ok');
    };
    checkSlug();
    return () => { mounted = false; };
  }, [value, userId, onChange]);

  const colors: Record<string, string> = { idle: '#666', ok: '#4ade80', taken: '#f87171', invalid: '#fbbf24' };
  const msgs: Record<string, string> = { idle: '', ok: '✓ Tersedia', taken: '✗ Sudah digunakan', invalid: '⚠ Min. 3 karakter, hanya huruf/angka/strip' };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label className={styles.label}>🔗 URL Website Anda <span style={{ color: '#f87171' }}>*</span></label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: `1.5px solid ${status === 'ok' ? '#10b981' : status === 'taken' ? '#ef4444' : '#e5e7eb'}`, borderRadius: 10, padding: '0.6rem 1rem', transition: 'border-color 0.2s' }}>
        <span style={{ color: '#9ca3af', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>akuila.site/s/</span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="nama-link-anda"
          style={{ flex: 1, background: 'none', border: 'none', color: '#111827', outline: 'none', fontSize: '0.95rem', fontFamily: 'Outfit, sans-serif' }}
          maxLength={40}
        />
      </div>
      {msgs[status] && <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: colors[status] }}>{msgs[status]}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Page
   ────────────────────────────────────────────── */
export default function CustomizePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  const { user, loading, language } = useAuth();

  const template = getTemplateById(templateId);
  const fields: TemplateField[] = template?.fields ?? [];

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldFonts, setFieldFonts] = useState<Record<string, string>>({});
  const [slug, setSlug] = useState('');
  const [qrShape, setQrShape] = useState<QrShapeId>('rounded');
  const [qrFg, setQrFg] = useState('#000000');
  const [qrBg, setQrBg] = useState('#ffffff');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'content' | 'design' | 'link'>('content');

  // ── Dynamic Google Fonts loader ──
  // Collects all fonts in use (global + per-field) and injects a single <link> tag
  useEffect(() => {
    const fontsInUse = new Set<string>();
    const globalFont = formData.fontFamily ?? 'Outfit';
    fontsInUse.add(globalFont);
    Object.values(fieldFonts).forEach(f => fontsInUse.add(f));

    // Build Google Fonts URL
    const familyParams = Array.from(fontsInUse)
      .filter(f => f !== 'serif' && f !== 'sans-serif' && f !== 'monospace' && f !== 'Google Sans Flex' && f !== 'Gilroy' && f !== 'Outfit' && f !== 'Inter')
      .map(f => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:ital,wght@0,300;0,400;0,600;0,700;1,400`)
      .join('&');

    if (!familyParams) return;

    const linkId = 'akuila-dynamic-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${familyParams}&display=swap`;
  }, [formData.fontFamily, fieldFonts]);

  // Init form
  useEffect(() => {
    const initial: Record<string, any> = { colorScheme: 0, fontFamily: 'Google Sans Flex' };
    fields.forEach(f => { initial[f.id] = f.type === 'date' ? '' : ''; });
    try {
      const raw = localStorage.getItem(`draft_${templateId}`);
      if (raw) {
        const saved = JSON.parse(raw);
        // Cegah foto lama atau draft akun lain lengket!
        if (saved.userId && user && saved.userId !== user.id) {
          localStorage.removeItem(`draft_${templateId}`);
          sessionStorage.removeItem(`media_${templateId}`);
        } else {
          Object.keys(saved).forEach(k => {
            if (saved[k] === '__base64_photo__' || saved[k] === '__base64_audio__') delete saved[k];
          });
          Object.assign(initial, saved);
          if (saved.slug) setSlug(saved.slug);
          if (saved.qrShape) setQrShape(saved.qrShape as QrShapeId);
          if (saved.qrFg) setQrFg(saved.qrFg);
          if (saved.qrBg) setQrBg(saved.qrBg);
          if (saved.fieldFonts) setFieldFonts(saved.fieldFonts);
        }
      }
    } catch { }
    setFormData(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, user?.id]);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  // Auto-save draft
  useEffect(() => {
    if (Object.keys(formData).length === 0) return;
    const timer = setTimeout(() => {
      const toSave: Record<string, any> = { ...formData, slug, qrShape, qrFg, qrBg, fieldFonts, userId: user?.id };
      if (String(toSave.couple_photo ?? '').startsWith('data:')) toSave.couple_photo = '__base64_photo__';
      if (String(toSave.photo ?? '').startsWith('data:')) toSave.photo = '__base64_photo__';
      if (String(toSave.song ?? '').startsWith('data:')) toSave.song = '__base64_audio__';
      if (String(toSave.audio ?? '').startsWith('data:')) toSave.audio = '__base64_audio__';
      try { localStorage.setItem(`draft_${templateId}`, JSON.stringify(toSave)); } catch { }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData, slug, qrShape, qrFg, qrBg, fieldFonts, templateId, user?.id]);

  const mockSite = useMemo(() => buildMockSite(templateId, formData, fieldFonts), [templateId, formData, fieldFonts]);

  const t = (id: string, en: string) => language === 'id' ? id : en;

  const handleChange = (fieldId: string, value: any) =>
    setFormData(prev => ({ ...prev, [fieldId]: value }));

  const handleFile = useCallback(async (fieldId: string, file: File | null) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert(t('File terlalu besar (maks 8MB)', 'File too large (max 8MB)')); return; }
    
    if (isSupabaseConfigured && user) {
      setUploadingField(fieldId);
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('site-media')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (!uploadError) {
          const { data } = supabase.storage.from('site-media').getPublicUrl(filePath);
          handleChange(fieldId, data.publicUrl);
          setUploadingField(null);
          return;
        } else {
          console.warn('⚠️ Supabase Storage upload gagal, mencoba fallback base64:', uploadError.message);
        }
      } catch (err) {
        console.warn('⚠️ Supabase Storage error:', err);
      }
      setUploadingField(null);
    }

    const reader = new FileReader();
    reader.onload = e => handleChange(fieldId, e.target?.result);
    reader.readAsDataURL(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, user]);

  const setFieldFont = (fieldId: string, font: string) =>
    setFieldFonts(prev => ({ ...prev, [fieldId]: font }));

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d12' }}>
      <div style={{ width: 48, height: 48, border: '3px solid #a855f7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const handleSaveAndPreview = async () => {
    if (!slug || slug.length < 3) { alert('Isi nama link terlebih dahulu (min. 3 karakter)'); setActiveSection('link'); return; }
    let existingSite = storage.getSiteBySlug(slug);
    if (!existingSite && storage.isCloud()) {
      existingSite = await storage.syncSiteBySlugFromCloud(slug);
    }
    if (existingSite && existingSite.userId !== user.id) { alert('Nama link sudah digunakan'); setActiveSection('link'); return; }

    setSaving(true);

    // Build clean customization (no raw base64 in localStorage)
    const cleanData: Record<string, any> = { ...formData, fieldFonts };
    // All known base64 fields (photos + audio)
    const base64Fields = [
      'couple_photo', 'photo', 'song', 'audio',
      // SakuraGift fields
      'memory_photo_1', 'memory_photo_2', 'memory_photo_3',
      'memory_photo_4', 'memory_photo_5', 'memory_photo_6',
      'memory_photo_7', 'memory_photo_8',
      'slide_1_photo', 'slide_2_photo', 'slide_3_photo',
      'bucket_flower',
      'menu_icon_1', 'menu_icon_2', 'menu_icon_3', 'menu_icon_4',
    ];

    // Save media to sessionStorage BEFORE stripping (sessionStorage is per-tab, no accumulation)
    const mediaData: Record<string, string> = {};
    for (const f of base64Fields) {
      if (String(cleanData[f] ?? '').startsWith('data:')) {
        mediaData[f] = cleanData[f] as string;
      }
    }
    try {
      sessionStorage.setItem(`media_${templateId}`, JSON.stringify(mediaData));
    } catch (e) {
      console.warn('sessionStorage media save failed:', e);
    }

    // Strip base64 from localStorage draft
    for (const f of base64Fields) {
      if (String(cleanData[f] ?? '').startsWith('data:')) delete cleanData[f];
    }

    // Re-merge media back into customization for the live site object
    const customizationWithMedia = { ...cleanData, ...mediaData };


    const schemeIdx = typeof formData.colorScheme === 'number' ? formData.colorScheme : 0;
    const scheme = template?.colorSchemes[schemeIdx] ?? {
      primary: '#D4AF37', secondary: '#8B6914', accent: '#FFE066', background: '#0A0806', text: '#F5EDD6',
    };

    // Check if site already exists for this user+slug
    const existingOwn = existingSite?.userId === user.id ? existingSite : null;

    const siteId = existingOwn?.id ?? storage.generateId();
    const newSite: Site = {
      id: siteId,
      userId: user.id,
      templateId,
      slug,
      customization: customizationWithMedia,
      colorScheme: scheme,
      font: formData.fontFamily ?? 'Outfit',
      qrConfig: { shape: qrShape, foreground: qrFg, background: qrBg, cornerColor: qrFg },
      status: 'draft',
      views: existingOwn?.views ?? 0,
      createdAt: existingOwn?.createdAt ?? new Date().toISOString(),
    };

    try {
      if (existingOwn) storage.updateSite(newSite);
      else storage.saveSite(newSite);
      localStorage.removeItem(`draft_${templateId}`);
      sessionStorage.removeItem(`media_${templateId}`);
      router.push(`/preview/${siteId}`);
    } catch {
      alert('Gagal menyimpan. Coba lagi.');
      setSaving(false);
    }
  };

  const colorSchemes = template?.colorSchemes ?? [];
  const isMobile = previewDevice === 'mobile';

  /* ── Field renderer with per-field font ── */
  const renderField = (field: TemplateField) => {
    const val = formData[field.id] ?? '';
    const label = language === 'id' ? field.label.id : field.label.en;
    const ph = field.placeholder ? (language === 'id' ? field.placeholder.id : field.placeholder.en) : '';
    const font = fieldFonts[field.id] ?? (formData.fontFamily ?? 'Outfit');

    if (field.type === 'photo') return (
      <div key={field.id} style={{ marginBottom: '1.5rem' }}>
        <label className={styles.label}>{label}</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '1rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
        >
          <input type="file" accept="image/*" hidden onChange={e => handleFile(field.id, e.target.files?.[0] ?? null)} />
          {val && isUploadedMedia(val) ? (
            <>
              <img src={val} alt="" style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              <div>
                <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>✓ Foto terupload</p>
                <p style={{ color: '#666', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>Klik untuk ganti foto</p>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 72, height: 72, borderRadius: 10, background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>Upload Foto</p>
                <p style={{ color: '#666', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>JPG, PNG, WebP • Maks 8MB</p>
              </div>
            </>
          )}
        </label>
      </div>
    );

    if (field.type === 'audio') return (
      <div key={field.id} style={{ marginBottom: '1.5rem' }}>
        <label className={styles.label}>{label}</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '1rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
        >
          <input type="file" accept="audio/*" hidden onChange={e => handleFile(field.id, e.target.files?.[0] ?? null)} />
          <div style={{ width: 72, height: 72, borderRadius: 10, background: val && isUploadedMedia(val) ? 'rgba(74,222,128,0.1)' : 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '2rem' }}>
            🎵
          </div>
          <div style={{ flex: 1 }}>
            {val && isUploadedMedia(val) ? (
              <>
                <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.85rem', margin: '0 0 0.5rem' }}>✓ Lagu terupload</p>
                <audio controls src={val} style={{ width: '100%', height: 32 }} />
              </>
            ) : (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>Upload Lagu Latar</p>
                <p style={{ color: '#666', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>MP3, M4A, WAV • Klik untuk upload</p>
              </>
            )}
          </div>
        </label>
      </div>
    );

    if (field.type === 'textarea') return (
      <div key={field.id} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label className={styles.label} style={{ margin: 0 }}>{label}</label>
          <div style={{ width: '160px' }}>
            <FontDropdown
              value={fieldFonts[field.id] ?? String(formData.fontFamily ?? 'Outfit')}
              onChange={v => setFieldFont(field.id, v)}
            />
          </div>
        </div>
        <textarea className={styles.textarea} value={val} placeholder={ph}
          onChange={e => handleChange(field.id, e.target.value)}
          maxLength={field.maxLength ?? 500} rows={4}
          style={{ fontFamily: `'${font}', sans-serif` }} />
        <span className={styles.charCount}>{String(val).length}/{field.maxLength ?? 500}</span>
      </div>
    );

    // text / date / color
    return (
      <div key={field.id} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label className={styles.label} style={{ margin: 0 }}>
            {label}{field.required && <span style={{ color: '#f87171', marginLeft: 4 }}>*</span>}
          </label>
          {field.type === 'text' && (
            <div style={{ width: '160px' }}>
              <FontDropdown
                value={fieldFonts[field.id] ?? String(formData.fontFamily ?? 'Outfit')}
                onChange={v => setFieldFont(field.id, v)}
              />
            </div>
          )}
        </div>
        {field.type === 'color' ? (
          <input type="color" value={val || '#D4AF37'} onChange={e => handleChange(field.id, e.target.value)}
            style={{ width: 48, height: 36, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8 }} />
        ) : (
          <input type={field.type === 'date' ? 'date' : 'text'} className={styles.input}
            value={val} placeholder={ph}
            onChange={e => handleChange(field.id, e.target.value)}
            maxLength={field.maxLength ?? 100}
            style={{ fontFamily: field.type === 'text' ? `'${font}', sans-serif` : undefined }} />
        )}
      </div>
    );
  };

  /* ── Sections ── */
  const SECTIONS = [
    { id: 'content', label: '✍️ Konten' },
    { id: 'design',  label: '🎨 Desain & QR' },
    { id: 'link',    label: '🔗 Link & Simpan' },
  ] as const;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6fa', overflow: 'hidden' }}>

      {/* ── LEFT: Form panel ── */}
      <div style={{ flex: '0 0 420px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #e5e7eb', overflow: 'hidden', background: '#f8f9ff' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', flexShrink: 0, background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <button onClick={() => router.push('/catalog')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem', padding: 0, fontWeight: 500 }}>← Katalog</button>
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            {t('Edit Template', 'Edit Template')}: {template?.name[language] ?? templateId}
          </h1>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', flexShrink: 0, background: '#ffffff' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ flex: 1, padding: '0.75rem 0.5rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: activeSection === s.id ? 'var(--primary)' : '#6b7280', borderBottom: `2px solid ${activeSection === s.id ? 'var(--primary)' : 'transparent'}`, transition: 'all 0.2s' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Scrollable form content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: '#c7c8e0 transparent' }}>

          {/* CONTENT SECTION */}
          {activeSection === 'content' && (
            <div>
              {/* Color scheme — at top of content */}
              {colorSchemes.length > 0 && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <label className={styles.label}>🎨 Skema Warna</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                    {colorSchemes.map((s, i) => (
                      <button key={i} onClick={() => handleChange('colorScheme', i)}
                        title={`Skema ${i + 1}`}
                        style={{ height: 48, borderRadius: 10, background: `linear-gradient(135deg, ${s.primary}, ${s.secondary}, ${s.background})`, border: formData.colorScheme === i ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', boxShadow: formData.colorScheme === i ? `0 0 0 2px ${s.primary}` : 'none', position: 'relative' }}>
                        {formData.colorScheme === i && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#fff', fontSize: '1rem', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Global font */}
              <div style={{ marginBottom: '1.5rem' }}>
                <FontDropdown
                  value={String(formData.fontFamily ?? 'Outfit')}
                  onChange={v => handleChange('fontFamily', v)}
                  label="🔤 Font Global (default semua field)"
                />
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0.3rem 0 0' }}>Font ini menjadi default. Setiap field teks bisa diubah fontnya sendiri di sebelah kanan label.</p>
              </div>
              {fields.map(renderField)}
            </div>
          )}


          {/* DESIGN SECTION — now only QR */}
          {activeSection === 'design' && (
            <div>

              {/* QR Code editor */}
              <div>
                <label className={styles.label} style={{ marginBottom: '1rem', display: 'block' }}>Bentuk QR Code</label>

                {/* QR shape grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  {QR_SHAPES.map(shape => (
                    <button key={shape.id} onClick={() => setQrShape(shape.id)}
                      style={{ padding: '0.6rem', borderRadius: 10, border: `2px solid ${qrShape === shape.id ? 'var(--primary)' : '#e5e7eb'}`, background: qrShape === shape.id ? 'rgba(79,70,229,0.08)' : '#ffffff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}>
                      <span style={{ fontSize: '1.5rem' }}>{shape.emoji}</span>
                      <span style={{ fontSize: '0.7rem', color: qrShape === shape.id ? 'var(--primary)' : '#6b7280', fontWeight: 600 }}>{shape.label}</span>
                    </button>
                  ))}
                </div>

                {/* QR colors */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Warna QR</label>
                    <input type="color" value={qrFg} onChange={e => setQrFg(e.target.value)} style={{ width: '100%', height: 36, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Background QR</label>
                    <input type="color" value={qrBg} onChange={e => setQrBg(e.target.value)} style={{ width: '100%', height: 36, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8 }} />
                  </div>
                </div>

                {/* QR preview */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#ffffff', borderRadius: 16, border: '1.5px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <QrPreview text={`akuila.site/s/${slug || 'preview'}`} shape={qrShape} fg={qrFg} bg={qrBg} />
                    <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>Preview QR Code</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LINK & SAVE SECTION */}
          {activeSection === 'link' && (
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Tentukan alamat website Anda. Setelah disimpan, link ini akan aktif setelah pembayaran.
              </p>
              <SlugInput value={slug} onChange={setSlug} userId={user.id} />

              {/* Summary */}
              <div style={{ background: '#f8f9ff', border: '1.5px solid rgba(79,70,229,0.12)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>RINGKASAN</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Template', value: template?.name[language] ?? templateId },
                    { label: 'Link', value: slug ? `akuila.site/s/${slug}` : '—' },
                    { label: 'Harga', value: template ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(template.price) : '—' },
                    { label: 'QR Shape', value: QR_SHAPES.find(s => s.id === qrShape)?.label ?? qrShape },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                      <span style={{ color: '#9ca3af' }}>{item.label}</span>
                      <span style={{ color: '#111827', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveAndPreview}
                disabled={saving || !slug || slug.length < 3}
                style={{ width: '100%', padding: '1rem', background: saving ? 'rgba(79,70,229,0.3)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '1rem', fontFamily: 'Outfit, sans-serif', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: !slug || slug.length < 3 ? 0.5 : 1, boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
                {saving ? '⏳ Menyimpan...' : '👁 Pratinjau & Lanjutkan →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Live preview ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#eceef5' }}>

        {/* Preview header */}
        <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#f5f6fa' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
            ✦ Preview berubah secara real-time
          </p>
          {/* Device toggle */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#ffffff', padding: '0.25rem', borderRadius: 8, border: '1.5px solid #e5e7eb' }}>
            {(['mobile', 'desktop'] as const).map(d => (
              <button key={d} onClick={() => setPreviewDevice(d)}
                style={{ padding: '0.25rem 0.75rem', borderRadius: 6, border: 'none', cursor: 'pointer', background: previewDevice === d ? 'var(--primary)' : 'transparent', color: previewDevice === d ? '#ffffff' : '#6b7280', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s' }}>
                {d === 'mobile' ? '📱 Mobile' : '🖥 Desktop'}
              </button>
            ))}
          </div>
        </div>

        {/* Device frame */}
        <div style={{ flex: 1, display: 'flex', alignItems: isMobile ? 'center' : 'stretch', justifyContent: 'center', padding: isMobile ? '1.5rem' : '0', overflow: 'hidden' }}>
          <div style={{
            width: isMobile ? 390 : '100%',
            height: isMobile ? 'calc(100vh - 120px)' : '100%',
            maxHeight: isMobile ? 780 : 'none',
            borderRadius: isMobile ? 36 : 0,
            border: isMobile ? '6px solid #d1d5db' : 'none',
            overflow: 'hidden',
            boxShadow: isMobile ? '0 20px 60px rgba(0,0,0,0.15)' : 'none',
            flexShrink: 0,
            transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {isMobile && (
              <div style={{ height: 26, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 56, height: 4, background: '#9ca3af', borderRadius: 999 }} />
              </div>
            )}
            <div style={{ height: isMobile ? 'calc(100% - 26px)' : '100%', overflowY: 'auto', overflowX: 'hidden', transform: 'translateZ(0)' }}>
              <LiveTemplatePreview templateId={templateId} site={mockSite} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
