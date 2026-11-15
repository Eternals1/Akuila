'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Site } from '@/types';

type Phase = 'intro' | 'burst' | 'menu' | 'memories' | 'bucket' | 'slides' | 'song';

function HardcodedMenuIcon({ src, fallback, title, color }: { src: string; fallback: string; title: string; color: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{fallback}</div>;
  }
  return (
    <img
      src={src}
      alt={title}
      onError={() => setErr(true)}
      style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem', filter: `drop-shadow(0 4px 8px ${color}33)` }}
    />
  );
}

function HardcodedBucketFlower({ src, fallback, color }: { src: string; fallback: string; color: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return <div style={{ fontSize: '7rem', lineHeight: 1, filter: `drop-shadow(0 0 24px ${color}99)` }}>{fallback}</div>;
  }
  return (
    <img
      src={src}
      alt="Buket Cinta"
      onError={() => setErr(true)}
      style={{ width: 150, height: 150, objectFit: 'contain', display: 'block', margin: '0 auto', filter: `drop-shadow(0 10px 30px ${color}44)` }}
    />
  );
}

function HardcodedMusicTopIcon({ src, fallback, color }: { src: string; fallback: string; color: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{fallback}</div>;
  }
  return (
    <img
      src={src}
      alt="Music Top Icon"
      onError={() => setErr(true)}
      style={{ width: 70, height: 70, objectFit: 'contain', display: 'block', margin: '0 auto 0.75rem', filter: `drop-shadow(0 6px 16px ${color}66)` }}
    />
  );
}

