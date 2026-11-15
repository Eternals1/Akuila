'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './payment.module.css';
import * as storage from '@/lib/storage';
import { getTemplateById } from '@/data/templates';
import type { Site } from '@/types';

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function PaymentPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const router = useRouter();
  const [method, setMethod] = useState('qris');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [site, setSite] = useState<Site | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('GoPay');
  const [qrisReady, setQrisReady] = useState(false);
  const qrisRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load site from storage & cloud
  useEffect(() => {
    let mounted = true;
    const loadSite = async () => {
      const found = storage.getSiteById(siteId);
      if (found) setSite(found);
      if (storage.isCloud()) {
        const cloudSite = await storage.syncSiteByIdFromCloud(siteId);
        if (mounted && cloudSite) setSite(cloudSite);
      }
    };
    loadSite();
    return () => { mounted = false; };
  }, [siteId]);

  // Derive template & price from site data
  const template = site ? getTemplateById(site.templateId) : null;
  const price = template?.price ?? 0;
  const originalPrice = template?.originalPrice ?? price;
  const discount = template?.discount ?? (originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0);

  // Generate real QRIS QR Code when method is qris
  useEffect(() => {
    if (method !== 'qris' || !site) return;
    let cancelled = false;
    const payload = `https://qris.id/pay?merchant=AKUILA_INDONESIA&nmid=ID2026AKUILA&amount=${price}&inv=${site.id}`;

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (cancelled || !qrisRef.current) return;
      const qr = new QRCodeStyling({
        width: 190,
        height: 190,
        type: 'svg',
        data: payload,
        dotsOptions: { color: '#000000', type: 'rounded' },
        backgroundOptions: { color: '#ffffff' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#dc2626' },
        cornersDotOptions: { color: '#000000' },
      });
      qrisRef.current.innerHTML = '';
      qr.append(qrisRef.current);
      setQrisReady(true);
    });

    return () => {
      cancelled = true;
      if (qrisRef.current) qrisRef.current.innerHTML = '';
    };
  }, [method, site, price]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      if (site) {
        storage.updateSite({ ...site, status: 'published', publishedAt: new Date().toISOString() });
      }
      router.push(`/success/${siteId}`);
    }, 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    });
  };

  if (!site) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div style={{ width: 44, height: 44, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>

        {/* ── Order Summary ── */}
        <div className={styles.card}>
          <h2 className={styles.title}>Ringkasan Pesanan</h2>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Template</span>
            <span className={styles.summaryValue}>
              {template?.name?.id ?? site.templateId}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Tier Layanan</span>
            <span className={styles.summaryValue} style={{ textTransform: 'capitalize', color: 'var(--primary)', fontWeight: 800 }}>
              {template?.tier ?? '—'}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>URL Website</span>
            <span className={styles.summaryValue} style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
              akuila.site/s/<strong style={{ color: 'var(--primary)' }}>{site.slug}</strong>
            </span>
          </div>

          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Harga</span>
            <span className={styles.summaryValue}>
              {originalPrice > price && (
                <span className={styles.priceOriginal}>{formatRp(originalPrice)}</span>
              )}
              {formatRp(price)}
              {discount > 0 && (
                <span style={{ marginLeft: '0.5rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '0.1rem 0.45rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                  -{discount}%
                </span>
              )}
            </span>
          </div>

          {discount > 0 && (
            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#4ade80' }}>
              🎉 Kamu hemat {formatRp(originalPrice - price)} ({discount}% off)!
            </div>
          )}

          <div className={styles.totalRow}>
            <span>Total Tagihan</span>
            <span>{formatRp(price)}</span>
          </div>
        </div>

        {/* ── Payment Method ── */}
        <div className={styles.card}>
          <h2 className={styles.title}>Metode Pembayaran</h2>

          <div className={styles.methodsGrid}>
            {[
              { id: 'qris',     icon: '📱', label: 'QRIS (Semua E-Wallet & Bank)', badge: 'Rekomendasi Utama' },
              { id: 'transfer', icon: '🏦', label: 'Transfer Bank Virtual Account', badge: '' },
              { id: 'ewallet',  icon: '👛', label: 'E-Wallet Instant',             badge: '' },
            ].map(m => (
              <div
                key={m.id}
                className={`${styles.methodCard} ${method === m.id ? styles.active : ''}`}
                onClick={() => setMethod(m.id)}
              >
                <span style={{ fontSize: '1.6rem' }}>{m.icon}</span>
                <span style={{ fontWeight: 700, flex: 1 }}>{m.label}</span>
                {m.badge && <span className={styles.badge}>{m.badge}</span>}
              </div>
            ))}
          </div>

          {method === 'qris' && (
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', color: '#1a1a1a', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              {/* QRIS Header Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #ef4444', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#dc2626', letterSpacing: '0.05em' }}>QRIS</span>
                  <div style={{ fontSize: '0.65rem', color: '#666', fontWeight: 600 }}>NMID: ID2026AKUILA88</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1a1a1a' }}>AKUILA INDONESIA</div>
                  <div style={{ fontSize: '0.65rem', color: '#666' }}>SaaS Micro-Site Builder</div>
                </div>
              </div>

              {/* Real SVG QR Code Container (Safe from React removeChild bugs!) */}
              <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {!qrisReady && (
                  <div style={{ position: 'absolute', width: 36, height: 36, border: '3px solid #ef4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                )}
                <div ref={qrisRef} style={{ width: '100%', height: '100%', display: qrisReady ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }} />
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#dc2626', marginBottom: '0.25rem' }}>{formatRp(price)}</div>
              <p style={{ fontWeight: 700, color: '#1a1a1a', margin: '0.25rem 0 0.5rem 0', fontSize: '0.9rem' }}>Scan menggunakan aplikasi apapun:</p>
              
              {/* Supported apps pills */}
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {['BCA Mobile', 'GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja'].map(app => (
                  <span key={app} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', background: '#f1f5f9', color: '#475569', borderRadius: 6, border: '1px solid #e2e8f0' }}>{app}</span>
                ))}
              </div>

              {/* Live Status indicator */}
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#92400e', fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', boxShadow: '0 0 8px #f59e0b' }} />
                Menunggu pembayaran QRIS...
              </div>
            </div>
          )}

          {method === 'transfer' && (
            <div style={{ background: '#f8f8f8', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', color: '#1a1a1a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#666' }}>Bank BCA (Virtual Account)</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.6rem', borderRadius: 999 }}>Otomatis Dicek</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e5e7eb', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.08em', color: '#111827' }}>8831 0812 3456 7890</span>
                <button
                  onClick={() => copyToClipboard('8831081234567890')}
                  style={{ background: copiedBank ? '#10b981' : '#3b82f6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {copiedBank ? '✓ Tersalin!' : 'Salin'}
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.25rem 0' }}>a.n. <strong>PT AKUILA DIGITAL INDONESIA</strong></p>
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: 'rgba(168,85,247,0.1)', borderRadius: 8, fontSize: '0.85rem', color: '#7c3aed', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>Nominal Transfer Pasti:</span>
                <span>{formatRp(price)}</span>
              </div>
            </div>
          )}

          {method === 'ewallet' && (
            <div style={{ background: '#f8f8f8', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', color: '#1a1a1a', textAlign: 'center' }}>
              <p style={{ fontWeight: 700, marginBottom: '1rem' }}>Pilih E-Wallet untuk Bayar Langsung (Deep Link):</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {['GoPay', 'OVO', 'Dana', 'ShopeePay', 'LinkAja'].map(w => (
                  <button
                    key={w}
                    onClick={() => setSelectedWallet(w)}
                    style={{ padding: '0.6rem 1.4rem', background: selectedWallet === w ? '#7c3aed' : '#fff', color: selectedWallet === w ? '#fff' : '#1a1a1a', borderRadius: 10, border: `2px solid ${selectedWallet === w ? '#7c3aed' : '#e0e0e0'}`, fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedWallet === w ? '0 4px 12px rgba(124,58,237,0.3)' : 'none' }}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>Aplikasi <strong>{selectedWallet}</strong> akan terbuka otomatis saat tombol bayar ditekan.</p>
            </div>
          )}

          {/* Timer */}
          <div className={styles.timer} style={{ color: timeLeft < 60 ? '#f87171' : undefined }}>
            ⏱ Selesaikan pembayaran dalam: <strong>{formatTime(timeLeft)}</strong>
          </div>

          <button
            className={styles.btnPay}
            onClick={handlePay}
            disabled={loading || timeLeft === 0}
          >
            {loading ? (
              <>
                <div className={styles.loader} />
                Memverifikasi Pembayaran...
              </>
            ) : method === 'qris' ? (
              `✨ Saya Sudah Scan QRIS (${formatRp(price)})`
            ) : (
              `💳 Konfirmasi Bayar ${formatRp(price)} Sekarang`
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <span>🔒</span> Pembayaran dijamin aman 100%, terverifikasi otomatis oleh sistem.
          </p>
        </div>
      </div>
    </div>
  );
}
