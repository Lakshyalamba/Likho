import type { HTMLInputTypeAttribute } from "react";

interface AuthFormFieldProps {
  id: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  placeholder: string;
  autoComplete?: string;
  onChange(value: string): void;
}

export function AuthFormField({
  id,
  label,
  type = "text",
  value,
  placeholder,
  autoComplete,
  onChange
}: AuthFormFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-300/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
        required
      />
    </label>
  );
}