function HardcodedMusicDiskIcon({ src, fallback, color, secondary }: { src: string; fallback: string; color: string; secondary: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: `radial-gradient(circle, ${secondary}, ${color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
        {fallback}
      </div>
    );
  }
  return (
    <div style={{ width: 60, height: 60, borderRadius: '50%', background: `radial-gradient(circle, ${secondary}, ${color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <img
        src={src}
        alt="Music Disk Icon"
        onError={() => setErr(true)}
        style={{ width: 48, height: 48, objectFit: 'contain' }}
      />
    </div>
  );
}

const isMedia = (val: string): boolean => Boolean(val && (val.startsWith('data:') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/')));

export default function SakuraGift({ site }: { site: Site }) {
  const col = site.colorScheme;
  const c = site.customization as Record<string, any>;
  const g = (k: string, fb = '') => (c[k] as string) || fb;
  const fonts = (c.fieldFonts ?? {}) as Record<string, string>;
  const fnt = (id: string) => `'${fonts[id] ?? site.font}', 'Noto Serif JP', serif`;

  const [phase, setPhase] = useState<Phase>('intro');
  const [burstActive, setBurstActive] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEverPlayed, setHasEverPlayed] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isMedia(g('song')) || !audioRef.current) return;
    // Try to autoplay once on mount (will be blocked by browser policy until user gesture)
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      setHasEverPlayed(true);
    }).catch(() => {
      // Autoplay blocked — will play when user clicks play
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deterministic sakura petals for background — continuous falling rain in all phases
  const bgPetals = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: ((i * 97 + 13) % 100),
    dur: ((i * 17 + 30) % 30) / 10 + 5,
    delay: -((i * 31) % 60) / 10,
    size: ((i * 11 + 8) % 10) + 10,
    sway: (((i * 43) % 60) - 30),
    opacity: ((i * 7 + 3) % 5) / 10 + 0.35,
  })), []);

  // Burst elements - pile up like leaves then blow away
  const burstElements = useMemo(() => Array.from({ length: 180 }, (_, i) => {
    const isFlower = i % 3 === 0; // 33% flowers
    const size = isFlower ? (Math.random() * 160 + 140) : (Math.random() * 60 + 50); // Bigger sizes so we need fewer elements to cover the screen
    const left = Math.random() * 140 - 20; 
    const top = Math.random() * 140 - 20;
    const rot = Math.random() * 360;
    const enterDelay = Math.random() * 0.7; 
    const windDelay = 1.3 + Math.random() * 0.5; 
    const windX = Math.random() * 80 + 100; 
    const windY = (Math.random() * 100 - 50) - 40;
    const windRot = Math.random() * 720;
    return { id: i, isFlower, size, left, top, rot, enterDelay, windDelay, windX, windY, windRot };
  }), []);

  const handleOpenGift = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().then(() => { setIsPlaying(true); setHasEverPlayed(true); }).catch(() => {});
    }
    setBurstActive(true);
    setPhase('burst');
    setTimeout(() => {
      setPhase('menu');
      setBurstActive(false);
      setShowContent(true);
    }, 2800); // Extended timeout for smoother wind out and cinematic transition
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      setHasEverPlayed(true);
    }
  };

  const slides = [
    { photo: g('slide_1_photo'), text: g('slide_1_text', 'Slide 1') },
    { photo: g('slide_2_photo'), text: g('slide_2_text', 'Slide 2') },
    { photo: g('slide_3_photo'), text: g('slide_3_text', 'Slide 3') },
  ].filter(s => s.text || isMedia(s.photo));

  const loveMessages = [
    g('love_msg_1'), g('love_msg_2'), g('love_msg_3'), g('love_msg_4'),
    g('love_msg_5'), g('love_msg_6'), g('love_msg_7'), g('love_msg_8'),
  ].filter(Boolean);

  // Menu card icons — hardcoded default icons from public/ folder with fallback to emoji
  const menuIcons = [
    { icon: '/menu_icon_1.png', fallback: '📸', phase: 'memories' as Phase, title: 'Kenangan Kita',   subtitle: 'Foto & Cerita',          delay: '0s'   },
    { icon: '/menu_icon_2.png', fallback: '💐', phase: 'bucket'   as Phase, title: 'Buket Cinta',      subtitle: 'Pesan Kasih Sayang',     delay: '0.1s' },
    { icon: '/menu_icon_3.png', fallback: '📖', phase: 'slides'   as Phase, title: 'Cerita Kita',      subtitle: 'Slide Foto & Kata',      delay: '0.2s' },
    { icon: '/menu_icon_4.png', fallback: '🎵', phase: 'song'     as Phase, title: 'Lagu Untukmu',     subtitle: g('song_title','Lagu Spesial'), delay: '0.3s' },
  ];

  const cssVars = {
    ['--sg-primary' as string]: col.primary,
    ['--sg-secondary' as string]: col.secondary,
    ['--sg-accent' as string]: col.accent,
    ['--sg-bg' as string]: col.background,
    ['--sg-text' as string]: col.text,
    ['--sg-glow' as string]: col.primary + '66',
  } as React.CSSProperties;

  return (
    <>
    <div style={{ ...cssVars, minHeight: '100vh', background: col.background, color: col.text, fontFamily: `'${site.font}', 'Noto Serif JP', serif`, overflow: 'hidden', position: 'relative' }}>
      
      {/* ── Background sakura petals — Always raining continuously across all phases without stopping ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {bgPetals.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            top: '-20px',
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            ['--sway' as string]: `${p.sway}px`,
            animation: `sgPetalFall ${p.dur}s ${p.delay}s linear infinite`,
          } as React.CSSProperties}>
            🌸
          </div>
        ))}
      </div>

      {/* ════════════ INTRO PHASE ════════════ */}
      {phase === 'intro' && (
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          
          {/* Japanese decorative top */}
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.5em', color: col.primary, opacity: 0.6, marginBottom: '2rem', textTransform: 'uppercase' }}>✿ お誕生日おめでとう ✿</div>
          
          {/* Gift Box */}
          <div onClick={handleOpenGift} style={{ cursor: 'pointer', position: 'relative', marginBottom: '2.5rem', animation: burstActive ? 'sgGiftShake 0.15s ease infinite' : 'sgFloat 3s ease-in-out infinite' }}>
            {/* Box body */}
            <div style={{ width: 160, height: 140, background: `linear-gradient(135deg, ${col.primary}, ${col.secondary})`, borderRadius: '12px 12px 16px 16px', position: 'relative', boxShadow: `0 0 40px ${col.primary}66, 0 20px 60px rgba(0,0,0,0.4)`, animation: 'sgPulse 2s ease-in-out infinite' }}>
              {/* Box lid */}
              <div style={{ position: 'absolute', top: -28, left: -8, right: -8, height: 44, background: `linear-gradient(135deg, ${col.accent}, ${col.primary})`, borderRadius: '10px 10px 0 0', zIndex: 2 }} />
              {/* Ribbon vertical */}
              <div style={{ position: 'absolute', left: '50%', top: -28, bottom: 0, width: 20, transform: 'translateX(-50%)', background: `${col.accent}cc`, zIndex: 3 }} />
              {/* Ribbon horizontal */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 20, transform: 'translateY(-50%)', background: `${col.accent}cc`, zIndex: 3 }} />
              {/* Bow */}
              <div style={{ position: 'absolute', top: -56, left: '50%', transform: 'translateX(-50%)', zIndex: 4, fontSize: '2.5rem', animation: 'sgFloat 2s ease-in-out infinite reverse' }}>🎀</div>
              {/* Star sparkles */}
              {[{top:'-10px',right:'-15px',size:'1.2rem'},{top:'20px',left:'-18px',size:'0.9rem'},{bottom:'10px',right:'-12px',size:'1rem'}].map((s, i) => (
                <span key={i} style={{ position: 'absolute', ...s, fontSize: s.size, animation: `sgFloat ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite` }}>✨</span>
              ))}
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: fnt('recipient_name'), fontSize: 'clamp(2rem, 8vw, 4.5rem)', fontWeight: 700, color: col.primary, margin: '0 0 0.5rem', lineHeight: 1.1, textShadow: `0 0 40px ${col.primary}88` }}>
            Happy Birthday
          </h1>
          <h2 style={{ fontFamily: fnt('recipient_name'), fontSize: 'clamp(1.4rem, 5vw, 2.5rem)', fontWeight: 300, color: col.text, margin: '0 0 1.5rem', opacity: 0.9 }}>
            {g('recipient_name', '✨ Namamu ✨')}
          </h2>
          <p style={{ fontSize: '1rem', color: col.secondary, letterSpacing: '0.1em', marginBottom: '3rem', opacity: 0.8 }}>
            {g('opening_message', '🌸 This is a present for you 🌸')}
          </p>

          {/* Open button */}
          <button onClick={handleOpenGift} style={{ padding: '1rem 3rem', background: `linear-gradient(135deg, ${col.primary}, ${col.secondary})`, border: 'none', borderRadius: '999px', color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', boxShadow: `0 8px 30px ${col.primary}66`, animation: 'sgPulse 2s ease-in-out infinite', transition: 'transform 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            🎁 Buka Hadiahmu
          </button>

          <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', opacity: 0.3, letterSpacing: '0.2em' }}>FROM {g('from_name', '...').toUpperCase()}</p>
        </div>
      )}

      {/* ════════════ BURST TRANSITION ════════════ */}
      {/* ════════════ BURST TRANSITION (Wind Blow Style) ════════════ */}
      {phase === 'burst' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', pointerEvents: 'none' }}>
          {burstElements.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              top: `${p.top}%`,
              left: `${p.left}%`,
              animation: `sgPileEnter 0.5s ${p.enterDelay}s cubic-bezier(0.2, 0.8, 0.2, 1) both`,
              willChange: 'transform, opacity',
            }}>
              <div style={{
                animation: `sgWindBlow 0.8s ${p.windDelay}s cubic-bezier(0.6, -0.2, 0.7, 0.05) both`,
                ['--wx' as string]: `${p.windX}vw`,
                ['--wy' as string]: `${p.windY}vh`,
                ['--wrot' as string]: `${p.windRot}deg`,
                willChange: 'transform, opacity',
              }}>
                <div style={{
                  width: p.size,
                  height: p.size,
                  transform: `rotate(${p.rot}deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {p.isFlower ? (
                    <img src="/pink_flower_single.png" alt="flower" style={{ width: '100%', height: '100%', objectFit: 'contain' }} loading="eager" />
                  ) : (
                    <span style={{ fontSize: `${p.size * 0.8}px` }}>🌸</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════ MENU PHASE ════════════ */}
      {phase === 'menu' && (
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, animation: 'sgCinematicIn 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'sgFadeIn 0.6s ease forwards' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.5em', color: col.primary, opacity: 0.6, marginBottom: '0.75rem' }}>✿ あなたへのプレゼント ✿</p>
            <h1 style={{ fontFamily: fnt('recipient_name'), fontSize: 'clamp(1.5rem, 6vw, 3rem)', fontWeight: 700, color: col.primary, margin: '0 0 0.5rem', textShadow: `0 0 30px ${col.primary}66` }}>
              Happy Birthday, {g('recipient_name', 'Kamu')} 🎂
            </h1>
            <p style={{ color: col.text, opacity: 0.6, fontSize: '0.9rem' }}>Pilih hadiahmu 🎁</p>
          </div>

          {/* 4 Choice Cards in 2x2 grid */}
          <div className="sg-menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', width: '100%', maxWidth: 'clamp(320px, 90vw, 620px)' }}>
            {menuIcons.map(card => (
              <button key={card.phase} onClick={() => setPhase(card.phase)}
                className="sg-menu-card"
                style={{ padding: '2rem 1.5rem', background: `linear-gradient(135deg, ${col.primary}18, ${col.secondary}12)`, border: `1.5px solid ${col.primary}44`, borderRadius: 20, cursor: 'pointer', textAlign: 'center', color: col.text, transition: 'all 0.3s', animation: `sgFadeIn 0.6s ${card.delay} ease both`, backdropFilter: 'blur(10px)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 12px 40px ${col.primary}44`; e.currentTarget.style.borderColor = col.primary; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = `${col.primary}44`; }}
              >
                <HardcodedMenuIcon src={card.icon} fallback={card.fallback} title={card.title} color={col.primary} />
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem', color: col.primary }}>{card.title}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{card.subtitle}</div>
              </button>
            ))}
          </div>

          <p style={{ marginTop: '3rem', fontSize: '0.7rem', opacity: 0.25, letterSpacing: '0.15em' }}>FROM {g('from_name', '...').toUpperCase()} WITH ♥</p>
        </div>
      )}

      {/* ════════════ CONTENT SECTIONS (overlay) ════════════ */}
      {(['memories', 'bucket', 'slides', 'song'] as Phase[]).includes(phase) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: col.background, overflowY: 'auto', animation: 'sgFadeIn 0.4s ease forwards' }}>
          {/* Back button */}
          <button onClick={() => setPhase('menu')}
            style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', zIndex: 51, background: `${col.primary}22`, border: `1px solid ${col.primary}44`, borderRadius: '999px', color: col.primary, padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = `${col.primary}44`)}
            onMouseLeave={e => (e.currentTarget.style.background = `${col.primary}22`)}
          >
            ← Kembali
          </button>

          {/* ─── RESPONSIVE & AESTHETIC STYLES ─── */}
          <style dangerouslySetInnerHTML={{ __html: `
  /* Mobile overrides */
  @media (max-width: 768px) {
    /* Memories */
    .memories-corkboard { display: flex !important; flex-wrap: wrap !important; justify-content: center !important; gap: 1.25rem !important; width: 100% !important; height: auto !important; padding-bottom: 2rem !important; }
    .memories-item { position: relative !important; left: auto !important; top: auto !important; margin: 0 !important; }
    .memories-item.col-0, .memories-item.col-3 { width: calc(44% - 0.5rem) !important; max-width: 145px !important; }
    .memories-item.col-1, .memories-item.col-2 { width: calc(54% - 0.5rem) !important; max-width: 185px !important; }
    /* Bucket */
    .bucket-3col { display: flex !important; flex-direction: column !important; align-items: center !important; gap: 1.25rem !important; }
    .bucket-left-col, .bucket-right-col { flex-direction: row !important; flex-wrap: wrap !important; justify-content: center !important; width: 100% !important; gap: 0.75rem !important; }
    .bucket-left-col .bucket-bubble, .bucket-right-col .bucket-bubble { width: calc(50% - 0.5rem) !important; max-width: 200px !important; text-align: center !important; border-radius: 12px !important; }
    .bucket-center-flower { order: -1 !important; margin-bottom: 0.5rem !important; }
    /* Slide */
    .slides-row { flex-direction: column !important; }
    .slides-photo { width: 100% !important; max-width: 300px !important; margin: 0 auto !important; }
    /* Song card */
    .song-spotify-card { max-width: 100% !important; margin: 0 1rem !important; }
    /* Menu grid */
    .sg-menu-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0.875rem !important; max-width: 95vw !important; }
    .sg-menu-card { padding: 1.25rem 0.75rem !important; }
  }
  /* Desktop enhancements */
  @media (min-width: 769px) {
    .bucket-3col { gap: 2.5rem !important; }
    .bucket-left-col, .bucket-right-col { gap: 1.25rem !important; }
    .bucket-bubble { font-size: 0.9rem !important; padding: 0.9rem 1.2rem !important; }
  }
`}} />

