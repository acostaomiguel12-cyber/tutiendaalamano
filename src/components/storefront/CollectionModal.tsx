import React from 'react';
import { X } from 'lucide-react';
import { CatalogBrowser } from './CatalogBrowser';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Modal de colección: navegador completo (pills, buscador, orden, compra). */
export const CollectionModal: React.FC<CollectionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight">Colección completa</h3>
            <p className="text-[11px] text-zinc-400 font-mono">Explora, filtra y compra sin salir</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
            title="Cerrar colección"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
          <CatalogBrowser limit={24} />
        </div>
      </div>
    </div>
  );
};
