import { WhatsAppIcon } from "@/components/whatsapp-icon";

export function FloatingWhatsAppButton() {
  return (
    <a
      href="https://wa.me/5491164453032"
      target="_blank"
      rel="noopener noreferrer"
      className="card-shadow fixed right-4 bottom-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-left text-white hover:-translate-y-1 hover:bg-[#1fb958] focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 sm:right-6 sm:bottom-6 sm:h-auto sm:w-auto sm:gap-3 sm:px-4 sm:py-3"
      aria-label="Contactar a Tierra Sana por WhatsApp"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white">
        <WhatsAppIcon />
      </span>
      <span className="hidden sm:block">
        <span className="block text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
          WhatsApp
        </span>
        <span className="block text-sm font-semibold">Escribinos</span>
      </span>
    </a>
  );
}
