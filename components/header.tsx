import Image from "next/image";

type HeaderProps = {
  totalItems: number;
  onOpenCart: () => void;
};

export function Header({ totalItems, onOpenCart }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-olive/10 bg-background/85 backdrop-blur-xl">
      <div className="container-shell flex items-center justify-between gap-4 py-4">
        <a href="#inicio" className="min-w-0">
          <Image
            src="/logo-tierra-sana-header.png"
            alt="Tierra Sana Dietetica & Bienestar"
            width={320}
            height={140}
            priority
            className="h-auto w-[72px] sm:w-[88px] md:w-[98px]"
          />
        </a>

        <div className="hidden min-w-0 flex-1 items-center justify-center px-2 lg:flex">
          <div className="organic-outline flex w-full max-w-3xl items-center gap-4 rounded-[2rem] bg-white/72 px-4 py-3 shadow-[0_14px_30px_rgba(111,127,79,0.08)]">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive-soft text-lg">
                📦
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-[0.12em] text-earth uppercase">
                  Entregas locales sin costo
                </p>
                <p className="mt-0.5 text-sm leading-5 text-foreground/66">
                  Avellaneda, Villa Dominico, Gerli, Bernal y Don Bosco.
                  Coordinamos por WhatsApp.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-olive/10 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-olive-dark uppercase">
              Sin cargo
            </span>
          </div>
        </div>

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

      <div className="border-t border-olive/8 lg:hidden">
        <div className="container-shell py-2.5">
          <div className="flex items-start gap-3 rounded-[1.1rem] bg-white/62 px-3 py-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive-soft text-base">
              📦
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] text-earth uppercase">
                Entregas locales sin costo
              </p>
              <p className="mt-0.5 text-sm leading-5 text-foreground/66">
                Avellaneda, Villa Dominico, Gerli, Bernal y Don Bosco. Coordinamos por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
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
