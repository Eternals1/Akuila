'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { t } from '@/lib/i18n';
import styles from './Navbar.module.css';

function ThemeToggleIcon({ theme }: { theme: 'light' | 'dark' }) {
  if (theme === 'dark') {
    // Sun icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }
  // Moon icon
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { user, language, setLanguage, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo}>
            Akuila
          </Link>
        </div>

        <nav className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            <li>
              <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
                {t('nav.home', language)}
              </Link>
            </li>
            <li>
              <Link href="/catalog" className={`${styles.navLink} ${pathname === '/catalog' ? styles.active : ''}`}>
                {t('nav.catalog', language)}
              </Link>
            </li>
            {user && (
              <li>
                <Link href="/dashboard" className={`${styles.navLink} ${pathname === '/dashboard' ? styles.active : ''}`}>
                  {t('nav.dashboard', language)}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className={styles.actions}>
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle theme">
            <div className={styles.themeToggleTrack}>
              <div className={`${styles.themeToggleThumb} ${theme === 'dark' ? styles.themeToggleThumbDark : ''}`}>
                <ThemeToggleIcon theme={theme} />
              </div>
            </div>
          </button>

          {/* Language Toggle */}
          <button onClick={toggleLanguage} className={styles.langToggle} aria-label="Toggle language">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            {language === 'id' ? 'ID' : 'EN'}
          </button>

          <div className={styles.authContainerDesktop}>
            {user ? (
              <div className={styles.userMenu}>
                <div className={styles.avatar}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{user.name}</span>
                <button onClick={logout} className={styles.logoutBtn} aria-label="Logout">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </button>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/auth/login" className={styles.loginBtn}>
                  {t('nav.login', language)}
                </Link>
                <Link href="/auth/register" className={styles.registerBtn}>
                  {t('nav.register', language)}
                </Link>
              </div>
            )}
          </div>

          <button className={styles.mobileMenuBtn} onClick={toggleDrawer} aria-label="Menu">
            {drawerOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className={`${styles.mobileDrawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <ul className={styles.mobileNavLinks}>
            <li>
              <Link href="/" className={`${styles.mobileNavLink} ${pathname === '/' ? styles.active : ''}`} onClick={toggleDrawer}>
                {t('nav.home', language)}
              </Link>
            </li>
            <li>
              <Link href="/catalog" className={`${styles.mobileNavLink} ${pathname === '/catalog' ? styles.active : ''}`} onClick={toggleDrawer}>
                {t('nav.catalog', language)}
              </Link>
            </li>
            {user && (
              <li>
                <Link href="/dashboard" className={`${styles.mobileNavLink} ${pathname === '/dashboard' ? styles.active : ''}`} onClick={toggleDrawer}>
                  {t('nav.dashboard', language)}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile Theme Toggle */}
        <div className={styles.mobileThemeToggle}>
          <span className={styles.mobileThemeLabel}>
            {theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </span>
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle theme">
            <div className={styles.themeToggleTrack}>
              <div className={`${styles.themeToggleThumb} ${theme === 'dark' ? styles.themeToggleThumbDark : ''}`}>
                <ThemeToggleIcon theme={theme} />
              </div>
            </div>
          </button>
        </div>

        <div className={styles.mobileAuthContainer}>
          {user ? (
             <button onClick={() => { logout(); toggleDrawer(); }} className={styles.mobileLogoutBtn}>
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                 <polyline points="16 17 21 12 16 7"></polyline>
                 <line x1="21" y1="12" x2="9" y2="12"></line>
               </svg>
               {t('nav.logout', language)}
             </button>
          ) : (
            <div className={styles.mobileAuthButtons}>
              <Link href="/auth/login" className={styles.mobileLoginBtn} onClick={toggleDrawer}>
                {t('nav.login', language)}
              </Link>
              <Link href="/auth/register" className={styles.mobileRegisterBtn} onClick={toggleDrawer}>
                {t('nav.register', language)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
