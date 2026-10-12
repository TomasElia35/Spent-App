import { Wallet } from 'lucide-react';

export default function Brand({ compact = false, light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-600/25">
        <Wallet className="h-5 w-5" />
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className={`text-[15px] font-semibold tracking-tight ${light ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            Gestor Personal
          </p>
          <p className={`text-[11px] ${light ? 'text-emerald-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
            Finanzas · Agenda
          </p>
        </div>
      )}
    </div>
  );
}
