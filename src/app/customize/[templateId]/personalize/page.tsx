'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './personalize.module.css';
import { useAuth } from '@/contexts/AuthContext';
import * as storage from '@/lib/storage';
import type { Site } from '@/types';

export default function PersonalizePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  const { user, loading, language } = useAuth();
  
  const [slug, setSlug] = useState('');
  const [isValidSlug, setIsValidSlug] = useState<boolean | null>(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const t = (id: string, en: string) => language === 'id' ? id : en;

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    // Allow only alphanumeric and hyphens
    if (/^[a-z0-9-]*$/.test(val)) {
      setSlug(val);
      if (val.length >= 3 && val.length <= 50) {
        // Mock availability check
        setIsValidSlug(val !== 'admin' && val !== 'test');
      } else {
        setIsValidSlug(null);
      }
    }
  };

  const handleNext = async () => {
    if (!isValidSlug || !user) return;

    // Check slug availability against existing sites in local or cloud
    let existingSite = storage.getSiteBySlug(slug);
    if (!existingSite && storage.isCloud()) {
      existingSite = await storage.syncSiteBySlugFromCloud(slug);
    }
    if (existingSite && existingSite.userId !== user.id) {
      alert(t('Slug ini sudah digunakan oleh orang lain. Silakan pilih nama lain!', 'This slug is already taken by someone else. Please choose another!'));
      setIsValidSlug(false);
      return;
    }

    // Build site object WITHOUT base64 data (too large for localStorage)
    const draft = (() => {
      try {
        const raw = localStorage.getItem(`draft_${templateId}`);
        return raw ? JSON.parse(raw) : {};
      } catch { return {}; }
    })();

    // Remove any base64 placeholders
    const cleanDraft = { ...draft };
    if (cleanDraft.photo === '__base64_photo__') delete cleanDraft.photo;
    if (cleanDraft.audio === '__base64_audio__') delete cleanDraft.audio;

    const siteId = storage.generateId();

    const newSite: Site = {
      id: siteId,
      userId: user.id,
      templateId,
      slug,
      customization: cleanDraft,
      colorScheme: cleanDraft.colorScheme ?? {
        primary: '#7c3aed',
        secondary: '#db2777',
        accent: '#f59e0b',
        background: '#0d0d12',
        text: '#f5f5f5',
      },
      font: cleanDraft.fontFamily ?? 'Google Sans Flex',
      qrConfig: {
        shape: 'rounded',
        foreground: '#D4AF37',
        background: '#ffffff',
        cornerColor: '#D4AF37',
      },
      status: 'draft',
      views: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      storage.saveSite(newSite);
      // Clean up draft after saving
      localStorage.removeItem(`draft_${templateId}`);
      sessionStorage.removeItem(`media_${templateId}`);
      // Navigate using siteId
      router.push(`/preview/${siteId}`);
    } catch (e) {
      console.error('Failed to save site:', e);
      alert(t('Gagal menyimpan. Silakan coba lagi.', 'Failed to save. Please try again.'));
    }
  };

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('Personalisasi Tautan', 'Personalize Link')}</h1>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          {t('Tautan Kustom', 'Custom Link')}
        </h2>
        
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{t('Masukkan tautan unik untuk situs Anda (3-50 karakter)', 'Enter a unique link for your site (3-50 characters)')}</label>
          <div className={styles.slugInputWrapper}>
            <span className={styles.slugPrefix}>akuila.site/s/</span>
            <input 
              type="text" 
              className={styles.slugInput} 
              value={slug}
              onChange={handleSlugChange}
              placeholder="nama-kamu"
              maxLength={50}
            />
            {slug.length >= 3 && (
              <div className={styles.validationIcon}>
                {isValidSlug ? (
                  <svg className={styles.iconValid} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg className={styles.iconInvalid} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📱</span>
        {language === 'id' ? 'QR Code kustom akan tersedia setelah pembayaran berhasil.' : 'Custom QR Code will be available after successful payment.'}
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.btnNext} 
          disabled={!isValidSlug}
          onClick={handleNext}
        >
          {t('Lanjut ke Pratinjau', 'Continue to Preview')}
        </button>
      </div>
    </div>
  );
}
