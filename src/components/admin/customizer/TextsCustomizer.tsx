import React from 'react';
import { Type, ShieldCheck, Tag, ShoppingBag, Users } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

export const TextsCustomizer: React.FC = () => {
  const { themeConfig, updateThemeConfig } = useStore();

  return (
    <div className="space-y-4 text-xs text-slate-700 animate-in fade-in">
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-indigo-900 text-[11px] leading-relaxed">
        <strong>✏️ Editor Central de Contenidos:</strong> Modifica aquí los títulos, subtítulos y textos de cada bloque de la tienda para adaptar el tono a tu marca.
        Vaciar un campo lo <strong>elimina de la tienda</strong> (no queda pegado). Usa la pestaña Bloques para desactivar secciones completas.
      </div>

      {/* 1. Cinta Superior de Anuncios */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>1. Cinta Superior de Anuncios</span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[10px] text-slate-400 font-mono">Activar</span>
            <input
              type="checkbox"
              checked={themeConfig.showAnnouncementBar}
              onChange={(e) => updateThemeConfig({ showAnnouncementBar: e.target.checked })}
              className="w-3.5 h-3.5 accent-indigo-600 rounded"
            />
          </label>
        </div>
        <input
          type="text"
          value={themeConfig.announcementText}
          onChange={(e) => updateThemeConfig({ announcementText: e.target.value })}
          placeholder="ENVÍOS GRATIS A COLOMBIA POR COMPRAS SUPERIORES A $250.000 COP"
          className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-mono"
        />
      </div>

      {/* 2. Sección de Categorías / Siluetas */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800 uppercase">
          <Tag className="w-3.5 h-3.5 text-indigo-600" />
          <span>2. Sección de Categorías / Siluetas</span>
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Etiqueta Badge</label>
          <input
            type="text"
            value={themeConfig.categoriesBadge || ''}
            onChange={(e) => updateThemeConfig({ categoriesBadge: e.target.value })}
            placeholder="STREETWEAR ARCHIVE // SILUETAS"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Título de la Sección</label>
          <input
            type="text"
            value={themeConfig.categoriesTitle || ''}
            onChange={(e) => updateThemeConfig({ categoriesTitle: e.target.value })}
            placeholder="Líneas & Prendas Urbanas"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Subtítulo Descriptivo</label>
          <input
            type="text"
            value={themeConfig.categoriesSubtitle || ''}
            onChange={(e) => updateThemeConfig({ categoriesSubtitle: e.target.value })}
            placeholder="TOCA CUALQUIER CATEGORÍA PARA FILTRAR • CORTE BOXY • 450 GSM"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
          />
        </div>
      </div>

      {/* 3. Sección de Catálogo / Drops */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800 uppercase">
          <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
          <span>3. Sección de Catálogo de Prendas</span>
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Etiqueta Badge</label>
          <input
            type="text"
            value={themeConfig.catalogBadge || ''}
            onChange={(e) => updateThemeConfig({ catalogBadge: e.target.value })}
            placeholder="CATÁLOGO // DISPONIBLE"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Título de la Sección</label>
          <input
            type="text"
            value={themeConfig.catalogTitle || ''}
            onChange={(e) => updateThemeConfig({ catalogTitle: e.target.value })}
            placeholder="Colección de Prendas"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Subtítulo Descriptivo</label>
          <input
            type="text"
            value={themeConfig.catalogSubtitle || ''}
            onChange={(e) => updateThemeConfig({ catalogSubtitle: e.target.value })}
            placeholder="Prendas exclusivas de corte oversize confeccionadas en Medellín..."
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
          />
        </div>
      </div>

      {/* 4. Lookbook de Comunidad */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800 uppercase">
          <Users className="w-3.5 h-3.5 text-indigo-600" />
          <span>4. Sección de Lookbook & Comunidad</span>
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Etiqueta Badge</label>
          <input
            type="text"
            value={themeConfig.communityBadge || ''}
            onChange={(e) => updateThemeConfig({ communityBadge: e.target.value })}
            placeholder="LO MEJOR CALIFICADO // LA CASA"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Título de la Sección</label>
          <input
            type="text"
            value={themeConfig.communitySectionTitle || ''}
            onChange={(e) => updateThemeConfig({ communitySectionTitle: e.target.value })}
            placeholder="Favoritos de la casa"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Subtítulo Descriptivo</label>
          <input
            type="text"
            value={themeConfig.communitySectionSubtitle || ''}
            onChange={(e) => updateThemeConfig({ communitySectionSubtitle: e.target.value })}
            placeholder="Estilos compartidos por creadores en Medellín, Bogotá y Cali..."
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Mención Instagram (Llamado a la acción)</label>
          <input
            type="text"
            value={themeConfig.communityInstagramMention || ''}
            onChange={(e) => updateThemeConfig({ communityInstagramMention: e.target.value })}
            placeholder="MENCIONA @TUTIENDAALAMANO EN INSTAGRAM"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-mono font-bold"
          />
        </div>
      </div>

      {/* 5. Franja de Seguridad & Beneficios Wompi */}      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-3">
        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800 uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>5. Franja de Confianza & Pagos Wompi</span>
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Etiqueta Badge</label>
          <input
            type="text"
            value={themeConfig.trustSectionBadge || ''}
            onChange={(e) => updateThemeConfig({ trustSectionBadge: e.target.value })}
            placeholder="SEGURIDAD & CONFIANZA"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Título de la Franja</label>
          <input
            type="text"
            value={themeConfig.trustSectionTitle || ''}
            onChange={(e) => updateThemeConfig({ trustSectionTitle: e.target.value })}
            placeholder="Compra 100% Protegida en Colombia"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Subtítulo</label>
          <input
            type="text"
            value={themeConfig.trustSectionSubtitle || ''}
            onChange={(e) => updateThemeConfig({ trustSectionSubtitle: e.target.value })}
            placeholder="Transacciones encriptadas de extremo a extremo..."
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
          />
        </div>

        {/* 4 Beneficios detallados */}
        <div className="border-t border-slate-200 pt-3 space-y-2">
          <span className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
            Los 4 Beneficios de Confianza:
          </span>
          <div className="space-y-2">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold block">Beneficio 1 (Pagos)</span>
              <input
                type="text"
                value={themeConfig.trustFeature1Title || ''}
                onChange={(e) => updateThemeConfig({ trustFeature1Title: e.target.value })}
                placeholder="Pagos Seguros Wompi"
                className="w-full px-2 py-1 text-xs border rounded font-bold"
              />
              <input
                type="text"
                value={themeConfig.trustFeature1Desc || ''}
                onChange={(e) => updateThemeConfig({ trustFeature1Desc: e.target.value })}
                placeholder="Bancolombia, Tarjeta de Crédito, PSE y Nequi"
                className="w-full px-2 py-1 text-[11px] border rounded text-slate-600"
              />
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold block">Beneficio 2 (Envíos)</span>
              <input
                type="text"
                value={themeConfig.trustFeature2Title || ''}
                onChange={(e) => updateThemeConfig({ trustFeature2Title: e.target.value })}
                placeholder="Envíos a Toda Colombia"
                className="w-full px-2 py-1 text-xs border rounded font-bold"
              />
              <input
                type="text"
                value={themeConfig.trustFeature2Desc || ''}
                onChange={(e) => updateThemeConfig({ trustFeature2Desc: e.target.value })}
                placeholder="Coordinadora e Inter Rapidísimo con guía en tiempo real"
                className="w-full px-2 py-1 text-[11px] border rounded text-slate-600"
              />
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold block">Beneficio 3 (Garantía)</span>
              <input
                type="text"
                value={themeConfig.trustFeature3Title || ''}
                onChange={(e) => updateThemeConfig({ trustFeature3Title: e.target.value })}
                placeholder="Garantía de Satisfacción"
                className="w-full px-2 py-1 text-xs border rounded font-bold"
              />
              <input
                type="text"
                value={themeConfig.trustFeature3Desc || ''}
                onChange={(e) => updateThemeConfig({ trustFeature3Desc: e.target.value })}
                placeholder="Cambios fáciles por talla o prenda en 15 días"
                className="w-full px-2 py-1 text-[11px] border rounded text-slate-600"
              />
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold block">Beneficio 4 (Soporte) — vaciar ambos oculta la tarjeta</span>
              <input
                type="text"
                value={themeConfig.trustFeature4Title || ''}
                onChange={(e) => updateThemeConfig({ trustFeature4Title: e.target.value })}
                placeholder="Atención Personalizada"
                className="w-full px-2 py-1 text-xs border rounded font-bold"
              />
              <input
                type="text"
                value={themeConfig.trustFeature4Desc || ''}
                onChange={(e) => updateThemeConfig({ trustFeature4Desc: e.target.value })}
                placeholder="Asesoría directa vía WhatsApp en tu compra"
                className="w-full px-2 py-1 text-[11px] border rounded text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. Reseñas y Testimonios */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800 uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>6. Reseñas y Testimonios</span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[10px] text-slate-400 font-mono">Activar</span>
            <input
              type="checkbox"
              checked={themeConfig.showReviews !== false}
              onChange={(e) => updateThemeConfig({ showReviews: e.target.checked })}
              className="w-3.5 h-3.5 accent-indigo-600 rounded"
            />
          </label>
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Etiqueta Badge (vacío = oculta)</label>
          <input
            type="text"
            value={themeConfig.reviewsBadge || ''}
            onChange={(e) => updateThemeConfig({ reviewsBadge: e.target.value })}
            placeholder="TESTIMONIOS REALES // COMUNIDAD A LA MANO"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Título (vacío = oculta)</label>
          <input
            type="text"
            value={themeConfig.reviewsTitle || ''}
            onChange={(e) => updateThemeConfig({ reviewsTitle: e.target.value })}
            placeholder="Lo Que Dicen Quienes Visten Nuestro Drop"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Subtítulo (vacío = oculta)</label>
          <input
            type="text"
            value={themeConfig.reviewsSubtitle || ''}
            onChange={(e) => updateThemeConfig({ reviewsSubtitle: e.target.value })}
            placeholder="Más de 2.400 clientes en toda Colombia…"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
          />
        </div>
      </div>

      {/* 7. Newsletter VIP */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold font-mono text-slate-800 uppercase">
            <Type className="w-3.5 h-3.5 text-indigo-600" />
            <span>7. Suscripción VIP (Newsletter)</span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-[10px] text-slate-400 font-mono">Activar</span>
            <input
              type="checkbox"
              checked={themeConfig.showNewsletter !== false}
              onChange={(e) => updateThemeConfig({ showNewsletter: e.target.checked })}
              className="w-3.5 h-3.5 accent-indigo-600 rounded"
            />
          </label>
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Título (vacío = oculta)</label>
          <input
            type="text"
            value={themeConfig.newsletterTitle || ''}
            onChange={(e) => updateThemeConfig({ newsletterTitle: e.target.value })}
            placeholder="Sé el primero en acceder al próximo Drop"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white font-bold"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Subtítulo (vacío = oculta)</label>
          <input
            type="text"
            value={themeConfig.newsletterSubtitle || ''}
            onChange={(e) => updateThemeConfig({ newsletterSubtitle: e.target.value })}
            placeholder="Suscríbete para recibir contraseña de acceso…"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
          />
        </div>
      </div>
    </div>
  );
};
