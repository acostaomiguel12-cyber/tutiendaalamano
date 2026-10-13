import React from 'react';
import { Palette, Type, Sliders } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

const COLOR_PALETTES = [
  { name: 'Onyx Black', hex: '#18181b', bg: '#ffffff', accent: '#3b82f6' },
  { name: 'Pure Noir Dark', hex: '#ffffff', bg: '#09090b', accent: '#a855f7' },
  { name: 'Royal Indigo', hex: '#4f46e5', bg: '#ffffff', accent: '#ec4899' },
  { name: 'Forest Emerald', hex: '#059669', bg: '#ffffff', accent: '#f59e0b' },
  { name: 'Crimson Drop', hex: '#dc2626', bg: '#ffffff', accent: '#6366f1' },
  { name: 'Warm Bronze', hex: '#78350f', bg: '#faf8f5', accent: '#d97706' },
];

export const StylingCustomizer: React.FC<{ advanced?: boolean }> = ({ advanced = false }) => {
  const { themeConfig, updateThemeConfig } = useStore();

  return (
    <div className="space-y-4 text-xs text-slate-700 animate-in fade-in">
      {/* Presets de paleta */}
      <div>
        <span className="text-[11px] font-mono text-slate-500 block mb-1.5 uppercase font-bold">
          Paletas Rápidas (1 Clic):
        </span>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_PALETTES.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() =>
                updateThemeConfig({
                  primaryColor: p.hex,
                  primaryHover: p.hex,
                  backgroundColor: p.bg,
                  accentColor: p.accent,
                  mode: p.bg === '#09090b' ? 'dark' : p.bg === '#faf8f5' ? 'warm' : 'light',
                  textColor: p.bg === '#09090b' ? '#fafafa' : '#18181b',
                })
              }
              className="p-2 border rounded-xl flex items-center gap-1.5 hover:border-slate-400 transition-all text-left bg-slate-50 cursor-pointer"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border shrink-0"
                style={{ backgroundColor: p.hex }}
              />
              <span className="font-mono text-[10px] truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selectores de color individuales */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <div className="space-y-1">
          <label className="text-[11px] font-mono text-slate-600 block">Color Primario (Botones)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={themeConfig.primaryColor}
              onChange={(e) => updateThemeConfig({ primaryColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
            />
            {advanced && (
            <input
              type="text"
              value={themeConfig.primaryColor}
              onChange={(e) => updateThemeConfig({ primaryColor: e.target.value })}
              className="w-full px-2 py-1 text-xs border rounded font-mono uppercase bg-white"
            />
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-mono text-slate-600 block">Color de Fondo</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={themeConfig.backgroundColor}
              onChange={(e) => updateThemeConfig({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
            />
            {advanced && (
            <input
              type="text"
              value={themeConfig.backgroundColor}
              onChange={(e) => updateThemeConfig({ backgroundColor: e.target.value })}
              className="w-full px-2 py-1 text-xs border rounded font-mono uppercase bg-white"
            />
            )}
          </div>
        </div>

        <div className={advanced ? 'space-y-1' : 'hidden'}>
          <label className="text-[11px] font-mono text-slate-600 block">Color de Texto</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={themeConfig.textColor}
              onChange={(e) => updateThemeConfig({ textColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
            />
            <input
              type="text"
              value={themeConfig.textColor}
              onChange={(e) => updateThemeConfig({ textColor: e.target.value })}
              className="w-full px-2 py-1 text-xs border rounded font-mono uppercase bg-white"
            />
          </div>
        </div>

        <div className={advanced ? 'space-y-1' : 'hidden'}>
          <label className="text-[11px] font-mono text-slate-600 block">Color de Acento (Badges)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={themeConfig.accentColor}
              onChange={(e) => updateThemeConfig({ accentColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-300 p-0.5 cursor-pointer"
            />
            <input
              type="text"
              value={themeConfig.accentColor}
              onChange={(e) => updateThemeConfig({ accentColor: e.target.value })}
              className="w-full px-2 py-1 text-xs border rounded font-mono uppercase bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tipografía */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <label className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
          Familia Tipográfica:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'sans', label: 'Moderna Sans', sample: 'Aa' },
            { id: 'serif', label: 'Editorial Serif', sample: 'Aa' },
            { id: 'mono', label: 'Tech Mono', sample: '01' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => updateThemeConfig({ fontFamily: t.id as any })}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                themeConfig.fontFamily === t.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              <span className="text-base block font-bold">{t.sample}</span>
              <span className="text-[10px] font-mono block mt-1">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bordes (solo Avanzado) */}
      <div className={advanced ? 'border-t border-slate-100 pt-3 space-y-2' : 'hidden'}>
        <label className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
          Esquinas (redondeo):
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'none', label: 'Recto (0px)' },
            { id: 'sm', label: 'Suave (4px)' },
            { id: 'md', label: 'Medio (8px)' },
            { id: 'full', label: 'Pill (Redondo)' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => updateThemeConfig({ borderRadius: r.id as any })}
              className={`py-1.5 px-1 rounded-lg border text-center font-mono text-[10px] transition-all ${
                themeConfig.borderRadius === r.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
