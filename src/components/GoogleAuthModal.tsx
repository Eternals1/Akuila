'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './GoogleAuthModal.module.css';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'register';
}

const PRESET_ACCOUNTS = [
  {
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Siti Aminah',
    email: 'siti.aminah@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Alex Chandler',
    email: 'alex.chandler@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export default function GoogleAuthModal({ isOpen, onClose, mode = 'login' }: GoogleAuthModalProps) {
  const { loginWithGoogle, language } = useAuth();
  const router = useRouter();

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');

  if (!isOpen) return null;

  const t = {
    id: {
      title: mode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google',
      subtitle: 'Pilih akun untuk melanjutkan ke Akuila',
      useAnother: 'Gunakan akun lain',
      nameLabel: 'Nama Lengkap',
      emailLabel: 'Alamat Gmail',
      cancel: 'Batal',
      continue: 'Lanjutkan',
      connecting: 'Menghubungkan ke Google...',
      redirecting: 'Meneruskan ke Akuila...',
      footer: 'Fitur autentikasi aman bertenaga Google OAuth Simulation.',
    },
    en: {
      title: mode === 'login' ? 'Sign in with Google' : 'Sign up with Google',
      subtitle: 'Choose an account to continue to Akuila',
      useAnother: 'Use another account',
      nameLabel: 'Full Name',
      emailLabel: 'Gmail Address',
      cancel: 'Cancel',
      continue: 'Continue',
      connecting: 'Connecting to Google...',
      redirecting: 'Redirecting to Akuila...',
      footer: 'Secure authentication powered by Google OAuth Simulation.',
    },
  };

  const texts = t[language];

  const handleSelectAccount = async (name: string, email: string, avatar?: string) => {
    setSelectedEmail(email);
    setIsConnecting(true);
    
    // Simulate realistic OAuth network delay
    setTimeout(async () => {
      await loginWithGoogle(name, email, avatar);
      setIsConnecting(false);
      onClose();
      router.push('/catalog');
    }, 800);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) return;
    
    let finalEmail = customEmail.trim();
    if (!finalEmail.includes('@')) {
      finalEmail += '@gmail.com';
    }

    await handleSelectAccount(
      customName.trim(), 
      finalEmail, 
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
    );
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Official Google Logo SVG */}
          <svg className={styles.googleLogo} viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>

          <h3 className={styles.title}>{texts.title}</h3>
          <p className={styles.subtitle}>{texts.subtitle}</p>
        </div>

        {isConnecting ? (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
            <div>
              <p className={styles.loadingText}>{texts.connecting}</p>
              <p className={styles.loadingSub}>{selectedEmail}</p>
            </div>
          </div>
        ) : (
          <div className={styles.body}>
            {!showCustomForm ? (
              <>
                <div className={styles.accountList}>
                  {PRESET_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      className={styles.accountCard}
                      onClick={() => handleSelectAccount(acc.name, acc.email, acc.avatar)}
                    >
                      <img src={acc.avatar} alt={acc.name} className={styles.avatar} />
                      <div className={styles.accountInfo}>
                        <p className={styles.name}>{acc.name}</p>
                        <p className={styles.email}>{acc.email}</p>
                      </div>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4 }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ))}
                </div>

                <div className={styles.divider}>atau</div>

                <button
                  type="button"
                  className={styles.customAccountBtn}
                  onClick={() => setShowCustomForm(true)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>{texts.useAnother}</span>
                </button>
              </>
            ) : (
              <form onSubmit={handleCustomSubmit} className={styles.customForm}>
                <div className={styles.inputGroup}>
                  <label>{texts.nameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Andi Pratama"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>{texts.emailLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder="andi.pratama@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowCustomForm(false)}
                  >
                    {texts.cancel}
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    {texts.continue}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <span>{texts.footer}</span>
        </div>
      </div>
    </div>
  );
}
