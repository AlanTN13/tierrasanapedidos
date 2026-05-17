import { formatARS } from "@/lib/format";

type FloatingCartButtonProps = {
  totalItems: number;
  subtotal: number;
  onOpenCart: () => void;
};

export function FloatingCartButton({
  totalItems,
  subtotal,
  onOpenCart,
}: FloatingCartButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpenCart}
      className="card-shadow fixed right-4 bottom-4 z-40 inline-flex items-center gap-3 rounded-full bg-olive px-4 py-3 text-left text-white hover:-translate-y-1 hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35 sm:right-6 sm:bottom-6"
      aria-label={`Abrir carrito con ${totalItems} productos`}
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/18">
        <CartIcon />
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/76">
          Carrito
        </span>
        <span className="block text-sm font-semibold">
          {totalItems} items · {formatARS(subtotal)}
        </span>
      </span>
    </button>
  );
}

function CartIcon() {
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
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.3 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.8L21 7H7.2" />
    </svg>
  );
}
