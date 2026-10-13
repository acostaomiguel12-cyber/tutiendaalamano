import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AdminLogin: React.FC = () => {
  const { adminLogin, adminAuthMode, setActiveView } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    const result = await adminLogin(email, password, undefined, rememberMe);
    if (!result.success) {
      setErrorMessage(result.error || 'Error al iniciar sesión.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Bar with Return to Store */}
      <div className="relative z-10 p-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-widest text-white uppercase font-sans">
                TU TIENDA A LA MANO
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                PRO PORTAL v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Centro de Comando & Pasarela Wompi Colombia
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Tienda</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand & Security Overview */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Conexión Wompi Merchant 100% Cifrada</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Acceso Administrativo <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  Control Central
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Plataforma de gestión de inventario, conciliación bancaria Wompi, despacho logístico nacional y campañas promocionales de TU TIENDA A LA MANO.
              </p>
            </div>

            {/* Security notice */}
            <div className="space-y-2.5 pt-2">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-left">
                <p className="text-[11px] text-slate-300 leading-relaxed flex gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    El acceso se verifica contra el servidor (bcrypt + sesión firmada, bloqueo tras 8 intentos).
                    Sin backend, rige una contraseña local de este navegador (modo no apto para producción).
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Box */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Corner Badge */}
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-2xl">
                AUTH SSL 256-BIT
              </div>

              {/* Mode Tabs (single secure mode) */}
              <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
                  <Mail className="w-4 h-4" />
                  <span>Correo + Contraseña</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Correo Electrónico Corporativo
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@tutiendaalamano.co"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder:text-slate-600 font-medium focus:outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        Contraseña de Terminal
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder:text-slate-600 font-medium focus:outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-400 font-medium">Recordar sesión en este equipo</span>
                    </label>
                    {adminAuthMode === 'local' && (
                      <span className="text-[10px] text-amber-300 font-bold">MODO LOCAL</span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Autenticar y Entrar al Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Audit Bar */}
      <div className="relative z-10 p-4 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md text-center text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-3 px-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Servidor Principal: Medellín, Antioquia (NIT 901.442.880-1)</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Wompi Sandbox & Production Gateway
          </span>
          <span className="text-slate-600">|</span>
          <span>© 2026 TU TIENDA A LA MANO PRO</span>
        </div>
      </div>
    </div>
  );
};
