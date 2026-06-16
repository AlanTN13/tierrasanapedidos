"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import type { FilterCategory } from "@/types/catalog";
import type { HomeSectionLink } from "@/types/home";

type HeaderProps = {
  sectionLinks: HomeSectionLink[];
  categories: FilterCategory[];
  activeCategory: FilterCategory;
  onChangeCategory: (category: FilterCategory) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmitSearch: () => void;
  onClearSearch: () => void;
  totalItems: number;
  onOpenCart: () => void;
};

export function Header({
  sectionLinks,
  categories,
  activeCategory,
  onChangeCategory,
  searchQuery = "",
  onSearchChange,
  onSubmitSearch,
  onClearSearch,
  totalItems,
  onOpenCart,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const desktopCategoryRailRef = useRef<HTMLDivElement | null>(null);
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCategoryHeadingRef = useRef<HTMLParagraphElement | null>(null);
  const mobileSearchPanelId = useId();
  const mobileCategoryPanelId = useId();
  const safeSearchQuery = searchQuery ?? "";

  function updateDesktopCategoryScrollState() {
    const container = desktopCategoryRailRef.current;

    if (!container) {
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setCanScrollCategoriesLeft(container.scrollLeft > 4);
    setCanScrollCategoriesRight(container.scrollLeft < maxScrollLeft - 4);
  }

  useEffect(() => {
    const container = desktopCategoryRailRef.current;

    if (!container) {
      return;
    }

    updateDesktopCategoryScrollState();

    const handleResize = () => updateDesktopCategoryScrollState();
    container.addEventListener("scroll", updateDesktopCategoryScrollState, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", updateDesktopCategoryScrollState);
      window.removeEventListener("resize", handleResize);
    };
  }, [categories.length]);

  function moveDesktopCategoryRail(direction: "left" | "right") {
    const container = desktopCategoryRailRef.current;

    if (!container) {
      return;
    }

    const scrollAmount = Math.max(container.clientWidth * 0.42, 220);
    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (!isMenuOpen && !isSearchOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      mobileSearchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      mobileCategoryHeadingRef.current?.focus();
    }
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-olive/10 bg-background/88 backdrop-blur-xl">
      <div className="container-shell py-3 sm:py-4 lg:py-2">
        <div className="flex items-center gap-3 lg:hidden">
          <a href="#inicio" className="shrink-0">
            <Image
              src="/logo-tierra-sana-header.png"
              alt="Tierra Sana Dietetica & Bienestar"
              width={320}
              height={140}
              className="h-auto w-[58px] sm:w-[88px]"
            />
          </a>

          <div className="hidden min-w-0 flex-1 items-center gap-6 lg:flex">
            <nav
              aria-label="Secciones principales"
              className="flex items-center gap-6 text-sm font-medium text-foreground/72"
            >
              {sectionLinks.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="transition-colors hover:text-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/25"
                >
                  {section.label}
                </a>
              ))}
            </nav>

            <form
              className="relative ml-auto w-full max-w-[24rem]"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitSearch();
              }}
            >
              <label className="organic-outline card-shadow relative block">
                <input
                  type="search"
                  value={safeSearchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full rounded-full bg-card px-11 py-2.5 pr-10 text-sm font-medium text-olive-dark outline-none placeholder:text-foreground/42 focus:bg-white focus:ring-2 focus:ring-olive/25"
                  aria-label="Buscar productos"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 left-4 inline-flex items-center text-olive-dark/58 focus:outline-none"
                  aria-label="Buscar"
                >
                  <SearchIcon />
                </button>
                {safeSearchQuery ? (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="absolute inset-y-0 right-3 inline-flex items-center text-sm font-semibold text-olive-dark/72 hover:text-olive-dark focus:outline-none"
                    aria-label="Limpiar busqueda"
                  >
                    ✕
                  </button>
                ) : null}
              </label>
            </form>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsSearchOpen((current) => !current);
              }}
              className="organic-outline inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-olive-dark lg:hidden"
              aria-label="Abrir buscador"
              aria-expanded={isSearchOpen}
              aria-controls={mobileSearchPanelId}
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="organic-outline card-shadow inline-flex items-center gap-2 rounded-full bg-card px-3 py-2 text-sm font-semibold text-olive-dark hover:bg-white focus:outline-none focus:ring-2 focus:ring-olive/35"
              aria-label={`Abrir carrito con ${totalItems} productos`}
              aria-haspopup="dialog"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-olive text-white">
                <CartIcon />
              </span>
              <span className="hidden sm:inline">Carrito</span>
              <span className="rounded-full bg-olive-soft px-2 py-0.5 text-xs font-bold text-olive-dark">
                {totalItems}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setIsMenuOpen((current) => !current);
              }}
              className="organic-outline inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-olive-dark lg:hidden"
              aria-label="Abrir menu de categorias"
              aria-expanded={isMenuOpen}
              aria-controls={mobileCategoryPanelId}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>

        <div className="hidden lg:grid lg:grid-cols-[160px_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:gap-x-5 xl:grid-cols-[170px_minmax(0,1fr)]">
          <div className="row-span-2 flex items-center justify-center self-stretch border-r border-olive/8 pr-5 xl:pr-6">
            <a href="#inicio" className="flex h-full items-center">
              <Image
                src="/logo-tierra-sana-header.png"
                alt="Tierra Sana Dietetica & Bienestar"
                width={420}
                height={190}
                className="h-auto w-[116px] xl:w-[130px]"
              />
            </a>
          </div>

          <div className="flex min-w-0 items-center gap-5 pb-2 xl:gap-6">
            <nav
              aria-label="Secciones principales"
              className="flex items-center gap-5 text-sm font-medium text-foreground/72 xl:gap-6"
            >
              {sectionLinks.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="transition-colors hover:text-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/25"
                >
                  {section.label}
                </a>
              ))}
            </nav>

            <div className="ml-auto flex min-w-0 items-center gap-3 xl:gap-4">
              <form
                className="relative w-full min-w-[21rem] max-w-[30rem] xl:min-w-[25rem] xl:max-w-[34rem]"
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSubmitSearch();
                }}
              >
                <label className="organic-outline card-shadow relative block">
                  <input
                    type="search"
                    value={safeSearchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full rounded-full bg-card px-11 py-2.5 pr-10 text-sm font-medium text-olive-dark outline-none placeholder:text-foreground/42 focus:bg-white focus:ring-2 focus:ring-olive/25"
                    aria-label="Buscar productos"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 left-4 inline-flex items-center text-olive-dark/58 focus:outline-none"
                    aria-label="Buscar"
                  >
                    <SearchIcon />
                  </button>
                  {safeSearchQuery ? (
                    <button
                      type="button"
                      onClick={onClearSearch}
                      className="absolute inset-y-0 right-3 inline-flex items-center text-sm font-semibold text-olive-dark/72 hover:text-olive-dark focus:outline-none"
                      aria-label="Limpiar busqueda"
                    >
                      ✕
                    </button>
                  ) : null}
                </label>
              </form>

              <button
                type="button"
                onClick={onOpenCart}
                className="organic-outline card-shadow inline-flex shrink-0 items-center gap-2 rounded-full bg-card px-3 py-2 text-sm font-semibold text-olive-dark hover:bg-white focus:outline-none focus:ring-2 focus:ring-olive/35"
                aria-label={`Abrir carrito con ${totalItems} productos`}
                aria-haspopup="dialog"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-olive text-white">
                  <CartIcon />
                </span>
                <span>Carrito</span>
                <span className="rounded-full bg-olive-soft px-2 py-0.5 text-xs font-bold text-olive-dark">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-olive/10 pt-2">
            <div className="relative min-w-0 flex-1">
              <div
                className={`pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-12 bg-[linear-gradient(90deg,rgba(255,253,248,0.98)_15%,rgba(255,253,248,0)_100%)] transition-opacity ${
                  canScrollCategoriesLeft ? "opacity-100" : "opacity-0"
                }`}
              />
              <div
                className={`pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-14 bg-[linear-gradient(270deg,rgba(255,253,248,0.98)_18%,rgba(255,253,248,0)_100%)] transition-opacity ${
                  canScrollCategoriesRight ? "opacity-100" : "opacity-0"
                }`}
              />
              <div className="pointer-events-none absolute top-1/2 left-0 z-20 -translate-y-1/2">
                <DesktopRailArrow
                  label="Ver categorias anteriores"
                  disabled={!canScrollCategoriesLeft}
                  onClick={() => moveDesktopCategoryRail("left")}
                >
                  <ArrowLeftIcon />
                </DesktopRailArrow>
              </div>
              <div className="pointer-events-none absolute top-1/2 right-1 z-20 -translate-y-1/2">
                <DesktopRailArrow
                  label="Ver categorias siguientes"
                  disabled={!canScrollCategoriesRight}
                  onClick={() => moveDesktopCategoryRail("right")}
                >
                  <ArrowRightIcon />
                </DesktopRailArrow>
              </div>
              <div
                ref={desktopCategoryRailRef}
                className="overflow-x-auto pl-8 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex min-w-max items-center gap-4 pr-4 text-sm font-medium text-foreground/72 xl:gap-5">
                  {categories.map((category) => {
                    const isActive = category === activeCategory;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => onChangeCategory(category)}
                        className={`shrink-0 transition-colors ${isActive ? "text-olive-dark" : "hover:text-olive-dark"}`}
                        aria-pressed={isActive}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-olive-soft px-3 py-1.5 text-xs font-semibold text-olive-dark">
              Filtro: {activeCategory}
            </div>
          </div>
        </div>

        {isSearchOpen ? (
          <div id={mobileSearchPanelId} className="mt-3 lg:hidden">
            <form
              className="relative"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitSearch();
                setIsSearchOpen(false);
              }}
            >
              <label className="organic-outline card-shadow relative block">
                <input
                  ref={mobileSearchInputRef}
                  type="search"
                  value={safeSearchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full rounded-[1.3rem] bg-white px-11 py-3 pr-11 text-sm font-medium text-olive-dark outline-none placeholder:text-foreground/42 focus:ring-2 focus:ring-olive/25"
                  aria-label="Buscar productos"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 left-4 inline-flex items-center text-olive-dark/58 focus:outline-none"
                  aria-label="Buscar productos"
                >
                  <SearchIcon />
                </button>
                {safeSearchQuery ? (
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="absolute inset-y-0 right-4 inline-flex items-center text-sm font-semibold text-olive-dark/72 hover:text-olive-dark focus:outline-none"
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                ) : null}
              </label>
            </form>
          </div>
        ) : null}

        {isMenuOpen ? (
          <div id={mobileCategoryPanelId} className="mt-3 lg:hidden">
            <div className="organic-outline rounded-[1.5rem] bg-white/76 p-4 shadow-[0_14px_30px_rgba(111,127,79,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <p
                  ref={mobileCategoryHeadingRef}
                  tabIndex={-1}
                  className="text-[11px] font-bold tracking-[0.12em] text-earth uppercase focus:outline-none"
                >
                  Nuestras categorias
                </p>
                <span className="rounded-full bg-olive-soft px-3 py-1 text-xs font-semibold text-olive-dark">
                  {activeCategory}
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {categories.map((category) => {
                  const isActive = category === activeCategory;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        onChangeCategory(category);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-between rounded-[1rem] border px-4 py-3 text-left text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-olive/35 ${
                        isActive
                          ? "border-olive bg-olive text-white"
                          : "border-olive/12 bg-white/90 text-olive-dark"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span>{category}</span>
                      <span aria-hidden="true">{isActive ? "•" : "→"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div
        aria-hidden="true"
        className="h-[9px] w-full bg-[linear-gradient(180deg,#8fc9ec_0%,#8fc9ec_33.333%,#ffffff_33.333%,#ffffff_66.666%,#8fc9ec_66.666%,#8fc9ec_100%)]"
      />
    </header>
  );
}

function HamburgerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.5 13.5 4 4" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
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
      className="h-3.5 w-3.5"
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

type DesktopRailArrowProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
};

function DesktopRailArrow({
  label,
  disabled,
  onClick,
  children,
}: DesktopRailArrowProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-olive/10 bg-white/88 text-olive-dark shadow-[0_6px_16px_rgba(111,127,79,0.08)] transition hover:border-olive/22 hover:bg-olive-soft/55 disabled:cursor-default disabled:opacity-0"
    >
      {children}
    </button>
  );
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}
