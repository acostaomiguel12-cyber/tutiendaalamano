import React from 'react';
import { Upload, Trash2, ShieldCheck, FileText } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

interface FooterCustomizerProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, targetField: 'logo' | 'footerLogo' | 'heroImage') => void;
}

export const FooterCustomizer: React.FC<FooterCustomizerProps> = ({ onFileUpload }) => {
  const { themeConfig, updateThemeConfig, storePreferences, updateStorePreferences } = useStore();

  return (
    <div className="space-y-4 text-xs text-slate-700 animate-in fade-in">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 text-[11px] leading-relaxed">
        <strong>👣 Pie de Página (Footer):</strong> Configura aquí la descripción de la marca, los datos tributarios (NIT, razón social) y el texto de copyright que se muestra al final de la tienda.
      </div>

      {/* Logo exclusivo para Footer (opcional) */}
      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
        <label className="text-[11px] font-mono font-bold text-slate-700 uppercase block">
          Logo para el Footer (Opcional, en blanco o contraste):
        </label>
        {themeConfig.footerLogoUrl ? (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded border border-slate-800">
              <img
                src={themeConfig.footerLogoUrl}
                alt="Footer Logo"
                className="h-8 max-w-[140px] object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => updateThemeConfig({ footerLogoUrl: '' })}
              className="px-2.5 py-1 text-[11px] font-mono bg-rose-50 text-rose-700 rounded border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Usar Logo Principal
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 font-mono">
            Actualmente se usa el logo principal o el nombre de la tienda.
          </p>
        )}

        <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 font-mono font-bold text-xs uppercase rounded-lg hover:bg-slate-100 transition-all cursor-pointer">
          <Upload className="w-3.5 h-3.5 text-indigo-600" />
          <span>Subir Logo Blanco/Contraste para Footer</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileUpload(e, 'footerLogo')}
            className="hidden"
          />
        </label>
      </div>

      {/* Descripción de la Marca en el Footer */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono font-bold text-slate-700 block">
          Descripción de la Marca en el Footer:
        </label>
        <textarea
          rows={3}
          value={themeConfig.footerBrandDescription || ''}
          onChange={(e) => updateThemeConfig({ footerBrandDescription: e.target.value })}
          placeholder="Marca colombiana de streetwear contemporáneo confeccionada en Medellín con algodón pesado de 450 GSM. Envíos nacionales con Wompi."
          className="w-full px-3 py-2 text-xs border rounded-lg bg-white"
        />
      </div>

      {/* Razón Social y NIT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-500 block">Razón Social Legal</label>
          <input
            type="text"
            value={storePreferences.businessLegalName || 'TU TIENDA A LA MANO S.A.S.'}
            onChange={(e) => updateStorePreferences({ businessLegalName: e.target.value })}
            placeholder="TU TIENDA A LA MANO S.A.S."
            className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-500 block">NIT de la Empresa</label>
          <input
            type="text"
            value={storePreferences.businessNit || '901.847.291-4'}
            onChange={(e) => updateStorePreferences({ businessNit: e.target.value })}
            placeholder="901.847.291-4"
            className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white font-mono"
          />
        </div>
      </div>

      {/* Texto de Derechos Reservados / Copyright */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono font-bold text-slate-700 block">
          Texto Legal de Copyright en el Pie:
        </label>
        <input
          type="text"
          value={themeConfig.footerCopyrightText || ''}
          onChange={(e) => updateThemeConfig({ footerCopyrightText: e.target.value })}
          placeholder="© 2026 TU TIENDA A LA MANO S.A.S. — Todos los derechos reservados. Industria Colombiana."
          className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-mono"
        />
      </div>
    </div>
  );
};
