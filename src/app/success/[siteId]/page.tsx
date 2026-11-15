'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import * as storage from '@/lib/storage';
import type { Site } from '@/types';
import styles from './success.module.css';

const SHAPE_CLIP_PATHS: Record<string, string> = {
  square: 'M0,0 H220 V220 H0 Z',
  rounded: 'M22,0 H198 Q220,0 220,22 V198 Q220,220 198,220 H22 Q0,220 0,198 V22 Q0,0 22,0 Z',
  heart: 'M110,198 C66,176 0,143 0,88 C0,55 22,33 55,33 C71,33 88,42 110,60 C132,42 148,33 165,33 C198,33 220,55 220,88 C220,143 154,176 110,198 Z',
  star: 'M110,11 L134,79 L209,79 L146,121 L170,189 L110,148 L50,189 L74,121 L11,79 L86,79 Z',
  diamond: 'M110,5 L215,110 L110,215 L5,110 Z',
  circle: 'M110,0 A110,110 0 1,1 110,220 A110,110 0 1,1 110,0 Z',
};

export default function SuccessPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const setupSite = (targetSite: Site) => {
      if (cancelled) return;
      setSite(targetSite);
      const url = `${window.location.origin}/s/${targetSite.slug}`;
      const qrConfig = targetSite.qrConfig;
      const shape = qrConfig?.shape || 'rounded';
      const validDotTypes: Record<string, any> = {
        square: 'square',
        rounded: 'rounded',
        heart: 'rounded',
        star: 'rounded',
        diamond: 'square',
        circle: 'dots',
        'classy': 'classy',
        'classy-rounded': 'classy-rounded',
      };

      const isDuplicated = shape !== 'square' && shape !== 'rounded';
      const tileSize = isDuplicated ? 67 : 200;

      import('qr-code-styling').then(({ default: QRCodeStyling }) => {
        if (cancelled || !qrRef.current) return;
        const qr = new QRCodeStyling({
          width: tileSize,
          height: tileSize,
          margin: 10, // <-- Angka ini mengatur "zoom" / jarak dari tepi. Semakin besar angkanya, QR akan semakin mengecil (zoom out) ke tengah.
          type: 'svg',
          data: url,
          dotsOptions: {
            color: qrConfig?.foreground ?? '#D4AF37',
            type: validDotTypes[shape] ?? 'rounded',
          },
          backgroundOptions: { color: qrConfig?.background ?? '#ffffff' },
          cornersSquareOptions: { type: 'extra-rounded', color: qrConfig?.cornerColor ?? qrConfig?.foreground ?? '#D4AF37' },
          cornersDotOptions: { color: qrConfig?.cornerColor ?? qrConfig?.foreground ?? '#D4AF37' },
        });

        const tempDiv = document.createElement('div');
        qr.append(tempDiv);
        setTimeout(() => {
          if (cancelled || !qrRef.current) return;
          const svgEl = tempDiv.querySelector('svg');
          const svgText = svgEl ? svgEl.outerHTML : tempDiv.innerHTML;
          qrRef.current.innerHTML = '';
          if (isDuplicated) {
            const grid = document.createElement('div');
            grid.style.width = '200px';
            grid.style.height = '200px';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = 'repeat(3, 66.66px)';
            grid.style.gridTemplateRows = 'repeat(3, 66.66px)';
            for (let i = 0; i < 9; i++) {
              const cell = document.createElement('div');
              cell.style.width = '66.66px';
              cell.style.height = '66.66px';
              cell.style.overflow = 'hidden';
              cell.innerHTML = svgText;
              const innerSvg = cell.querySelector('svg');
              if (innerSvg) {
                innerSvg.style.width = '66.66px';
                innerSvg.style.height = '66.66px';
              }
              grid.appendChild(cell);
            }
            qrRef.current.appendChild(grid);
          } else {
            if (svgEl) {
              svgEl.style.width = '200px';
              svgEl.style.height = '200px';
            }
            qrRef.current.appendChild(tempDiv);
          }
          setQrReady(true);
          (qrRef.current as any).__qr = qr;
          (qrRef.current as any).__isDuplicated = isDuplicated;
          (qrRef.current as any).__svgText = svgText;
        }, 50);
      });
    };

    const found = storage.getSiteById(siteId);
    if (found) setupSite(found);

    if (storage.isCloud()) {
      storage.syncSiteByIdFromCloud(siteId).then((cloudSite) => {
        if (cloudSite && !cancelled) setupSite(cloudSite);
      });
    }

    return () => {
      cancelled = true;
      if (qrRef.current) qrRef.current.innerHTML = '';
    };
  }, [siteId]);


  const siteUrl = site ? `${typeof window !== 'undefined' ? window.location.origin : 'https://akuila.site'}/s/${site.slug}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(siteUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const isDuplicated = (qrRef.current as any).__isDuplicated;
    const qr = (qrRef.current as any).__qr;
    const svgText = (qrRef.current as any).__svgText;

    if (isDuplicated && svgText && site?.qrConfig) {
      const shape = site.qrConfig.shape;
      const bg = site.qrConfig.background ?? '#ffffff';
      const clipPath = SHAPE_CLIP_PATHS[shape];
      const tile = 200 / 3;
      let gridUses = '';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          gridUses += `<g transform="translate(${(c * tile).toFixed(2)}, ${(r * tile).toFixed(2)}) scale(${(tile / 67).toFixed(4)})">${svgText}</g>`;
        }
      }
      const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="600" height="600">
        <defs>
          <clipPath id="dl-clip">
            <path d="${clipPath}"/>
          </clipPath>
        </defs>
        <rect width="200" height="200" fill="${bg}"/>
        <g clip-path="url(#dl-clip)">${gridUses}</g>
      </svg>`;

      const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 600, 600);
          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.download = `qr-${site.slug || 'akuila'}.png`;
          a.href = pngUrl;
          a.click();
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (qr) {
      qr.download({ name: `qr-${site?.slug || 'akuila'}`, extension: 'png' });
    }
  };

  if (!site) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#ede9fe,#e0e7ff,#f5f6fa)' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Confetti particles — deterministic positions to prevent hydration mismatch */}
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{
          position: 'fixed',
          top: '-10px',
          left: `${((i * 97 + 13) % 100)}%`,
          width: `${((i * 7 + 5) % 10) + 5}px`,
          height: `${((i * 11 + 5) % 10) + 5}px`,
          borderRadius: i % 2 === 0 ? '50%' : '2px',
          background: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#7B68EE', '#98FB98'][i % 6],
          animation: `confettiFall ${((i * 13) % 30) / 10 + 2}s ${((i * 7) % 20) / 10}s ease-in forwards`,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      ))}

      <div className={styles.card} style={{ position: 'relative', zIndex: 1 }}>
        {/* Success icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'successPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--success), #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>✓</div>
          <h1 className={styles.title}>Pembayaran Berhasil! 🎉</h1>
          <p className={styles.subtitle}>Website Anda kini sudah aktif dan bisa diakses.</p>
        </div>

        {/* Site URL bar */}
        <div style={{ animation: 'fadeUp 0.6s 0.3s both' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>URL Website Anda:</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8f9ff', border: '1.5px solid rgba(79,70,229,0.12)', borderRadius: 12, padding: '0.75rem 1rem' }}>
            <a href={siteUrl} target="_blank" rel="noreferrer" style={{ flex: 1, color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', wordBreak: 'break-all', fontWeight: 600 }}>{siteUrl}</a>
            <button onClick={handleCopy} style={{ padding: '0.4rem 0.9rem', background: copied ? 'var(--success)' : '#f0f0f8', border: '1.5px solid #e5e7eb', borderRadius: 8, color: copied ? '#fff' : '#4f46e5', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap', transition: 'all 0.2s', fontWeight: 700 }}>
              {copied ? '✓ Tersalin!' : '📋 Salin'}
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div style={{ animation: 'fadeUp 0.6s 0.5s both', marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.05em' }}>QR Code Website Anda:</p>
          <div style={{ display: 'inline-block', padding: '1.25rem', background: '#ffffff', borderRadius: 16, boxShadow: '0 4px 24px rgba(79,70,229,0.1)', position: 'relative', border: '1.5px solid #f0f0f5' }}>
            {!qrReady && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: 16, zIndex: 2 }}>
                <div style={{ width: 32, height: 32, border: '3px solid #D4AF37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            <div ref={qrRef} style={{ width: 220, height: 220, display: qrReady ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', clipPath: site?.qrConfig?.shape && SHAPE_CLIP_PATHS[site.qrConfig.shape] ? `path('${SHAPE_CLIP_PATHS[site.qrConfig.shape]}')` : undefined }} />
          </div>
          {qrReady && (
            <div style={{ marginTop: '1rem' }}>
              <button onClick={handleDownloadQr} style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                ⬇ Unduh QR Code
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', animation: 'fadeUp 0.6s 0.7s both' }}>
          <a href={siteUrl} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '0.85rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: '#fff', border: 'none', borderRadius: 12, textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
            🌐 Buka Website
          </a>
          <button onClick={() => router.push('/dashboard')} style={{ flex: 1, padding: '0.85rem', background: '#ffffff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s' }}>
            📊 Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
