import Image from "next/image";

export function Hero() {
  return (
    <section id="inicio" className="container-shell pt-7 pb-10 sm:pt-10 sm:pb-14">
      <div className="surface-panel organic-outline relative overflow-hidden rounded-[2.3rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
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

        <div className="relative max-w-3xl">
          <span className="section-kicker">Tierra Sana</span>
          <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.94] font-semibold text-olive-dark sm:text-6xl lg:text-7xl">
            Productos naturales para todos los días
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-foreground/68 sm:text-lg">
            Frutos secos, cereales, semillas y productos naturales para armar tus pedidos de forma simple.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#productos"
              className="inline-flex items-center justify-center rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(111,127,79,0.28)] hover:-translate-y-0.5 hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35"
            >
              Ver catalogo
            </a>
            <p className="inline-flex items-center rounded-full bg-white/72 px-4 py-3 text-sm text-foreground/62">
              Armá tu pedido por WhatsApp
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
