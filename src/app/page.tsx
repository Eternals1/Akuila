'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from '@/contexts/AuthContext';

function HardcodedFeatureAestheticIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>✨</div>;
  return <img src="/images/home/feature_aesthetic.png" alt="Aesthetic Templates" onError={() => setErr(true)} style={{ width: 32, height: 32, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.3))' }} />;
}

function HardcodedFeatureCustomizationIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>🎨</div>;
  return <img src="/images/home/feature_customization.png" alt="Easy Customization" onError={() => setErr(true)} style={{ width: 32, height: 32, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.3))' }} />;
}

function HardcodedFeatureMusicIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>🎵</div>;
  return <img src="/images/home/feature_music.png" alt="Music Player" onError={() => setErr(true)} style={{ width: 32, height: 32, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.3))' }} />;
}

function HardcodedFeatureQrIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>📱</div>;
  return <img src="/images/home/feature_qr.png" alt="Custom QR Code" onError={() => setErr(true)} style={{ width: 32, height: 32, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.3))' }} />;
}

function HardcodedFeatureLinkIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>🔗</div>;
  return <img src="/images/home/feature_link.png" alt="Personal Links" onError={() => setErr(true)} style={{ width: 32, height: 32, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.3))' }} />;
}

function HardcodedFeaturePaymentIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>🔒</div>;
  return <img src="/images/home/feature_payment.png" alt="Secure Payment" onError={() => setErr(true)} style={{ width: 32, height: 32, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.3))' }} />;
}

function HardcodedStepChooseIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🖼️</div>;
  return <img src="/images/home/step_choose.png" alt="Choose Template" onError={() => setErr(true)} style={{ width: 48, height: 48, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))' }} />;
}

function HardcodedStepCustomizeIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>✍️</div>;
  return <img src="/images/home/step_customize.png" alt="Customize" onError={() => setErr(true)} style={{ width: 48, height: 48, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))' }} />;
}

function HardcodedStepPayIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>💳</div>;
  return <img src="/images/home/step_pay.png" alt="Preview & Pay" onError={() => setErr(true)} style={{ width: 48, height: 48, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))' }} />;
}

function HardcodedStepShareIcon() {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🚀</div>;
  return <img src="/images/home/step_share.png" alt="Share!" onError={() => setErr(true)} style={{ width: 48, height: 48, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))' }} />;
}

