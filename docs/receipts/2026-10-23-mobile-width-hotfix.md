# Home mobile — corrección de escala y publicación

## Execution preflight / PATCH MODE
- Resultado/autorización: corregir la Home que quedaba reducida a25% del lienzo. El usuario ordena publicar: «mandalo a produ nomas». La autorización de producción queda vigente para este arreglo concreto; no agregar funciones.
- Baseline: main/producción PR14 f322929c495a552b94ab96447ffeb5754ecec63c, árbol c00ed735b49d3f7a41ebcee3f65fcd6616c90bc2, deployment dpl_9nGUq2gcRjbSGjUEbWb9GGqXiTp6. Contexto canónico cdc17a8cc5048817124b82af91429716aff398ff. Runtime leído: Alan/01_Architecture/Execution_Runtime_Contract.md, blob c74478a3d868c5f9dd4bdc91a5414073dc469624. AGENTS y guías locales Next16 CSS/viewport/Server Actions leídos durante el diagnóstico; guía de despliegue Vercel y checklist React aplicados al cierre.
- Budget S / T1 / R1. Un escritor. Superficie final: una clase de posicionamiento en components/featured-products.tsx y este receipt. Congelados: geometría/copy/diseño de tarjetas, handlers/cantidad1/enlaces, header/banners/categorías/recetas/carruseles/popup, cupón/carrito/WhatsApp, catálogo/precios/stock, ERP/Supabase/logística/pagos y dependencias.
- Aceptación/checks: compilación/tipos/lint, diff literal, evidencia nativa400px y escritorio, build final sin instrumentación, smoke del SHA/HTML en preview y producción. No certificar anchos o interacciones no observadas.
- Publicación por merge de PR15 y Git integration existente. Recuperación: revertir PR15 o restaurar deployment previo f322929; no tocar datos. STOP al quedar producción READY con SHA/HTML verificados y checkpoint canónico. Si falla build/smoke, conservar o restaurar baseline, registrar causa y no ampliar alcance.

## Causa y cambio final
FeaturedProductCard incluye un aviso accesible span.sr-only[role=status] absoluto de1px. El article y el track no definían su bloque de referencia; los avisos escapaban del scrollport y ampliaban el documento. Hay12 tarjetas/12 avisos en el HTML real.

Se añade únicamente relative al article, sin offsets, z-index ni transform. El aviso queda anclado a su tarjeta y contenido por el carrusel. No se retira accesibilidad ni se cambia el diseño o la lógica de compra.

La geometría explica las dos mediciones previas: a400px, última tarjeta en x1988 más aviso1px = scroll1989; a200px, última en x888 más1 = scroll889. Antes del arreglo: client/body/Home400, inner1600/root.scroll1989, visualViewport1600/scale0.25 al recargar.

Los candidatos de contención del wrapper (5786186b) y raíz (f4712b4b) fallaron en pruebas reales y se retiraron. Globals.css y PromotionPopup coinciden con producción; sin cambios de meta viewport/zoom ni reglas para ocultar el problema.

## Evidencia nativa y QA
- Preview del arreglo b748cf402d834b6ba6cf99432d5a19fe71f06dce, árbol9fd530111a22ddd385ca180ba181b26cb08861b4, deployment dpl_6dfrxK5ktTsjTqBhLM11YGfH7Amc READY/Vercel success.
- Navegador del cliente24/10/2026 02:09:36.710UTC: mobile inner/client/root.scroll/body400px y alto1224px. VisualViewport383.693/scale1.0425 (zoom leve de esa sesión); ya no hay lienzo1600 ni autoescala0.25. Boxes nativas de Home/header/main400 y secciones384.
- Escritorio real1440px, fases initial/settled02:09:32–34UTC: inner/client/root.scroll/body1440, scale1. Sin expansión.
- Tipos/lint focal PASS. Comparación literal de FeaturedProducts contra blob02feca3a88d67657460095a3f2fa7060ac9b9f52 PASS salvo relative. Hashes de globals baddd0a5cea8ea64573b7a22bdea0216f0a65909 y popup bfcb0556e008dd5d66bde6e83e00a669068ddb30 iguales a producción.
- HTML de preview HTTP200:12 artículos relative y12 avisos conservados, viewport width=device-width/initial-scale=1. Los callbacks/precios/presentaciones y demás componentes permanecen literales.
- No se acreditó QA nativa320/390px ni otra prueba de clipboard/playback/foco/arrastre en este arreglo. La evidencia nativa valida el desborde400px y escritorio; no se repiten suites comerciales sobre código intacto. Browser js/CUA no disponibles; no repetir headless fallido ni otro control.

## Retiro del diagnóstico y despliegue
La observación temporal sólo preview permitió obtener las medidas del navegador y no registró textos/inputs/compradores/URLs/tokens ni escribió DB. Se retira completa antes del merge: app/page.tsx y components/storefront.tsx restaurados literalmente a producción y eliminación de lib/preview-layout-diagnostic.ts. Sin bandera, marcador DOM, efecto/listeners/temporizadores, acción ni logs temporales en la entrega.

La versión final conserva exactamente la clase relative que se probó nativamente. El build, SHA final, merge/deploy, smoke de dominio y consulta de errores se registran en PR15 y estado canónico, sin nuevos cambios de código para anotar IDs de despliegue. El rollback de referencia es dpl_9nGUq2gcRjbSGjUEbWb9GGqXiTp6 / mainf322929.
