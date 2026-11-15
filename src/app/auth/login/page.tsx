'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GoogleAuthModal from '@/components/GoogleAuthModal';
import styles from './login.module.css';

export default function LoginPage() {
  const { user, loading, login, loginWithGoogle, isCloud, language } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/catalog');
    }
  }, [user, loading, router]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleGoogleClick = async () => {
    if (isCloud) {
      const success = await loginWithGoogle();
      if (success) router.push('/catalog');
    } else {
      setShowGoogleModal(true);
    }
  };

  const t = {
    id: {
      title: 'Selamat Datang',
      subtitle: 'Masuk ke akun Anda untuk melanjutkan',
      email: 'Alamat Email',
      password: 'Kata Sandi',
      loginBtn: 'Masuk',
      loading: 'Memproses...',
      forgot: 'Lupa kata sandi?',
      noAccount: 'Belum punya akun?',
      register: 'Daftar',
      error: 'Email atau kata sandi tidak valid',
      googleBtn: 'Masuk dengan Google',
      or: 'atau',
    },
    en: {
      title: 'Welcome Back',
      subtitle: 'Sign in to your account to continue',
      email: 'Email Address',
      password: 'Password',
      loginBtn: 'Sign In',
      loading: 'Processing...',
      forgot: 'Forgot password?',
      noAccount: 'Don\'t have an account?',
      register: 'Register',
      error: 'Invalid email or password',
      googleBtn: 'Sign in with Google',
      or: 'or',
    }
  };

  const texts = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/catalog');
      } else {
        setError(texts.error);
      }
    } catch (err) {
      setError(texts.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.brand}>Akuila</h1>
          <h2 className={styles.title}>{texts.title}</h2>
          <p className={styles.subtitle}>{texts.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorShake}>{error}</div>}

          <div className={styles.inputGroup}>
            <label>{texts.email}</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="hello@akuila.com"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label>{texts.password}</label>
              <Link href="/auth/forgot-password" className={styles.forgotLink}>
                {texts.forgot}
              </Link>
            </div>
            <div className={styles.inputWrapper}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
              <button 
                type="button" 
                className={styles.toggleBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={`${styles.submitBtn} ${isSubmitting ? styles.loading : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? texts.loading : texts.loginBtn}
          </button>
        </form>

        <div className={styles.divider}>{texts.or}</div>

        <button 
          type="button" 
          className={styles.googleBtn}
          onClick={handleGoogleClick}
        >
          <svg className={styles.googleIcon} viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          <span>{texts.googleBtn}</span>
        </button>

        <div className={styles.footer}>
          <p>{texts.noAccount} <Link href="/auth/register" className={styles.registerLink}>{texts.register}</Link></p>
        </div>

        <GoogleAuthModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} mode="login" />
      </div>
    </div>
  );
}
