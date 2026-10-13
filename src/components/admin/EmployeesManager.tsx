import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  CheckCircle2,
  Lock,
  Unlock,
  Trash2,
  Check,
  Search,
  Sliders,
  Package,
  ShoppingBag,
  RotateCcw,
  Truck,
  CreditCard,
  Tag,
  Palette,
  MessageSquare,
  DollarSign,
  Globe,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Mail,
  Phone,
  LayoutDashboard,
  Rocket,
  Star,
  FileSpreadsheet,
  Bell,
  Disc,
} from 'lucide-react';
import { AdminTab, AdminUser } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ModuleDefinition {
  id: AdminTab;
  name: string;
  category: 'Operaciones' | 'Catálogo & Marketing' | 'Configuración & Finanzas';
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const ALL_SYSTEM_MODULES: ModuleDefinition[] = [
  {
    id: 'dashboard',
    name: 'Panel General & KPIs',
    category: 'Operaciones',
    description: 'Métricas de ventas, conversión y alertas del día.',
    icon: LayoutDashboard,
  },
  {
    id: 'orders',
    name: 'Pedidos Wompi & Despachos',
    category: 'Operaciones',
    description: 'Ver transacciones aprobadas, imprimir remisiones y despachar.',
    icon: ShoppingBag,
    badge: 'Logística',
  },
  {
    id: 'shipping',
    name: 'Guías & Logística Nacional',
    category: 'Operaciones',
    description: 'Fletes por departamento, tarifas y transportadoras.',
    icon: Truck,
    badge: 'Logística',
  },
  {
    id: 'abandoned-checkouts',
    name: 'Carritos Abandonados',
    category: 'Operaciones',
    description: 'Recuperación de clientes potenciales vía WhatsApp.',
    icon: RotateCcw,
    badge: 'Ventas',
  },
  {
    id: 'customers',
    name: 'Directorio de Clientes & LTV',
    category: 'Operaciones',
    description: 'Historial de compras, teléfonos, direcciones y recurrencia.',
    icon: Users,
    badge: 'Ventas',
  },
  {
    id: 'catalog',
    name: 'Catálogo & SKUs (450 GSM)',
    category: 'Catálogo & Marketing',
    description: 'Subir prendas, stock por talla, precios y variaciones.',
    icon: Package,
    badge: 'Catálogo',
  },
  {
    id: 'coupons',
    name: 'Cupones & Promociones',
    category: 'Catálogo & Marketing',
    description: 'Crear códigos de descuento porcentuales o montos fijos.',
    icon: Tag,
    badge: 'Marketing',
  },
  {
    id: 'reviews',
    name: 'Reseñas & Social Proof',
    category: 'Catálogo & Marketing',
    description: 'Aprobación de testimonios y fotos de compradores.',
    icon: Star,
    badge: 'Marketing',
  },
  {
    id: 'theme-builder',
    name: 'Diseño & Personalización',
    category: 'Catálogo & Marketing',
    description: 'Editor de paleta de color, videos de portada y banners.',
    icon: Palette,
    badge: 'Diseño',
  },
  {
    id: 'music-player',
    name: 'Música & Soundtrack',
    category: 'Catálogo & Marketing',
    description: 'Configuración del reproductor urbano de la tienda.',
    icon: Disc,
  },
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business API',
    category: 'Operaciones',
    description: 'Envío automático de notificaciones de despacho y guías.',
    icon: MessageSquare,
    badge: 'Atención',
  },
  {
    id: 'notifications',
    name: 'Centro de Notificaciones',
    category: 'Operaciones',
    description: 'Webhooks de Wompi, alertas de inventario y compras en vivo.',
    icon: Bell,
  },
  {
    id: 'wompi-reconciliation',
    name: 'Conciliación Wompi Bancolombia',
    category: 'Configuración & Finanzas',
    description: 'Comisiones descontadas, recaudos netos y dispersiones.',
    icon: DollarSign,
    badge: 'Finanzas',
  },
  {
    id: 'reports',
    name: 'Reportes Financieros & Ventas',
    category: 'Configuración & Finanzas',
    description: 'Exportación a Excel/CSV, IVA e ingresos brutos.',
    icon: FileSpreadsheet,
    badge: 'Finanzas',
  },
  {
    id: 'settings',
    name: 'Pasarela Wompi & Llaves',
    category: 'Configuración & Finanzas',
    description: 'Credenciales públicas y privadas de comercio Wompi.',
    icon: CreditCard,
    badge: 'Seguridad',
  },
  {
    id: 'domain-trust',
    name: 'Dominio .COM & Sellos',
    category: 'Configuración & Finanzas',
    description: 'Gestor de enlace de tienda, DNS y sellos de confianza.',
    icon: Globe,
  },
  {
    id: 'production-launch',
    name: 'Lanzamiento a Producción',
    category: 'Configuración & Finanzas',
    description: 'Checklist integral para salida a ventas reales.',
    icon: Rocket,
  },
  {
    id: 'system-testing',
    name: 'Auditoría & Salud del Sistema',
    category: 'Configuración & Finanzas',
    description: 'Simulador de pagos y diagnóstico de integridad técnica.',
    icon: Sparkles,
  },
  {
    id: 'employees',
    name: 'Empleados & Permisos',
    category: 'Configuración & Finanzas',
    description: 'Creación de colaboradores y restricción de módulos.',
    icon: Shield,
    badge: 'Admin',
  },
  {
    id: 'help-center',
    name: 'Centro de Ayuda & Manuales',
    category: 'Operaciones',
    description: 'Guías de uso rápido, despacho con Coordinadora y atajos.',
    icon: HelpCircle,
  },
];

