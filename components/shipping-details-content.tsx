export function ShippingDetailsContent({ inverse = false }: { inverse?: boolean }) {
  const headingClass = inverse ? "font-semibold text-cream" : "font-semibold text-olive-dark";

  return (
    <>
      <p className={headingClass}>Entrega sin costo</p>
      <p className="mt-1">
        Avellaneda, Sarandí, Wilde, Villa Domínico, Gerli, Bernal y Don Bosco.
      </p>
      <p className={`mt-4 ${headingClass}`}>Otras localidades</p>
      <p className="mt-1">
        Calculamos el costo de envío según tu localidad y te lo informamos
        por WhatsApp.
      </p>
      <p className={`mt-4 text-xs leading-5 ${inverse ? "text-cream/75" : "text-foreground/65"}`}>
        Día y horario a coordinar por WhatsApp.
      </p>
    </>
  );
}
