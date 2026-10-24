import Image from "next/image";
import Link from "next/link";
import { ShippingDetailsContent } from "@/components/shipping-details-content";

const linkClass = "inline-flex min-h-[44px] items-center rounded-md text-[13px] font-medium text-cream/90 transition-colors hover:text-white hover:underline hover:decoration-white/45 hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream";

export function StorefrontFooter() {
  return (
    <footer className="mt-auto w-full bg-olive-dark text-cream">
      <div className="container-shell pt-5 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pt-6 sm:pb-5">
        <div className="grid min-w-0 gap-2 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start md:gap-8">
          <Link href="/" aria-label="Tierra Sana, ir al inicio" className="inline-flex w-fit min-w-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream">
            <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-background">
              <Image src="/logo-tierra-sana-header.png" alt="" width={1853} height={1891} sizes="56px" className="h-[56px] w-[56px] object-contain" />
            </span>
            <span className="font-display text-[24px] leading-tight font-semibold">Tierra Sana</span>
          </Link>

          <nav aria-label="Navegación del pie de página" className="min-w-0 md:justify-self-center">
            <div className="flex flex-wrap items-start gap-x-5 md:gap-x-6">
              <Link href="/catalogo" className={linkClass}>Catálogo</Link>
              <Link href="/recetas" className={linkClass}>Recetas</Link>
              <details className="group min-w-0 max-w-full md:max-w-[260px]">
                <summary className={`${linkClass} flex w-fit cursor-pointer list-none gap-2 [&::-webkit-details-marker]:hidden`}>
                  Envíos y entregas
                  <span aria-hidden="true" className="text-base leading-none group-open:rotate-180">⌄</span>
                </summary>
                <div className="mt-1 mb-2 max-w-[360px] rounded-xl border border-cream/20 bg-white/5 p-4 text-[13px] leading-6 text-cream/85">
                  <ShippingDetailsContent inverse />
                </div>
              </details>
            </div>
          </nav>

          <nav aria-label="Contactá a Tierra Sana" className="flex min-w-0 flex-wrap gap-x-5">
            <a href="https://www.instagram.com/tierrasana.dietetica/" target="_blank" rel="noopener noreferrer" className={linkClass}>Instagram <span aria-hidden="true" className="ml-1">↗</span></a>
            <a href="https://wa.me/5491164453032" target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp <span aria-hidden="true" className="ml-1">↗</span></a>
          </nav>
        </div>
        <p className="mt-3 border-t border-cream/15 pt-3 pr-20 text-[11px] leading-5 text-cream/70 sm:pr-48">
          © 2026 Tierra Sana
        </p>
      </div>
    </footer>
  );
}
