"use client";

import type { FilterCategory } from "@/types/catalog";

type CategoryFiltersProps = {
  categories: FilterCategory[];
  activeCategory: FilterCategory;
  onChange: (category: FilterCategory) => void;
};

export function CategoryFilters({
  categories,
  activeCategory,
  onChange,
}: CategoryFiltersProps) {
  return (
    <div className="relative">
      <div className="mb-2 flex justify-end sm:hidden">
        <span className="rounded-full bg-white/72 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-olive-dark">
          Desliza  →
        </span>
      </div>

      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={`shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-olive/35 ${
                isActive
                  ? "border-olive bg-olive text-white shadow-[0_10px_24px_rgba(111,127,79,0.25)]"
                  : "border-olive/12 bg-white/84 text-olive-dark hover:border-olive/28 hover:bg-olive-soft/50"
              }`}
              aria-pressed={isActive}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