export default function Home() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { language } = useAuth();
  const tr = (id: string, en: string) => language === 'id' ? id : en;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    const stepItems = document.querySelectorAll(`.${styles.stepItem}`);
    stepItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.floatingElements}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
          <div className={styles.circle3}></div>
        </div>
        
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h1 className={styles.title}>
              {tr('Ciptakan Momen Spesial', 'Create Special Moments')}
              <br />
              {tr('Dalam Satu Klik', 'In One Click')}
            </h1>
            <p className={styles.subtitle}>
              {tr(
                'Buat undangan pernikahan, kartu ucapan, dan hadiah personal digital yang indah dan interaktif dengan mudah dalam waktu singkat.',
                'Create beautiful and interactive digital wedding invitations, greeting cards, and personalized gifts easily in no time.'
              )}
            </p>
            <div className={styles.buttonGroup}>
              <button className={styles.primaryBtn} onClick={() => router.push('/auth/register')}>
                {tr('Mulai Sekarang', 'Get Started')}
              </button>
              <button className={styles.outlineBtn} onClick={() => router.push('/catalog')}>
                {tr('Jelajahi Katalog', 'Explore Catalog')}
              </button>
            </div>
          </div>
          
          <div className={styles.heroRight}>
            <div className={styles.floatingImage2}>
              <img src="/images/home/hero_template_2.png" alt="Template Preview 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className={styles.floatingImage1}>
              <img src="/images/home/hero_template_1.png" alt="Template Preview 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{tr('Fitur Unggulan', 'Key Features')}</h2>
          <p className={styles.sectionSubtitle}>
            {tr(
              'Semua yang Anda butuhkan untuk membuat micro-site menawan dan berkesan.',
              'Everything you need to create stunning and memorable interactive micro-sites.'
            )}
          </p>
        </div>
        
        <div className={styles.featuresGrid}>
          {[
            {
              title: tr('Templat Estetis', 'Aesthetic Templates'),
              desc: tr('15+ templat romantis siap pakai untuk berbagai acara.', '15+ ready-to-use romantic templates for various events.'),
              iconComponent: <HardcodedFeatureAestheticIcon />,
            },
            {
              title: tr('Kustomisasi Mudah', 'Easy Customization'),
              desc: tr('Sistem drag & drop dengan pratinjau real-time.', 'Drag & drop system with real-time preview.'),
              iconComponent: <HardcodedFeatureCustomizationIcon />,
            },
            {
              title: tr('Pemutar Musik', 'Music Player'),
              desc: tr('Sematkan lagu favorit Anda untuk suasana romantis.', 'Embed your favorite songs for a romantic vibe.'),
              iconComponent: <HardcodedFeatureMusicIcon />,
            },
            {
              title: tr('QR Code Kustom', 'Custom QR Code'),
              desc: tr('Bentuk dan warna yang unik sesuai tema acara.', 'Unique shapes and colors matching your theme.'),
              iconComponent: <HardcodedFeatureQrIcon />,
            },
            {
              title: tr('Tautan Personal', 'Personal Links'),
              desc: tr('URL slug khusus dan eksklusif untuk Anda.', 'Custom and exclusive URL slug just for you.'),
              iconComponent: <HardcodedFeatureLinkIcon />,
            },
            {
              title: tr('Pembayaran Aman', 'Secure Payment'),
              desc: tr('Mendukung QRIS, dompet digital, dan transfer bank.', 'Supports QRIS, digital wallets, and bank transfers.'),
              iconComponent: <HardcodedFeaturePaymentIcon />,
            },
          ].map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {feature.iconComponent}
                </div>
                <h3 className={styles.featureTitle} style={{ margin: 0, lineHeight: 1.25 }}>{feature.title}</h3>
              </div>
              <p className={styles.featureDesc} style={{ margin: 0 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorksSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{tr('Cara Kerja', 'How It Works')}</h2>
          <p className={styles.sectionSubtitle}>
            {tr(
              'Empat langkah mudah menuju momen tak terlupakan bersama orang tersayang.',
              'Four simple steps to unforgettable moments with your loved ones.'
            )}
          </p>
        </div>

        <div className={styles.stepsContainer} ref={stepsRef}>
          {[
            {
              title: tr('Pilih Templat', 'Choose Template'),
              desc: tr('Pilih desain yang sesuai dengan tema acara Anda.', 'Select a design that matches your event theme.'),
              iconComponent: <HardcodedStepChooseIcon />,
            },
            {
              title: tr('Kustomisasi', 'Customize'),
              desc: tr('Ubah teks, foto, warna, dan musik sesuai keinginan.', 'Change text, photos, colors, and music as you wish.'),
              iconComponent: <HardcodedStepCustomizeIcon />,
            },
            {
              title: tr('Pratinjau & Bayar', 'Preview & Pay'),
              desc: tr('Lihat hasil akhir dan lakukan pembayaran aman.', 'Check the final result and make a secure payment.'),
              iconComponent: <HardcodedStepPayIcon />,
            },
            {
              title: tr('Bagikan!', 'Share!'),
              desc: tr('Kirim tautan undangan ke semua tamu Anda dengan mudah.', 'Send the invitation link to all your guests easily.'),
              iconComponent: <HardcodedStepShareIcon />,
            },
          ].map((step, idx) => (
            <div key={idx} className={styles.stepItem}>
              <div className={styles.stepNumberContainer}>
                <div className={styles.stepNumber}>{idx + 1}</div>
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle} style={{ margin: '0 0 0.5rem 0' }}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricingSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{tr('Harga Transparan', 'Transparent Pricing')}</h2>
          <p className={styles.sectionSubtitle}>
            {tr(
              'Bayar sekali, miliki selamanya. Tidak ada biaya bulanan.',
              'Pay once, own forever. No monthly fees.'
            )}
          </p>
        </div>

        <div className={styles.pricingGrid}>
          {[
            {
              tier: 'Basic',
              price: 'Rp 39.900',
              original: 'Rp 79.000',
              color: '#4ade80',
              popular: false,
              features: [
                tr('1 Halaman Interaktif', '1 Interactive Page'),
                tr('Pemutar Musik', 'Music Player'),
                tr('QR Code Kustom', 'Custom QR Code'),
                tr('Tautan URL Kustom', 'Custom URL Link'),
                tr('Template Standar', 'Standard Templates'),
              ],
              excluded: [
                tr('Galeri Foto', 'Photo Gallery'),
                tr('Animasi Premium', 'Premium Animations'),
                tr('Efek Partikel', 'Particle Effects'),
              ],
            },
            {
              tier: 'Premium',
              price: 'Rp 79.900',
              original: 'Rp 149.000',
              color: '#a855f7',
              popular: true,
              features: [
                tr('Semua fitur Basic', 'All Basic features'),
                tr('Galeri Foto (10 foto)', 'Photo Gallery (10 photos)'),
                tr('Animasi Premium', 'Premium Animations'),
                tr('Hitung Mundur Real-time', 'Real-time Countdown'),
                tr('RSVP Interaktif', 'Interactive RSVP'),
              ],
              excluded: [
                tr('Efek Partikel', 'Particle Effects'),
              ],
            },
            {
              tier: 'Exclusive',
              price: 'Rp 99.900',
              original: 'Rp 199.000',
              color: '#f59e0b',
              popular: false,
              features: [
                tr('Semua fitur Premium', 'All Premium features'),
                tr('Efek Partikel & Animasi', 'Particle & Animation Effects'),
                tr('Foto Tak Terbatas', 'Unlimited Photos'),
                tr('Desain Eksklusif', 'Exclusive Designs'),
                tr('Prioritas Dukungan', 'Priority Support'),
              ],
              excluded: [],
            },
          ].map((plan) => (
            <div
              key={plan.tier}
              className={styles.pricingCard}
              style={plan.popular ? { borderColor: plan.color, transform: 'scale(1.03)' } : {}}
            >
              {plan.popular && (
                <div className={styles.popularBadge}>{tr('⭐ Paling Populer', '⭐ Most Popular')}</div>
              )}
              <div className={styles.pricingCardHeader}>
                <span className={styles.tierName} style={{ color: plan.color }}>{plan.tier}</span>
                <div>
                  <span className={styles.tierOriginalPrice}>{plan.original}</span>
                  <span className={styles.tierPrice}>{plan.price}</span>
                </div>
              </div>
              <ul className={styles.tierFeatures}>
                {plan.features.map((f, i) => (
                  <li key={i} className={styles.featureItem}>
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </li>
                ))}
                {plan.excluded.map((f, i) => (
                  <li key={`x-${i}`} className={`${styles.featureItem} ${styles.featureExcluded}`}>
                    <span>✗</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={styles.tierCta}
                style={{
                  borderColor: plan.color,
                  color: plan.popular ? '#fff' : plan.color,
                  background: plan.popular
                    ? `linear-gradient(135deg, ${plan.color}cc, ${plan.color}66)`
                    : 'transparent',
                }}
                onClick={() => router.push('/auth/register')}
              >
                {tr('Mulai Sekarang', 'Get Started')}
              </button>
            </div>
          ))}
        </div>

        <p className={styles.pricingNote}>
          {tr('* Harga berlaku per pembuatan micro-site. Tidak ada biaya bulanan.', '* Price applies per micro-site creation. No monthly fees.')}
        </p>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{tr('Apa Kata Mereka', 'Testimonials')}</h2>
          <p className={styles.sectionSubtitle}>
            {tr(
              'Pengalaman manis pengguna Akuila dalam menciptakan momen bahagia.',
              'Sweet experiences of Akuila users in creating joyous moments.'
            )}
          </p>
        </div>
        <div className={styles.testimonialScroll}>
          {[
            { name: 'Sarah & Budi', quote: tr('Sangat mudah digunakan dan hasilnya sangat memuaskan! Template-nya cantik banget, banyak tamu yang memuji undangan kami.', 'Very easy to use and the result is so satisfying! The template is gorgeous, many guests praised our invitation.') },
            { name: 'Andi Pratama', quote: tr('Platform terbaik untuk buat ucapan ulang tahun digital. Cepat, murah, dan tampilannya sangat premium.', 'Best platform to create digital birthday wishes. Fast, affordable, and looks very premium.') },
            { name: 'Rina & Dio', quote: tr('Fitur musik dan galerinya sangat berkesan. Harga premium yang ditawarkan sangat worth it untuk momen sekali seumur hidup.', 'The music and gallery features are very memorable. The premium price offered is very worth it for a once-in-a-lifetime moment.') }
          ].map((item, i) => (
            <div key={i} className={styles.testimonialCard}>
              <div className={styles.testimonialHeader}>
                <div className={styles.testimonialAvatar}></div>
                <div>
                  <h4 className={styles.testimonialName}>{item.name}</h4>
                  <p className={styles.testimonialRole}>Happy Client</p>
                </div>
              </div>
              <p className={styles.testimonialQuote}>&quot;{item.quote}&quot;</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
