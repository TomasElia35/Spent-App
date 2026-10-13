import { CalendarDays, ClipboardList, LogOut, Moon, Settings2, Sun, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useConfirm } from '../ui/ConfirmDialog.jsx';
import Brand from './Brand.jsx';

export const NAV = [
  { id: 'finance', label: 'Finanzas', icon: Wallet },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'config', label: 'Configuración', short: 'Config.', icon: Settings2 },
  { id: 'audit', label: 'Auditoría', icon: ClipboardList },
];

function ThemeButton({ className = '' }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 ${className}`}
      aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

export default function AppShell({ tab, onTabChange, children }) {
  const { username, logout } = useAuth();
  const confirm = useConfirm();
  const current = NAV.find((n) => n.id === tab);

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Cerrar sesión',
      message: '¿Querés salir de tu cuenta?',
      confirmText: 'Salir',
      danger: false,
    });
    if (ok) logout();
  };

  return (
    <div className="min-h-screen min-h-[100dvh] lg:pl-64">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="px-5 py-6">
          <Brand />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = id === tab;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-3 dark:border-slate-800">
          <div className="flex items-center gap-2 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {(username || '?').slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{username}</p>
              <p className="text-[11px] text-slate-400">Sesión activa</p>
            </div>
            <ThemeButton />
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Brand compact />
          <span className="text-base font-semibold text-slate-900 dark:text-white">{current?.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeButton />
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-44 pt-4 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</main>

      {/* Bottom tabs (mobile) */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/70 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
        <div className="grid grid-cols-4">
          {NAV.map(({ id, label, short, icon: Icon }) => {
            const active = id === tab;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    active ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {short || label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