const PRESET_ROLES = [
  {
    name: 'Logística & Despachos',
    roleTitle: 'Operador Logístico',
    department: 'Logística' as const,
    role: 'LOGISTICS_MANAGER' as const,
    modules: ['dashboard', 'orders', 'shipping', 'notifications', 'help-center', 'store-preview'] as AdminTab[],
    description: 'Para empacadores y transportistas. Generan guías de Coordinadora y marcan envíos.',
  },
  {
    name: 'Ventas & Atención WhatsApp',
    roleTitle: 'Asesor Comercial',
    department: 'Ventas' as const,
    role: 'SALES_MANAGER' as const,
    modules: ['dashboard', 'orders', 'abandoned-checkouts', 'customers', 'whatsapp-business', 'coupons', 'reviews', 'help-center', 'store-preview'] as AdminTab[],
    description: 'Para cerrar carritos abandonados, atender clientes y gestionar pedidos.',
  },
  {
    name: 'Operativo de Negocio',
    roleTitle: 'Operador de Negocio',
    department: 'Ventas' as const,
    role: 'CUSTOM' as const,
    modules: ['dashboard', 'catalog', 'orders', 'shipping', 'customers', 'abandoned-checkouts', 'coupons', 'reviews', 'whatsapp-business', 'notifications', 'help-center', 'store-preview'] as AdminTab[],
    description: 'Para crear productos y manejar el negocio. Sin llaves, finanzas, empleados ni ajustes del sistema.',
  },
  {
    name: 'Diseño & Catálogo',
    roleTitle: 'Director Creativo',
    department: 'Diseño' as const,
    role: 'CUSTOM' as const,
    modules: ['dashboard', 'catalog', 'theme-builder', 'music-player', 'reviews', 'help-center', 'store-preview'] as AdminTab[],
    description: 'Para actualizar productos, fotos, videos de portada y look de la tienda.',
  },
  {
    name: 'Finanzas & Conciliación',
    roleTitle: 'Auditor Contable',
    department: 'Finanzas' as const,
    role: 'FINANCE_MANAGER' as const,
    modules: ['dashboard', 'orders', 'wompi-reconciliation', 'reports', 'settings', 'help-center', 'store-preview'] as AdminTab[],
    description: 'Para auditar dispersiones de Wompi Bancolombia, comisiones y balances.',
  },
  {
    name: 'Super Administrador (Total)',
    roleTitle: 'Super Administrador',
    department: 'Administración' as const,
    role: 'SUPER_ADMIN' as const,
    modules: ALL_SYSTEM_MODULES.map((m) => m.id),
    description: 'Acceso total a todos los módulos y llaves de la tienda.',
  },
];

