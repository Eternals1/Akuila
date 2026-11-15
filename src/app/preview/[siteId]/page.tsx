'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import * as storage from '@/lib/storage';
import type { Site } from '@/types';

export default function PreviewPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const router = useRouter();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadSite = async () => {
      const found = storage.getSiteById(siteId);
      if (found) {
        setSite(found);
        setLoading(false);
      }
      if (storage.isCloud()) {
        const cloudSite = await storage.syncSiteByIdFromCloud(siteId);
        if (mounted && cloudSite) {
          setSite(cloudSite);
        }
      }
      if (mounted) setLoading(false);
    };
    loadSite();
    return () => { mounted = false; };
  }, [siteId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d12' }}>
      <div style={{ width: 48, height: 48, border: '3px solid #a855f7', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!site) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', background: '#0d0d12', color: '#f5f5f5' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌌</div>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Site tidak ditemukan</h2>
      <button onClick={() => router.push('/dashboard')} style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}>
        Kembali ke Dashboard
      </button>
    </div>
  );

  const isMobile = device === 'mobile';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d0d12', overflow: 'hidden' }}>

      {/* ── Top Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: 56,
        background: 'rgba(13,13,18,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0, zIndex: 10, gap: '1rem',
      }}>
        {/* Left: back + site info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.35rem 0.85rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'background 0.2s' }}
          >
            ← Edit
          </button>
          <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            akuila.site/s/<strong style={{ color: '#fff' }}>{site.slug}</strong>
          </span>
          <span style={{ padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', whiteSpace: 'nowrap' }}>
            DRAFT
          </span>
        </div>

        {/* Center: device toggle */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['desktop', 'mobile'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              style={{
                padding: '0.3rem 0.9rem', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: device === d ? 'rgba(168,85,247,0.25)' : 'transparent',
                color: device === d ? '#c084fc' : 'rgba(255,255,255,0.35)',
                fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
              }}
            >
              {d === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
            </button>
          ))}
        </div>

        {/* Right: pay button */}
        <button
          onClick={() => router.push(`/payment/${siteId}`)}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
            color: '#fff', border: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: 10, cursor: 'pointer',
            fontWeight: 700, fontSize: '0.9rem',
            fontFamily: 'Outfit, sans-serif',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(168,85,247,0.4)',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          💳 Bayar &amp; Aktifkan
        </button>
      </div>

      {/* ── Preview Area ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', padding: isMobile ? '1.5rem 1rem' : '0', background: isMobile ? 'rgba(0,0,0,0.3)' : 'transparent' }}>
        <div style={{
          width: isMobile ? 390 : '100%',
          height: isMobile ? 'calc(100vh - 56px - 3rem)' : 'calc(100vh - 56px)',
          maxWidth: isMobile ? 390 : '100%',
          borderRadius: isMobile ? 36 : 0,
          border: isMobile ? '6px solid #2a2a2a' : 'none',
          overflow: 'hidden',
          boxShadow: isMobile ? '0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px #333' : 'none',
          position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
        }}>
          {isMobile && (
            <div style={{ height: 28, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '30px 30px 0 0' }}>
              <div style={{ width: 60, height: 5, background: '#333', borderRadius: 999 }} />
            </div>
          )}
          <iframe
            key={`${siteId}-${device}`}
            src={`/s/${site.slug}?preview=1`}
            style={{
              width: '100%',
              height: isMobile ? 'calc(100% - 28px)' : '100%',
              border: 'none',
              display: 'block',
            }}
            title="Template Preview"
          />
        </div>
      </div>

      {/* ── Bottom CTA bar (always visible) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: 'rgba(13,13,18,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
        gap: '1rem',
      }}>
        <div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
            Puas dengan hasilnya? Aktifkan website Anda sekarang.
          </p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem' }}>
            Website akan aktif dan bisa dibagikan setelah pembayaran berhasil.
          </p>
        </div>
        <button
          onClick={() => router.push(`/payment/${siteId}`)}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
            color: '#fff', border: 'none',
            padding: '0.7rem 2rem',
            borderRadius: 12, cursor: 'pointer',
            fontWeight: 700, fontSize: '1rem',
            fontFamily: 'Outfit, sans-serif',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(168,85,247,0.5)',
            flexShrink: 0,
          }}
        >
          Lanjut ke Pembayaran →
        </button>
      </div>
    </div>
  );
}
