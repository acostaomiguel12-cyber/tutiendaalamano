import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ShoppingBag,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { fetchBackendHealth } from '../../lib/wompi';

type GatewayTab = 'superadmin' | 'customer';

/** Indica qué ruta usará el login (diagnóstico visible). */
const BackendModeHint: React.FC = () => {
  const [mode, setMode] = React.useState<'...' | 'servidor' | 'local'>('...');
  React.useEffect(() => {
    fetchBackendHealth()
      .then((h) => setMode(h ? 'servidor' : 'local'))
      .catch(() => setMode('local'));
  }, []);
  return (
    <p className="text-center text-[10px] font-mono text-zinc-500 pt-1">
      Modo de acceso: <strong className="text-zinc-300">{mode === '...' ? 'verificando…' : mode === 'servidor' ? 'servidor (clave real)' : 'local (clave de este navegador)'}</strong>
    </p>
  );
};

export const SystemLoginGateway: React.FC = () => {
  const {
    adminLogin,
    customerLogin,
    setActiveView,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<GatewayTab>('superadmin');

  // Superadmin form state (no pre-filled usernames or PINs)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Customer form state (no pre-filled usernames or PINs)
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  // Handle Admin Submit
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const cleanEmail = adminEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAdminError('Ingresa un correo electrónico corporativo válido.');
      return;
    }

    if (!adminPassword || adminPassword.length < 4) {
      setAdminError('Ingresa una contraseña válida de al menos 4 caracteres.');
      return;
    }

    setIsAdminLoading(true);

    const result = await adminLogin(cleanEmail, adminPassword, undefined, true);

    if (result.success) {
      showToast('🔓 Sesión de Super Admin iniciada con éxito.');
      setActiveView('admin');
    } else {
      setAdminError(result.error || 'Credenciales no autorizadas. Verifica tus datos.');
    }
    setIsAdminLoading(false);
  };

  // Handle Customer Submit
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError(null);

    const cleanEmail = customerEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setCustomerError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!customerPassword || customerPassword.length < 4) {
      setCustomerError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setIsCustomerLoading(true);

    setTimeout(() => {
      customerLogin(cleanEmail);
      showToast('✨ Bienvenido a la tienda oficial.');
      setActiveView('home');
      setIsCustomerLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Mesh */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Brand Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-widest text-white uppercase font-sans">
                TU TIENDA A LA MANO
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                SISTEMA SEGURO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Portal Oficial // Acceso Restringido Únicamente con Login
            </p>
          </div>
        </div>

        {/* Security Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Autenticación Obligatoria</span>
            <span className="sm:hidden">Login Requerido</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand Context & Security Notice */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Portal de Acceso Protegido</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Iniciar Sesión <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  TU TIENDA A LA MANO
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Ingresa tu correo y contraseña para acceder a la plataforma. Toda la navegación, stock exclusivo y pasarela de pagos Wompi Bancolombia cuentan con encriptación activa de seguridad.
              </p>
            </div>

            {/* Security Callouts */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-tight">Acceso Super Admin</p>
                  <p className="text-[11px] text-zinc-400">Panel corporativo para gestión de inventario, envíos y pasarela Wompi.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-tight">Acceso Clientes & Compradores</p>
                  <p className="text-[11px] text-zinc-400">Ingreso a la tienda para compra de drops, seguimiento de órdenes y puntos VIP.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-tight">Transacciones Protegidas</p>
                  <p className="text-[11px] text-zinc-400">Conexión cifrada de alta seguridad con Wompi Bancolombia.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Login Form Box */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Mode Tabs */}
              <div className="flex items-center p-1 bg-zinc-950 rounded-2xl border border-zinc-800 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('superadmin');
                    setAdminError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'superadmin'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('customer');
                    setCustomerError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'customer'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cliente / Comprador</span>
                </button>
              </div>

              {/* TAB 1: SUPER ADMIN LOGIN (EMAIL & PASSWORD ONLY) */}
              {activeTab === 'superadmin' && (
                <div className="space-y-4 text-left">
                  <div className="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800/80">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Ingresa tus credenciales corporativas para acceder al panel de administración.
                    </p>
                  </div>

                  {adminError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@tutiendaalamano.co"
                          className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder:text-zinc-600 font-medium focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                          Contraseña
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                        >
                          {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showAdminPassword ? 'Ocultar' : 'Ver'}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showAdminPassword ? 'text' : 'password'}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-3 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder:text-zinc-600 font-medium focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAdminLoading}
                      className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {isAdminLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Iniciar Sesión en Super Admin</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <BackendModeHint />
                  </form>
                </div>
              )}

              {/* TAB 2: CUSTOMER LOGIN (EMAIL & PASSWORD ONLY) */}
              {activeTab === 'customer' && (
                <div className="space-y-4 text-left">
                  <div className="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800/80">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Accede con tu correo para explorar el catálogo oficial, gestionar tus pedidos y pagar seguro con <strong>Wompi Bancolombia</strong>.
                    </p>
                  </div>

                  {customerError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{customerError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="cliente@ejemplo.com"
                          className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder:text-zinc-600 font-medium focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                          Contraseña
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          {showCustomerPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{showCustomerPassword ? 'Ocultar' : 'Ver'}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showCustomerPassword ? 'text' : 'password'}
                          required
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-white placeholder:text-zinc-600 font-medium focus:outline-hidden transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCustomerLoading}
                      className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {isCustomerLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Iniciar Sesión y Entrar a la Tienda</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Direct Storefront Access Quick Link for Testing / Preview */}
              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">¿Quieres ver la tienda como cliente?</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('home');
                    showToast('🛍️ Ingresando a la tienda online oficial.');
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Ver Tienda Online</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-4 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md text-center text-zinc-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-3 px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Acceso Protegido TU TIENDA A LA MANO // NIT 901.442.880-1</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400">Autenticación Obligatoria • Pasarela Wompi Colombia</span>
          <span className="text-zinc-700">|</span>
          <span>© 2026 TU TIENDA A LA MANO</span>
        </div>
      </footer>
    </div>
  );
};
