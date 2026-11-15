'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './forgot.module.css';

export default function ForgotPasswordPage() {
  const { language } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = {
    id: {
      title: 'Lupa Kata Sandi?',
      subtitle: 'Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.',
      email: 'Alamat Email',
      sendBtn: 'Kirim Tautan Reset',
      loading: 'Mengirim...',
      success: 'Tautan telah dikirim',
      successDesc: 'Silakan periksa kotak masuk Anda.',
      back: 'Kembali ke login',
    },
    en: {
      title: 'Forgot Password?',
      subtitle: 'Enter your email and we will send you a link to reset your password.',
      email: 'Email Address',
      sendBtn: 'Send Reset Link',
      loading: 'Sending...',
      success: 'Link sent successfully',
      successDesc: 'Please check your inbox.',
      back: 'Back to login',
    }
  };

  const texts = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
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
          
          {isSuccess ? (
            <div className={styles.successAnimation}>
              <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none"/>
                <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
              <h2 className={styles.title}>{texts.success}</h2>
              <p className={styles.subtitle}>{texts.successDesc}</p>
            </div>
          ) : (
            <>
              <h2 className={styles.title}>{texts.title}</h2>
              <p className={styles.subtitle}>{texts.subtitle}</p>
            </>
          )}
        </div>

        {!isSuccess && (
          <form onSubmit={handleSubmit} className={styles.form}>
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

            <button 
              type="submit" 
              className={`${styles.submitBtn} ${isSubmitting ? styles.loading : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? texts.loading : texts.sendBtn}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <Link href="/auth/login" className={styles.backLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            {texts.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
