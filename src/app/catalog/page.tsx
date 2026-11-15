'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './catalog.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { templates } from '@/data/templates';
import type { Template } from '@/data/templates';
import TemplateQuickPreview from '@/components/TemplateQuickPreview';

export default function CatalogPage() {
  const router = useRouter();
  const { user, loading, language } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTier, setActiveTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickPreview, setQuickPreview] = useState<Template | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
      </div>
    );
  }

  if (!user) return null;

  const tr = (id: string, en: string) => language === 'id' ? id : en;

  const filteredTemplates = templates.filter(tmpl => {
    const matchCategory = activeCategory === 'all' || tmpl.category === activeCategory;
    const matchTier = activeTier === 'all' || tmpl.tier === activeTier;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = !searchLower ||
      tmpl.name.id.toLowerCase().includes(searchLower) ||
      tmpl.name.en.toLowerCase().includes(searchLower) ||
      tmpl.description.id.toLowerCase().includes(searchLower) ||
      tmpl.description.en.toLowerCase().includes(searchLower);
    return matchCategory && matchTier && matchSearch;
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const tierColors: Record<string, string> = {
    basic: '#4ade80',
    premium: '#a855f7',
    exclusive: '#f59e0b',
  };

  return (
    <>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{tr('Katalog Templat', 'Template Catalog')}</h1>
          <p className={styles.subtitle}>{tr('Pilih templat sempurna untuk momen spesial Anda', 'Choose the perfect template for your special moment')}</p>
        </header>

        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={tr('Cari templat...', 'Search templates...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.tabs}>
            {['all', 'wedding', 'greeting', 'gift'].map(cat => (
              <button
                key={cat}
                className={`${styles.tab} ${activeCategory === cat ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? tr('Semua', 'All') :
                 cat === 'wedding' ? tr('Pernikahan', 'Wedding') :
                 cat === 'greeting' ? tr('Kartu Ucapan', 'Greeting') :
                 tr('Hadiah', 'Gift')}
              </button>
            ))}
          </div>

          <div className={styles.tiers}>
            {['all', 'basic', 'premium', 'exclusive'].map(tier => (
              <button
                key={tier}
                className={`${styles.tierBtn} ${activeTier === tier ? styles.active : ''}`}
                onClick={() => setActiveTier(tier)}
              >
                {tier === 'all' ? tr('Semua Tingkat', 'All Tiers') : tier.charAt(0).toUpperCase() + tier.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template, index) => {
              const scheme = template.colorSchemes[0];
              const discountPct = template.discount ?? (template.originalPrice ? Math.round((1 - template.price / template.originalPrice) * 100) : 0);
              return (
                <div key={template.id} className={styles.card} style={{ animationDelay: `${index * 0.08}s` }}>
                  <div
                    className={styles.preview}
                    style={{ background: `linear-gradient(135deg, ${scheme?.primary ?? '#7c3aed'}, ${scheme?.secondary ?? '#db2777'})` }}
                  >
                    {/* Decorative elements */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                      <p style={{ color: `${scheme?.primary ?? '#fff'}aa`, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>✦ Preview ✦</p>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>
                        {template.name[language]}
                      </div>
                      <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.4)', margin: '0.5rem auto' }} />
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>
                        {template.features.slice(0, 2).map(f => f[language === 'id' ? 'id' : 'en']).join(' · ')}
                      </p>
                    </div>

                    <div className={styles.badges}>
                      <span className={styles.categoryBadge}>
                        {template.category === 'wedding' ? tr('Pernikahan', 'Wedding') :
                         template.category === 'greeting' ? tr('Kartu Ucapan', 'Greeting') :
                         tr('Hadiah', 'Gift')}
                      </span>
                      <span className={styles.tierBadge} style={{ background: tierColors[template.tier] ?? '#888', color: '#000' }}>
                        {template.tier}
                      </span>
                    </div>
                    <div className={styles.quickPreviewOverlay}>
                      <button
                        className={styles.previewBtn}
                        onClick={(e) => { e.stopPropagation(); setQuickPreview(template); }}
                      >
                        {tr('Pratinjau Cepat', 'Quick Preview')}
                      </button>
                    </div>
                  </div>

                  <div className={styles.content}>
                    <h3 className={styles.cardTitle}>{template.name[language]}</h3>
                    <p className={styles.description}>{template.description[language]}</p>

                    <div className={styles.priceSection}>
                      <span className={styles.currentPrice}>{formatPrice(template.price)}</span>
                      {(template.originalPrice ?? 0) > template.price && (
                        <>
                          <span className={styles.originalPrice}>{formatPrice(template.originalPrice!)}</span>
                          <span className={styles.discount}>-{discountPct}%</span>
                        </>
                      )}
                    </div>

                    <button
                      className={styles.selectBtn}
                      onClick={() => router.push(`/customize/${template.id}`)}
                    >
                      {tr('Pilih Templat', 'Choose Template')}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 12h8M12 8v8"></path>
                </svg>
              </div>
              <p className={styles.emptyText}>{tr('Tidak ada templat ditemukan.', 'No templates found.')}</p>
              <button className={styles.clearBtn} onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActiveTier('all'); }}>
                {tr('Hapus Filter', 'Clear Filters')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Preview Modal */}
      {quickPreview && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setQuickPreview(null)}
        >
          <div
            style={{
              width: '100%', maxWidth: 860,
              background: 'hsl(240,20%,10%)',
              border: `1px solid ${quickPreview.colorSchemes[0].primary}44`,
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: `0 0 80px ${quickPreview.colorSchemes[0].primary}33`,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: `1px solid ${quickPreview.colorSchemes[0].primary}22` }}>
              <div>
                <h2 style={{ color: quickPreview.colorSchemes[0].primary, fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{quickPreview.name[language]}</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{quickPreview.category} · {quickPreview.tier}</p>
              </div>
              <button onClick={() => setQuickPreview(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Visual preview */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Left: visual opening screen preview */}
              <TemplateQuickPreview template={quickPreview} language={language} />

              {/* Right: features */}
              <div style={{ width: 260, padding: '1.75rem', borderLeft: `1px solid ${quickPreview.colorSchemes[0].primary}22`, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(0,0,0,0.2)' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Fitur</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {quickPreview.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
                        <span style={{ color: quickPreview.colorSchemes[0].primary, fontSize: '0.7rem' }}>✦</span>
                        {language === 'id' ? f.id : f.en}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Skema Warna</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {quickPreview.colorSchemes.map((s, i) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${s.primary}, ${s.secondary})`, border: '2px solid rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{formatPrice(quickPreview.originalPrice ?? quickPreview.price)}</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>{formatPrice(quickPreview.price)}</div>
                  </div>
                  <button
                    style={{ width: '100%', padding: '0.75rem', background: `linear-gradient(135deg, ${quickPreview.colorSchemes[0].primary}, ${quickPreview.colorSchemes[0].secondary})`, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif' }}
                    onClick={() => router.push(`/customize/${quickPreview.id}`)}
                  >
                    {language === 'id' ? 'Pilih Template Ini' : 'Use This Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
