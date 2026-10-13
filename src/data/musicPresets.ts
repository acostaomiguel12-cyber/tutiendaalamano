import { StoreMusicConfig } from '../types';

export interface MusicPreset {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  bpm: number;
  sourceType: 'synth_808' | 'preset' | 'custom_url';
  audioUrl: string;
  tag: string;
  description: string;
}

export const MUSIC_PRESETS: MusicPreset[] = [
  {
    id: 'synth-808-medellin',
    title: 'Medellín 808 Boom-Bap Cypher',
    artist: 'Tu Tienda a la Mano · Synthesizer Lab',
    genre: 'Boom-Bap / Underground',
    duration: 'Bucle Infinito (Live Web Audio)',
    bpm: 88,
    sourceType: 'synth_808',
    audioUrl: '',
    tag: 'Procedural 0 Latencia',
    description: 'Generado directamente en el navegador con Web Audio API. 100% confiable, sin descargas externas y con pegada analógica.',
  },
  {
    id: 'lofi-night-street',
    title: 'Midnight Chill // Envigado Sessions',
    artist: 'Streetwear Beats Co.',
    genre: 'Lo-Fi Chill Hop',
    duration: '2:38',
    bpm: 82,
    sourceType: 'preset',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    tag: 'Chill Urbano',
    description: 'Bases relajadas con texturas de vinilo ideales para que el cliente navegue el catálogo cómodamente.',
  },
  {
    id: 'heavy-trap-drip',
    title: 'Heavyweight 450 GSM Drip',
    artist: 'Metro Cypher Project',
    genre: 'Dark Trap / 808 Bass',
    duration: '2:45',
    bpm: 138,
    sourceType: 'preset',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=trap-future-bass-royalty-free-music-108933.mp3',
    tag: 'Bajo Pesado',
    description: 'Líneas de bajo 808 saturadas, hi-hats rápidos y actitud pura de streetwear underground.',
  },
  {
    id: 'drill-anthem',
    title: 'Comuna 13 Drill Anthem',
    artist: 'Raw Cartel Productions',
    genre: 'Underground Drill',
    duration: '2:15',
    bpm: 142,
    sourceType: 'preset',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_73229b4e6d.mp3?filename=urban-hip-hop-6401.mp3',
    tag: 'Drill Duro',
    description: 'Cadencia drill con cortes agresivos y sintetizadores oscuros que potencian la identidad de la marca.',
  },
];

export const DEFAULT_MUSIC_CONFIG: StoreMusicConfig = {
  enabled: true,
  title: 'Medellín 808 Boom-Bap Cypher',
  artist: 'Tu Tienda a la Mano · Synthesizer Lab',
  genre: 'Boom-Bap / Underground',
  sourceType: 'synth_808',
  audioUrl: '',
  volume: 0.28,
  autoplayOnInteraction: true,
  loop: true,
  stealthMode: true, // Modo espía activo por defecto
};
