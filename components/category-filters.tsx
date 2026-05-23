"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasHydratedRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const activeIndex = categories.findIndex((category) => category === activeCategory);

  function updateScrollState() {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    setCanScrollLeft(container.scrollLeft > 4);
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 4);
  }

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      updateScrollState();
      return;
    }

    const activeButton = buttonRefs.current[activeIndex];

    activeButton?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    updateScrollState();

    const handleResize = () => updateScrollState();

    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", handleResize);
    };
  }, [categories.length]);

  function moveRail(direction: "left" | "right") {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const firstVisibleIndex = buttonRefs.current.findIndex((button) => {
      if (!button) {
        return false;
      }

      return button.offsetLeft + button.offsetWidth > container.scrollLeft + 4;
    });

    if (firstVisibleIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "right"
        ? Math.min(firstVisibleIndex + 1, categories.length - 1)
        : Math.max(firstVisibleIndex - 1, 0);

    const targetButton = buttonRefs.current[targetIndex];

    targetButton?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-end gap-2">
        <NavArrow
          label="Ver categorias anteriores"
          disabled={!canScrollLeft}
          onClick={() => moveRail("left")}
        >
          <ArrowLeftIcon />
        </NavArrow>
        <NavArrow
          label="Ver categorias siguientes"
          disabled={!canScrollRight}
          onClick={() => moveRail("right")}
        >
          <ArrowRightIcon />
        </NavArrow>
      </div>

      <div className="relative">
        <div
          className={`pointer-events-none absolute top-0 bottom-2 left-0 w-10 bg-[linear-gradient(90deg,rgba(255,253,249,0.96)_0%,rgba(255,253,249,0)_100%)] transition-opacity ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`pointer-events-none absolute top-0 right-0 bottom-2 w-10 bg-[linear-gradient(270deg,rgba(255,253,249,0.96)_0%,rgba(255,253,249,0)_100%)] transition-opacity ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          ref={scrollContainerRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
        {categories.map((category, index) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              ref={(element) => {
                buttonRefs.current[index] = element;
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
