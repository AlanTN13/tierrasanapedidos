# Acceso destacado a recetas — preview del 23/10/2026

## Revisión compacta aprobada — sustituye la primera tarjeta

- Resultado/autorización: tras descartar el diseño alto y aprobar el último boceto, el usuario indica «ahora si mandale». Implementar la fila compacta en la misma preview; sin instrucción nueva de producción.
- Contexto releído: runtime `c74478a3d868c5f9dd4bdc91a5414073dc469624`; estado canónico `56a577157d6d63e303d6f4ee85e2a4334062b91d`, Alanos/main `502081a13c1763795e55c029e6ce58251da6f206`; PR13 draft/open con head `dc929917fd5fbca9687d5ef46f67c1ed56c07528`, Hero `d18e4fa97737b5a18c2ce9bc4b3d9206558d80cb`. Web/main sigue `713fc6bd31162bc269b2f6ccda5097ef7481958c`. Guía local Next16/Image leída.
- PATCH MODE / S-T1-R1: sólo `components/hero.tsx` y este receipt. Una fila de 64px, máximo 520px centrada, título pequeño, acción textual/flecha e imagen real de barritas a la derecha. Se retira el subtítulo y el botón grande por el diseño aprobado; se conserva ubicación y destino `/recetas`.
- Congelado: carrusel/banners, header/entregas, categorías/fotos de productos, contenido de recetas/Shorts, cupón/carrito/WhatsApp, catálogo/precios/stock, ERP, Supabase/datos, logística y pagos. Sin dependencias del proyecto, migraciones o consultas nuevas.
- Aceptación: altura real de 64px, fila sin desbordes en 320/390/desktop, foto existente, foco y navegación semántica. Tipos/lint focal, comparación literal del carrusel, build preview y un smoke. QA nativa sólo se acredita si se ejecuta; herramientas Browser/Chrome del usuario no callable. Sin tests permanentes de estilos ni repetir descuentos intactos.
- Recuperación/STOP: actualizar rama/PR13 y entregar preview; sin merge/promoción. Revertir la revisión o cerrar PR conserva producción. Detener expansión fuera de Hero; resultados y límites finales en el cuerpo de PR13.

### QA focal de la revisión

- Tipos y lint de Hero: PASS. Bloque del carrusel idéntico al head previo.
- Altura de 64px y máximo de 520px declarados en píxeles para conservarlos con el escalado de fuente global de desktop. Título en una fila; acción textual sólo desde sm y flecha en ambos tamaños; enlace completo accesible de 64px. Foto reservada de 60/72 × 48px.
- Herramientas Browser/Chrome del usuario no callable. Se intentó QA headless aislada con Playwright temporal fuera del repo y Chrome instalado; el proceso terminó con SIGABRT/EPERM antes de abrir una página. No se repitió ni se pidieron privilegios. QA visual/interactivo nativo 320/390/desktop sigue pendiente; tipos/HTTP no lo sustituyen. Sin cambios de dependencias del proyecto.
- Build, URL, versión desplegada y smoke finales: ver cuerpo actualizado del PR13.

## EXECUTION PREFLIGHT / PATCH MODE

- Rol/superficie: Dirección de Ejecución Técnica, acceso a recetas inmediatamente debajo del carrusel de Home.
- Resultado/autorización: el usuario conserva relevancia/ubicación, aprueba el boceto con foto y CTA, y corrige la imagen: usar «Barritas de cereal sin horno». Implementar una preview revisable; la autorización de producción anterior corresponde sólo al PR12 ya publicado.
- Contexto: runtime vigente `AlanTN13/Alanos/Alan/01_Architecture/Execution_Runtime_Contract.md`, blob `c74478a3d868c5f9dd4bdc91a5414073dc469624`; estado canónico `d6d4cd86`; main `713fc6bd31162bc269b2f6ccda5097ef7481958c`, árbol `2c9652061200f7dff9156e5638732b07bf7eb538`; Hero remoto `9574a261` leído. Imagen real de la receta localizada en `/recetas`, HTTP200: `/storage/product-images/recipes/barritas-de-cereal-mt05rw71.webp`.
- Budget S / T1 / R1. Delta exacto: presentación de la tarjeta y foto elegida, título/subtítulo y destino `/recetas` conservados, CTA «Ver recetas» visible; desktop/mobile.
- Permitido: sólo `components/hero.tsx` y este receipt. Congelado: carrusel/configuración y activos de banners, header/entregas publicados, categorías de productos y fotos, receta/contenido/Shorts, carrito/cupón, WhatsApp, catálogo/precios/stock, ERP/datos/Supabase/logística/pagos. Sin nuevas consultas, dependencias o migraciones.
- Aceptación/QA: Next/Image con espacio reservado y tamaños responsive, navegación semántica/teclado; tipos/lint focal; comparación de bloque del carrusel; build/preview READY y un smoke Home + disponibilidad de imagen. No tests nuevos de estilos/copy ni repetir suite de descuentos intacta.
- Permisos/recuperación: sólo rama nueva y PR en borrador, sin merge ni promoción; producción baseline `dpl_2qD6A274wCtvd3Y21frFtTeDh6ZG` / `713fc6b`. Cerrar/revertir la propuesta no afecta producción.
- STOP: preview lista para revisión. QA visual/interactivo nativo 320/390/desktop pendiente si Chrome/Browser no es callable; no certificar layout por checks de código/HTTP.

## Implementación y cierre

El resultado final de commit, build, preview y QA se mantiene en el cuerpo del PR asociado. La imagen del boceto generado es referencia de composición, no un activo para publicar; se reutiliza la foto existente de barritas.

## QA ejecutada antes de la preview

- `npm run typecheck` y lint focal de `components/hero.tsx`: PASS.
- Bloque `HeroBannerCarousel` comparado literalmente con main: idéntico.
- Imagen elegida comprobada en web oficial: HTTP200, `image/webp`; misma URL que la receta «Barritas de cereal sin horno».
- Sin tests nuevos de presentación/copy; no se repite suite de cupón intacta.
- Chrome/Browser no callable. QA visual/interactivo nativo 320/390/desktop pendiente, sin afirmación de layout o recorte nativos por inspeccionar código/HTTP.
