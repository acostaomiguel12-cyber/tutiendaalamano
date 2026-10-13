import React, { useState, useRef } from 'react';
import {
  X,
  Zap,
  Upload,
  CheckCircle2,
  Download,
  Copy,
  Gauge,
  Video,
  Image as ImageIcon,
  Play,
  Volume2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  compressImageFile,
  formatBytes,
  CompressionResult,
  LIGHTWEIGHT_VIDEO_PRESETS,
  VideoPreset,
} from '../../lib/mediaOptimizer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyImage?: (dataUrl: string, sizeKb: number) => void;
  onApplyVideo?: (videoUrl: string, posterUrl: string) => void;
  targetBlockTitle?: string;
}

export const MediaCompressorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onApplyImage,
  onApplyVideo,
  targetBlockTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'image-compressor' | 'video-presets'>('image-compressor');
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [quality, setQuality] = useState<number>(0.76);
  const [maxWidth, setMaxWidth] = useState<number>(1440);
  const [copied, setCopied] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoPreset>(LIGHTWEIGHT_VIDEO_PRESETS[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await compressImageFile(file, {
        maxWidth,
        quality,
        targetFormat: 'webp',
      });
      setCompressionResult(result);
    } catch (err) {
      console.error('Error al comprimir:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToBanner = () => {
    if (compressionResult && onApplyImage) {
      const sizeKb = Math.round(compressionResult.compressedSize / 1024);
      onApplyImage(compressionResult.dataUrl, sizeKb);
      onClose();
    }
  };

  const handleApplyVideoToBanner = (preset: VideoPreset) => {
    if (onApplyVideo) {
      onApplyVideo(preset.videoUrl, preset.posterUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Compresor & Optimizador Ultraliviano
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Reduce el peso de imágenes hasta 98% a WebP y streaming de video HD sin lag
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('image-compressor')}
            className={`px-4 py-2.5 font-mono text-xs font-bold uppercase flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'image-compressor'
                ? 'border-black text-black bg-white rounded-t-lg'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>1. Comprimir Fotos a WebP</span>
          </button>
          <button
            onClick={() => setActiveTab('video-presets')}
            className={`px-4 py-2.5 font-mono text-xs font-bold uppercase flex items-center gap-2 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'video-presets'
                ? 'border-black text-black bg-white rounded-t-lg'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Videos de Fondo Ultralivianos</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'image-compressor' ? (
            <div className="space-y-6">
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 hover:border-black rounded-xl p-8 text-center cursor-pointer transition-all bg-zinc-50/60 hover:bg-zinc-100/50 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-200 group-hover:bg-black group-hover:text-white flex items-center justify-center mx-auto text-zinc-600 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-zinc-900 block">
                      Arrastra tu foto aquí o haz clic para seleccionarla
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      Acepta PNG, JPG, JPEG, fotos de celular pesadas (hasta 20MB)
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <Zap className="w-3 h-3" />
                    <span>Se comprime automáticamente al formato WebP de máxima velocidad</span>
                  </div>
                </div>
              </div>

              {/* Compression Config Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-mono">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="font-bold text-zinc-700">Resolución Máxima:</label>
                    <span className="text-zinc-500">{maxWidth}px</span>
                  </div>
                  <select
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-xs"
                  >
                    <option value={1600}>1600px (Ideal para Banners Hero de ancho completo)</option>
                    <option value={1200}>1200px (Recomendado para Banners Estándar)</option>
                    <option value={800}>800px (Ideal para Fotos de Prendas y Catálogo)</option>
                    <option value={600}>600px (Miniaturas ultrarrápidas)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="font-bold text-zinc-700">Calidad WebP:</label>
                    <span className="text-zinc-500">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={0.92}
                    step={0.02}
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-black"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Ultra Liviano (50%)</span>
                    <span>Recomendado (76%)</span>
                    <span>Retina Sharp (92%)</span>
                  </div>
                </div>
              </div>

              {/* Compression Results Card */}
              {isProcessing && (
                <div className="p-8 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-mono text-zinc-600 font-bold">
                    Procesando matriz WebP y recalculando bytes...
                  </p>
                </div>
              )}

              {compressionResult && !isProcessing && (
                <div className="p-5 bg-zinc-950 text-white rounded-xl space-y-4 shadow-lg border border-zinc-800 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm">¡Imagen Optimizada con Éxito!</span>
                    </div>
                    <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                      {compressionResult.savedPercentage}% AHORRADO
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px]">PESO ORIGINAL:</span>
                      <span className="text-red-400 font-bold line-through">
                        {formatBytes(compressionResult.originalSize)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px]">PESO COMPRIMIDO:</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {formatBytes(compressionResult.compressedSize)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px]">DIMENSIONES:</span>
                      <span className="text-white font-bold">
                        {compressionResult.width} × {compressionResult.height}px
                      </span>
                    </div>
                    <div className="p-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                      <span className="text-zinc-400 block text-[10px]">FORMATO FINAL:</span>
                      <span className="text-indigo-300 font-bold uppercase">
                        {compressionResult.format.toUpperCase()} (Next-Gen)
                      </span>
                    </div>
                  </div>

                  {/* Preview of Compressed Image */}
                  <div className="relative aspect-video max-h-44 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                    <img
                      src={compressionResult.dataUrl}
                      alt="Preview comprimido"
                      className="max-h-full max-w-full object-contain"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300">
                      Previsualización en vivo
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {onApplyImage && (
                      <button
                        onClick={handleApplyToBanner}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-xs font-mono rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Aplicar al Bloque Seleccionado</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(compressionResult.dataUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? '¡Copiado!' : 'Copiar Data URL'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Video Presets Tab */
            <div className="space-y-5">
              <div className="p-3 bg-zinc-900 text-white rounded-xl text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-amber-400" />
                  <span>Streaming HD con compresión H.264 / WebM liviano (&lt;2 MB)</span>
                </div>
                <span className="text-[10px] text-zinc-400">Autoplay • Muted • Loop</span>
              </div>

              {/* Video Grid Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LIGHTWEIGHT_VIDEO_PRESETS.map((preset) => {
                  const isCurrent = selectedVideo.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedVideo(preset)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-3 ${
                        isCurrent
                          ? 'border-black bg-zinc-50 ring-2 ring-black shadow-md'
                          : 'border-zinc-200 hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                        <video
                          src={preset.videoUrl}
                          poster={preset.posterUrl}
                          muted
                          loop
                          playsInline
                          autoPlay={isCurrent}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          {preset.sizeEstimate}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                          {preset.category}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900">{preset.name}</h4>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">
                          {preset.description}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyVideoToBanner(preset);
                        }}
                        className="w-full py-2 bg-black hover:bg-zinc-800 text-white text-xs font-mono font-bold uppercase rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5 text-amber-400" />
                        <span>Insertar Este Video en el Banner</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Carga ultraligera certificada para redes móviles colombianas</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-md text-zinc-700 font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
