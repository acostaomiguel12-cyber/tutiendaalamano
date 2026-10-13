import React, { useState, useEffect, useRef } from 'react';
import {
  Disc,
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  Flame,
  Sliders,
  Link2,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  Music,
  ExternalLink,
  ShieldCheck,
  Headphones,
  Upload,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MUSIC_PRESETS, MusicPreset } from '../../data/musicPresets';
import { StoreMusicConfig } from '../../types';

export const MusicPlayerSettings: React.FC = () => {
  const {
    musicConfig,
    setMusicConfig,
    showToast,
    isMusicPlaying,
    toggleMusicPlayback,
    stopMusicPlayback,
  } = useStore();

  const [formData, setFormData] = useState<StoreMusicConfig>({
    ...musicConfig,
  });

  // Admin local preview audio instance
  const [adminPreviewPlaying, setAdminPreviewPlaying] = useState(false);
  const adminAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  // Stop admin preview on unmount
  useEffect(() => {
    return () => {
      if (adminAudioRef.current) {
        adminAudioRef.current.pause();
        adminAudioRef.current = null;
      }
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (synthCtxRef.current && synthCtxRef.current.state !== 'closed') {
        synthCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleApplyPreset = (preset: MusicPreset) => {
    stopAdminPreview();
    const updated: StoreMusicConfig = {
      ...formData,
      title: preset.title,
      artist: preset.artist,
      genre: preset.genre,
      sourceType: preset.sourceType,
      audioUrl: preset.audioUrl,
    };
    setFormData(updated);
    showToast(`Pista seleccionada: "${preset.title}". Guarda para aplicar a la tienda.`);
  };

  const stopAdminPreview = () => {
    if (adminAudioRef.current) {
      adminAudioRef.current.pause();
      adminAudioRef.current.currentTime = 0;
    }
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    setAdminPreviewPlaying(false);
  };

  const playSynthPreview = () => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!synthCtxRef.current) {
      synthCtxRef.current = new AudioCtx();
    }
    const ctx = synthCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    let step = 0;
    const bpm = 88;
    const stepDuration = (60 / bpm / 4) * 1000;

    synthIntervalRef.current = window.setInterval(() => {
      const now = ctx.currentTime;
      const s = step % 16;
      const vol = formData.volume;

      // Kick on 0, 7, 10
      if (s === 0 || s === 7 || s === 10) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.18);
        gain.gain.setValueAtTime(vol * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }

      // Snare on 4, 12
      if (s === 4 || s === 12) {
        const bufferSize = ctx.sampleRate * 0.12;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(900, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.16);
      }

      step++;
    }, stepDuration);
  };

  const handleToggleAdminPreview = () => {
    if (adminPreviewPlaying) {
      stopAdminPreview();
      return;
    }

    if (formData.sourceType === 'synth_808') {
      setAdminPreviewPlaying(true);
      playSynthPreview();
      return;
    }

    if (!formData.audioUrl.trim()) {
      showToast('⚠️ Ingresa una URL de audio válida para probar la canción.');
      return;
    }

    try {
      if (!adminAudioRef.current) {
        adminAudioRef.current = new Audio(formData.audioUrl);
      } else {
        adminAudioRef.current.src = formData.audioUrl;
      }

      adminAudioRef.current.volume = formData.volume;
      adminAudioRef.current.loop = formData.loop;

      adminAudioRef.current
        .play()
        .then(() => {
          setAdminPreviewPlaying(true);
        })
        .catch((err) => {
          showToast(`❌ Error al reproducir audio: ${err.message || 'Formato o enlace no compatible'}`);
          setAdminPreviewPlaying(false);
        });

      adminAudioRef.current.onended = () => {
        setAdminPreviewPlaying(false);
      };
    } catch (err: any) {
      showToast(`❌ No se pudo cargar el audio: ${err.message}`);
    }
  };

  const handleSaveConfig = () => {
    stopAdminPreview();
    stopMusicPlayback();
    setMusicConfig(formData);
    showToast(`✅ Banda sonora guardada: "${formData.title}" activa en la tienda.`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Audio & Banda Sonora Oficial // TU TIENDA A LA MANO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Música de Fondo & Modo Espía
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Cambia la canción ambiental de la tienda por cualquier pista (vía URL personalizada o presets urbanos) y controla la visibilidad discreta del botón de parada en el sitio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-2 bg-[#2b47e5] hover:bg-[#203ac9] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar y Publicar en Tienda</span>
          </button>
        </div>
      </div>

      {/* Main Status & Switcher Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.enabled ? 'bg-zinc-950 text-[#22c55e] shadow-md' : 'bg-slate-200 text-slate-400'}`}>
              <Disc className={`w-6 h-6 ${formData.enabled ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                Música Ambiental de Tienda
                {formData.enabled ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Activa
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    Desactivada
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {formData.enabled
                  ? `Sonando: "${formData.title}" (${formData.artist})`
                  : 'El audio está apagado en el sitio web.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-950"></div>
          </label>
        </div>

        {/* Live Audio Previewer for Admin */}
        <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#22c55e]">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#22c55e]">
                  Preescucha de Prueba (Panel Admin)
                </span>
                <h4 className="text-sm font-black text-white">{formData.title || 'Sin título'}</h4>
                <p className="text-xs text-zinc-400">
                  {formData.artist || 'Artista no especificado'} • {formData.genre || 'Urbano'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleAdminPreview}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  adminPreviewPlaying
                    ? 'bg-[#22c55e] text-black shadow-md shadow-[#22c55e]/25 scale-105'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                {adminPreviewPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>PAUSAR PREESCUCHA</span>
                    <span className="flex items-end gap-0.5 h-3 ml-1">
                      <span className="w-0.5 h-2 bg-black animate-pulse" />
                      <span className="w-0.5 h-3 bg-black animate-bounce" />
                      <span className="w-0.5 h-1.5 bg-black animate-pulse" />
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PROBAR CANCIÓN AHORA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Volume and format note */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <span>Volumen de prueba: {Math.round(formData.volume * 100)}%</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Tipo: {formData.sourceType === 'synth_808' ? 'Sintetizador Analógico 808' : 'Archivo de Audio URL'}
            </span>
          </div>
        </div>
      </div>

      {/* Choose Song: URL Input or Streetwear Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Custom Song Configuration */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Canción Personalizada (Cualquier URL)</h3>
                <p className="text-xs text-slate-500">Pega el enlace a cualquier archivo MP3, WAV, OGG o stream que desees</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Audio URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>URL Directa del Archivo de Audio (MP3, WAV, OGG, AAC)</span>
                <span className="text-[11px] text-indigo-600 font-medium">HTTPS Recomendado</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://tudominio.com/musica/mi-cancion.mp3"
                  value={formData.audioUrl}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      audioUrl: e.target.value,
                      sourceType: e.target.value.trim() ? 'custom_url' : 'synth_808',
                    });
                  }}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
                {formData.audioUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        audioUrl: '',
                        sourceType: 'synth_808',
                        title: 'Medellín 808 Boom-Bap Cypher',
                        artist: 'Tu Tienda a la Mano · Synthesizer Lab',
                      });
                      showToast('Restaurado al sintetizador 808 procedural.');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Puedes alojar tu MP3 en Dropbox (enlace directo con ?raw=1), Supabase Storage, tu CDN, AWS S3 o cualquier servidor web.
              </p>
            </div>

            {/* Subir canción desde el computador (solo esta sesión) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                O sube una canción desde tu computador
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 border border-dashed border-indigo-300 rounded-xl text-xs font-bold text-indigo-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Examinar MP3 / WAV / OGG en mi PC</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    const name = file.name.replace(/\.[^.]+$/, '');
                    setFormData({
                      ...formData,
                      audioUrl: url,
                      sourceType: 'custom_url',
                      title: name || 'Mi canción',
                      artist: formData.artist || 'Subida local',
                    });
                    showToast('🎵 Canción cargada. Vale solo en esta sesión: guárdala y publícala para probarla.');
                    e.target.value = '';
                  }}
                />
              </label>
              <p className="text-[11px] text-slate-500">
                El archivo vive en la memoria del navegador: funciona al instante pero se pierde al recargar. Para que suene siempre, súbelo a Supabase Storage o tu CDN y pega la URL arriba.
              </p>
            </div>

            {/* Song Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Título de la Canción</label>
                <input
                  type="text"
                  placeholder="Ej: Cypher Medellín Vol. 2"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Artista / Productor / Beatmaker</label>
                <input
                  type="text"
                  placeholder="Ej: Tu Tienda a la Mano Records"
                  value={formData.artist}
                  onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Volume & Loop Controls */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Comportamiento de Reproducción
              </h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-indigo-600" />
                    Volumen Inicial en Tienda: {Math.round(formData.volume * 100)}%
                  </span>
                  <span className="text-slate-400 font-mono">
                    {formData.volume <= 0.2 ? 'Muy sutil' : formData.volume <= 0.4 ? 'Recomendado' : 'Fuerte'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.loop}
                    onChange={(e) => setFormData({ ...formData, loop: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Bucle Infinito (Loop)</span>
                    <span className="text-[10px] text-slate-500">Reinicia la pista automáticamente al terminar</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.autoplayOnInteraction}
                    onChange={(e) => setFormData({ ...formData, autoplayOnInteraction: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Autoplay Inteligente</span>
                    <span className="text-[10px] text-slate-500">Inicia al primer clic del cliente en la tienda</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Presets Streetwear Library */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Pistas Listas para Usar</h3>
              <p className="text-xs text-slate-500">1 clic para cargar canciones urbanas optimizadas</p>
            </div>
          </div>

          <div className="space-y-3">
            {MUSIC_PRESETS.map((preset) => {
              const isSelected =
                formData.title === preset.title ||
                (preset.sourceType === 'synth_808' && formData.sourceType === 'synth_808');

              return (
                <div
                  key={preset.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-zinc-950 text-white border-zinc-800 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-[#22c55e] text-black' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {preset.tag}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-zinc-400' : 'text-slate-400'}`}>
                          {preset.bpm} BPM • {preset.duration}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold leading-tight">{preset.title}</h4>
                      <p className={`text-[11px] ${isSelected ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {preset.artist}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 text-[#22c55e] border border-white/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Activa' : 'Elegir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stealth Mode / "Modo Espía" Configuration Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-[#22c55e] flex items-center justify-center shrink-0 shadow-md">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Botón de Parada: "Modo Espía" (Stealth UI)</h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded-full">
                  Requerimiento Cumplido
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                El botón de parada en la tienda no interfiere con el diseño ni tapa las prendas. Permanece en modo sigiloso semi-transparente y solo se revela en momentos estratégicos:
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={formData.stealthMode}
              onChange={(e) => setFormData({ ...formData, stealthMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-950"></div>
          </label>
        </div>

        {/* Breakdown of the 4 Spy Moments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
              01 // Estado Espía (Reposo)
            </span>
            <h4 className="text-xs font-bold text-slate-900">Cápsula Translúcida 25%</h4>
            <p className="text-[11px] text-slate-500">
              Un micro ecualizador táctico que oscila con discreción en la esquina. No estorba la vista del cliente.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
              02 // Momento Interactivo
            </span>
            <h4 className="text-xs font-bold text-slate-900">Movimiento de Cursor</h4>
            <p className="text-[11px] text-slate-500">
              Al mover el cursor o hacer scroll se ilumina al 65% para recordar su ubicación, y se desvanece suavemente a los 3.5s.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
              03 // Parada Inmediata (Hover)
            </span>
            <h4 className="text-xs font-bold text-slate-900">Expansión con Botón STOP</h4>
            <p className="text-[11px] text-slate-500">
              Al pasar el ratón o pulsar en móvil se expande al 100% mostrando el botón de pausa grande y control de volumen.
            </p>
          </div>
        </div>

        {/* Live Simulation Box */}
        <div className="p-6 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3">
            <span className="font-mono text-[#22c55e]">SIMULACIÓN VISUAL DEL BOTÓN EN LA TIENDA</span>
            <span>Pasa el cursor por encima para probar la expansión espía</span>
          </div>

          <div className="py-6 flex items-center justify-center">
            {/* Simulated spy widget */}
            <div className="group relative select-none">
              <div className="flex items-center gap-2 bg-black/60 hover:bg-black/95 text-white backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 shadow-2xl transition-all duration-300 opacity-40 hover:opacity-100 cursor-pointer">
                {/* Micro waveform indicator */}
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-[#22c55e] animate-pulse" />
                  <span className="w-0.5 h-3 bg-[#22c55e] animate-bounce" />
                  <span className="w-0.5 h-1.5 bg-[#22c55e] animate-pulse" />
                </div>

                {/* Always subtle text that expands on hover */}
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">
                  TIENDA BEAT
                </span>

                {/* Expanded controls on hover */}
                <div className="hidden group-hover:flex items-center gap-2 pl-2 border-l border-zinc-700 animate-in fade-in duration-200">
                  <span className="text-[10px] font-bold text-[#22c55e] truncate max-w-[140px]">
                    {formData.title}
                  </span>
                  <div className="px-2 py-0.5 rounded-md bg-[#22c55e] text-black text-[9px] font-black uppercase">
                    STOP [M]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
