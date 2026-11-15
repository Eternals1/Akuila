'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Site } from '@/types';
import { Play, ChevronRight, Check } from 'lucide-react';

type Phase = 'intro' | 'music' | 'journey' | 'wishes' | 'finale';

const isMedia = (val: string): boolean => Boolean(val && (val.startsWith('data:') || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/')));

/* ════════════ BACKGROUND CANVAS (PERSISTENT) ════════════ */
// Wrapped in React.memo so it NEVER re-renders when parent state changes.
const PersistentBackground = React.memo(({ colors }: { colors: string[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let animationId: number;

    class Particle {
      x: number; y: number; vx: number; vy: number; alpha: number;
      color: string; size: number; decay: number; gravity: number;
      constructor(x: number, y: number, color: string, isHeart = false) {
        this.x = x; this.y = y; this.color = color; this.alpha = 1;
        const angle = Math.random() * Math.PI * 2;
        const speed = isHeart ? (Math.random() * 2 + 1) : Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = Math.random() * 2 + 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.gravity = 0.05;
      }
      update() { this.vy += this.gravity; this.x += this.vx; this.y += this.vy; this.alpha -= this.decay; }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.save(); ctx.globalAlpha = Math.max(0, this.alpha); ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    }

    class Rocket {
      x: number; y: number; vx: number; vy: number; targetY: number; color: string; dead: boolean;
      constructor(x: number, startY: number, targetY: number, color: string) {
        this.x = x; this.y = startY; this.targetY = targetY; this.color = color; this.dead = false;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -Math.random() * 4 - 6;
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.vy += 0.03;
        if (this.vy > 0 && this.vy < 0.1 && this.y < this.targetY + 100) this.dead = true;
        if (this.vy < 0 && this.y <= this.targetY) this.dead = true;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2); ctx.fill();
      }
    }

    class GlowParticle {
      x: number; y: number; vx: number; vy: number; alpha: number; size: number;
      constructor() {
        this.x = Math.random() * w; this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5; this.vy = -Math.random() * 0.5 - 0.2;
        this.alpha = Math.random() * 0.5 + 0.1; this.size = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.y < 0) { this.y = h; this.x = Math.random() * w; }
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    const glowParticles: GlowParticle[] = Array.from({ length: 50 }, () => new GlowParticle());

    const explode = (x: number, y: number, color: string) => {
      for (let i = 0; i < 60; i++) particles.push(new Particle(x, y, color, false));
    };

    const loop = () => {
      // Clear with trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; ctx.fillRect(0, 0, w, h);

      // Ambient glowing dust
      glowParticles.forEach(gp => { gp.update(); gp.draw(ctx); });

      // Random background rockets (1% chance per frame)
      if (Math.random() < 0.01) {
        rockets.push(new Rocket(Math.random() * w, h, h * 0.2 + Math.random() * h * 0.5, colors[Math.floor(Math.random() * colors.length)]));
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]; r.update(); r.draw(ctx);
        if (r.dead) { explode(r.x, r.y, r.color); rockets.splice(i, 1); }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.update(); p.draw(ctx);
        if (p.alpha <= 0) particles.splice(i, 1);
      }
      animationId = requestAnimationFrame(loop);
    };
    loop();

    const handleResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); };
  }, [colors]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {/* Starry Gradient Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a3a 50%, #2a1a3a 100%)' }} />
      {/* CSS Stars */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 40px 70px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ddd, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0))', backgroundRepeat: 'repeat', backgroundSize: '200px 200px', opacity: 0.6 }} />
      {/* Dynamic Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      {/* City/Mountain Silhouette (Bottom) */}
      <img src="/city_silhouette.png" alt="" onError={e => e.currentTarget.style.display='none'} style={{ position: 'absolute', bottom: 0, width: '100%', height: '35vh', objectFit: 'cover', opacity: 0.8 }} />
    </div>
  );
});
PersistentBackground.displayName = 'PersistentBackground';

