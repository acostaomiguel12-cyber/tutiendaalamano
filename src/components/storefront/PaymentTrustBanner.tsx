import React from 'react';
import { Lock, RotateCcw, Truck, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const PaymentTrustBanner: React.FC = () => {
  const { themeConfig } = useStore();

  // Visible por defecto (undefined = visible): coherente con el toggle de Bloques (checked !== false).
  if (themeConfig.showTrustBadges === false) {
    return null;
  }

  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';

  const roundedClass =
    themeConfig.borderRadius === 'rounded'
      ? 'rounded-2xl'
      : themeConfig.borderRadius === 'pill'
      ? 'rounded-3xl'
      : 'rounded-none';

  return (
    <section
      id="confianza-pagos"
      className={`py-12 px-4 sm:px-6 border-b scroll-mt-24 transition-colors ${
        isDark
          ? 'bg-zinc-950 text-white border-zinc-800'
          : isWarm
          ? 'bg-[#f5f1eb] text-stone-900 border-stone-200'
          : 'bg-white text-zinc-900 border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          {(themeConfig.trustSectionBadge !== undefined ? themeConfig.trustSectionBadge : 'SEGURIDAD & CONFIANZA') ? (
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 block">
            {themeConfig.trustSectionBadge !== undefined ? themeConfig.trustSectionBadge : 'SEGURIDAD & CONFIANZA'}
          </span>
          ) : null}
          {(themeConfig.trustSectionTitle !== undefined ? themeConfig.trustSectionTitle : 'Compra 100% Protegida en Colombia') ? (
          <h2
            className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
              themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
            }`}
          >
            {themeConfig.trustSectionTitle !== undefined ? themeConfig.trustSectionTitle : 'Compra 100% Protegida en Colombia'}
          </h2>
          ) : null}
          {(themeConfig.trustSectionSubtitle !== undefined ? themeConfig.trustSectionSubtitle : 'Transacciones encriptadas de extremo a extremo con los más altos estándares de seguridad bancaria.') ? (
          <p className="text-xs text-zinc-500">
            {themeConfig.trustSectionSubtitle !== undefined ? themeConfig.trustSectionSubtitle : 'Transacciones encriptadas de extremo a extremo con los más altos estándares de seguridad bancaria.'}
          </p>
          ) : null}
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(themeConfig.trustFeature1Title !== '' || themeConfig.trustFeature1Desc !== '') && (
          <div
            className={`p-5 border transition-all ${roundedClass} ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <Zap className={`w-5 h-5 mb-2 ${isDark ? 'text-[#ccff00]' : 'text-zinc-950'}`} />
            {(themeConfig.trustFeature1Title !== undefined ? themeConfig.trustFeature1Title : 'Pagos Instantáneos') ? (
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {themeConfig.trustFeature1Title !== undefined ? themeConfig.trustFeature1Title : 'Pagos Instantáneos'}
            </h3>
            ) : null}
            {(themeConfig.trustFeature1Desc !== undefined ? themeConfig.trustFeature1Desc : 'PSE sin costo adicional, Nequi, Botón Bancolombia, Daviplata y tarjetas crédito/débito.') ? (
            <p className="text-xs text-zinc-500 leading-relaxed mt-1">
              {themeConfig.trustFeature1Desc !== undefined ? themeConfig.trustFeature1Desc : 'PSE sin costo adicional, Nequi, Botón Bancolombia, Daviplata y tarjetas crédito/débito.'}
            </p>
            ) : null}
          </div>
          )}

          {(themeConfig.trustFeature2Title !== '' || themeConfig.trustFeature2Desc !== '') && (
          <div
            className={`p-5 border transition-all ${roundedClass} ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <Truck className={`w-5 h-5 mb-2 ${isDark ? 'text-[#ccff00]' : 'text-zinc-950'}`} />
            {(themeConfig.trustFeature2Title !== undefined ? themeConfig.trustFeature2Title : 'Despacho Asegurado') ? (
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {themeConfig.trustFeature2Title !== undefined ? themeConfig.trustFeature2Title : 'Despacho Asegurado'}
            </h3>
            ) : null}
            {(themeConfig.trustFeature2Desc !== undefined ? themeConfig.trustFeature2Desc : 'Envíos prioritarios con Coordinadora y Servientrega. Número de guía en tiempo real a tu WhatsApp.') ? (
            <p className="text-xs text-zinc-500 leading-relaxed mt-1">
              {themeConfig.trustFeature2Desc !== undefined ? themeConfig.trustFeature2Desc : 'Envíos prioritarios con Coordinadora y Servientrega. Número de guía en tiempo real a tu WhatsApp.'}
            </p>
            ) : null}
          </div>
          )}

          {(themeConfig.trustFeature3Title !== '' || themeConfig.trustFeature3Desc !== '') && (
          <div
            className={`p-5 border transition-all ${roundedClass} ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <RotateCcw className={`w-5 h-5 mb-2 ${isDark ? 'text-[#ccff00]' : 'text-zinc-950'}`} />
            {(themeConfig.trustFeature3Title !== undefined ? themeConfig.trustFeature3Title : 'Cambios en 30 Días') ? (
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {themeConfig.trustFeature3Title !== undefined ? themeConfig.trustFeature3Title : 'Cambios en 30 Días'}
            </h3>
            ) : null}
            {(themeConfig.trustFeature3Desc !== undefined ? themeConfig.trustFeature3Desc : '¿No te quedó la talla? Gestionamos el cambio directo a domicilio sin trámites complicados.') ? (
            <p className="text-xs text-zinc-500 leading-relaxed mt-1">
              {themeConfig.trustFeature3Desc !== undefined ? themeConfig.trustFeature3Desc : '¿No te quedó la talla? Gestionamos el cambio directo a domicilio sin trámites complicados.'}
            </p>
            ) : null}
          </div>
          )}

          {(themeConfig.trustFeature4Title !== '' || themeConfig.trustFeature4Desc !== '') && (
          <div
            className={`p-5 border transition-all ${roundedClass} ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
            }`}
          >
            <Lock className={`w-5 h-5 mb-2 ${isDark ? 'text-[#ccff00]' : 'text-zinc-950'}`} />
            {(themeConfig.trustFeature4Title !== undefined ? themeConfig.trustFeature4Title : 'Encriptación Bancaria') ? (
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {themeConfig.trustFeature4Title !== undefined ? themeConfig.trustFeature4Title : 'Encriptación Bancaria'}
            </h3>
            ) : null}
            {(themeConfig.trustFeature4Desc !== undefined ? themeConfig.trustFeature4Desc : 'Firma criptográfica SHA-256 HMAC para validar cada pago de forma 100% segura.') ? (
            <p className="text-xs text-zinc-500 leading-relaxed mt-1">
              {themeConfig.trustFeature4Desc !== undefined ? themeConfig.trustFeature4Desc : 'Firma criptográfica SHA-256 HMAC para validar cada pago de forma 100% segura.'}
            </p>
            ) : null}
          </div>
          )}
        </div>

        {/* Colombian Payment Badges Row */}
        <div
          className={`flex items-center justify-center gap-3 flex-wrap pt-4 border-t ${
            isDark ? 'border-zinc-800' : 'border-zinc-200'
          }`}
        >
          <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">
            Medios autorizados:
          </span>
          <div className="flex items-center gap-2 font-mono text-xs font-bold flex-wrap justify-center">
            <span className="bg-white text-zinc-800 px-2.5 py-1 border border-zinc-200 rounded text-[11px]">
              PSE
            </span>
            <span className="bg-white text-pink-600 px-2.5 py-1 border border-zinc-200 rounded text-[11px]">
              NEQUI
            </span>
            <span className="bg-white text-blue-700 px-2.5 py-1 border border-zinc-200 rounded text-[11px]">
              BANCOLOMBIA
            </span>
            <span className="bg-white text-red-600 px-2.5 py-1 border border-zinc-200 rounded text-[11px]">
              DAVIPLATA
            </span>
            <span className="bg-white text-zinc-800 px-2.5 py-1 border border-zinc-200 rounded text-[11px]">
              VISA / MASTERCARD
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
