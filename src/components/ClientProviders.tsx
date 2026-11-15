'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';

/** Routes where Navbar + Footer should NOT render (standalone pages) */
function isStandalonePage(pathname: string): boolean {
  return (
    pathname.startsWith('/s/') ||
    pathname.startsWith('/preview/') ||
    pathname.startsWith('/customize/')
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = isStandalonePage(pathname);
  const { language } = useAuth();
  const tr = (id: string, en: string) => language === 'id' ? id : en;

  if (standalone) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '88px', minHeight: 'calc(100vh - 88px)' }}>
        {children}
      </main>
      <footer style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'var(--bg-darker)',
        borderTop: '1px solid var(--divider)',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-primary)',
        fontSize: 'var(--text-body-sm)',
        transition: 'background-color 0.35s ease, border-color 0.35s ease, color 0.35s ease'
      }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <a href="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>{tr('Beranda', 'Home')}</a>
          <a href="/catalog" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>{tr('Katalog', 'Catalog')}</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>{tr('Harga', 'Pricing')}</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>{tr('Kontak', 'Contact')}</a>
        </div>
        <p style={{ fontFamily: 'var(--font-primary)', fontSize: 'var(--text-body)', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Akuila</p>
        <p>{tr('Menciptakan Momen Spesial Dalam Satu Klik', 'Create Special Moments In One Click')}</p>
        <p style={{ marginTop: '2rem', fontSize: 'var(--text-caption)', opacity: 0.7 }}>© 2026 Akuila. All rights reserved.</p>
      </footer>
    </>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>{children}</Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}
