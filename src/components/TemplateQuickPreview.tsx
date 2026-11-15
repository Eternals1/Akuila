'use client';

import React from 'react';
import type { Template } from '@/types';

interface TemplateQuickPreviewProps {
  template: Template;
  language?: string;
}

export default function TemplateQuickPreview({ template, language = 'id' }: TemplateQuickPreviewProps) {
  const col = template.colorSchemes[0] || {
    primary: '#E8547A',
    secondary: '#F4A0B5',
    accent: '#FFD6E7',
    background: '#1A0A0F',
    text: '#FFE8F0',
  };

  // Prevent all mouse interactions / clicks inside the preview
  const wrapperStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    pointerEvents: 'none',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: col.background,
    color: col.text,
    textAlign: 'center',
  };

  // 1. Sakura Gift Template Opening Screen Preview
  if (template.id === 'sakura-gift') {
    return (
      <div style={wrapperStyle}>
        {/* Background glow circles */}
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: `${col.primary}15`, top: -60, right: -60 }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: `${col.secondary}15`, bottom: -40, left: -40 }} />

        {/* Japanese decorative top */}
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.4em', color: col.primary, opacity: 0.7, marginBottom: '1.5rem', textTransform: 'uppercase' }}>
          ✿ お誕生日おめでとう ✿
        </div>

        {/* Gift Box (Non-clickable, animated) */}
        <div style={{ position: 'relative', marginBottom: '2rem', animation: 'sgFloat 3s ease-in-out infinite' }}>
          <div style={{ width: 140, height: 120, background: `linear-gradient(135deg, ${col.primary}, ${col.secondary})`, borderRadius: '12px 12px 16px 16px', position: 'relative', boxShadow: `0 0 40px ${col.primary}66, 0 15px 40px rgba(0,0,0,0.5)`, animation: 'sgPulse 2s ease-in-out infinite' }}>
            {/* Box lid */}
            <div style={{ position: 'absolute', top: -24, left: -8, right: -8, height: 38, background: `linear-gradient(135deg, ${col.accent}, ${col.primary})`, borderRadius: '10px 10px 0 0', zIndex: 2 }} />
            {/* Ribbon vertical */}
            <div style={{ position: 'absolute', left: '50%', top: -24, bottom: 0, width: 18, transform: 'translateX(-50%)', background: `${col.accent}cc`, zIndex: 3 }} />
            {/* Ribbon horizontal */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 18, transform: 'translateY(-50%)', background: `${col.accent}cc`, zIndex: 3 }} />
            {/* Bow */}
            <div style={{ position: 'absolute', top: -48, left: '50%', transform: 'translateX(-50%)', zIndex: 4, fontSize: '2.2rem', animation: 'sgFloat 2s ease-in-out infinite reverse' }}>🎀</div>
            {/* Star sparkles */}
            {[
              { top: '-10px', right: '-15px', size: '1.1rem' },
              { top: '15px', left: '-18px', size: '0.85rem' },
              { bottom: '10px', right: '-12px', size: '0.95rem' },
            ].map((s, i) => (
              <span key={i} style={{ position: 'absolute', ...s, fontSize: s.size, animation: `sgFloat ${1.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite` }}>✨</span>
            ))}
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 700, color: col.primary, margin: '0 0 0.35rem', lineHeight: 1.1, textShadow: `0 0 30px ${col.primary}88` }}>
          Happy Birthday
        </h1>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', fontWeight: 300, color: col.text, margin: '0 0 1.25rem', opacity: 0.9 }}>
          ✨ {language === 'id' ? 'Nama Penerima' : 'Recipient Name'} ✨
        </h2>
        <p style={{ fontSize: '0.85rem', color: col.secondary, letterSpacing: '0.05em', marginBottom: '2rem', opacity: 0.8, maxWidth: '80%' }}>
          🌸 {language === 'id' ? 'Hadiah spesial untukmu' : 'A special present for you'} 🌸
        </p>

        {/* Non-clickable button simulating the open action */}
        <div style={{ padding: '0.75rem 2.25rem', background: `linear-gradient(135deg, ${col.primary}, ${col.secondary})`, borderRadius: '999px', color: '#fff', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.05em', boxShadow: `0 6px 20px ${col.primary}66`, animation: 'sgPulse 2s ease-in-out infinite', opacity: 0.95 }}>
          🎁 {language === 'id' ? 'Buka Hadiahmu' : 'Open Your Gift'}
        </div>

        <p style={{ marginTop: '1.25rem', fontSize: '0.7rem', opacity: 0.3, letterSpacing: '0.15em' }}>
          FROM {language === 'id' ? 'NAMA PENGIRIM' : 'SENDER NAME'}
        </p>
      </div>
    );
  }

  // 2. Starlight Celebration Opening Screen Preview
  if (template.id === 'starlight-celebration') {
    return (
      <div style={{ ...wrapperStyle, background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a3a 50%, #2a1a3a 100%)' }}>
        {/* CSS Stars Background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ddd, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #fff, rgba(0,0,0,0))', backgroundRepeat: 'repeat', backgroundSize: '150px 150px', opacity: 0.6 }} />
        
        {/* Fireworks spark at top */}
        <div style={{ position: 'absolute', top: 20, left: '50%', width: 4, height: 4, background: '#fff', borderRadius: '50%', boxShadow: `0 0 20px 10px ${col.primary}`, animation: 'sgFloat 2s ease-in-out infinite' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 220, height: 220 }}>
          {/* Dashed Heart Outline */}
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'visible', animation: 'sgPulse 2s infinite' }}>
            <path d="M50,88 C50,88 10,55 10,30 C10,15 25,10 38,20 C50,30 50,30 50,30 C50,30 50,30 62,20 C75,10 90,15 90,30 C90,55 50,88 50,88 Z" fill="none" stroke={col.primary} strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
          </svg>
          
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: 140, lineHeight: 1.2, fontWeight: 600, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {language === 'id' ? "mari rayakan hari spesialmu" : "lets celebrate your spesial day"}
            </p>
            <p style={{ margin: '5px 0', fontSize: '0.8rem', opacity: 0.8, color: '#fff' }}>in</p>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, color: col.primary, textShadow: `0 0 15px ${col.primary}` }}>3</div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Default/Fallback Opening Screen Preview (e.g. for future wedding templates)
  if (template.category === 'wedding') {
    return (
      <div style={wrapperStyle}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: `${col.primary}11`, top: -80, right: -80 }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: `${col.secondary}11`, bottom: -60, left: -60 }} />
        <p style={{ color: col.primary, fontSize: '0.7rem', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '2rem', opacity: 0.8 }}>✦ {template.category.toUpperCase()} ✦</p>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: col.text, lineHeight: 1.1, marginBottom: '0.5rem' }}>Rizky</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.75rem 0' }}>
          <div style={{ width: 40, height: 1, background: `${col.primary}44` }} />
          <span style={{ color: col.primary, fontStyle: 'italic', fontSize: '1.2rem' }}>&amp;</span>
          <div style={{ width: 40, height: 1, background: `${col.primary}44` }} />
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 300, color: col.text, lineHeight: 1.1, marginBottom: '2rem' }}>Amelia</h1>
        <div style={{ padding: '0.5rem 1.5rem', border: `1px solid ${col.primary}55`, borderRadius: '999px', color: col.text, fontSize: '0.85rem', opacity: 0.8 }}>
          {language === 'id' ? 'Sabtu, 15 Agustus 2026' : 'Saturday, August 15, 2026'}
        </div>
        <p style={{ marginTop: '1rem', opacity: 0.4, fontSize: '0.8rem', color: col.text }}>Ballroom Grand Hotel</p>
      </div>
    );
  }

  // Generic fallback for any other future category
  return (
    <div style={wrapperStyle}>
      <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: `${col.primary}15`, top: -60, right: -60 }} />
      <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: `${col.secondary}15`, bottom: -50, left: -50 }} />
      <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem', animation: 'sgFloat 3s ease-in-out infinite' }}>
        {template.category === 'greeting' ? '💌' : '✨'}
      </div>
      <p style={{ color: col.primary, fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.75rem', opacity: 0.9 }}>
        ✦ {template.category.toUpperCase()} ✦
      </p>
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, color: col.text, marginBottom: '1rem', lineHeight: 1.2 }}>
        {template.name[language === 'id' ? 'id' : 'en'] || template.name.en}
      </h1>
      <p style={{ fontSize: '0.9rem', color: col.secondary, maxWidth: '80%', opacity: 0.8, lineHeight: 1.5 }}>
        {template.description[language === 'id' ? 'id' : 'en'] || template.description.en}
      </p>
      <div style={{ marginTop: '2rem', padding: '0.65rem 2rem', background: `linear-gradient(135deg, ${col.primary}, ${col.secondary})`, borderRadius: '999px', color: '#fff', fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>
        {language === 'id' ? 'Pratinjau Desain' : 'Design Preview'}
      </div>
    </div>
  );
}