/* ════════════ POLAROID COMPONENT (NO GHOST DRAG) ════════════ */
function Polaroid({ id, imgUrl, text, zIndex, onFocus, onFlipped, initialRotation, initialX, initialY }: any) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Use simple Click to Zoom and Click to Flip.
  // The user requested to remove drag if it causes issues, and just use left click.
  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFocused) {
      setIsFocused(true);
      onFocus();
    } else {
      const newlyFlipped = !isFlipped;
      setIsFlipped(newlyFlipped);
      if (newlyFlipped) onFlipped(id);
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    const handleClickOutside = () => { setIsFocused(false); setIsFlipped(false); };
    setTimeout(() => window.addEventListener('click', handleClickOutside), 10);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isFocused]);

  const currentX = isFocused ? (typeof window !== 'undefined' ? window.innerWidth / 2 - 150 : 0) : initialX;
  const currentY = isFocused ? (typeof window !== 'undefined' ? window.innerHeight / 2 - 180 : 0) : initialY;
  const currentRot = isFocused ? 0 : initialRotation;
  const scale = isFocused ? 1.2 : 1;

  return (
    <div
      onClick={handleLeftClick}
      onContextMenu={(e) => e.preventDefault()} // Block right click
      onDragStart={(e) => e.preventDefault()} // Block ghost dragging
      style={{
        position: 'absolute', width: 300, height: 360, left: 0, top: 0,
        transform: `translate3d(${currentX}px, ${currentY}px, 0) rotate(${currentRot}deg) scale(${scale})`,
        zIndex: isFocused ? 9999 : zIndex, cursor: 'pointer',
        transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        perspective: '1000px', userSelect: 'none', WebkitUserSelect: 'none', WebkitTapHighlightColor: 'transparent'
      }}
    >
      <div style={{
        width: '100%', height: '100%', position: 'relative', transition: 'transform 0.6s',
        transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        boxShadow: isFocused ? '0 20px 50px rgba(0,0,0,0.5)' : '0 4px 10px rgba(0,0,0,0.3)', borderRadius: 4
      }}>
        {/* Front */}
        <div style={{ position: 'absolute', inset: 0, background: '#fff', backfaceVisibility: 'hidden', padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, background: '#f0f0f0', marginBottom: 16, overflow: 'hidden', pointerEvents: 'none' }}>
            {imgUrl ? (
              <img src={imgUrl} alt="Memory" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '3rem' }}>📸</div>
            )}
          </div>
          {isFocused && !isFlipped && (
            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', fontFamily: 'sans-serif', animation: 'slBounce 1s infinite alternate' }}>
              Klik kiri untuk membalik ↺
            </div>
          )}
        </div>
        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0, background: '#fff', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
          padding: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 29px, #e0e0e0 30px)', backgroundPosition: '0 10px'
        }}>
          <p style={{ fontFamily: "'Caveat', cursive, sans-serif", fontSize: '1.5rem', color: '#333', lineHeight: '30px', margin: 0, transform: 'rotate(-2deg)' }}>
            {text || "A beautiful memory..."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ════════════ MAIN TEMPLATE ════════════ */
export default function StarlightCelebration({ site }: { site: Site }) {
  const col = site.colorScheme;
  const c = site.customization as Record<string, any>;
  const g = (k: string, fb = '') => (c[k] as string) || fb;
  const fnt = (id: string) => `'${(c.fieldFonts ?? {})[id] ?? site.font}', 'Playfair Display', serif`;

  const isEditor = typeof window !== 'undefined' && window.self !== window.top;
  
  const [phase, setPhase] = useState<Phase>('intro');
  const [countdown, setCountdown] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewedPhotos, setViewedPhotos] = useState<Set<number>>(new Set());
  const [topZ, setTopZ] = useState(10);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto Countdown Logic (Disabled in Editor for stable preview)
  useEffect(() => {
    if (phase === 'intro') {
      if (isEditor) {
        setCountdown(3); // Freeze at 3 in editor so text is visible
        return;
      }
      
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(Math.max(0, count));
        if (count === 0) {
          clearInterval(interval);
          handleRocketTransition('music');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, isEditor]);

  const handleRocketTransition = (nextPhase: Phase) => {
    setIsTransitioning(true);
    setTimeout(() => { setPhase(nextPhase); setIsTransitioning(false); }, 1500);
  };

  const handlePlayMusic = () => {
    if (audioRef.current) { audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true)); }
    else setIsPlaying(true);
  };

  // Enforce exactly 8 photos as requested
  const photos = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= 8; i++) {
      const url = g(`photo_${i}`);
      const msg = g(`photo_${i}_msg`, `Memory #${i}`);
      arr.push({ url: isMedia(url) ? url : '', msg });
    }
    return arr.map((item, i) => {
      const initX = (typeof window !== 'undefined' ? window.innerWidth : 1000) * 0.1 + (i % 4) * 200 + Math.random() * 50;
      const initY = (typeof window !== 'undefined' ? window.innerHeight : 800) * 0.2 + Math.floor(i / 4) * 200 + Math.random() * 50;
      const rot = Math.random() * 40 - 20; 
      return { ...item, id: i, initX, initY, rot };
    });
  }, []);

  const allPhotosViewed = viewedPhotos.size >= photos.length;

  const wishes = [g('wish_1'), g('wish_2'), g('wish_3'), g('wish_4'), g('wish_5'), g('wish_6'), g('wish_7'), g('wish_8'), g('wish_9'), g('wish_10')].filter(Boolean);
  const activeWishes = wishes.length > 0 ? wishes : ['Happy Birthday!', 'All the best for you!', 'Enjoy your special day!', 'Success always!', 'Keep smiling!'];
  const colors = [col.primary, col.secondary, col.accent, '#FFFFFF'];

  return (
    <div style={{ backgroundColor: col.background, color: col.text, minHeight: '100vh', overflow: 'hidden', position: 'relative', fontFamily: fnt('intro_text') }}>
      
      <PersistentBackground colors={colors} />
      {isMedia(g('song')) && <audio ref={audioRef} loop src={g('song')} />}

      {/* ── LIVE PREVIEW NAVBAR (EDITOR ONLY) ── */}
      {isEditor && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 99999, display: 'flex', gap: 10, background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: 30, boxShadow: '0 5px 20px rgba(0,0,0,0.5)', border: `1px solid ${col.primary}` }}>
          {(['intro', 'music', 'journey', 'wishes', 'finale'] as Phase[]).map(p => (
            <button key={p} onClick={() => { setPhase(p); setIsTransitioning(false); }} style={{ background: phase === p ? col.primary : 'transparent', color: '#fff', border: phase === p ? 'none' : '1px solid #555', padding: '5px 15px', borderRadius: 20, cursor: 'pointer', fontSize: '12px', textTransform: 'capitalize' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ── BIG ROCKET TRANSITION (Used for Opening & Finale) ── */}
      {isTransitioning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8999, pointerEvents: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <img src="/big_rocket.png" alt="Rocket" onError={e => e.currentTarget.style.display='none'} style={{ width: 120, height: 'auto', animation: 'slRocketShoot 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0, animation: 'slFlash 1.5s ease-out' }} />
        </div>
      )}

      {/* ════════════ PHASE 1: INTRO ════════════ */}
      {phase === 'intro' && !isTransitioning && (
        <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          
          {/* Top falling fireworks mapping to countdown */}
          {!isEditor && countdown < 3 && (
            <div style={{ position: 'absolute', top: 0, left: `${20 + countdown * 30}%`, width: 4, height: 4, background: '#fff', borderRadius: '50%', boxShadow: `0 0 20px 10px ${col.primary}`, animation: 'slFallDown 1s linear forwards' }} />
          )}

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 320, height: 320 }}>
            {/* Dashed Heart Outline */}
            <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'visible', animation: 'slPulse 2s infinite' }}>
              <path d="M50,88 C50,88 10,55 10,30 C10,15 25,10 38,20 C50,30 50,30 50,30 C50,30 50,30 62,20 C75,10 90,15 90,30 C90,55 50,88 50,88 Z" fill="none" stroke={col.primary} strokeWidth="1.5" strokeDasharray="4 4" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20 }}>
              <p style={{ margin: 0, fontSize: '1.4rem', maxWidth: 200, lineHeight: 1.2, fontWeight: 600, color: '#fff' }}>{g('intro_text', "lets celebrate your spesial day")}</p>
              <p style={{ margin: '10px 0', fontSize: '1.2rem', opacity: 0.8, color: '#fff' }}>in</p>
              <div style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: col.primary, textShadow: `0 0 20px ${col.primary}` }}>{countdown}</div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ PHASE 2: MUSIC ════════════ */}
      {phase === 'music' && !isTransitioning && (
        <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', animation: 'slFadeIn 1s ease-out' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, color: '#fff', textShadow: `0 2px 10px ${col.primary}88` }}>{g('recipient_name', 'Nama Penerima')}</h1>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 400, margin: '0.5rem 0', color: col.primary }}>{g('opening_subtitle', 'welcome tou your ..........')}</h2>
            <p style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8, color: '#fff' }}>from {g('sender_name', 'Nama Pengirim')}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', width: '100%', maxWidth: '900px', flexWrap: 'wrap' }}>
            
            {/* Left: Instruction */}
            <div style={{ flex: 1, textAlign: 'right', minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <p style={{ fontSize: '1.4rem', margin: '0 0 1rem 0', color: '#fff' }}>first u need play this music</p>
              {/* Play Button & Wave */}
              <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {!isPlaying ? (
                  <button onClick={handlePlayMusic} style={{
                    background: col.primary, border: 'none', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: col.background, boxShadow: `0 0 20px ${col.primary}88`, animation: 'slPulse 2s infinite'
                  }}>
                    <Play size={24} style={{ marginLeft: 3 }} />
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[1,2,3,4,5].map(i => <div key={i} style={{ width: 6, borderRadius: 3, background: col.primary, animation: `slWave 1s ${i*0.15}s infinite alternate` }} />)}
                  </div>
                )}
              </div>
            </div>

            {/* Center: Disk */}
            <div style={{ position: 'relative', width: 250, height: 250, flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#222', border: '2px solid #555', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: isPlaying ? 'slSpin 4s linear infinite' : 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
                <img src="/disk_cover.png" alt="" onError={e => e.currentTarget.style.display='none'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', opacity: 0.8 }} />
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: col.background, zIndex: 2, border: `4px solid ${col.primary}` }} />
              </div>
            </div>

            {/* Right: Continue */}
            <div style={{ flex: 1, textAlign: 'left', minWidth: 200, opacity: isPlaying ? 1 : 0, transition: 'opacity 1s ease', visibility: isPlaying ? 'visible' : 'hidden' }}>
              <button onClick={() => setPhase('journey')} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'slFloat 3s ease-in-out infinite' }}>
                Continue your journey <ChevronRight />
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ════════════ PHASE 3: OUR JOURNEY ════════════ */}
      {phase === 'journey' && !isTransitioning && (
        <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100vh', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '2rem', left: 0, width: '100%', textAlign: 'center', zIndex: 1, pointerEvents: 'none' }}>
            <h2 style={{ fontSize: '2.5rem', color: col.primary, animation: 'slFadeInDown 1s ease', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>Our Journey</h2>
            <p style={{ opacity: 0.8, fontSize: '1.1rem', color: '#fff' }}>Klik foto untuk melihat. Klik lagi untuk membalik.</p>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '100%', animation: 'slFadeIn 1s ease' }}>
            {photos.map((p) => (
              <Polaroid key={p.id} id={p.id} imgUrl={p.url} text={p.msg} initialX={p.initX} initialY={p.initY} initialRotation={p.rot} zIndex={topZ} onFocus={() => setTopZ(z => z + 1)} onFlipped={(id: number) => setViewedPhotos(prev => new Set(prev).add(id))} />
            ))}
          </div>

          <button onClick={() => setPhase('wishes')} style={{
            position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 9000, display: 'flex', alignItems: 'center', gap: '0.5rem', background: col.primary, border: 'none', borderRadius: '50px', padding: '1rem 3rem', color: col.background, fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', boxShadow: `0 10px 30px ${col.primary}88`,
            opacity: allPhotosViewed ? 1 : 0, visibility: allPhotosViewed ? 'visible' : 'hidden', transition: 'all 0.5s'
          }}>
            View Wishes <ChevronRight />
          </button>
        </div>
      )}

      {/* ════════════ PHASE 4: WISHES ════════════ */}
      {phase === 'wishes' && !isTransitioning && (
        <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100vh', overflow: 'hidden' }}>
          {/* Looping 10 papers */}
          {Array.from({ length: 10 }).map((_, i) => {
            const wishText = activeWishes[i % activeWishes.length];
            const left = 5 + Math.random() * 80; 
            const duration = Math.random() * 10 + 15; // 15-25s slow fall
            const delay = -(Math.random() * 20); // Stagger start
            const rotation = Math.random() * 60 - 30;
            return (
              <div key={i} style={{
                position: 'absolute', top: -300, left: `${left}%`, width: 240, minHeight: 240, padding: '2rem',
                background: '#f9f9f9', color: '#111', display: 'flex', flexDirection: 'column', 
                boxShadow: '0 15px 35px rgba(0,0,0,0.4)', fontFamily: "'Caveat', cursive, sans-serif", fontSize: '1.6rem', 
                animation: `slPaperFall ${duration}s linear ${delay}s infinite`, transform: `rotate(${rotation}deg)`
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', fontFamily: 'sans-serif' }}>Pesan</span>
                <p style={{ margin: 0, lineHeight: 1.3 }}>{wishText}</p>
              </div>
            )
          })}
          
          <div style={{ position: 'absolute', bottom: '3rem', width: '100%', display: 'flex', justifyContent: 'center', zIndex: 20 }}>
            <button onClick={() => handleRocketTransition('finale')} style={{ background: 'transparent', border: `1px solid ${col.primary}`, borderRadius: '50px', padding: '1rem 2rem', color: col.primary, fontSize: '1.2rem', cursor: 'pointer', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={20} /> Selesai membaca
            </button>
          </div>
        </div>
      )}

      {/* ════════════ PHASE 5: GRAND FINALE ════════════ */}
      {phase === 'finale' && !isTransitioning && (
        <div style={{ position: 'relative', zIndex: 10, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ animation: 'slZoomInTitle 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, margin: 0, lineHeight: 1.1, color: col.primary, filter: `drop-shadow(0 0 30px ${col.primary})` }}>
              {g('finale_title', 'HAPPY BIRTHDAY!')}
            </h1>
          </div>
          <div style={{ marginTop: '2rem', animation: 'slFadeInUp 1s ease 1s backwards' }}>
            <p style={{ fontSize: '1.8rem', fontWeight: 300, opacity: 0.9, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {g('finale_quote', 'May all your dreams light up the sky.')}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slFadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slFadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes slFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes slZoomInTitle { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slBounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }
        @keyframes slSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slWave { from { height: 10px; } to { height: 40px; } }
        @keyframes slRocketShoot { 
          0% { transform: translateY(100vh); } 
          60% { transform: translateY(-30vh); } 
          100% { transform: translateY(-50vh); } 
        }
        @keyframes slFlash { 0% { opacity: 0; } 40% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes slFallDown { from { transform: translateY(-10vh); opacity: 1; } to { transform: translateY(40vh); opacity: 0; } }
        @keyframes slPaperFall {
          0% { transform: translateY(-300px) rotate(0deg); opacity: 0; }
          5% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(180deg); opacity: 0; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap');
      `}</style>
    </div>
  );
}