{/* ─── MEMORIES — Overlapping Polaroid Collage ─── */}
          {phase === 'memories' && (() => {
            const photoKeys = [
              'memory_photo_1','memory_photo_2','memory_photo_3','memory_photo_4',
              'memory_photo_5','memory_photo_6','memory_photo_7','memory_photo_8',
            ];

            // All photos have the EXACT same vertical image height (PH = 155px).
            // Widths vary by column: Narrow (150px) for col 0 & 3, Wide (205px) for col 1 & 2.
            // This satisfies: "fotonya dibuat ukuran panjang [tinggi sama], tetapi lebar kiri kanannya saja berbeda"
            // Overlap is reduced to ~4px so every card and face is clearly visible without heavy overlap.
            const PH = 155; // photo image height px (identical for all photos)
            const cardPad = 10;
            const labelH = 34;
            const CARD_H = cardPad + PH + cardPad + labelH; // 209px total height for all cards
            const row1Top = 20;
            const row2Top = 221; // minimal ~8px vertical touch/overlap with row 1

            const layout = [
              // Row 1 — top row (rotations and positions matching reference image)
              { l: 0,   t: row1Top + 0,  w: 150, rot: -6,   delay: '0s'    }, // photo 1 (col 0: narrow, left lean)
              { l: 146, t: row1Top - 6,  w: 205, rot: 2.5,  delay: '0.08s' }, // photo 2 (col 1: wide, right lean)
              { l: 347, t: row1Top + 3,  w: 205, rot: -2,   delay: '0.16s' }, // photo 3 (col 2: wide, left lean)
              { l: 548, t: row1Top - 4,  w: 150, rot: 5,    delay: '0.24s' }, // photo 4 (col 3: narrow, right lean)
              // Row 2 — bottom row
              { l: 6,   t: row2Top + 4,  w: 150, rot: -4,   delay: '0.3s'  }, // photo 5 (col 0: narrow, left lean)
              { l: 152, t: row2Top - 3,  w: 205, rot: 3,    delay: '0.38s' }, // photo 6 (col 1: wide, right lean)
              { l: 353, t: row2Top + 6,  w: 205, rot: -1.5, delay: '0.46s' }, // photo 7 (col 2: wide, left lean)
              { l: 554, t: row2Top + 0,  w: 150, rot: 4.5,  delay: '0.54s' }, // photo 8 (col 3: narrow, right lean)
            ];

            const containerH = row2Top + CARD_H + 20; // 450px
            const containerW = 705; // ~700px

            return (
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem 1rem 4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'sgFadeIn 0.5s ease forwards' }}>
                  <h2 style={{ fontFamily: fnt('recipient_name'), fontSize: '2.4rem', color: col.primary, margin: '0 0 0.5rem', textShadow: `0 0 20px ${col.primary}66` }}>Kenangan Kita</h2>
                  <p style={{ opacity: 0.6, fontSize: '0.9rem', letterSpacing: '0.05em' }}>✿ Momen Spesial yang Selalu Kita Ingat ✿</p>
                </div>

                {/* Collage container — centered, fixed size */}
                <div className="memories-corkboard" style={{ position: 'relative', width: containerW, height: containerH, margin: '0 auto', maxWidth: '95vw' }}>

                  {photoKeys.map((key, i) => {
                    const l = layout[i];
                    const hasPhoto = isMedia(g(key));
                    const isLastCol = i === 3 || i === 7;
                    const rot = l.rot;

                    return (
                      <div
                        key={key}
                        className={`memories-item col-${i % 4}`}
                        style={{
                          position: 'absolute',
                          left: l.l,
                          top: l.t,
                          width: l.w,
                          background: '#fefefe',
                          padding: `${cardPad}px ${cardPad}px ${labelH}px`,
                          boxShadow: '0 8px 28px rgba(0,0,0,0.45), 0 3px 8px rgba(0,0,0,0.2)',
                          transform: `rotate(${rot}deg)`,
                          animation: `sgFadeIn 0.5s ${l.delay} ease both`,
                          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, z-index 0s',
                          zIndex: i + 1,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'rotate(0deg) scale(1.12) translateY(-6px)';
                          e.currentTarget.style.zIndex = '30';
                          e.currentTarget.style.boxShadow = '0 18px 50px rgba(0,0,0,0.65)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = `rotate(${rot}deg)`;
                          e.currentTarget.style.zIndex = `${i + 1}`;
                          e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.45), 0 3px 8px rgba(0,0,0,0.2)';
                        }}
                      >
                        {/* Washi tape */}
                        <div style={{
                          position: 'absolute', top: -11,
                          left: [0,4].includes(i) ? '22%' : [1,5].includes(i) ? '45%' : [2,6].includes(i) ? '60%' : '70%',
                          transform: 'translateX(-50%) rotate(-2deg)',
                          width: 48, height: 16,
                          background: `linear-gradient(90deg, ${col.accent}cc, ${col.primary}99)`,
                          borderRadius: 2,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        }} />

                        {/* Photo — landscape, fixed height */}
                        {hasPhoto ? (
                          <img src={g(key)} alt={`Kenangan ${i+1}`}
                            style={{
                              width: '100%',
                              height: PH,
                              objectFit: 'cover',
                              display: 'block',
                              borderRadius: 1,
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: PH,
                            background: `${col.primary}14`,
                            border: `1.5px dashed ${col.primary}44`,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                            borderRadius: 1,
                          }}>
                            <span style={{ fontSize: '1.6rem', opacity: 0.3 }}>📷</span>
                            <span style={{ fontSize: '0.58rem', color: col.primary, opacity: 0.5, fontWeight: 600 }}>Foto {i+1}</span>
                          </div>
                        )}

                        {/* Bottom label */}
                        <div style={{
                          position: 'absolute', bottom: 9, left: 0, right: 0,
                          textAlign: 'center', fontSize: '0.57rem',
                          color: '#999', fontFamily: fnt('recipient_name'),
                          letterSpacing: '0.04em',
                        }}>✿ {i + 1} ✿</div>

                        {/* Sakura at outer right corner of last-column photos */}
                        {isLastCol && (
                          <img
                            src="/pink_flower_single.png"
                            alt="" aria-hidden="true"
                            style={{
                              position: 'absolute',
                              right: i === 3 ? -30 : -24,
                              top: i === 3 ? '8%' : '60%',
                              width: i === 3 ? 68 : 54,
                              height: i === 3 ? 68 : 54,
                              objectFit: 'contain',
                              transform: `rotate(${i === 3 ? 22 : -28}deg)`,
                              opacity: 0.9,
                              animation: `sgFloat ${i === 3 ? 4.2 : 3.8}s ease-in-out ${i === 3 ? 0 : 0.5}s infinite`,
                              pointerEvents: 'none',
                              filter: `drop-shadow(0 4px 12px ${col.primary}66)`,
                              zIndex: 40,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Caption */}
                {g('memories_caption') && (
                  <div style={{ background: `linear-gradient(135deg, ${col.primary}18, ${col.secondary}15)`, border: `1.5px solid ${col.primary}44`, borderRadius: 20, padding: '1.4rem 2rem', lineHeight: 1.8, fontSize: '1rem', opacity: 0.95, textAlign: 'center', fontStyle: 'italic', animation: 'sgFadeIn 0.5s 0.6s ease both', marginTop: '2.5rem', maxWidth: 700, margin: '2.5rem auto 0' }}>
                    "{g('memories_caption')}"
                  </div>
                )}
              </div>
            );
          })()}

          {/* ─── BUCKET — Interactive, Spacious Desktop Grid, Bouquet on Top for Mobile ─── */}
          {phase === 'bucket' && (() => {
            const defaultMsgs = [
              'Kamu sangat spesial bagiku 💕',
              'Semoga harimu selalu bersinar 🌟',
              'Terima kasih selalu hadir ✿',
              'Kamu adalah hadiah terindah 🎁',
              'Aku bersyukur mengenalmu 🌸',
              'Setiap momen bersamamu berharga 💫',
              'Selalu ada di sisimu 🤝',
              'Happy Birthday sayang 🎂',
            ];
            const allMsgs = [...loveMessages];
            for (const d of defaultMsgs) { if (allMsgs.length < 8) allMsgs.push(d); }
            const leftMsgs  = allMsgs.slice(0, 4);
            const rightMsgs = allMsgs.slice(4, 8);

            const BubbleLeft = ({ msg, i }: { msg: string; i: number }) => (
              <div className="bucket-bubble-item bucket-bubble" style={{
                background: `linear-gradient(135deg, ${col.primary}38, ${col.secondary}28)`,
                border: `1.5px solid ${col.primary}66`,
                borderRadius: '20px 20px 4px 20px',
                padding: '1.1rem 1.4rem',
                fontSize: '1rem',
                lineHeight: 1.6,
                textAlign: 'right',
                animation: `sgBubblePop 0.45s ${i * 0.12}s ease both`,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 8px 24px ${col.primary}33`,
                transform: `rotate(${-3 + (i % 3) * 2}deg) translateX(${-6 * (i % 2)}px)`,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.06) rotate(0deg)';
                e.currentTarget.style.boxShadow = `0 14px 35px ${col.primary}66`;
                e.currentTarget.style.background = `linear-gradient(135deg, ${col.primary}55, ${col.secondary}44)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = `rotate(${-3 + (i % 3) * 2}deg) translateX(${-6 * (i % 2)}px)`;
                e.currentTarget.style.boxShadow = `0 8px 24px ${col.primary}33`;
                e.currentTarget.style.background = `linear-gradient(135deg, ${col.primary}38, ${col.secondary}28)`;
              }}
              >
                <span style={{ animation: `sgBubbleFloat ${2.2 + i * 0.35}s ease-in-out ${i * 0.1}s infinite`, display: 'inline-block', fontWeight: 500 }}>{msg}</span>
              </div>
            );

            const BubbleRight = ({ msg, i }: { msg: string; i: number }) => (
              <div className="bucket-bubble-item bucket-bubble" style={{
                background: `linear-gradient(135deg, ${col.secondary}38, ${col.primary}28)`,
                border: `1.5px solid ${col.primary}66`,
                borderRadius: '20px 20px 20px 4px',
                padding: '1.1rem 1.4rem',
                fontSize: '1rem',
                lineHeight: 1.6,
                textAlign: 'left',
                animation: `sgBubblePop 0.45s ${0.06 + i * 0.12}s ease both`,
                backdropFilter: 'blur(12px)',
                boxShadow: `0 8px 24px ${col.primary}33`,
                transform: `rotate(${3 - (i % 3) * 2}deg) translateX(${6 * (i % 2)}px)`,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.06) rotate(0deg)';
                e.currentTarget.style.boxShadow = `0 14px 35px ${col.primary}66`;
                e.currentTarget.style.background = `linear-gradient(135deg, ${col.secondary}55, ${col.primary}44)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = `rotate(${3 - (i % 3) * 2}deg) translateX(${6 * (i % 2)}px)`;
                e.currentTarget.style.boxShadow = `0 8px 24px ${col.primary}33`;
                e.currentTarget.style.background = `linear-gradient(135deg, ${col.secondary}38, ${col.primary}28)`;
              }}
              >
                <span style={{ animation: `sgBubbleFloat ${2.5 + i * 0.35}s ease-in-out ${i * 0.1}s infinite`, display: 'inline-block', fontWeight: 500 }}>{msg}</span>
              </div>
            );

            return (
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem 1rem 4rem', maxWidth: 980, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'sgFadeIn 0.5s ease forwards' }}>
                  <h2 style={{ fontFamily: fnt('recipient_name'), fontSize: '2.5rem', color: col.primary, margin: '0 0 0.5rem', textShadow: `0 0 25px ${col.primary}66` }}>Buket Cinta</h2>
                  <p style={{ opacity: 0.6, fontSize: '0.95rem' }}>✿ Sentuh ucapan untuk melihat cinta dari hatiku ✿</p>
                </div>

                {/* 3-column grid on Desktop, Stacks vertically with Flower on TOP on Mobile */}
                <div className="bucket-3col" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: '2.5rem',
                  alignItems: 'center',
                }}>

                  {/* KIRI — bubbles 1-4 */}
                  <div className="bucket-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', alignItems: 'flex-end' }}>
                    {leftMsgs.map((msg, i) => <BubbleLeft key={i} msg={msg} i={i} />)}
                  </div>

                  {/* TENGAH (Top on mobile) — bunga besar */}
                  <div className="bucket-center-flower" style={{ textAlign: 'center', animation: 'sgFloat 3.5s ease-in-out infinite', padding: '1rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, ${col.primary}33 0%, transparent 70%)`, filter: 'blur(20px)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1, transform: 'scale(1.15)', transition: 'transform 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.25) rotate(5deg)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                    >
                      <HardcodedBucketFlower src="/bucket_flower.png" fallback="💐" color={col.primary} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: col.primary, opacity: 0.6, marginTop: '1rem', letterSpacing: '0.25em', fontWeight: 600 }}>✿ BUKET SPESIAL ✿</div>
                  </div>

                  {/* KANAN — bubbles 5-8 */}
                  <div className="bucket-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem', alignItems: 'flex-start' }}>
                    {rightMsgs.map((msg, i) => <BubbleRight key={i} msg={msg} i={i} />)}
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '1.8rem', opacity: 0.4, animation: 'sgFloat 2.5s ease-in-out infinite reverse' }}>🌸 ✿ 💖 ✿ 🌸</div>
              </div>
            );
          })()}



          {/* ─── SLIDES — Bigger layout ─── */}
          {phase === 'slides' && (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem 2rem 3rem', maxWidth: 900, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem', animation: 'sgFadeIn 0.5s ease forwards' }}>
                <h2 style={{ fontFamily: fnt('recipient_name'), fontSize: '2.2rem', color: col.primary, margin: '0 0 0.5rem', textShadow: `0 0 20px ${col.primary}66` }}>Cerita Kita</h2>
                <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>✿ Setiap momen punya cerita ✿</p>
              </div>

              {/* Slide content */}
              {(slides.length > 0 ? slides : [{ photo: '', text: 'Isi foto dan cerita di halaman edit untuk slide ini 🌸' }]).map((slide, i) => (
                <div key={i} className="slides-row" style={{ display: i === currentSlide ? 'flex' : 'none', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap', animation: 'sgFadeIn 0.4s ease forwards', marginBottom: '2rem' }}>
                  {/* Photo — bigger */}
                  <div className="slides-photo" style={{ flex: '0 0 auto', width: 'clamp(200px, 40%, 280px)' }}>
                    {isMedia(slide.photo) ? (
                      <img src={slide.photo} alt={`Slide ${i+1}`} style={{ width: '100%', borderRadius: 20, objectFit: 'cover', border: `3px solid ${col.primary}55`, boxShadow: `0 12px 40px ${col.primary}33, 0 4px 16px rgba(0,0,0,0.4)`, animation: 'sgSlideLeft 0.4s ease forwards' }} />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 20, background: `${col.primary}11`, border: `2px dashed ${col.primary}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', opacity: 0.4 }}>📷</div>
                    )}
                  </div>
                  {/* Text — bigger */}
                  <div style={{ flex: 1, minWidth: 240, animation: 'sgSlideRight 0.4s ease forwards' }}>
                    <div style={{ width: 50, height: 4, background: `linear-gradient(90deg, ${col.primary}, transparent)`, borderRadius: 2, marginBottom: '1.25rem' }} />
                    <p style={{ lineHeight: 2, fontSize: '1.1rem', opacity: 0.9, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{slide.text}</p>
                    <div style={{ marginTop: '1.5rem', color: col.primary, opacity: 0.6, fontSize: '0.9rem', fontWeight: 600 }}>— {g('from_name', 'Aku')} 🌸</div>
                  </div>
                </div>
              ))}

              {/* Slide navigation */}
              {slides.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setCurrentSlide(s => Math.max(0, s - 1))} disabled={currentSlide === 0}
                    style={{ padding: '0.7rem 1.5rem', background: `${col.primary}22`, border: `1px solid ${col.primary}44`, borderRadius: '999px', color: col.primary, cursor: 'pointer', opacity: currentSlide === 0 ? 0.3 : 1, fontSize: '1rem' }}>←</button>
                  <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>{currentSlide + 1} / {slides.length}</span>
                  <button onClick={() => setCurrentSlide(s => Math.min(slides.length - 1, s + 1))} disabled={currentSlide === slides.length - 1}
                    style={{ padding: '0.7rem 1.5rem', background: `${col.primary}22`, border: `1px solid ${col.primary}44`, borderRadius: '999px', color: col.primary, cursor: 'pointer', opacity: currentSlide === slides.length - 1 ? 0.3 : 1, fontSize: '1rem' }}>→</button>
                </div>
              )}
              {slides.length > 1 && (
                <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: '1rem' }}>
                  {slides.map((_, i) => <div key={i} onClick={() => setCurrentSlide(i)} style={{ width: i === currentSlide ? 24 : 9, height: 9, borderRadius: 5, background: i === currentSlide ? col.primary : `${col.primary}44`, cursor: 'pointer', transition: 'all 0.3s' }} />)}
                </div>
              )}
            </div>
          )}

          {/* ─── SONG ─── */}
          {phase === 'song' && (
            <div className="song-spotify-card" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem 1.5rem 3rem', position: 'relative' }}>

              {/* Sakura petals around card — absolute positioned */}
              {[
                { top: '8%',   left: '5%',   rot: 20,  size: 56, opacity: 0.75, dur: 4.2 },
                { top: '6%',   right: '6%',  rot: -35, size: 48, opacity: 0.7,  dur: 3.8 },
                { top: '45%',  left: '2%',   rot: 15,  size: 44, opacity: 0.65, dur: 5.1 },
                { top: '42%',  right: '3%',  rot: -20, size: 52, opacity: 0.72, dur: 4.6 },
                { bottom: '8%',left: '8%',   rot: -10, size: 40, opacity: 0.65, dur: 4.0 },
                { bottom: '6%',right: '7%',  rot: 25,  size: 46, opacity: 0.7,  dur: 3.6 },
              ].map((s, i) => (
                <img key={i} src="/pink_flower_single.png" alt="" aria-hidden="true"
                  style={{
                    position: 'absolute',
                    width: s.size, height: s.size,
                    objectFit: 'contain',
                    top: (s as any).top, left: (s as any).left,
                    right: (s as any).right, bottom: (s as any).bottom,
                    transform: `rotate(${s.rot}deg)`,
                    opacity: s.opacity,
                    animation: `sgFloat ${s.dur}s ease-in-out ${i * 0.4}s infinite`,
                    pointerEvents: 'none',
                    filter: `drop-shadow(0 4px 12px ${col.primary}55)`,
                  }}
                />
              ))}

              {/* Spotify-style card */}
              <div style={{
                background: `linear-gradient(160deg, ${col.primary}22, ${col.secondary}15, rgba(0,0,0,0.6))`,
                backdropFilter: 'blur(30px)',
                border: `1.5px solid ${col.primary}44`,
                borderRadius: 28,
                padding: '2.5rem 2rem 2rem',
                maxWidth: 360,
                width: '100%',
                boxShadow: `0 30px 80px ${col.primary}33, 0 8px 30px rgba(0,0,0,0.6)`,
                animation: 'sgFadeIn 0.5s ease forwards',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}>
                {/* Album art / vinyl */}
                <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto 1.75rem' }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: `conic-gradient(${col.primary} 0deg, ${col.background} 60deg, ${col.primary} 120deg, ${col.background} 180deg, ${col.primary} 240deg, ${col.background} 300deg, ${col.primary} 360deg)`,
                    boxShadow: `0 0 50px ${col.primary}55, 0 15px 50px rgba(0,0,0,0.5)`,
                    animation: isPlaying ? 'sgVinylSpin 3s linear infinite' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <HardcodedMusicDiskIcon src="/music_disk_icon.png" fallback="🎵" color={col.primary} secondary={col.secondary} />
                  </div>
                  {/* Tonearm */}
                  <div style={{ position: 'absolute', top: -8, right: -16, width: 70, height: 3, background: col.primary, borderRadius: 2, transformOrigin: 'right center', transform: isPlaying ? 'rotate(-25deg)' : 'rotate(-45deg)', transition: 'transform 0.5s ease', boxShadow: `0 0 8px ${col.primary}` }} />
                </div>

                {/* Song info */}
                <h2 style={{ fontFamily: fnt('recipient_name'), fontSize: '1.4rem', color: col.primary, margin: '0 0 0.25rem', textShadow: `0 0 16px ${col.primary}66` }}>
                  {g('song_title', 'Lagu Spesial')}
                </h2>
                <p style={{ opacity: 0.5, fontSize: '0.8rem', margin: '0 0 1.75rem' }}>Dipersembahkan oleh {g('from_name', 'Aku')} 🌸</p>

                {/* EQ bars */}
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'flex-end', height: 28, marginBottom: '1.75rem' }}>
                  {Array.from({ length: 9 }, (_, i) => (
                    <div key={i} style={{
                      width: 4, borderRadius: 2,
                      background: `linear-gradient(to top, ${col.secondary}, ${col.primary})`,
                      height: isPlaying ? `${((i * 7 + 5) % 20) + 8}px` : '3px',
                      animation: isPlaying ? `sgFloat ${0.35 + i * 0.08}s ease-in-out ${i * 0.04}s infinite` : 'none',
                      transition: 'height 0.4s ease',
                      opacity: isPlaying ? 1 : 0.3,
                    }} />
                  ))}
                </div>

                {/* Controls row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  {isMedia(g('song')) ? (
                    <button onClick={toggleAudio} style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${col.primary}, ${col.secondary})`,
                      border: 'none', cursor: 'pointer', fontSize: '1.5rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 25px ${col.primary}66`,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                  ) : (
                    <div style={{ padding: '1rem', background: `${col.primary}11`, border: `1px dashed ${col.primary}33`, borderRadius: 12, opacity: 0.6, fontSize: '0.85rem' }}>
                      🎵 Upload lagu di halaman edit
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

      {/* ════ GLOBAL AUDIO — persists across all phases without restarting ════ */}
      {isMedia(g('song')) && (
        <audio ref={audioRef} src={g('song')} loop style={{ display: 'none' }} />
      )}

      {/* ════ FLOATING MINI PLAYER ════ */}
      {isMedia(g('song')) && hasEverPlayed && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: `linear-gradient(135deg, ${col.primary}22, ${col.secondary}18)`,
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${col.primary}55`,
          borderRadius: '999px',
          padding: '0.6rem 1rem 0.6rem 0.75rem',
          boxShadow: `0 8px 32px ${col.primary}44, 0 2px 8px rgba(0,0,0,0.4)`,
          animation: 'sgFadeIn 0.4s ease forwards',
        }}>
          {/* EQ bars */}
          <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: 20, width: 24 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                width: 4, borderRadius: 2, background: col.primary,
                height: isPlaying ? `${((i * 7 + 4) % 12) + 6}px` : '4px',
                animation: isPlaying ? `sgFloat ${0.3 + i * 0.12}s ease-in-out ${i * 0.07}s infinite` : 'none',
                transition: 'height 0.3s ease',
              }} />
            ))}
          </div>
          {/* Song title */}
          <span style={{ fontSize: '0.78rem', color: col.text, opacity: 0.85, maxWidth: 120, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {g('song_title', 'Lagu Spesial')}
          </span>
          {/* Play/Pause */}
          <button onClick={toggleAudio} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `linear-gradient(135deg, ${col.primary}, ${col.secondary})`,
            border: 'none', cursor: 'pointer', fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: isPlaying ? `0 0 16px ${col.primary}88` : 'none',
            transition: 'box-shadow 0.3s, transform 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      )}
    </>
  );
}
