import React from 'react';
import { ArrowUp, ArrowDown, Layers, PinOff, Sparkles } from 'lucide-react';
import { useStore, orderedShowcasePinnedIds } from '../../../context/StoreContext';
import { Product } from '../../../types';

export const BlocksCustomizer: React.FC = () => {
  const { themeConfig, updateThemeConfig, products, moveShowcasePinned, setShowcasePinned } = useStore();

  const BLOCKS = [
    { key: 'showAnnouncementBar', label: 'Cinta Superior de Anuncios', desc: 'Promociones y envíos gratis arriba de todo' },
    { key: 'showHero', label: 'Banner Principal (Hero)', desc: 'Foto/video de portada con titular y botones CTA' },
    { key: 'showCategories', label: 'Sección de Categorías / Siluetas', desc: 'Selector de hoodies, camisetas, etc.' },
    { key: 'showCatalog', label: 'Catálogo de Prendas (Drops)', desc: 'Grilla principal de productos' },
    { key: 'showCommunityLooks', label: 'Favoritos de la casa', desc: 'Lo mejor calificado por los clientes con compra rápida' },
    { key: 'showReviews', label: 'Reseñas y Testimonios', desc: 'Opiniones verificadas + franja de asesoría WhatsApp' },
    { key: 'showTrustBadges', label: 'Franja de Pagos Wompi & Beneficios', desc: 'Sellos de Bancolombia, PSE, Nequi y envíos' },
    { key: 'showNewsletter', label: 'Caja de Suscripción VIP (Newsletter)', desc: 'Captura de correos para próximos drops' },
  ];

  const pinnedIds = orderedShowcasePinnedIds(themeConfig, products);
  const byId = new Map<string, Product>(products.map((p) => [p.id, p]));

  return (
    <div className="space-y-3 text-xs text-slate-700 animate-in fade-in">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-[11px] leading-relaxed">
        <strong>📦 Activar o Desactivar Secciones:</strong> Puedes ocultar temporalmente cualquier bloque de la página de inicio con un solo clic.
      </div>

      {/* Vitrina principal: fijos + rotación */}
      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-800 block text-xs">🔥 Vitrina destacada (fijos + rotación)</span>
            <span className="text-[10px] text-slate-500">Fija productos con el 📌 en Catálogo; el resto rota solo.</span>
          </div>
          <input
            type="checkbox"
            checked={themeConfig.showcaseEnabled !== false}
            onChange={(e) => updateThemeConfig({ showcaseEnabled: e.target.checked })}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono font-bold text-slate-700 block mb-1">Título de la vitrina (vacío = oculta el título)</label>
          <input
            type="text"
            value={themeConfig.showcaseTitle || ''}
            onChange={(e) => updateThemeConfig({ showcaseTitle: e.target.value })}
            placeholder="Vitrina Tu Tienda a la Mano"
            className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-medium focus:outline-hidden focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-[11px] font-mono font-bold text-slate-700 block mb-1">Subtítulo de la vitrina (vacío = oculto)</label>
          <input
            type="text"
            value={themeConfig.showcaseSubtitle || ''}
            onChange={(e) => updateThemeConfig({ showcaseSubtitle: e.target.value })}
            placeholder="Fijos seleccionados y rotación del catálogo."
            className="w-full px-3 py-2 border rounded-xl bg-white text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-mono font-bold text-slate-700 block mb-1">En rotación</label>
            <input
              type="number"
              min={1}
              max={10}
              value={themeConfig.showcaseRotateCount || 4}
              onChange={(e) => updateThemeConfig({ showcaseRotateCount: Math.min(10, Math.max(1, Number(e.target.value) || 4)) })}
              className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono font-bold text-slate-700 block mb-1">Cada (segundos)</label>
            <input
              type="number"
              min={3}
              max={120}
              value={themeConfig.showcaseIntervalSec || 8}
              onChange={(e) => updateThemeConfig({ showcaseIntervalSec: Math.min(120, Math.max(3, Number(e.target.value) || 8)) })}
              className="w-full px-3 py-2 border rounded-xl bg-white text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Orden manual de fijados */}
        <div className="bg-white border border-amber-200 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px]">📌 Orden de fijos (arrastra con ↑↓)</span>
            <span className="text-[10px] text-slate-400">{pinnedIds.length}</span>
          </div>
          {pinnedIds.length === 0 ? (
            <p className="text-[11px] text-slate-500">Sin fijos: marca el 📌 en Catálogo.</p>
          ) : (
            pinnedIds.map((id, idx) => {
              const p = byId.get(id);
              if (!p) return null;
              return (
                <div key={id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1">
                  <span className="font-mono font-black text-slate-400 text-[11px] w-4">{idx + 1}</span>
                  <span className="flex-1 truncate text-[11px] font-bold text-slate-800">{p.title}</span>
                  <button type="button" onClick={() => moveShowcasePinned(id, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer" title="Subir">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => moveShowcasePinned(id, 1)} disabled={idx === pinnedIds.length - 1} className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer" title="Bajar">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setShowcasePinned(id, false)} className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer" title="Soltar">
                    <PinOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-200 rounded-xl px-3 py-2">
          <input
            type="checkbox"
            checked={themeConfig.showcaseNewFirst !== false}
            onChange={(e) => updateThemeConfig({ showcaseNewFirst: e.target.checked })}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
          <span className="text-[11px] font-bold text-slate-700">✨ Productos nuevos siempre primeros</span>
        </label>
      </div>

      <div className="space-y-2">
        {BLOCKS.map((b) => (
          <div
            key={b.key}
            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div>
              <span className="font-bold text-slate-800 block text-xs">{b.label}</span>
              <span className="text-[10px] text-slate-400">{b.desc}</span>
            </div>
            <input
              type="checkbox"
              checked={(themeConfig as any)[b.key] !== false}
              onChange={(e) => updateThemeConfig({ [b.key]: e.target.checked })}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
