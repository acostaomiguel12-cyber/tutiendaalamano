import React from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getMerchantWhatsAppDigits, waLink } from '../../lib/whatsappOrder';

export const CustomerReviewsStrip: React.FC = () => {
  const { themeConfig, storePreferences } = useStore();
  if (themeConfig.showReviews === false) {
    return null;
  }
  const isDark = themeConfig.mode === 'dark';
  const isWarm = themeConfig.mode === 'warm';

  // Vacío ('') = eliminado por el admin -> se oculta. Undefined = valor por defecto.
  const badgeText = themeConfig.reviewsBadge === undefined ? 'TESTIMONIOS REALES // COMUNIDAD A LA MANO' : themeConfig.reviewsBadge;
  const titleText = themeConfig.reviewsTitle === undefined ? 'Lo Que Dicen Quienes Visten Nuestro Drop' : themeConfig.reviewsTitle;
  const subtitleText = themeConfig.reviewsSubtitle === undefined ? 'Más de 2.400 clientes en toda Colombia confían en la densidad de nuestras telas y la velocidad de nuestros envíos.' : themeConfig.reviewsSubtitle;

  const reviews = [
    {
      id: 'rev-1',
      author: 'Mateo Restrepo',
      city: 'Medellín, Antioquia',
      rating: 5,
      date: 'Hace 2 días',
      item: 'Hoodie Boxy Heavyweight 450 GSM',
      comment:
        'El peso de 450 GSM se siente brutal. La tela es gruesa, no se deforma al lavar y la caída en hombros es exactamente la silueta que buscaba. 10/10.',
      verified: true,
    },
    {
      id: 'rev-2',
      author: 'Valentina Soto',
      city: 'Bogotá D.C.',
      rating: 5,
      date: 'Hace 4 días',
      item: 'Parachute Pants Ripstop',
      comment:
        'Hice el pedido el martes y el jueves en la mañana ya estaba en mi puerta. El ajuste en tobillos y los 8 bolsillos son perfectos.',
      verified: true,
    },
    {
      id: 'rev-3',
      author: 'Daniel Gómez',
      city: 'Cali, Valle',
      rating: 5,
      date: 'Hace 1 semana',
      item: 'Boxy Tee 280 GSM Acid Wash',
      comment:
        'El cuello grueso de 3cm se mantiene firme. La calidad supera con creces marcas importadas que cobran el triple.',
      verified: true,
    },
  ];

  return (
    <section
      id="reviews-section"
      className={`py-12 sm:py-16 px-4 sm:px-6 border-b transition-colors ${
        isDark
          ? 'bg-zinc-950 text-white border-zinc-800'
          : isWarm
          ? 'bg-[#faf8f5] text-stone-900 border-stone-200'
          : 'bg-white text-zinc-900 border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/80">
          <div className="space-y-2">
            {badgeText ? (
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>{badgeText}</span>
            </div>
            ) : null}
            {titleText ? (
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {titleText}
            </h2>
            ) : null}
            {subtitleText ? (
            <p className={`text-xs sm:text-sm max-w-xl ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {subtitleText}
            </p>
            ) : null}
          </div>

          {/* Social Proof Score Pill */}
          <div
            className={`flex items-center gap-3 p-3 rounded-2xl border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div>
              <div className="text-xs font-black font-mono">4.9 / 5.0 ESTRELLAS</div>
              <div className="text-[10px] text-zinc-400 font-mono">98.8% Clientes Satisfechos</div>
            </div>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition-all hover:translate-y-[-2px] ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  : 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Rating + Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">{rev.date}</span>
                </div>

                {/* Comment */}
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Item info */}
              <div className="pt-3 border-t border-zinc-200/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold font-sans">
                    <span>{rev.author}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" title="Comprador Verificado" />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">{rev.city}</div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Compra Verificada
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Fast Assistance Strip */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-900 text-white border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                ¿Dudas con tu talla o el fit oversized?
              </h4>
              <p className="text-[11px] text-zinc-400">
                Nuestros asesores en Medellín te guían en vivo según tu estatura y peso antes de comprar.
              </p>
            </div>
          </div>

          <a
            href={waLink(getMerchantWhatsAppDigits(storePreferences.supportPhoneWhatsApp), 'Hola Tu Tienda a la Mano, deseo asesoría personalizada con mi talla')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md active:scale-95"
          >
            <span>Asesoría WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
