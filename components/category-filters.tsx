"use client";

import { useEffect, useRef, type ReactNode } from "react";
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
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasHydratedRef = useRef(false);
  const activeIndex = categories.findIndex((category) => category === activeCategory);
  const canGoBack = activeIndex > 0;
  const canGoForward = activeIndex >= 0 && activeIndex < categories.length - 1;

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }

    const activeButton = buttonRefs.current[activeIndex];

    activeButton?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  function goToCategory(index: number) {
    const nextCategory = categories[index];

    if (!nextCategory) {
      return;
    }

    onChange(nextCategory);
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-end gap-2 sm:hidden">
        <NavArrow
          label="Categoria anterior"
          disabled={!canGoBack}
          onClick={() => goToCategory(activeIndex - 1)}
        >
          <ArrowLeftIcon />
        </NavArrow>
        <NavArrow
          label="Categoria siguiente"
          disabled={!canGoForward}
          onClick={() => goToCategory(activeIndex + 1)}
        >
          <ArrowRightIcon />
        </NavArrow>
      </div>

      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              ref={(element) => {
                buttonRefs.current[categories.indexOf(category)] = element;
              }}
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

type NavArrowProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
};

function NavArrow({
  label,
  disabled,
  onClick,
  children,
}: NavArrowProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-olive/12 bg-white/84 text-olive-dark transition hover:border-olive/24 hover:bg-olive-soft/55 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
