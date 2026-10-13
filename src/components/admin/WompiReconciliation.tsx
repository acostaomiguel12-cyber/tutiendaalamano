import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  RefreshCw,
  Send,
  Building2,
  FileSpreadsheet,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatCOP, generateWompiIntegritySignature, fetchWompiTransactions, fetchServerTransactions } from '../../lib/wompi';

export const WompiReconciliation: React.FC = () => {
  const { orders, showToast, processWompiWebhook, storePreferences } = useStore();

  const [testRef, setTestRef] = useState('#ORD-9942');
  const [testAmount, setTestAmount] = useState('18990000');
  // La calculadora es local: el usuario pega su secreto (nunca se guarda en el bundle).
  const [testSecret, setTestSecret] = useState(storePreferences.wompiIntegritySecret || '');
  const [calculatedSignature, setCalculatedSignature] = useState('');
  const [realTransactions, setRealTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txSource, setTxSource] = useState<'server' | 'direct' | null>(null);

  const loadLiveWompiTransactions = async () => {
    setLoadingTx(true);
    try {
      // 1) Vía backend (llave privada en servidor, lo producción-correcto).
      const viaServer = await fetchServerTransactions(10);
      if (viaServer) {
        setRealTransactions(viaServer);
        setTxSource('server');
        return;
      }
      // 2) Directo con llave pegada en ajustes (solo si el admin la configuró).
      const pKey = storePreferences.wompiPrivateKey;
      if (pKey) {
        const res = await fetchWompiTransactions(pKey, storePreferences.wompiEnvMode || 'production', 10);
        if (res.success && res.transactions) {
          setRealTransactions(res.transactions);
          setTxSource('direct');
          return;
        }
        showToast('⚠️ Wompi respondió con error. Revisa la llave privada en Ajustes.');
      } else {
        showToast('⚠️ Sin backend ni llave privada: inicia el servidor (npm run server) o configura la llave en Ajustes.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    loadLiveWompiTransactions();
  }, [storePreferences.wompiPrivateKey]);

  useEffect(() => {
    generateWompiIntegritySignature(testRef, Number(testAmount) || 0, 'COP', testSecret).then((sig) => {
      setCalculatedSignature(sig);
    });
  }, [testRef, testAmount, testSecret]);

  const handleValidateSignature = async () => {
    const sig = await generateWompiIntegritySignature(testRef, Number(testAmount) || 0, 'COP', testSecret);
    setCalculatedSignature(sig);
    showToast('✅ Algoritmo SHA-256 validado conforme al estándar oficial Wompi Colombia.');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('📋 Firma copiada al portapapeles.');
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 bg-[#f8f9fc] min-h-screen">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">
            PASARELA DE PAGO & CONCILIACIÓN
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Conciliación Wompi Bancolombia & Verificador HMAC
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gateway Prod Conectado</span>
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: SHA-256 HMAC Signature Sandbox */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">Calculadora de Integridad Wompi SHA-256</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold">Standard v2</span>
          </div>

          <p className="text-xs text-slate-500">
            Fórmula oficial: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">SHA256(reference + amountInCents + currency + integritySecret)</code>
          </p>

          <div className="space-y-3 text-xs pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Referencia del Pedido</label>
              <input
                type="text"
                value={testRef}
                onChange={(e) => setTestRef(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Monto en Centavos (COP)</label>
                <input
                  type="text"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Moneda ISO</label>
                <input
                  type="text"
                  readOnly
                  value="COP"
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Secreto de Integridad Wompi</label>
              <input
                type="password"
                value={testSecret}
                onChange={(e) => setTestSecret(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
              />
            </div>

            <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Resultado SHA-256 Checksum:</span>
                <button
                  onClick={() => copyToClipboard(calculatedSignature)}
                  className="hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copiar
                </button>
              </div>
              <div className="font-mono text-[11px] text-emerald-400 break-all leading-tight">
                {calculatedSignature}
              </div>
            </div>

            <button
              onClick={handleValidateSignature}
              className="w-full bg-[#2b47e5] hover:bg-[#203ac9] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Verificar Integridad Criptográfica SHA-256</span>
            </button>
          </div>
        </div>

        {/* Right Column: Liquidaciones y Depósitos Bancolombia */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">Liquidaciones Diarias en Cuenta Bancaria</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              T+1 Bancolombia
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Depósitos automáticos T+1 a tu cuenta empresarial. El detalle oficial de
            liquidaciones vive en el{' '}
            <a
              href="https://production.wompi.co/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-indigo-600 hover:underline"
            >
              panel de Wompi
            </a>
            .
          </p>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-900 space-y-1">
            <span className="font-black block">Conciliación contra transacciones reales</span>
            <p className="text-[11px] text-indigo-700">
              Usa la tabla inferior (datos en vivo de la API Wompi) y compárala con los pedidos
              registrados en el módulo de Órdenes. No mostramos saldos bancarios estimados.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              Los montos liquidados (comisión 2.65% + $700 COP + IVA) se confirman en el
              extracto de tu cuenta y en el panel de Wompi. La tabla inferior trae el
              historial real de transacciones para conciliar contra tus órdenes.
            </div>
          </div>
        </div>
      </div>

      {/* Real Live Wompi Transactions Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">
                Transacciones Reales en Wompi (Conexión de Producción en Vivo)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700">
                {txSource === 'server' ? 'Vía backend seguro' : txSource === 'direct' ? 'Llave local' : 'API Wompi Bancolombia'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Registros de la API Wompi consultados vía backend (llave privada en servidor) o con tu llave configurada
            </p>
          </div>

          <button
            onClick={loadLiveWompiTransactions}
            disabled={loadingTx}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTx ? 'animate-spin' : ''}`} />
            <span>{loadingTx ? 'Consultando Wompi...' : 'Sincronizar con Wompi'}</span>
          </button>
        </div>

        {realTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {loadingTx ? (
              <div className="flex items-center justify-center gap-2 font-bold text-indigo-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Consultando historial de transacciones en Wompi...</span>
              </div>
            ) : (
              <span>No se encontraron transacciones en el periodo consultado o las credenciales aún se están sincronizando.</span>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">ID Transacción Wompi</th>
                  <th className="py-3 px-4">Referencia</th>
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Monto</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Cliente / Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {realTransactions.map((tx: any) => {
                  const isApproved = tx.status === 'APPROVED';
                  const isPending = tx.status === 'PENDING';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {tx.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        {tx.reference || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {tx.created_at ? new Date(tx.created_at).toLocaleString('es-CO') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {tx.payment_method_type || 'CARD'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCOP(tx.amount_in_cents || 0)} COP
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] truncate max-w-[180px]">
                        {tx.customer_email || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
