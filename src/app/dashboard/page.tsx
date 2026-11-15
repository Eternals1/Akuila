'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import * as storage from '@/lib/storage';
import type { Site } from '@/types';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, language } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const tr = (id: string, en: string) => language === 'id' ? id : en;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const userSites = storage.getUserSites(user.id);
      setSites(userSites);
      
      if (storage.isCloud()) {
        storage.syncUserSitesFromCloud(user.id).then((cloudSites) => {
          if (cloudSites) {
            setSites(cloudSites);
          }
        });
      }
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const handleDelete = (id: string) => {
    storage.deleteSite(id);
    setSites(sites.filter(s => s.id !== id));
    setDeleteConfirm(null);
  };

  const publishedCount = sites.filter(s => s.status === 'published').length;
  const totalViews = sites.reduce((acc, site) => acc + (site.views || 0), 0);

  const statusLabel = (status: Site['status']) => {
    if (status === 'published') return { label: tr('Terpublikasi', 'Published'), color: 'var(--success)' };
    if (status === 'pending_payment') return { label: tr('Menunggu Bayar', 'Pending Payment'), color: 'var(--warning)' };
    return { label: tr('Draf', 'Draft'), color: 'var(--text-muted)' };
  };

  return (
    <div className={styles.container}>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: 380, width: '90%', backdropFilter: 'blur(20px)' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{tr('Hapus Website?', 'Delete Website?')}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{tr('Tindakan ini tidak dapat dibatalkan.', 'This action cannot be undone.')}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '0.75rem', background: 'var(--error)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>
                {tr('Hapus', 'Delete')}
              </button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>
                {tr('Batal', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>{tr('Dasbor Saya', 'My Dashboard')}</h1>
        <Link href="/catalog" className={styles.btnCreate}>
          + {tr('Buat Baru', 'Create New')}
        </Link>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{tr('Total Website', 'Total Sites')}</div>
          <div className={styles.statValue}>{sites.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{tr('Terpublikasi', 'Published')}</div>
          <div className={styles.statValue}>{publishedCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{tr('Total Dilihat', 'Total Views')}</div>
          <div className={styles.statValue}>{totalViews}</div>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>{tr('Belum ada website', 'No websites yet')}</h3>
          <p className={styles.emptyText}>{tr('Mulai dengan memilih template dari katalog kami.', 'Start by choosing a template from our catalog.')}</p>
          <Link href="/catalog" className={styles.btnCreate} style={{ display: 'inline-block', marginTop: '1.5rem' }}>
            {tr('Jelajahi Katalog', 'Explore Catalog')}
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {sites.map(site => {
            const status = statusLabel(site.status);
            return (
              <div key={site.id} className={styles.siteCard}>
                <div
                  className={styles.previewArea}
                  style={{ background: `linear-gradient(135deg, ${site.colorScheme?.primary ?? '#7c3aed'}, ${site.colorScheme?.secondary ?? '#db2777'})` }}
                >
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(0,0,0,0.4)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                    {status.label}
                  </span>
                </div>
                <div className={styles.siteInfo}>
                  <h3 className={styles.siteName}>akuila.site/s/{site.slug}</h3>
                  <p className={styles.templateName}>{tr('Template:', 'Template:')} {site.templateId}</p>
                  <div className={styles.meta}>
                    <span>{new Date(site.createdAt).toLocaleDateString('id-ID')}</span>
                    <span>👁 {site.views ?? 0} {tr('dilihat', 'views')}</span>
                  </div>
                  <div className={styles.actions}>
                    {site.status === 'published' ? (
                      <a href={`/s/${site.slug}`} target="_blank" rel="noreferrer" className={styles.btnAction}>
                        {tr('Lihat', 'View')}
                      </a>
                    ) : (
                      <Link href={`/preview/${site.id}`} className={styles.btnAction}>
                        {tr('Pratinjau', 'Preview')}
                      </Link>
                    )}
                    {site.status === 'pending_payment' && (
                      <Link href={`/payment/${site.id}`} className={styles.btnAction} style={{ background: 'var(--warning)', color: '#000' }}>
                        {tr('Bayar', 'Pay')}
                      </Link>
                    )}
                    <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => setDeleteConfirm(site.id)}>
                      {tr('Hapus', 'Delete')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
