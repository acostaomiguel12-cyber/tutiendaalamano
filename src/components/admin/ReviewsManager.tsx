import React, { useState } from 'react';
import {
  Star,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  MessageSquare,
  ShieldCheck,
  User,
  X,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductReview } from '../../types';

export const ReviewsManager: React.FC = () => {
  const { reviews, products, addProductReview, updateReviewStatus, deleteReview, showToast } =
    useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>(
    'ALL'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New review form
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [authorName, setAuthorName] = useState('');
  const [authorCity, setAuthorCity] = useState('Medellín');
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [verifiedPurchase, setVerifiedPurchase] = useState(true);

  const filtered = reviews.filter((r) => {
    if (ratingFilter !== 'ALL' && r.rating !== ratingFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.authorName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    addProductReview({
      productId: selectedProductId,
      authorName: authorName.trim(),
      authorCity: authorCity.trim() || 'Colombia',
      rating: rating,
      title: title.trim() || 'Excelente calidad',
      comment: comment.trim(),
      verifiedPurchase: verifiedPurchase,
      status: 'APPROVED',
    });

    setIsModalOpen(false);
    setAuthorName('');
    setTitle('');
    setComment('');
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
            SOCIAL PROOF & REPUTACIÓN DE MARCA
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Reseñas & Testimonios de Clientes</span>
            <span className="text-xs font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              {reviews.length} reseñas
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Calificación promedio: <strong className="text-amber-500 font-black">★ {averageRating} / 5.0</strong> en Colombia.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Reseña Verificada</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, comentario o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Todas las Estrellas</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Estrellas)</option>
            <option value="4">⭐⭐⭐⭐ (4 Estrellas)</option>
            <option value="3">⭐⭐⭐ (3 Estrellas)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="APPROVED">Aprobadas</option>
            <option value="PENDING">Pendientes</option>
            <option value="REJECTED">Rechazadas</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-12 text-center">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <Star className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No hay reseñas registradas</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Las opiniones de clientes verificados aparecerán aquí tan pronto los compradores califiquen sus pedidos.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primera Reseña</span>
            </button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((rev) => {
          const targetProduct = products.find((p) => p.id === rev.productId);

          return (
            <div
              key={rev.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rev.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : rev.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {rev.status === 'APPROVED'
                      ? 'Aprobada'
                      : rev.status === 'PENDING'
                      ? 'Pendiente'
                      : 'Rechazada'}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{rev.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">"{rev.comment}"</p>
                </div>

                {/* Target Product Badge */}
                {targetProduct && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                    <img
                      src={targetProduct.mainImage}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                      {targetProduct.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Author & Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <span>{rev.authorName || rev.customerName || 'Cliente Verificado'}</span>
                    {rev.verifiedPurchase && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Compra Verificada" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {rev.authorCity || rev.city || 'Colombia'} • {new Date(rev.createdAt).toLocaleDateString('es-CO')}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {rev.status !== 'APPROVED' && (
                    <button
                      onClick={() => updateReviewStatus(rev.id, 'APPROVED')}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Aprobar reseña"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(rev.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Eliminar reseña"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Create Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-sm">Registrar Reseña de Cliente</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Producto calificado</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Santiago Mejía"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ciudad (Colombia)</label>
                  <input
                    type="text"
                    placeholder="Medellín / Bogotá"
                    value={authorCity}
                    onChange={(e) => setAuthorCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Calificación en Estrellas</label>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRating(st)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          st <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-700 ml-2">{rating} de 5 estrellas</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Título de la Reseña</label>
                <input
                  type="text"
                  placeholder="ej. El gramaje y corte son insuperables"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Comentario Detallado</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Excelente tela pesada, llegó en 24 horas a Medellín..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md shadow-indigo-200"
                >
                  Publicar Reseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
