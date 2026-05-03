'use client';

interface SuggestionChipProps {
  label: string;
  onClick?: () => void;
}

export default function Chip({ label, onClick }: SuggestionChipProps) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 squircle bg-richcerulean text-background text-[13px] hover:bg-foreground transition-all cursor-pointer"
    >
      {label}
    </button>
  );
}
