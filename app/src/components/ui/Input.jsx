import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export function Field({ label, htmlFor, children, className = '', hint }) {
  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export const Input = forwardRef(function Input({ className = '', ...rest }, ref) {
  return <input ref={ref} className={`input ${className}`} {...rest} />;
});

export const Textarea = forwardRef(function Textarea({ className = '', ...rest }, ref) {
  return <textarea ref={ref} className={`input resize-y ${className}`} {...rest} />;
});

export const Select = forwardRef(function Select({ className = '', children, ...rest }, ref) {
  return (
    <div className="relative min-w-0">
      <select ref={ref} className={`input appearance-none pr-9 ${className}`} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
});

export default Input;
