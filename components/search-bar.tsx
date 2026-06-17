type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  srLabel?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar almendras, granola, harina...",
  srLabel = "Buscar",
}: SearchBarProps) {
  return (
    <label className="organic-outline card-shadow flex w-full items-center gap-3 rounded-full bg-white/90 px-4 py-3 text-sm text-foreground">
      <SearchIcon />
      <span className="sr-only">{srLabel}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="search"
        placeholder={placeholder}
        className="w-full bg-transparent text-[15px] outline-none placeholder:text-foreground/45"
      />
    </label>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-olive"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
