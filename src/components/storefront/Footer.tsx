import React, { useState } from 'react';
import { Layers, Send, Instagram, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const {
    setActiveView,
    setActiveCategoryFilter,
    showToast,
    themeConfig,
    openPolicyModal,
    openOrderTracking,
    storePreferences,
  } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    showToast('🎉 ¡Te has registrado! Recibirás nuestras ofertas y novedades.');
    setNewsletterEmail('');
  };

  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';
  const rawLogo = themeConfig.footerLogoUrl || themeConfig.logoUrl || storePreferences.storeLogoUrl;
  const activeLogo = rawLogo && rawLogo.trim() ? rawLogo.trim() : null;

  return (
    <footer
      className={`border-t transition-colors ${
        isDark
          ? 'bg-zinc-950 text-white border-zinc-800'
          : isWarm
          ? 'bg-[#ece7df] text-stone-900 border-stone-300'
          : 'bg-zinc-900 text-white border-zinc-800'
      }`}
    >
      {/* Newsletter Early Access Bar (visible por defecto, coherente con toggle de Bloques) */}
      {themeConfig.showNewsletter !== false && (
        <div
          className={`border-b py-12 px-4 sm:px-6 ${
            isDark
              ? 'border-zinc-800'
              : isWarm
              ? 'border-stone-300 bg-[#f5f1eb]'
              : 'border-zinc-800 bg-zinc-950'
          }`}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                VIP DROP ACCESS // MEDELLÍN
              </span>
              {(themeConfig.newsletterTitle !== undefined ? themeConfig.newsletterTitle : 'Sé el primero en acceder al próximo Drop') ? (
              <h3
                className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${
                  themeConfig.fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                }`}
              >
                {themeConfig.newsletterTitle !== undefined ? themeConfig.newsletterTitle : 'Sé el primero en acceder al próximo Drop'}
              </h3>
              ) : null}
              {(themeConfig.newsletterSubtitle !== undefined ? themeConfig.newsletterSubtitle : 'Nuestras piezas de edición limitada suelen agotarse en minutos. Suscríbete para recibir contraseña de acceso 30 minutos antes.') ? (
              <p className="text-xs text-zinc-400 max-w-md">
                {themeConfig.newsletterSubtitle !== undefined ? themeConfig.newsletterSubtitle : 'Nuestras piezas de edición limitada suelen agotarse en minutos. Suscríbete para recibir contraseña de acceso 30 minutos antes.'}
              </p>
              ) : null}
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-md lg:ml-auto w-full">
              <input
                type="email"
                placeholder="Ingresa tu correo electrónico..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className={`flex-1 px-4 py-3 text-xs font-mono focus:outline-hidden rounded-md border ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500'
                    : isWarm
                    ? 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400'
                    : 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400'
                }`}
              />
              <button
                type="submit"
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap rounded-md text-white shadow-xs"
                style={{ backgroundColor: themeConfig.primaryColor }}
              >
                Unirme
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              {activeLogo ? (
                <div className="flex items-center gap-3">
                  <img
                    src={activeLogo}
                    alt={storePreferences.storeBrandName || 'Logo de Tienda'}
                    style={{ height: `${themeConfig.logoHeight ? Math.min(themeConfig.logoHeight, 48) : 40}px` }}
                    className="w-auto object-contain max-h-16"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xl sm:text-2xl font-black uppercase tracking-tighter font-sans block">
                      {storePreferences.storeBrandName || 'TU TIENDA A LA MANO'}
                    </span>
                    <span className="block text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase">
                      {storePreferences.city || 'MEDELLÍN'} // {storePreferences.department || 'COLOMBIA'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-2xl sm:text-3xl font-black uppercase tracking-tighter font-sans">
                    {storePreferences.storeBrandName || 'TU TIENDA A LA MANO'}
                  </span>
                  <span className="block text-[10px] font-mono tracking-[0.2em] text-zinc-400 uppercase">
                    {storePreferences.city || 'MEDELLÍN'} // {storePreferences.department || 'COLOMBIA'} • EST. 2026
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              {themeConfig.footerBrandDescription ||
                'Tu tienda mixta colombiana: ropa, hogar, mascotas, café e infusiones y accesorios con precios claros, pago seguro y envíos a todo el país.'}
            </p>
          </div>

          {/* Links 1: Drops */}
          <div className="space-y-3 text-xs">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-300 text-[11px]">
              DEPARTAMENTOS
            </h4>
            <ul className="space-y-2 text-zinc-400 font-medium">
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('Ropa');
                    setActiveView('home');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ropa para todos
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('Hogar');
                    setActiveView('home');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Hogar y decoración
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('Mascotas');
                    setActiveView('home');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Mascotas felices
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('Café e Infusiones');
                    setActiveView('home');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Café e infusiones
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('Accesorios');
                    setActiveView('home');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Accesorios top
                </button>
              </li>
            </ul>
          </div>

          {/* Links 2: Customer Service */}
          <div className="space-y-3 text-xs">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-300 text-[11px]">
              ATENCIÓN AL CLIENTE
            </h4>
            <ul className="space-y-2 text-zinc-400 font-medium">
              <li>
                <button
                  onClick={() => openPolicyModal('tallas')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Guía de Medidas y Tallas (450 GSM)
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicyModal('envios')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Tiempos de Despacho & Cobertura
                </button>
              </li>
              <li>
                <button
                  onClick={() => openOrderTracking()}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer text-left font-bold flex items-center gap-1.5"
                >
                  <span>Rastrear Pedido en Vivo</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    SIN REGISTRO
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicyModal('garantias')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Garantía 30 Días & Retracto
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${(storePreferences.supportPhoneWhatsApp || '573009876543').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>WhatsApp: {storePreferences.supportPhoneWhatsApp}</span>
                </a>
              </li>
              <li>
                <span className="text-zinc-500">Email: {storePreferences.supportEmail}</span>
              </li>
            </ul>
          </div>

          {/* Links 3: Pasarela & Ubicación */}
          <div className="space-y-3 text-xs">
            <h4 className="font-mono font-bold uppercase tracking-wider text-zinc-300 text-[11px]">
              OPERACIÓN COLOMBIA
            </h4>
            <div className="space-y-2 text-zinc-400">
              <p className="text-[11px]">
                Despachos desde {storePreferences.city}, {storePreferences.department} hacia toda Colombia (Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Eje Cafetero).
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase block mb-1">
                  SEGURIDAD BANCARIA
                </span>
                <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 text-[10px] font-mono rounded">
                  PAGO SEGURO SSL & ENCRIPTADO WOMPI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <p>
            {themeConfig.footerLegalText ||
              `© 2026 ${storePreferences.storeLegalName || 'TU TIENDA A LA MANO S.A.S.'} • NIT ${storePreferences.nitRUT || '901.849.201-4'} - TODOS LOS DERECHOS RESERVADOS.`}
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => openPolicyModal('terminos')}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              TÉRMINOS Y CONDICIONES
            </button>
            <span>•</span>
            <button
              onClick={() => openPolicyModal('privacidad')}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              HABEAS DATA (LEY 1581)
            </button>
            <span>•</span>
            <button
              onClick={() => openPolicyModal('envios')}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              POLÍTICA DE ENVÍOS
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