export const EmployeesManager: React.FC = () => {
  const {
    adminUsers,
    currentAdminUser,
    switchAdminUser,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleTitle: 'Operador Logístico',
    department: 'Logística' as 'Logística' | 'Ventas' | 'Diseño' | 'Finanzas' | 'Soporte' | 'Administración',
    role: 'LOGISTICS_MANAGER' as AdminUser['role'],
    pinCode: '1234',
    assignedModules: ['dashboard', 'orders', 'shipping', 'help-center', 'store-preview'] as AdminTab[],
  });

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      roleTitle: 'Operador Logístico',
      department: 'Logística',
      role: 'LOGISTICS_MANAGER',
      pinCode: '1234',
      assignedModules: ['dashboard', 'orders', 'shipping', 'help-center', 'store-preview'],
    });
  };

  const handleStartEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setIsCreatingNew(false);

    // Initial fallback if user has no assignedModules yet
    let initialModules: AdminTab[] = user.assignedModules || [];
    if (initialModules.length === 0) {
      if (user.role === 'SUPER_ADMIN') {
        initialModules = ALL_SYSTEM_MODULES.map((m) => m.id);
      } else if (user.role === 'LOGISTICS_MANAGER') {
        initialModules = ['dashboard', 'orders', 'shipping', 'notifications', 'help-center', 'store-preview'];
      } else if (user.role === 'FINANCE_MANAGER') {
        initialModules = ['dashboard', 'orders', 'wompi-reconciliation', 'reports', 'settings', 'help-center', 'store-preview'];
      } else {
        initialModules = ['dashboard', 'orders', 'help-center', 'store-preview'];
      }
    }

    setFormData({
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      roleTitle: user.roleTitle,
      department: user.department || 'Administración',
      role: user.role,
      pinCode: user.pinCode || '1234',
      assignedModules: [...initialModules],
    });
  };

  const handleApplyPresetRole = (preset: (typeof PRESET_ROLES)[0]) => {
    setFormData((prev) => ({
      ...prev,
      roleTitle: preset.roleTitle,
      department: preset.department,
      role: preset.role,
      assignedModules: preset.modules,
    }));
  };

  const toggleModulePermission = (moduleId: AdminTab) => {
    setFormData((prev) => {
      const exists = prev.assignedModules.includes(moduleId);
      if (exists) {
        return {
          ...prev,
          assignedModules: prev.assignedModules.filter((id) => id !== moduleId),
        };
      } else {
        return {
          ...prev,
          assignedModules: [...prev.assignedModules, moduleId],
        };
      }
    });
  };

  const selectAllModules = () => {
    setFormData((prev) => ({
      ...prev,
      assignedModules: ALL_SYSTEM_MODULES.map((m) => m.id),
    }));
  };

  const clearAllModules = () => {
    setFormData((prev) => ({
      ...prev,
      assignedModules: ['help-center', 'store-preview'],
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isCreatingNew) {
      addAdminUser({
        name: formData.name.trim(),
        role: formData.role,
        roleTitle: formData.roleTitle.trim() || 'Colaborador',
        avatarInitials: formData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@tutiendaalamano.co`,
        phone: formData.phone.trim(),
        department: formData.department,
        pinCode: '',
        status: 'active',
        assignedModules: formData.assignedModules,
      });
      setIsCreatingNew(false);
      setSelectedUser(null);
    } else if (selectedUser) {
      updateAdminUser(selectedUser.id, {
        name: formData.name.trim(),
        role: formData.role,
        roleTitle: formData.roleTitle.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        pinCode: '',
        assignedModules: formData.assignedModules,
      });
      setSelectedUser(null);
    }
  };

  const filteredUsers = adminUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.roleTitle.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              SEGURIDAD & CONTROL DE ACCESO (RBAC)
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1 flex items-center gap-2.5">
            <span>Crear Empleados & Asignar Módulos</span>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              {adminUsers.length} Usuarios
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Crea cuentas de acceso individual para tu equipo de trabajo (despachos, ventas WhatsApp, fotógrafos y finanzas).
            Asigna qué módulos puede ver y modificar cada usuario para resguardar la seguridad de la tienda.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Nuevo Empleado</span>
        </button>
      </div>

      {/* Main Grid: Colaboradores + Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lista de Empleados (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Equipo de Trabajo</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Clic para editar</span>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, cargo o departamento..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Listado de Empleados */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredUsers.map((user) => {
                const isCurrent = currentAdminUser?.id === user.id;
                const isSelected = selectedUser?.id === user.id;
                const isSuperAdmin = user.role === 'SUPER_ADMIN';
                const moduleCount = user.assignedModules?.length ?? (isSuperAdmin ? ALL_SYSTEM_MODULES.length : 6);

                return (
                  <div
                    key={user.id}
                    onClick={() => handleStartEdit(user)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative group ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                            isSuperAdmin
                              ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white'
                              : 'bg-slate-800 text-slate-100'
                          }`}
                        >
                          {user.avatarInitials}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-slate-900 truncate">{user.name}</h3>
                            {isCurrent && (
                              <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                                EN USO
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{user.roleTitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                              {user.department || 'Operaciones'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {moduleCount} módulos
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Switch and Delete actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => switchAdminUser(user.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                            title={`Probar vista como ${user.name}`}
                          >
                            <Key className="w-3 h-3 text-indigo-600" />
                            <span className="hidden sm:inline">Entrar</span>
                          </button>
                        )}

                        {user.id !== 'admin-1' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`¿Eliminar empleado ${user.name}?`)) {
                                deleteAdminUser(user.id);
                                if (selectedUser?.id === user.id) setSelectedUser(null);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar empleado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Editor & Asignador de Módulos (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 block">
                  {isCreatingNew
                    ? 'NUEVO COLABORADOR'
                    : selectedUser
                    ? `EDITANDO PERMISOS: ${selectedUser.name}`
                    : 'SELECCIONA O CREA UN EMPLEADO'}
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  {isCreatingNew
                    ? 'Datos Personales y Módulos Autorizados'
                    : selectedUser
                    ? 'Módulos Asignados para este Perfil'
                    : 'Configuración de Empleados'}
                </h2>
              </div>

              {selectedUser && (
                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Nuevo Empleado</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nombre del Empleado *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Laura Gómez"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cargo / Rol Visible *</label>
                  <input
                    type="text"
                    required
                    value={formData.roleTitle}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    placeholder="Ej: Asistente de Despachos & Guías"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Departamento</label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Logística">Logística & Despachos</option>
                    <option value="Ventas">Ventas & Atención WhatsApp</option>
                    <option value="Diseño">Diseño & Catálogo</option>
                    <option value="Finanzas">Finanzas & Conciliación</option>
                    <option value="Soporte">Soporte Técnico</option>
                    <option value="Administración">Administración General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Acceso</label>
                  <div className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500">
                    Por contraseña del servidor (seed:admin). El PIN ya no da acceso.
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="empleado@tutiendaalamano.co"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Celular WhatsApp (Opcional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 300 000 0000"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Plantillas Rápidas de Roles con 1 Clic */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Plantillas Rápidas de Permisos:</span>
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={selectAllModules}
                      className="text-indigo-600 hover:underline cursor-pointer font-bold"
                    >
                      Marcar Todos
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={clearAllModules}
                      className="text-slate-500 hover:underline cursor-pointer font-medium"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_ROLES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPresetRole(preset)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/50 text-left transition-all cursor-pointer group"
                    >
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate">
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {preset.modules.length} módulos
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Checklist de Módulos Individuales */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Módulos Asignados ({formData.assignedModules.length} de {ALL_SYSTEM_MODULES.length})
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {ALL_SYSTEM_MODULES.map((mod) => {
                    const isChecked = formData.assignedModules.includes(mod.id);
                    const IconComponent = mod.icon;

                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleModulePermission(mod.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-left select-none ${
                          isChecked
                            ? 'bg-indigo-50/60 border-indigo-400 text-indigo-950 shadow-2xs'
                            : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {mod.name}
                            </span>
                            {mod.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                {mod.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guardar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Los módulos no asignados quedarán restringidos en el menú lateral.</span>
                </div>

                <div className="flex items-center gap-2">
                  {(isCreatingNew || selectedUser) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingNew(false);
                        setSelectedUser(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCreatingNew ? 'Crear Empleado' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
