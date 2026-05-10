'use client';

import { useState } from "react";
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";

interface SelectInputProps {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    icon?: LucideIcon;
    onChange: (v: string) => void;
    placeholder?: string;
}

export default function SelectInput({
    label,
    value,
    options,
    icon: Icon,
    onChange,
    placeholder = "Select..."
}: SelectInputProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon size={14} />} {label}
        </label>
        <div className="relative flex items-center">
        <select
            value={value}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onChange={(e) => {
            onChange(e.target.value);
            e.target.blur();
            }}
            className="w-full appearance-none bg-transparent squircle border border-foreground/15 px-4 py-3 text-sm outline-none focus:border-richcerulean pr-10 transition-all duration-200"
        >
            <option value="" disabled>{placeholder}</option>
            {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <div className="pointer-events-none absolute right-4 text-foreground/40">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        </div>
    </div>
    );
}