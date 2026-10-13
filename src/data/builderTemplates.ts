import { BuilderBlock, PageLayout } from '../types/builder';
import { STRIKING_HERO_IMAGE } from './heroAssets';

export const DEFAULT_BUILDER_BLOCKS: BuilderBlock[] = [
  {
    id: 'block-banner-1',
    type: 'banner',
    title: 'NUEVA COLECCIÓN MEDELLÍN // OVERSIZED FIT',
    subcontent: 'Prendas con telas pesadas de 450 GSM confeccionadas para durar. Diseñado y ensamblado en Medellín.',
    imageUrl: STRIKING_HERO_IMAGE,
    buttonText: 'EXPLORAR CATÁLOGO',
    buttonLink: '#catalog',
    bannerHeight: 'medium',
    overlayOpacity: 45,
    styles: {
      textAlign: 'center',
      borderRadius: 'none',
      paddingY: 'xl',
      paddingX: 'md',
    },
  },
  {
    id: 'block-container-intro',
    type: 'container',
    styles: {
      backgroundColor: '#f4f4f5',
      paddingY: 'lg',
      paddingX: 'md',
      borderRadius: 'md',
      textAlign: 'center',
      border: true,
      borderColor: '#e4e4e7',
    },
    children: [
      {
        id: 'block-heading-intro',
        type: 'heading',
        headingLevel: 'h2',
        content: 'ESTÉTICA MINIMALISTA // CORTE CONTEMPORÁNEO',
        styles: {
          textAlign: 'center',
          textColor: '#09090b',
        },
      },
      {
        id: 'block-paragraph-intro',
        type: 'paragraph',
        content:
          'Creemos en la sobriedad, la caída perfecta de la tela y la calidad de los acabados sin distracciones ni logos recargados.',
        styles: {
          textAlign: 'center',
          textColor: '#71717a',
          paddingY: 'sm',
        },
      },
      {
        id: 'block-btn-intro',
        type: 'button',
        buttonText: 'CONOCER EL MANIFIESTO',
        buttonVariant: 'outline',
        buttonLink: '#catalog',
        styles: {
          textAlign: 'center',
          borderRadius: 'full',
        },
      },
    ],
  },
  {
    id: 'block-heading-catalog',
    type: 'heading',
    headingLevel: 'h2',
    content: 'CATÁLOGO DESTACADO // EDICIÓN LIMITADA',
    styles: {
      textAlign: 'left',
      paddingY: 'md',
      textColor: '#09090b',
    },
  },
  {
    id: 'block-product-grid-main',
    type: 'product-grid',
    categoryFilter: 'TODOS',
    productsColumns: 3,
    productsLimit: 6,
    productCardStyle: 'bordered',
    styles: {
      paddingY: 'md',
    },
  },
  {
    id: 'block-cols-highlight',
    type: 'columns-2',
    styles: {
      paddingY: 'lg',
      paddingX: 'none',
      border: false,
    },
    children: [
      {
        id: 'block-img-craft',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85',
        imageAlt: 'Confección y detalle de telas',
        aspectRatio: '4:3',
        styles: {
          borderRadius: 'md',
          shadow: 'sm',
        },
      },
    ],
    childrenColumn2: [
      {
        id: 'block-heading-craft',
        type: 'heading',
        headingLevel: 'h3',
        content: 'ALGODÓN PEINADO DE 450 GSM',
        styles: {
          textAlign: 'left',
          textColor: '#09090b',
        },
      },
      {
        id: 'block-p-craft',
        type: 'paragraph',
        content:
          'Cada prenda pasa por un proceso de lavado previo para evitar encogimientos, costuras reforzadas en cuello y hombros, y teñido reactivo ecológico con fijación de alta durabilidad.',
        styles: {
          textAlign: 'left',
          textColor: '#52525b',
          paddingY: 'sm',
        },
      },
      {
        id: 'block-btn-craft',
        type: 'button',
        buttonText: 'VER HOODIES Y TEES',
        buttonVariant: 'primary',
        styles: {
          textAlign: 'left',
          borderRadius: 'md',
        },
      },
    ],
  },
  {
    id: 'block-trust-badges-1',
    type: 'trust-badges',
    styles: {
      backgroundColor: '#18181b',
      textColor: '#ffffff',
      paddingY: 'lg',
      paddingX: 'md',
      borderRadius: 'md',
    },
  },
  {
    id: 'block-newsletter-1',
    type: 'newsletter',
    title: 'ACCESO VIP AL PRÓXIMO DROP',
    subcontent: 'Suscríbete para recibir notificación y contraseña 30 minutos antes del lanzamiento oficial.',
    buttonText: 'SUSCRIBIRME',
    styles: {
      backgroundColor: '#fafafa',
      paddingY: 'xl',
      paddingX: 'md',
      textAlign: 'center',
      border: true,
      borderColor: '#e4e4e7',
      borderRadius: 'lg',
    },
  },
];

