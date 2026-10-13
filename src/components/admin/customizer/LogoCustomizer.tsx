import React from 'react';
import { Upload, Trash2, Eye, ShieldCheck, Tag } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';

interface LogoCustomizerProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, targetField: 'logo' | 'footerLogo' | 'heroImage') => void;
}

export const LogoCustomizer: React.FC<LogoCustomizerProps> = ({ onFileUpload }) => {
  const { themeConfig, updateThemeConfig, storePreferences, updateStorePreferences } = useStore();

  return (
    <div className="space-y-4 text-xs text-slate-700 animate-in fade-in">
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-amber-900 text-[11px] leading-relaxed">
        <strong>💡 Personalización de Marca:</strong> Sube tu logo en formato PNG o SVG transparente para reemplazar el texto tipográfico del encabezado. También puedes ajustar el tamaño y cómo se muestra.
      </div>

      {/* Previsualización del Logo */}
      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
          Logo Actual en la Tienda:
        </span>
        {themeConfig.logoUrl ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-center min-w-[140px] max-w-full">
              <img
                src={themeConfig.logoUrl}
                alt="Logo Tienda"
                style={{ height: `${themeConfig.logoHeight || 36}px` }}
                className="max-w-[200px] object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  updateThemeConfig({ logoUrl: '' });
                  updateStorePreferences({ storeLogoUrl: '' });
                }}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1 font-mono text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Quitar Logo (Volver a texto)
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-white border border-dashed border-slate-300 rounded-lg text-slate-400 text-center font-mono text-[11px]">
            No hay logo cargado. Actualmente se muestra el nombre: <strong>"{storePreferences.storeBrandName || 'TU TIENDA A LA MANO'}"</strong>
          </div>
        )}
      </div>

      {/* Cargar Archivo desde PC */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono font-bold text-slate-600 block uppercase">
          1. Subir Logo desde tu Computador:
        </label>
        <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-mono font-bold text-xs uppercase rounded-xl hover:bg-indigo-700 transition-all cursor-pointer shadow-xs">
          <Upload className="w-4 h-4" />
          <span>Examinar y Subir Archivo (PNG, JPG, SVG)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileUpload(e, 'logo')}
            className="hidden"
          />
        </label>
      </div>

      {/* O Enlace directo */}
      <div className="space-y-1">
        <label className="text-[11px] font-mono text-slate-500 block">
          O ingresar URL directa de la imagen del Logo:
        </label>
        <input
          type="url"
          value={themeConfig.logoUrl || ''}
          onChange={(e) => {
            updateThemeConfig({ logoUrl: e.target.value });
            updateStorePreferences({ storeLogoUrl: e.target.value });
          }}
          placeholder="https://ejemplo.com/mi-logo.png"
          className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-mono"
        />
      </div>

      {/* Tamaño / Altura del Logo */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold text-slate-700 uppercase">
            Altura del Logo en el Menú:
          </label>
          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            {themeConfig.logoHeight || 36} px
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="80"
          step="2"
          value={themeConfig.logoHeight || 36}
          onChange={(e) => updateThemeConfig({ logoHeight: Number(e.target.value) })}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>Pequeño (20px)</span>
          <span>Recomendado (36px - 44px)</span>
          <span>Grande (80px)</span>
        </div>
      </div>

      {/* Opción de mostrar texto junto al logo */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <span className="font-bold text-slate-800 block text-xs">Mostrar Nombre junto al Logo</span>
          <span className="text-[10px] text-slate-400">Si está activo, muestra tanto el icono/logo como el nombre de la tienda</span>
        </div>
        <input
          type="checkbox"
          checked={themeConfig.showBrandNameWithLogo !== false}
          onChange={(e) => updateThemeConfig({ showBrandNameWithLogo: e.target.checked })}
          className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
        />
      </div>

      {/* Nombre de la Marca */}
      <div className="border-t border-slate-100 pt-3 space-y-1">
        <label className="text-[11px] font-mono font-bold text-slate-700 block uppercase">
          Nombre Oficial de la Marca / Tienda:
        </label>
        <input
          type="text"
          value={storePreferences.storeBrandName || ''}
          onChange={(e) => updateStorePreferences({ storeBrandName: e.target.value })}
          placeholder="TU TIENDA A LA MANO"
          className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-bold"
        />
      </div>

      {/* Ciudad y País */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Ciudad Sede</label>
          <input
            type="text"
            value={storePreferences.storeCity || 'Medellín'}
            onChange={(e) => updateStorePreferences({ storeCity: e.target.value })}
            placeholder="Medellín"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-500 block mb-1">Departamento / País</label>
          <input
            type="text"
            value={storePreferences.storeDepartment || 'Antioquia, Colombia'}
            onChange={(e) => updateStorePreferences({ storeDepartment: e.target.value })}
            placeholder="Antioquia, Colombia"
            className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white"
          />
        </div>
      </div>
    </div>
  );
};
