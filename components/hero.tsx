import Image from "next/image";

type HeroProps = {
  onOpenCart: () => void;
};

export function Hero({ onOpenCart }: HeroProps) {
  return (
    <section id="inicio" className="container-shell pt-6 pb-9 sm:pt-8 sm:pb-12">
      <div className="surface-panel organic-outline relative overflow-hidden rounded-[2.3rem] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-12">
        <div className="absolute inset-0">
          <Image
            src="/portada.png"
            alt="Texturas naturales Tierra Sana"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[78%_center] scale-[1.02] sm:object-center sm:scale-100"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,253,248,0.58)_0%,rgba(255,253,248,0.68)_42%,rgba(255,253,248,0.8)_100%)] sm:bg-[linear-gradient(90deg,rgba(255,253,248,0.78)_0%,rgba(255,253,248,0.68)_36%,rgba(255,253,248,0.5)_100%)]" />
        </div>

        <div className="relative max-w-[46rem]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-olive-soft text-xl text-olive-dark">
              🛒
            </div>
            <span className="section-kicker">Como comprar</span>
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-[2.35rem] leading-[0.98] font-semibold text-olive-dark sm:text-[3.2rem] lg:text-[4.2rem]">
            Armá tu pedido en 3 pasos
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-6 text-foreground/68 sm:text-base sm:leading-7">
            Elegís productos, revisás el carrito y nos lo enviás por WhatsApp.
            Después confirmamos stock, total y entrega para que compres simple y
            sin vueltas.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StepPill number="1" text="Elegí productos y peso" />
            <StepPill number="2" text="Revisá el carrito" />
            <StepPill number="3" text="Enviá el pedido" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#productos"
              className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(111,127,79,0.28)] hover:-translate-y-0.5 hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
            >
              Ver catalogo
            </a>
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center justify-center rounded-full bg-white/78 px-5 py-3 text-sm font-semibold text-olive-dark shadow-[0_12px_26px_rgba(111,127,79,0.08)] hover:bg-olive-soft/45 focus:outline-none focus:ring-2 focus:ring-olive/35"
            >
              Revisar carrito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepPill({ number, text }: { number: string; text: string }) {
  return (
    <div className="organic-outline rounded-[1.45rem] bg-white/82 px-4 py-3.5 shadow-[0_12px_26px_rgba(111,127,79,0.08)]">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-olive text-sm font-bold text-white">
        {number}
      </div>
      <p className="mt-2.5 text-sm font-medium text-olive-dark sm:text-[0.92rem]">
        {text}
      </p>
    </div>
  );
}
