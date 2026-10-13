import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Radio,
  Disc,
  Headphones,
  Square,
  Sparkles,
  Flame,
  Music,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface HipHopStreetBarProps {
  variant?: 'bar' | 'floating';
}

export const HipHopStreetBar: React.FC<HipHopStreetBarProps> = ({ variant = 'floating' }) => {
  const {
    themeConfig,
    musicConfig,
    isMusicPlaying,
    setIsMusicPlaying,
    toggleMusicPlayback,
    stopMusicPlayback,
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isUserActive, setIsUserActive] = useState(false);
  const [showFlashNotice, setShowFlashNotice] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  // Audio elements & synthesis refs
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const activityTimeoutRef = useRef<number | null>(null);

  const isDark = themeConfig.mode === 'dark';
  const effectiveVolume = isMuted ? 0 : (musicConfig?.volume ?? 0.28);

  // Stop synthesis beat
  const stopSynth = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Stop HTML audio
  const stopHtmlAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  };

  // Web Audio Synth kick, snare, hi-hat
  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
  };

  const playKick = (ctx: AudioContext, time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.18);
    gain.gain.setValueAtTime(effectiveVolume * 1.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.25);
  };

  const playSnare = (ctx: AudioContext, time: number) => {
    const bufferSize = ctx.sampleRate * 0.14;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(effectiveVolume * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);
    noise.stop(time + 0.18);
  };

  const playHiHat = (ctx: AudioContext, time: number, open: boolean = false) => {
    const bufferSize = ctx.sampleRate * (open ? 0.2 : 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5000, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(effectiveVolume * 0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.18 : 0.04));
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);
    noise.stop(time + (open ? 0.2 : 0.05));
  };

  const startSynthBeat = () => {
    initAudioCtx();
    stopSynth();
    stepRef.current = 0;
    const stepDuration = (60 / 88 / 4) * 1000;

    intervalRef.current = window.setInterval(() => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const step = stepRef.current % 16;

      if (step === 0 || step === 7 || step === 10) playKick(ctx, now);
      if (step === 4 || step === 12) playSnare(ctx, now);
      if (step % 2 === 0) playHiHat(ctx, now, step === 14);

      stepRef.current += 1;
    }, stepDuration);
  };

  // Sync playback when isMusicPlaying or musicConfig changes
  useEffect(() => {
    if (!musicConfig?.enabled) {
      stopSynth();
      stopHtmlAudio();
      return;
    }

    if (isMusicPlaying) {
      if (musicConfig.sourceType === 'synth_808' || !musicConfig.audioUrl) {
        stopHtmlAudio();
        startSynthBeat();
      } else {
        stopSynth();
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio(musicConfig.audioUrl);
        } else if (audioElementRef.current.src !== musicConfig.audioUrl) {
          audioElementRef.current.src = musicConfig.audioUrl;
        }
        audioElementRef.current.volume = effectiveVolume;
        audioElementRef.current.loop = musicConfig.loop;
        audioElementRef.current.play().catch(() => {
          // Fallback to synth if audio URL fails
          startSynthBeat();
        });
        audioElementRef.current.onended = () => {
          if (!musicConfig.loop) {
            setIsMusicPlaying(false);
          }
        };
      }

      // Flash notification
      setFlashMessage(`🎧 Sonando: ${musicConfig.title || 'TIENDA BEAT'} // Presiona [M] o clic para pausar`);
      setShowFlashNotice(true);
      const timer = window.setTimeout(() => setShowFlashNotice(false), 3800);
      return () => window.clearTimeout(timer);
    } else {
      stopSynth();
      stopHtmlAudio();
    }
  }, [isMusicPlaying, musicConfig?.audioUrl, musicConfig?.sourceType, musicConfig?.enabled]);

  // Volume sync
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  // Autoplay on first user interaction if configured
  useEffect(() => {
    if (!musicConfig?.enabled || !musicConfig?.autoplayOnInteraction) return;

    let triggered = false;
    const handleFirstInteraction = () => {
      if (triggered) return;
      triggered = true;
      setIsMusicPlaying(true);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [musicConfig?.enabled, musicConfig?.autoplayOnInteraction]);

  // Activity tracker (makes spy button gently visible when user is moving mouse or scrolling)
  useEffect(() => {
    const handleActivity = () => {
      setIsUserActive(true);
      if (activityTimeoutRef.current) {
        window.clearTimeout(activityTimeoutRef.current);
      }
      activityTimeoutRef.current = window.setTimeout(() => {
        setIsUserActive(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (activityTimeoutRef.current) window.clearTimeout(activityTimeoutRef.current);
    };
  }, []);

  // Stealth keyboard shortcut: Press 'M' to mute / stop playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        if (isMusicPlaying) {
          stopMusicPlayback();
          setFlashMessage('🔇 Música pausada (Tecla M)');
        } else {
          setIsMusicPlaying(true);
          setFlashMessage(`▶️ Reproduciendo: ${musicConfig?.title || 'Beat'} (Tecla M)`);
        }
        setShowFlashNotice(true);
        setTimeout(() => setShowFlashNotice(false), 2600);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMusicPlaying, musicConfig?.title]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // If music is globally disabled in admin, do not render
  if (!musicConfig?.enabled) {
    return null;
  }

  // FLOATING STEALTH VARIANT ("Modo Espía pero visible en ciertos momentos")
  if (variant === 'floating') {
    // Determine visibility state
    // - Base state: spy mode (opacity 25% if playing, opacity 20% if paused)
    // - Active movement state: opacity 65%
    // - Hover / Focus state: opacity 100% and fully expanded with STOP button
    const isStealth = musicConfig.stealthMode;
    const currentOpacityClass = isHovered
      ? 'opacity-100 scale-100'
      : isUserActive
      ? 'opacity-65 scale-95'
      : isMusicPlaying
      ? 'opacity-25 hover:opacity-100 scale-95'
      : 'opacity-20 hover:opacity-100 scale-90';

    return (
      <div
        className="fixed bottom-20 sm:bottom-6 left-3 sm:left-4 z-40 select-none transition-all duration-500 pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Flash Toast Notification when track starts or toggles */}
        {showFlashNotice && (
          <div className="absolute bottom-full mb-2 left-0 w-max max-w-[280px] bg-black/90 backdrop-blur-md text-white border border-[#22c55e]/40 px-3 py-1.5 rounded-xl shadow-2xl text-[10px] font-mono flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping shrink-0" />
            <span className="truncate">{flashMessage}</span>
          </div>
        )}

        {/* The Stealth Pill Container */}
        <div
          className={`flex items-center gap-2 bg-black/60 hover:bg-black/95 text-white backdrop-blur-md border border-white/10 hover:border-white/30 shadow-2xl rounded-full transition-all duration-300 p-1.5 ${currentOpacityClass}`}
          title={
            isMusicPlaying
              ? `Reproduciendo: ${musicConfig.title}. Clic para pausar o presiona tecla M.`
              : `Música pausada. Clic para reproducir.`
          }
        >
          {/* Micro Equalizer or Play Icon */}
          <button
            onClick={toggleMusicPlayback}
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all cursor-pointer ${
              isMusicPlaying
                ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/30 active:scale-90'
                : 'bg-zinc-800 text-zinc-300 hover:text-white active:scale-95'
            }`}
            aria-label={isMusicPlaying ? 'Pausar música' : 'Reproducir música'}
          >
            {isMusicPlaying ? (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-black animate-pulse" />
                <span className="w-0.5 h-3 bg-black animate-bounce" />
                <span className="w-0.5 h-1.5 bg-black animate-pulse" />
              </div>
            ) : (
              <Play className="w-3 h-3 fill-current ml-0.5" />
            )}
          </button>

          {/* Discreet label when resting */}
          {!isHovered && (
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 pr-1.5">
              {isMusicPlaying ? 'A LA MANO' : 'BEAT'}
            </span>
          )}

          {/* Full Spy Expansion on Hover or when user interacts */}
          {isHovered && (
            <div className="flex items-center gap-2 pr-1 animate-in fade-in duration-200">
              {/* Song Title and Artist */}
              <div className="flex flex-col min-w-0 max-w-[150px] leading-tight">
                <span className="text-[10px] font-black text-[#22c55e] truncate">
                  {musicConfig.title || 'TIENDA BEAT'}
                </span>
                <span className="text-[8px] font-mono text-zinc-400 truncate">
                  {musicConfig.artist || 'Underground'}
                </span>
              </div>

              {/* Direct STOP Button */}
              {isMusicPlaying && (
                <button
                  onClick={stopMusicPlayback}
                  className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 px-2 py-1 rounded-full text-[9px] font-mono font-bold uppercase transition-all cursor-pointer active:scale-95"
                  title="Parar reproducción inmediatamente"
                >
                  <Square className="w-2.5 h-2.5 fill-current" />
                  <span>PARAR [M]</span>
                </button>
              )}

              {/* Mute toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // BAR VARIANT (For ticker/announcement strips if needed)
  const tickerItems = [
    '🔥 450 GSM HEAVYWEIGHT COTTON',
    '⚠️ PARENTAL ADVISORY // EXPLICIT DRIP',
    '🎙️ MEDELLÍN STREET CYPHER',
    '👑 BOXY DROP SHOULDER SILHOUETTES',
    '⚡ RAW ARCHIVE // ACID WASH FINISH',
    '📻 808 HIP HOP BEATS & DRIP',
    '📦 DESPACHOS CON COORDINADORA Y SERVIENTREGA',
    '🔒 PAGOS 100% SEGUROS (PSE • NEQUI • TARJETAS)',
  ];

  return (
    <div
      className={`border-y transition-colors font-mono select-none overflow-hidden ${
        isDark ? 'bg-black text-white border-zinc-800' : 'bg-zinc-950 text-white border-zinc-900'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Hip Hop Radio Beat Toggle */}
        <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2 bg-zinc-900/90 border-r border-zinc-800 shrink-0 z-10">
          <button
            onClick={toggleMusicPlayback}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer active:scale-95 ${
              isMusicPlaying
                ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/20'
                : 'bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700'
            }`}
            title={isMusicPlaying ? 'Pausar Canción' : 'Reproducir Música'}
          >
            {isMusicPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {musicConfig.title || '808 CYPHER'}
                </span>
                <span className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-0.5 h-2 bg-black animate-pulse" />
                  <span className="w-0.5 h-3 bg-black animate-bounce" />
                  <span className="w-0.5 h-1.5 bg-black animate-pulse" />
                </span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">BEAT FM</span>
                <Disc className="w-3.5 h-3.5 text-[#22c55e]" />
              </>
            )}
          </button>

          {isMusicPlaying && (
            <button
              onClick={stopMusicPlayback}
              className="text-[10px] text-red-400 hover:text-red-300 bg-red-950/60 border border-red-900 px-2 py-0.5 rounded cursor-pointer"
              title="Parar música"
            >
              PARAR [M]
            </button>
          )}
        </div>

        {/* Center: Running Hip Hop Marquee */}
        <div className="flex-1 overflow-hidden relative py-2">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee text-[11px] font-bold tracking-wider uppercase text-zinc-300">
            {tickerItems.concat(tickerItems).map((item, idx) => (
              <span key={idx} className="flex items-center gap-3">
                <span className="text-[#22c55e]">///</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Parental Advisory / Street Tag */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 border-l border-zinc-800 bg-zinc-900/60 shrink-0 text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
          <span className="border border-white/60 px-1 py-0.5 text-white font-sans text-[8px] font-black">
            PARENTAL ADVISORY
          </span>
          <span className="text-[#22c55e]">COMPRA SEGURA</span>
        </div>
      </div>
    </div>
  );
};
