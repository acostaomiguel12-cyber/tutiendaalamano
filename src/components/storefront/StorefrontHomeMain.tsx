import React from 'react';
import { useStore } from '../../context/StoreContext';
import { FlashDeals } from './FlashDeals';
import { RecentlyViewed } from './RecentlyViewed';
import { CampaignBanner } from './CampaignBanner';
import { Reveal } from './Reveal';
import { CommunityLooks } from './CommunityLooks';
import { CustomerReviewsStrip } from './CustomerReviewsStrip';
import { PaymentTrustBanner } from './PaymentTrustBanner';
import { StorefrontBlockRenderer } from './StorefrontBlockRenderer';

/**
 * Fuente única de verdad del home de la tienda en producción.
 * Se usa en App.tsx, en la vista previa del admin y en el simulador del
 * personalizador para que el diseño siempre se vea igual que en producción
 * y cada cambio (desactivar, editar, eliminar) se refleje en tiempo real.
 */
export const StorefrontHomeMain: React.FC = () => {
  const { pageLayout } = useStore();

  if (pageLayout.enabledInStorefront) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        <StorefrontBlockRenderer blocks={pageLayout.blocks} />
      </div>
    );
  }

  return (
    <>
      <CampaignBanner />
      <Reveal delayMs={60}><FlashDeals /></Reveal>
      <Reveal delayMs={60}><RecentlyViewed /></Reveal>
      <Reveal><CommunityLooks /></Reveal>
      <Reveal><CustomerReviewsStrip /></Reveal>
      <Reveal><PaymentTrustBanner /></Reveal>
    </>
  );
};
