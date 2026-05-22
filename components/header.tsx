"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { FilterCategory } from "@/types/catalog";

type HeaderProps = {
  categories: FilterCategory[];
  activeCategory: FilterCategory;
  onChangeCategory: (category: FilterCategory) => void;
  totalItems: number;
  onOpenCart: () => void;
};

export function Header({
  categories,
  activeCategory,
  onChangeCategory,
  totalItems,
  onOpenCart,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const instagramUrl = "https://www.instagram.com/tierrasana.dietetica/";

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  return (
    <header>
      <div className="sticky top-0 z-30 border-b border-olive/10 bg-background/85 backdrop-blur-xl">
        <div className="container-shell py-4">
        <div className="hidden items-center justify-between gap-4 lg:flex">
          <a href="#inicio" className="min-w-0">
            <Image
              src="/logo-tierra-sana-header.png"
              alt="Tierra Sana Dietetica & Bienestar"
              width={320}
              height={140}
              priority
              className="h-auto w-[98px]"
            />
          </a>

          <div className="organic-outline flex w-full max-w-3xl items-center gap-4 rounded-[2rem] bg-olive px-4 py-3 text-white shadow-[0_14px_30px_rgba(111,127,79,0.18)]">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/18 text-lg">
                📦
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-[0.12em] text-white uppercase">
                  Entregas en la zona sin costo
                </p>
                <p className="mt-0.5 text-sm leading-5 text-white/84">
                  Avellaneda, Sarandi, Villa Dominico, Gerli, Bernal y Don Bosco.
                  Coordinamos por WhatsApp.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/16 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-white uppercase">
              Sin cargo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="card-shadow inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fdf497_0%,#fdf497_8%,#fd5949_38%,#d6249f_65%,#285AEB_100%)] text-white hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#d6249f]/30"
              aria-label="Seguinos en Instagram"
            >
              <InstagramIcon />
            </a>

            <button
              type="button"
              onClick={onOpenCart}
              className="organic-outline card-shadow inline-flex items-center gap-3 rounded-full bg-card px-4 py-2.5 text-sm font-semibold text-olive-dark hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-olive/35"
              aria-label={`Abrir carrito con ${totalItems} productos`}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-olive text-white">
                <CartIcon />
              </span>
              <span className="hidden sm:inline">Carrito</span>
              <span className="rounded-full bg-olive-soft px-2.5 py-1 text-xs font-bold text-olive-dark">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((current) => !current);
              }}
              className="organic-outline inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card text-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
              aria-label="Abrir menu de categorias"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-category-menu"
            >
              <HamburgerIcon />
            </button>

            <a href="#inicio" className="flex min-w-0 flex-1 justify-center">
              <Image
                src="/logo-tierra-sana-header.png"
                alt="Tierra Sana Dietetica & Bienestar"
                width={320}
                height={140}
                priority
                className="h-auto w-[58px]"
              />
            </a>

            <div className="flex shrink-0 items-center gap-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="card-shadow inline-flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fdf497_0%,#fdf497_8%,#fd5949_38%,#d6249f_65%,#285AEB_100%)] text-white focus:outline-none focus:ring-2 focus:ring-[#d6249f]/30"
                aria-label="Seguinos en Instagram"
              >
                <InstagramIcon />
              </a>

              <button
                type="button"
                onClick={onOpenCart}
                className="organic-outline card-shadow inline-flex shrink-0 items-center gap-2 rounded-full bg-card px-3 py-2 text-sm font-semibold text-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
                aria-label={`Abrir carrito con ${totalItems} productos`}
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-olive text-white">
                  <CartIcon />
                </span>
                <span className="rounded-full bg-olive-soft px-2 py-0.5 text-xs font-bold text-olive-dark">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>

        </div>
        </div>

        <div
          id="mobile-category-menu"
          className={`border-t border-olive/8 transition-[grid-template-rows,opacity] duration-300 lg:hidden ${
            isMenuOpen ? "grid grid-rows-[1fr] opacity-100" : "grid grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="container-shell py-3">
              <div className="organic-outline rounded-[1.5rem] bg-white/76 p-4 shadow-[0_14px_30px_rgba(111,127,79,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.12em] text-earth uppercase">
                      Categorias
                    </p>
                    <p className="mt-1 text-sm text-foreground/62">
                      Elegi una seccion y bajamos directo al catalogo.
                    </p>
                  </div>
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
                      >
                        <span>{category}</span>
                        <span aria-hidden="true">{isActive ? "•" : "→"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="17.25" cy="6.75" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
