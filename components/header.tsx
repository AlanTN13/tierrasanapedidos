"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CatalogCategory } from "@/types/catalog";
import type { HomeSectionLink } from "@/types/home";

type HeaderProps = {
  sectionLinks: HomeSectionLink[];
  categories: CatalogCategory[];
  activeCategory: string | null;
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
  searchQuery = "",
  onSearchChange,
  onSubmitSearch,
  onClearSearch,
  totalItems,
  onOpenCart,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const desktopCategoryRailRef = useRef<HTMLDivElement | null>(null);
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileCategoryHeadingRef = useRef<HTMLParagraphElement | null>(null);
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
    if (!isMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      mobileCategoryHeadingRef.current?.focus();
    }
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-olive/12 bg-background/95 backdrop-blur-xl">
      <div className="container-shell pb-3 pt-1.5 lg:pb-0 lg:pt-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center pl-[max(0px,env(safe-area-inset-left))] pr-[max(0px,env(safe-area-inset-right))] lg:hidden">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-olive/12 bg-cream/60 text-olive-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
            aria-label={isMenuOpen ? "Cerrar menú de categorías" : "Abrir menú de categorías"}
            aria-expanded={isMenuOpen}
            aria-controls={mobileCategoryPanelId}
          >
            <HamburgerIcon />
          </button>

          <Link href="/" className="mx-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive">
            <Image
              src="/logo-tierra-sana-header.png"
              alt="Tierra Sana Dietética & Bienestar"
              width={1853}
              height={1891}
              className="h-[76px] w-[92px] object-contain sm:h-[84px] sm:w-[104px]"
            />
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-1.5">
            <InstagramLink variant="mobile" />
            <button
              type="button"
              onClick={onOpenCart}
              className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive-dark text-white transition-colors hover:bg-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
              aria-label={"Abrir carrito con " + totalItems + " productos"}
              aria-haspopup="dialog"
            >
              <CartIcon />
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full border-2 border-background bg-olive-soft px-1 text-[10px] font-bold leading-4 text-olive-dark">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        <form
          className="relative mt-1 lg:hidden"
          role="search"
          aria-label="Buscar en el catálogo"
          onSubmit={(event) => {
            event.preventDefault();
            setIsMenuOpen(false);
            onSubmitSearch();
          }}
        >
          <input
            type="search"
            value={safeSearchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="¿Qué estás buscando?"
            className="h-12 w-full rounded-full border border-olive/18 bg-cream/55 pl-12 pr-12 text-base text-olive-dark outline-none placeholder:text-foreground/55 focus:bg-white focus:ring-2 focus:ring-olive/30"
            aria-label="Buscar productos"
          />
          <button
            type="submit"
            className="absolute inset-y-0 left-1 inline-flex w-11 items-center justify-center rounded-full text-olive-dark focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-olive"
            aria-label="Buscar productos"
          >
            <SearchIcon />
          </button>
          {safeSearchQuery ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute inset-y-0 right-1 inline-flex w-11 items-center justify-center rounded-full text-olive-dark focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-olive"
              aria-label="Limpiar búsqueda"
            >
              <span aria-hidden="true">✕</span>
            </button>
          ) : null}
        </form>

        <div className="hidden lg:block">
          <div className="grid grid-cols-[140px_minmax(0,1fr)_auto] items-center gap-7 pb-2 xl:grid-cols-[176px_minmax(0,1fr)_auto] xl:gap-10">
            <Link href="/" className="justify-self-start rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive">
              <Image
                src="/logo-tierra-sana-header.png"
                alt="Tierra Sana Dietética & Bienestar"
                width={1853}
                height={1891}
                className="h-[86px] w-[120px] object-contain xl:h-[94px] xl:w-[144px]"
              />
            </Link>

            <form
              className="relative min-w-0"
              role="search"
              aria-label="Buscar en el catálogo"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmitSearch();
              }}
            >
              <input
                type="search"
                value={safeSearchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="¿Qué estás buscando hoy?"
                className="h-[52px] w-full rounded-full border border-olive/18 bg-cream/55 pl-14 pr-12 text-[15px] text-olive-dark outline-none placeholder:text-foreground/55 focus:bg-white focus:ring-2 focus:ring-olive/30"
                aria-label="Buscar productos"
              />
              <button
                type="submit"
                className="absolute inset-y-0 left-2 inline-flex w-[44px] items-center justify-center rounded-full text-olive-dark focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-olive"
                aria-label="Buscar productos"
              >
                <SearchIcon />
              </button>
              {safeSearchQuery ? (
                <button
                  type="button"
                  onClick={onClearSearch}
                  className="absolute inset-y-0 right-1 inline-flex w-[44px] items-center justify-center rounded-full text-olive-dark focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-olive"
                  aria-label="Limpiar búsqueda"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              ) : null}
            </form>

            <div className="flex items-center gap-3">
              <InstagramLink />
              <button
                type="button"
                onClick={onOpenCart}
                className="inline-flex min-h-[48px] shrink-0 items-center gap-3 rounded-full bg-olive-dark px-5 text-[15px] font-semibold text-white transition-colors hover:bg-olive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
                aria-label={"Abrir carrito con " + totalItems + " productos"}
                aria-haspopup="dialog"
              >
                <CartIcon />
                <span>Mi carrito</span>
                <span className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-background px-2 text-xs font-bold text-olive-dark">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-6 border-t border-olive/10">
            <nav
              aria-label="Secciones principales"
              className="order-2 flex max-w-[45%] shrink-0 items-center gap-5 border-l border-olive/12 py-2.5 pl-6 text-sm font-medium text-foreground/72"
            >
              {sectionLinks.map((section) => (
                <a
                  key={section.id}
                  href={"#" + section.id}
                  className="min-w-0 truncate rounded-sm transition-colors hover:text-olive-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive"
                >
                  {section.label}
                </a>
              ))}
            </nav>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-4 py-2.5">
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
                      const isActive = category.name === activeCategory;

                      return (
                        <Link
                          key={category.id}
                          href={`/categoria/${category.slug}`}
                          className={`shrink-0 transition-colors ${isActive ? "text-olive-dark" : "hover:text-olive-dark"}`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {category.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {activeCategory ? (
                <div className="shrink-0 rounded-full bg-olive-soft px-3 py-1.5 text-xs font-semibold text-olive-dark">
                  Categoría: {activeCategory}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {isMenuOpen ? (
          <div id={mobileCategoryPanelId} className="mt-3 max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-contain lg:hidden">
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
                  {activeCategory ?? "Categorías"}
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                {categories.map((category) => {
                  const isActive = category.name === activeCategory;

                  return (
                    <Link
                      key={category.id}
                      href={`/categoria/${category.slug}`}
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center justify-between rounded-[1rem] border px-4 py-3 text-left text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-olive/35 ${
                        isActive
                          ? "border-olive bg-olive text-white"
                          : "border-olive/12 bg-white/90 text-olive-dark"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span>{category.name}</span>
                      <span aria-hidden="true">{isActive ? "•" : "→"}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function InstagramLink({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const linkClassName = `${
    variant === "mobile" ? "h-11 w-11" : "h-[48px] w-[48px]"
  } inline-flex shrink-0 items-center justify-center rounded-full border border-olive/18 bg-cream/45 text-olive-dark transition-colors hover:bg-olive-soft/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive`;

  return (
    <a
      href="https://www.instagram.com/tierrasana.dietetica/"
      target="_blank"
      rel="noopener noreferrer"
      className={linkClassName}
      aria-label="Ver Tierra Sana en Instagram"
    >
      <InstagramIcon />
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.7" r="0.85" fill="currentColor" stroke="none" />
    </svg>
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
      className="h-5 w-5"
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
      <path d="M6 7h12l1 14H5L6 7Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
