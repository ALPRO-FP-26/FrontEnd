import React from 'react';

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  unit?: string;
  hint?: string;
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  unit,
  hint,
  className = ""
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-mono font-semibold text-foreground/50 uppercase tracking-wider px-1">
        {label}
      </label>
      <div className="flex items-center gap-2 px-4 py-3 bg-foreground/3 border border-foreground/10 squircle focus-within:border-richcerulean focus-within:bg-background transition-all">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/25"
        />
        {unit && (
          <span className="text-[10px] font-mono text-foreground/40 font-medium">
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <span className="text-[10px] font-mono text-foreground/30 px-1">
          {hint}
        </span>
      )}
    </div>
  );
};
