'use client';

import { useState } from "react";
import { Lock, Eye, EyeOff, type LucideIcon } from "lucide-react";

interface FieldInputProps {
    label: string;
    value: string;
    type?: string;
    placeholder?: string;
    icon?: LucideIcon;
    onChange: (v: string) => void;
    required?: boolean;
}

export default function FieldInput({
    label,
    value,
    type = "text",
    placeholder,
    icon: Icon,
    onChange,
    required
}: FieldInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
        {label}
        </label>
        <div className="relative flex items-center squircle border border-foreground/15 bg-background focus-within:border-richcerulean transition-all duration-200">
        {Icon && (
            <div className="pl-4 text-foreground/40">
            <Icon size={16} />
            </div>
        )}
        <input
            type={isPassword ? (showPassword ? "text" : "password") : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/25"
            required={required}
        />
        {isPassword && (
            <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 text-foreground/40 hover:text-foreground/70 transition-colors focus:outline-none"
            tabIndex={-1}
            >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        )}
        </div>
    </div>
    );
}