export const BUILDER_TEMPLATES: {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  blocks: BuilderBlock[];
}[] = [
  {
    id: 'minimal-clean',
    name: 'Gutenberg Minimal White',
    description: 'Composición sobria con fondo blanco, tipografía limpia y cuadrícula de 3 columnas.',
    previewColor: '#f4f4f5',
    blocks: DEFAULT_BUILDER_BLOCKS,
  },
  {
    id: 'editorial-split',
    name: 'Editorial Luxury Sand',
    description: 'Enfoque editorial tipo revista con bloques de imagen en 2 columnas y tipografía serif.',
    previewColor: '#ece7df',
    blocks: [
      {
        id: 'tmpl-heading-1',
        type: 'heading',
        headingLevel: 'h1',
        content: 'TIENDA // NUEVA COLECCIÓN',
        styles: {
          textAlign: 'center',
          textColor: '#1c1917',
          paddingY: 'xl',
        },
      },
      {
        id: 'tmpl-cols-1',
        type: 'columns-2',
        styles: {
          paddingY: 'lg',
        },
        children: [
          {
            id: 'tmpl-img-1',
            type: 'image',
            imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
            aspectRatio: '3:4',
            styles: { borderRadius: 'none' },
          },
        ],
        childrenColumn2: [
          {
            id: 'tmpl-head-2',
            type: 'heading',
            headingLevel: 'h2',
            content: 'SILUETA Y PROPORCIÓN',
            styles: { textAlign: 'left', textColor: '#1c1917' },
          },
          {
            id: 'tmpl-p-2',
            type: 'paragraph',
            content:
              'Prendas diseñadas desde la arquitectura corporal: hombros caídos con estructura rígida y largos calibrados al milímetro.',
            styles: { textAlign: 'left', textColor: '#78716c', paddingY: 'sm' },
          },
          {
            id: 'tmpl-btn-2',
            type: 'button',
            buttonText: 'EXPLORAR SILUETAS',
            buttonVariant: 'primary',
            styles: { textAlign: 'left', borderRadius: 'none' },
          },
        ],
      },
      {
        id: 'tmpl-grid-1',
        type: 'product-grid',
        productsColumns: 2,
        productsLimit: 4,
        productCardStyle: 'borderless',
        styles: { paddingY: 'lg' },
      },
      {
        id: 'tmpl-trust-1',
        type: 'trust-badges',
        styles: {
          backgroundColor: '#292524',
          textColor: '#f5f5f4',
          paddingY: 'lg',
          paddingX: 'md',
        },
      },
    ],
  },
  {
    id: 'streetwear-dark',
    name: 'Streetwear Dark Brutalist',
    description: 'Estilo brutalista oscuro con contrastes altos, cajas definidas e insignias Wompi.',
    previewColor: '#09090b',
    blocks: [
      {
        id: 'brutal-banner',
        type: 'banner',
        title: 'DROP EXCLUSIVO // SOLD OUT RISK',
        subcontent: 'Piezas numeradas producidas en lotes pequeños en Medellín.',
        imageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1600&q=85',
        bannerHeight: 'tall',
        overlayOpacity: 65,
        buttonText: 'ORDENAR ANTES DEL CIERRE',
        styles: { textAlign: 'center', paddingY: 'xl' },
      },
      {
        id: 'brutal-head',
        type: 'heading',
        headingLevel: 'h2',
        content: 'CATÁLOGO BRUTALISTA (4 COLUMNAS)',
        styles: { textAlign: 'left', paddingY: 'md', textColor: '#09090b' },
      },
      {
        id: 'brutal-grid',
        type: 'product-grid',
        productsColumns: 4,
        productsLimit: 8,
        productCardStyle: 'bordered',
        styles: { paddingY: 'md' },
      },
      {
        id: 'brutal-box',
        type: 'container',
        styles: {
          backgroundColor: '#09090b',
          textColor: '#ffffff',
          paddingY: 'xl',
          paddingX: 'lg',
          borderRadius: 'none',
          textAlign: 'center',
        },
        children: [
          {
            id: 'brutal-box-h',
            type: 'heading',
            headingLevel: 'h2',
            content: 'ENVÍOS CON COBERTURA TOTAL EN COLOMBIA',
            styles: { textAlign: 'center', textColor: '#ffffff' },
          },
          {
            id: 'brutal-box-p',
            type: 'paragraph',
            content: 'Entregas en 24 a 48 horas en Bogotá, Medellín, Cali, Barranquilla y todo el país con Coordinadora y Servientrega.',
            styles: { textAlign: 'center', textColor: '#a1a1aa', paddingY: 'sm' },
          },
        ],
      },
    ],
  },
  {
    id: 'video-lookbook',
    name: 'Lookbook & Video Teaser HD',
    description: 'Plantilla audiovisual con reproductor de video de pasarela, cuadrícula de prendas y caja de manifesto.',
    previewColor: '#4338ca',
    blocks: [
      {
        id: 'vid-teaser-block',
        type: 'video',
        title: 'CAMPAÑA AUDIOVISUAL // DROP MEDELLÍN',
        subcontent: 'Prendas con telas pesadas 450 GSM confeccionadas con corte boxy exclusivo.',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-black-jacket-41121-large.mp4',
        videoPoster: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=75',
        aspectRatio: '16:9',
        videoAutoplay: false,
        videoMuted: true,
        videoLoop: true,
        videoControls: true,
        videoCaption: 'Lookbook de temporada grabado en estudio con iluminación cinematográfica.',
        styles: { borderRadius: 'md', paddingY: 'lg' },
      },
      {
        id: 'vid-heading-catalog',
        type: 'heading',
        headingLevel: 'h2',
        content: 'PRENDAS DE LA PASARELA',
        styles: { textAlign: 'center', paddingY: 'md', textColor: '#09090b' },
      },
      {
        id: 'vid-grid',
        type: 'product-grid',
        productsColumns: 3,
        productsLimit: 6,
        productCardStyle: 'bordered',
        styles: { paddingY: 'md' },
      },
      {
        id: 'vid-trust',
        type: 'trust-badges',
        styles: {
          backgroundColor: '#18181b',
          textColor: '#ffffff',
          paddingY: 'lg',
          paddingX: 'md',
          borderRadius: 'md',
        },
      },
    ],
  },
];
