import { useState } from 'react';
import { CalendarDays, Eye, EyeOff, Lock, PieChart, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Brand from '../components/layout/Brand.jsx';
import Button from '../components/ui/Button.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Moon, Sun } from 'lucide-react';

const FEATURES = [
  { icon: PieChart, text: 'Ingresos, gastos y saldos mes a mes' },
  { icon: CalendarDays, text: 'Agenda semanal sin superposiciones' },
  { icon: ShieldCheck, text: 'Historial de auditoría de cada cambio' },
];

export default function LoginPage() {
  const { login, expired } = useAuth();
  const { theme, toggle } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(expired ? 'Tu sesión expiró. Volvé a ingresar.' : '');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Completá usuario y contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Panel de marca */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:flex">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/30 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-teal-500/20 blur-3xl" />
        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          <Brand light />
          <div>
            <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
              Tus finanzas y tu tiempo, <span className="text-emerald-400">en un solo lugar.</span>
            </h1>
            <ul className="mt-8 space-y-4">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-slate-300">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Gestor Personal</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="relative flex flex-1 items-center justify-center px-5 py-10">
        <button
          type="button"
          onClick={toggle}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ingresá tus credenciales para continuar.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="field-label">
                Usuario
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  className="input pl-9"
                  autoComplete="username"
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="field-label">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
                  aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
