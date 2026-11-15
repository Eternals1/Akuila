'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import * as storage from '@/lib/storage';
import { getTemplateById } from '@/data/templates';
import type { Site, Template } from '@/types';
import SakuraGift from './templates/SakuraGift';
import StarlightCelebration from './templates/StarlightCelebration';

/* ── Inner component — uses useSearchParams (needs Suspense) ── */
function PublicSiteInner({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';

  const [site, setSite] = useState<Site | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadSite = async () => {
      const found = storage.getSiteBySlug(slug);
      if (found) {
        if (!isPreview) storage.updateSite({ ...found, views: (found.views || 0) + 1 });
        setSite(found);
        const tmpl = getTemplateById(found.templateId);
        if (tmpl) setTemplate(tmpl);
        setPageLoading(false);
      }
      if (storage.isCloud()) {
        const cloudSite = await storage.syncSiteBySlugFromCloud(slug);
        if (mounted && cloudSite) {
          if (!found && !isPreview) storage.updateSite({ ...cloudSite, views: (cloudSite.views || 0) + 1 });
          setSite(cloudSite);
          const tmpl = getTemplateById(cloudSite.templateId);
          if (tmpl) setTemplate(tmpl);
        }
      }
      if (mounted) setPageLoading(false);
    };
    loadSite();
    return () => { mounted = false; };
  }, [slug, isPreview]);

  // Load Google Font dynamically if not already loaded globally (must be before conditional returns for Rules of Hooks)
  const isLocalFont = !site?.font || ['Google Sans Flex', 'Gilroy', 'Outfit', 'Inter'].includes(site.font);
  const fontUrl = (!site || isLocalFont) ? '' : `https://fonts.googleapis.com/css2?family=${encodeURIComponent(site.font)}:wght@400;600;700;800&display=swap`;

  useEffect(() => {
    if (!fontUrl) return;
    const id = 'site-font-link';
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) { link = document.createElement('link'); link.id = id; link.rel = 'stylesheet'; document.head.appendChild(link); }
    link.href = fontUrl;
  }, [fontUrl]);

  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020010' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #00f5ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!site) {
    return (
      <div style={{ minHeight: '100vh', background: 'hsl(240,20%,8%)', color: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🌌</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', background: 'linear-gradient(135deg, #7c3aed, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404 — Tidak Ditemukan</h1>
        <p style={{ opacity: 0.5, marginBottom: '2rem' }}>Website ini tidak ada atau sudah dihapus.</p>
        <a href='/' style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', borderRadius: '999px', textDecoration: 'none', fontWeight: 700 }}>Kembali ke Beranda</a>
      </div>
    );
  }

  // Gate: if NOT preview mode AND site not published → show locked screen
  if (!isPreview && site.status !== 'published') {
    return (
      <div style={{ minHeight: '100vh', background: 'hsl(240,20%,8%)', color: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', background: 'linear-gradient(135deg, #7c3aed, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Website Belum Aktif</h1>
        <p style={{ opacity: 0.5, marginBottom: '0.5rem' }}>Website ini belum dibayar atau sedang diproses.</p>
        <p style={{ opacity: 0.3, fontSize: '0.85rem' }}>This site is not yet activated.</p>
      </div>
    );
  }

  return <>{renderTemplate(site, template)}</>;
}

function renderTemplate(site: Site, template: Template | null) {
  // Match by specific templateId
  if (site.templateId === 'sakura-gift') return <SakuraGift site={site} />;
  if (site.templateId === 'starlight-celebration') return <StarlightCelebration site={site} />;

  // Fallback: no renderer found → show a simple card
  const col = site.colorScheme;
  return (
    <div style={{ minHeight: '100vh', background: col.background, color: col.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '3rem', background: `${col.primary}11`, border: `1px solid ${col.primary}33`, borderRadius: 24, maxWidth: 400 }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: col.primary }}>{site.slug}</h1>
        <p style={{ opacity: 0.5, marginTop: '0.5rem', fontSize: '0.9rem' }}>Template renderer tidak ditemukan.</p>
      </div>
    </div>
  );
}

/* ── Default export with Suspense boundary ── */
export default function PublicSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020010' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #00f5ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <PublicSiteInner slug={slug} />
    </Suspense>
  );
}
