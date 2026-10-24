# Recetas Home — validación de continuidad y publicación (24/10/2026)

## Execution preflight / PATCH MODE
- Resultado: resolver el blanco reportado al terminar las recetas y conservar el carrusel. El usuario validó la preview («esta perfecto ahora si») y autorizó «subilo a produccion». Esa orden autoriza publicar la versión limpia aprobada.
- Baseline: main15ab68cacd061cc429d1bf378dca54ec1e8cddb2, árbol b222e8393a7462853f99b8c963a22d28085715e6, producción dpl_DNky9kMqrBkz3rLXjTqXNbKVXumX. Runtime c74478a3d868c5f9dd4bdc91a5414073dc469624, estado canónico inicial blob0152478a9a964dad794ac3699d2bf86f0cc6362e y AGENTS/guía local Next16 Client Components leídos.
- M/T1/R1 durante diagnóstico, cierre S/T1/R1. Un escritor; no rediseño. Congelados: lógica/diseño/orden/imágenes/URLs de recetas y su modal/ingredientes, categorías/productos y corrección mobile PR15, header/banners/popup/cupón/carrito/WhatsApp, precios/stock/ERP/Supabase/logística/pagos.
- La observación no introdujo un cambio funcional de carrusel. No se encontró una causa reproducida del blanco; el navegador y el usuario validaron la lógica ya existente. No inventar una corrección ni una causa de caché/carga.
- Publicar sólo después de retirar toda la instrumentación y comprobar diff, tipos/lint, build y HTML. El diff final respecto del baseline debe contener únicamente este receipt: código de aplicación idéntico. La nueva publicación corresponde a la versión validada y sin observación temporal.
- Recuperación: revertir PR16/restaurar dpl_DNky9kMqrBkz3rLXjTqXNbKVXumX; no datos que restaurar. STOP después de READY/SHA/dominio/smoke y estado canónico. Si falla, conservar baseline sin ampliar alcance.

## Observación y evidencia
Preview de diagnóstico: PR16 draft, rama fix/recipes-loop-2026-10-24, head5aef480984900d508e34ac2f392ab6c948f270f8, árbol0d522ed81e87d14ae378490fd4a79cc80fe9e0d6, deployment dpl_FwjzERszyEpX4apKpHhR8pm1unJB READY/Vercel success. Home HTTP200 con7 recetas y21 tarjetas (before/primary/after), índices0–6/orden conservados.

Sólo se añadió una observación temporal a HomeShorts y una Server Action con guard VERCEL_ENV=preview, máximo12 reportes/JSON<=6000. Medidas/copia/índice/estado de imágenes públicas, sin textos/inputs/compradores/URLs/tokens/DB/otra infraestructura. No se alteraron handlers, medición, normalización o movimiento para observar.

Lecturas reales del navegador24/10 14:19UTC:
- Escritorio1440px: root/rootScroll1440, track1396, content5242, cycle1751; imágenes visibles cargadas al estabilizar. La instantánea inicial tenía imágenes todavía sin cargar, sin atribuirle por sí sola el blanco reportado.
- Mobile400px: root/rootScroll400, track384, content3770, cycle1260. Varias recentradas observadas con left654/701.5/662.5/662; tarjetas visibles con loaded=true/imageWidth>0, sin vacío en esas lecturas. Idle left1185 muestra última receta de before (índice6) seguida por primary0 y1, todas con imagen cargada.
- El usuario confirma que la preview está perfecta y pide producción. No se certifica una causa del síntoma previo, ni playback/foco/clipboard/arrastre completo o anchos320/390 no observados.
- Hubo medidas transitorias de DevTools200px y1px; no se toman como aceptación del layout mobile normal.

## QA y limpieza
- Tipos/lint focal PASS y8 tests existentes de continuous-carousel PASS durante diagnóstico. Fixture Node/TS de acción: producción sin logs; JSON inválido/oversized rechazado, preview válida aceptada.
- Antes de publicar se restaura components/home-discovery.tsx al blob fb9269e1c585a39af7eea47eee550a1722b8c20a y se elimina lib/preview-carousel-diagnostic.ts. Sin hooks/listeners/temporizadores/acciones/logs temporales en la entrega.
- El código final del carrusel es literalmente el publicado/probado. No ampliar el delta ni repetir suites económicas intactas. Sin nuevas dependencias/tests permanentes.
- El build/SHA final, merge/deploy, dominio/HTML y consulta de errores se registran en PR16 y estado canónico para evitar otro commit de código sólo para anotar IDs.
