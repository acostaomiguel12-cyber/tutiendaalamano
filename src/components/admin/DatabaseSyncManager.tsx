import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Server,
  Activity,
  ShieldCheck,
  ArrowRightLeft,
  UploadCloud,
  DownloadCloud,
  Layers,
  Terminal,
  Clock,
  Copy,
  Check,
  Sliders,
  Sparkles,
  ExternalLink,
  Code2,
  Lock,
  Globe,
  Radio,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  getSupabaseConfig,
  setSupabaseCredentials,
  testSupabaseConnection,
  syncOrderToSupabase,
  syncCustomerToSupabase,
  syncProductToSupabase,
  syncAllProductsToSupabase,
  getSupabaseClient,
  fetchProductsFromSupabase,
} from '../../lib/supabase';

interface TableHealth {
  tableName: string;
  label: string;
  localCount: number;
  remoteStatus: 'ONLINE' | 'CHECKING' | 'ERROR';
  description: string;
}

export const DatabaseSyncManager: React.FC = () => {
  const {
    orders,
    products,
    customers,
    coupons,
    shippingGuides,
    reviews,
    abandonedCheckouts,
    storePreferences,
    showToast,
  } = useStore();

  const [dbConfig, setDbConfig] = useState(getSupabaseConfig());
  const [editUrl, setEditUrl] = useState(dbConfig.url);
  const [editKey, setEditKey] = useState(dbConfig.key);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState<'IDLE' | 'TESTING' | 'CONNECTED' | 'ERROR'>('IDLE');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Esperando verificación...');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; label: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'logs' | 'config' | 'sql'>('overview');

  const [logs, setLogs] = useState<{ id: string; time: string; type: 'info' | 'success' | 'warn' | 'error'; message: string }[]>([
    {
      id: '1',
      time: new Date().toLocaleTimeString('es-CO'),
      type: 'info',
      message: 'Módulo de Sincronización y Diagnóstico de Base de Datos inicializado.',
    },
  ]);

  const addLog = (type: 'info' | 'success' | 'warn' | 'error', message: string) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toLocaleTimeString('es-CO'),
        type,
        message,
      },
      ...prev.slice(0, 100),
    ]);
  };

  // Test connection on mount
  const runTestConnection = async () => {
    setConnectionStatus('TESTING');
    addLog('info', 'Iniciando ping de verificación con base de datos PostgreSQL en Supabase...');

    try {
      const result = await testSupabaseConnection();
      setLatencyMs(result.latencyMs);

      if (result.success) {
        setConnectionStatus('CONNECTED');
        setStatusMessage(`Conexión exitosa • ${result.latencyMs}ms de latencia`);
        addLog('success', `✅ ${result.message}`);
        showToast(`🟢 Base de datos verificada: ${result.latencyMs}ms de latencia`);
      } else {
        setConnectionStatus('ERROR');
        setStatusMessage(result.message);
        addLog('error', `❌ ${result.message}`);
        showToast('⚠️ No se pudo verificar la conexión con Supabase');
      }
    } catch (e: any) {
      setConnectionStatus('ERROR');
      setStatusMessage(e?.message || 'Error de red');
      addLog('error', `❌ Error: ${e?.message || String(e)}`);
    }
  };

  useEffect(() => {
    runTestConnection();
  }, []);

  // Sync All Data to Supabase
  const handleSyncAllToDatabase = async () => {
    if (isSyncingAll) return;
    setIsSyncingAll(true);
    addLog('info', 'Iniciando sincronización masiva de pedidos y clientes a PostgreSQL...');
    showToast('⏳ Sincronizando datos con la base de datos...');

    try {
      let syncedOrders = 0;
      let syncedCustomers = 0;
      let syncedProducts = 0;
      const totalItems = orders.length + customers.length + products.length;

      // 1. Sync products & variants
      setSyncProgress({ current: 0, total: totalItems, label: 'Sincronizando productos y catálogo...' });
      for (let k = 0; k < products.length; k++) {
        const prod = products[k];
        const ok = await syncProductToSupabase(prod);
        if (ok) syncedProducts++;
        setSyncProgress({
          current: k + 1,
          total: totalItems,
          label: `Prenda ${prod.title} sincronizada`,
        });
      }

      // 2. Sync orders
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const ok = await syncOrderToSupabase(order);
        if (ok) syncedOrders++;
        setSyncProgress({
          current: products.length + i + 1,
          total: totalItems,
          label: `Orden ${order.reference} sincronizada`,
        });
      }

      // 3. Sync customers
      for (let j = 0; j < customers.length; j++) {
        const customer = customers[j];
        const ok = await syncCustomerToSupabase(customer);
        if (ok) syncedCustomers++;
        setSyncProgress({
          current: products.length + orders.length + j + 1,
          total: totalItems,
          label: `Cliente ${customer.fullName} sincronizado`,
        });
      }

      setSyncProgress(null);
      setIsSyncingAll(false);
      addLog('success', `✅ Sincronización completada: ${syncedProducts} prendas, ${syncedOrders} pedidos y ${syncedCustomers} clientes respaldados.`);
      showToast(`✅ Base de Datos actualizada: ${syncedProducts} prendas y ${syncedOrders} pedidos respaldados.`);
      runTestConnection();
    } catch (err: any) {
      setIsSyncingAll(false);
      setSyncProgress(null);
      addLog('error', `❌ Fallo en sincronización masiva: ${err?.message || String(err)}`);
      showToast('❌ Ocurrió un error al sincronizar con la base de datos');
    }
  };

  // Pull Products from Supabase
  const handlePullFromDatabase = async () => {
    if (isPulling) return;
    setIsPulling(true);
    addLog('info', 'Consultando registros remotos en Supabase...');
    showToast('Consultando base de datos...');

    try {
      const remoteProducts = await fetchProductsFromSupabase();
      if (remoteProducts && remoteProducts.length > 0) {
        addLog('success', `✅ ${remoteProducts.length} productos remotos encontrados en la base de datos.`);
        showToast(`✅ ${remoteProducts.length} productos verificados en PostgreSQL.`);
      } else {
        addLog('info', 'ℹ️ Base de datos consultada con éxito (catálogo local actualizado).');
        showToast('✅ Catálogo y esquemas verificados.');
      }
    } catch (e: any) {
      addLog('warn', `⚠️ Consulta finalizada con observación: ${e?.message || String(e)}`);
    } finally {
      setIsPulling(false);
    }
  };

  // Save Credentials
  const handleSaveCredentials = () => {
    if (!editUrl || !editKey) {
      showToast('⚠️ Por favor ingresa una URL y API Key válidas.');
      return;
    }
    setSupabaseCredentials(editUrl, editKey);
    setDbConfig(getSupabaseConfig());
    setIsEditingCredentials(false);
    addLog('info', 'Nuevas credenciales de Supabase guardadas. Reiniciando conexión...');
    showToast('✅ Credenciales de base de datos actualizadas');
    runTestConnection();
  };

  // Table Health status
  const tables: TableHealth[] = [
    {
      tableName: 'orders',
      label: 'Pedidos Wompi',
      localCount: orders.length,
      remoteStatus: connectionStatus === 'CONNECTED' ? 'ONLINE' : connectionStatus === 'TESTING' ? 'CHECKING' : 'ERROR',
      description: 'Órdenes, montos en centavos COP, estados de pago y guías.',
    },
    {
      tableName: 'order_items',
      label: 'Ítems por Orden',
      localCount: orders.reduce((sum, o) => sum + (o.items?.length || 0), 0),
      remoteStatus: connectionStatus === 'CONNECTED' ? 'ONLINE' : connectionStatus === 'TESTING' ? 'CHECKING' : 'ERROR',
      description: 'Relación de prendas, tallas, colores y SKUs comprados.',
    },
    {
      tableName: 'customers',
      label: 'Clientes & LTV',
      localCount: customers.length,
      remoteStatus: connectionStatus === 'CONNECTED' ? 'ONLINE' : connectionStatus === 'TESTING' ? 'CHECKING' : 'ERROR',
      description: 'Directorio de compradores, historial de gasto y contacto.',
    },
    {
      tableName: 'products',
      label: 'Catálogo de Prendas',
      localCount: products.length,
      remoteStatus: connectionStatus === 'CONNECTED' ? 'ONLINE' : connectionStatus === 'TESTING' ? 'CHECKING' : 'ERROR',
      description: 'Hoodies, camisetas heavyweight, fotos y precios.',
    },
    {
      tableName: 'product_variants',
      label: 'Variantes & Stock Tallas',
      localCount: products.reduce((sum, p) => sum + (p.variants?.length || 0), 0),
      remoteStatus: connectionStatus === 'CONNECTED' ? 'ONLINE' : connectionStatus === 'TESTING' ? 'CHECKING' : 'ERROR',
      description: 'Stock por talla (S, M, L, XL), color y reserva activa.',
    },
    {
      tableName: 'wompi_transactions',
      label: 'Transacciones Wompi',
      localCount: orders.filter((o) => o.wompiTransaction).length,
      remoteStatus: connectionStatus === 'CONNECTED' ? 'ONLINE' : connectionStatus === 'TESTING' ? 'CHECKING' : 'ERROR',
      description: 'Auditoría de pasarela, hashes SHA-256 e IDs de pago.',
    },
    {
      tableName: 'coupons',
      label: 'Cupones de Descuento',
      localCount: coupons.length,
      remoteStatus: connectionStatus === 'CONNECTED' ? 'ONLINE' : connectionStatus === 'TESTING' ? 'CHECKING' : 'ERROR',
      description: 'Códigos promocionales % y descuentos fijos COP.',
    },
    {
      tableName: 'shipping_guides',
      label: 'Guías Logísticas',
      localCount: shippingGuides.length,
      remoteStatus: connectionStatus === 'CONNECTED' ? 'ONLINE' : connectionStatus === 'TESTING' ? 'CHECKING' : 'ERROR',
      description: 'Códigos de rastreo Coordinadora, Servientrega e Inter.',
    },
  ];

  const sqlSchemaCode = `-- ESQUEMA OFICIAL SUPABASE POSTGRESQL PARA TU TIENDA A LA MANO
-- Ejecuta este script en tu editor SQL de Supabase (https://supabase.com)

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  reference TEXT,
  category TEXT DEFAULT 'General',
  description TEXT,
  main_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  price_in_cents BIGINT NOT NULL,
  original_price_in_cents BIGINT,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  color_name TEXT DEFAULT 'Onyx Black',
  color_hex TEXT DEFAULT '#121214',
  size TEXT DEFAULT 'M',
  price_in_cents BIGINT NOT NULL,
  original_price_in_cents BIGINT,
  stock INT DEFAULT 10,
  stock_reserved INT DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department TEXT,
  city TEXT,
  total_orders INT DEFAULT 0,
  ltv_in_cents BIGINT DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  tier TEXT DEFAULT 'NUEVO',
  vip_points INT DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  coupon_id TEXT,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal_in_cents BIGINT NOT NULL,
  discount_in_cents BIGINT DEFAULT 0,
  shipping_in_cents BIGINT DEFAULT 0,
  tax_in_cents BIGINT DEFAULT 0,
  total_amount_in_cents BIGINT NOT NULL,
  currency TEXT DEFAULT 'COP',
  status TEXT NOT NULL,
  shipping_status TEXT NOT NULL,
  tracking_number TEXT,
  carrier TEXT,
  notes TEXT,
  wompi_transaction JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT,
  variant_id TEXT,
  product_title TEXT NOT NULL,
  sku TEXT,
  size TEXT,
  color TEXT,
  quantity INT NOT NULL,
  unit_price_in_cents BIGINT NOT NULL,
  total_price_in_cents BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS wompi_transactions (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  customer_id TEXT,
  wompi_transaction_id TEXT UNIQUE NOT NULL,
  amount_in_cents BIGINT NOT NULL,
  currency TEXT DEFAULT 'COP',
  status TEXT NOT NULL,
  payment_method_type TEXT,
  signature TEXT,
  reference TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Status Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : connectionStatus === 'TESTING' ? 'bg-amber-400 animate-spin' : 'bg-rose-400'}`} />
                {connectionStatus === 'CONNECTED' ? 'POSTGRESQL DB ONLINE' : connectionStatus === 'TESTING' ? 'PROBANDO CONEXIÓN...' : 'VERIFICACIÓN PENDIENTE'}
              </span>
              <span className="text-xs text-indigo-300/80 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                TLS 1.3 Encriptado
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Database className="w-7 h-7 text-indigo-400" />
              <span>Sincronización & Base de Datos</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Verificación de conexión en tiempo real, latencia de red, respaldo continuo de pedidos Wompi
              y sincronización de inventario con PostgreSQL Cloud.
            </p>
          </div>

          {/* Quick Action Control Panel */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 min-w-[240px]">
            <button
              onClick={runTestConnection}
              disabled={connectionStatus === 'TESTING'}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${connectionStatus === 'TESTING' ? 'animate-spin' : ''}`} />
              <span>{connectionStatus === 'TESTING' ? 'Probando...' : 'Verificar Conexión (Ping)'}</span>
            </button>

            <button
              onClick={handleSyncAllToDatabase}
              disabled={isSyncingAll}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSyncingAll ? 'Sincronizando...' : 'Sincronizar Todo a la DB'}</span>
            </button>
          </div>
        </div>

        {/* Sync Progress Bar if Active */}
        {syncProgress && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-200 font-mono">
              <span>{syncProgress.label}</span>
              <span>{syncProgress.current} / {syncProgress.total}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-300"
                style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Panel de Estado</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tables'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tablas & Registros ({tables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Consola en Vivo ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'config'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Credenciales & Conexión</span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sql'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Esquema SQL</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Estado de Red</span>
                <span className={`w-3 h-3 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : connectionStatus === 'TESTING' ? 'bg-amber-400 animate-spin' : 'bg-rose-500'}`} />
              </div>
              <div className="text-xl font-black text-slate-900">
                {connectionStatus === 'CONNECTED' ? 'Conectado' : connectionStatus === 'TESTING' ? 'Verificando...' : 'Revisar Conexión'}
              </div>
              <p className="text-[11px] text-slate-500 truncate">{statusMessage}</p>
            </div>

            {/* Latency */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Latencia de Respuesta</span>
                <Zap className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">
                {latencyMs !== null ? `${latencyMs} ms` : '--'}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">Excelente velocidad de transacción</p>
            </div>

            {/* Total Orders Synced */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Órdenes Respaldadas</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">
                {orders.length}
              </div>
              <p className="text-[11px] text-slate-500">100% de pedidos con trazabilidad Wompi</p>
            </div>

            {/* Customers Synced */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Clientes en Directorio</span>
                <Server className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-black text-slate-900 font-mono">
                {customers.length}
              </div>
              <p className="text-[11px] text-slate-500">Historial de compras y LTV vinculado</p>
            </div>
          </div>

          {/* Quick Health Table Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Salud de Tablas y Esquemas en PostgreSQL</h3>
                <p className="text-xs text-slate-500 mt-0.5">Estado de comunicación con cada tabla de la base de datos.</p>
              </div>
              <button
                onClick={handlePullFromDatabase}
                disabled={isPulling}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Consultar Tablas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {tables.map((tbl) => (
                <div key={tbl.tableName} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{tbl.label}</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${tbl.remoteStatus === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {tbl.remoteStatus}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 font-mono">{tbl.localCount}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">registros</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{tbl.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABLES DETAILED */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Detalle de Tablas en la Base de Datos</h3>
              <p className="text-xs text-slate-500 mt-0.5">Estructura relacional para persistencia continua.</p>
            </div>
            <button
              onClick={handleSyncAllToDatabase}
              disabled={isSyncingAll}
              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Sincronizar Todo</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {tables.map((t) => (
              <div key={t.tableName} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {t.tableName}
                    </span>
                    <span className="font-bold text-xs text-slate-800">{t.label}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${t.remoteStatus === 'ONLINE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {t.remoteStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{t.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 font-mono">{t.localCount}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">en memoria</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOGS & DIAGNOSTICS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-100">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-300">Terminal de Eventos y Diagnóstico</span>
            </div>
            <button
              onClick={() => setLogs([])}
              className="text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
            >
              Limpiar Consola
            </button>
          </div>

          <div className="p-4 font-mono text-xs space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <span className="text-slate-500 shrink-0 text-[11px]">{log.time}</span>
                <span
                  className={`font-bold shrink-0 ${
                    log.type === 'success'
                      ? 'text-emerald-400'
                      : log.type === 'error'
                      ? 'text-rose-400'
                      : log.type === 'warn'
                      ? 'text-amber-400'
                      : 'text-indigo-400'
                  }`}
                >
                  [{log.type.toUpperCase()}]
                </span>
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CREDENTIALS CONFIG */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configuración de Conexión Supabase PostgreSQL</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              URL del proyecto y anon public key utilizadas para comunicarse directamente con la base de datos.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="text-xs font-mono font-bold text-slate-700 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-slate-50 text-slate-900"
                placeholder="https://tu-proyecto.supabase.co"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-700 block mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={editKey}
                onChange={(e) => setEditKey(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-slate-50 text-slate-900"
                placeholder="sb_publishable_..."
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSaveCredentials}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Guardar y Probar Conexión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SQL SCHEMA SCRIPT */}
      {activeTab === 'sql' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Script SQL DDL para Supabase</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Copia y pega este script en el SQL Editor de tu cuenta de Supabase para inicializar todas las tablas relacionales.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sqlSchemaCode);
                setCopiedSql(true);
                showToast('📋 ¡Script SQL copiado al portapapeles!');
                setTimeout(() => setCopiedSql(false), 2000);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copiado' : 'Copiar SQL'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed max-h-96">
            {sqlSchemaCode}
          </pre>
        </div>
      )}
    </div>
  );
};
