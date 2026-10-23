# Rediseño visual del carrito — 23/10/2026

## EXECUTION PREFLIGHT / PATCH MODE

- Resultado/autorización: el usuario pide rediseñar el carrito completo, a partir del bloque de objetivos, porque su presentación general le resulta poco estética. Referencia image(9).png / libfile_d7ff71da8bd08191abeb177e4af425cc. Publicación técnica de la experiencia comercial autorizada en este hilo; sin nueva aprobación técnica intermedia.
- Contexto leído: contrato AlanOS Execution_Runtime_Contract.md c74478a3d868c5f9dd4bdc91a5414073dc469624; estado TierraSana_Estado_Actual.md 1b9306ee280d1363c61fa092ae06739166970ce4; main afa4b6249a0d1b1e072e1fe2bb3740b91eeca946, árbol e0b531d8c204522399528c6531040c858059edfa. Guías locales Next16 de componentes/CSS y checklist React de Vercel.
- Budget M / T1 / R1. Un implementador; rediseño acotado a CartDrawer y CartCoupon reutilizando proveedor y preview existentes. Sin dependencias, servicios, nueva plataforma o datos.
- Diseño: encabezado compacto con identidad y cantidad, productos con miniatura y filas limpias, controles de cantidad claros, bloque único para incentivo/cupón, resumen de totales y CTA fijo con copy breve. Fondo crema, tipografía editorial y oliva coherentes con el popup.
- Congelados: lógica de cantidades/precios, promociones/código/fechas/mínimo/tope, provider/storage, WhatsApp/envío/medición, popup, banners, ERP, datos, catálogo, pagos, auth/RLS y Supabase. La consulta previa sobre mayor alto de banners no autoriza cambios de imágenes ni se mezcla en este ajuste.
- Aceptación: estados vacío/con productos, bajo/sobre mínimo, cupón aplicado/error/vencido, cantidades/remoción/persistencia y totales WhatsApp preservados. Foco atrapado, Escape y cierre restauran navegación; footer visible y cuerpo desplazable. Tipos/lint focal, suite vigente y fixture React DOM. Preview/build Vercel; QA visual/nativo320/390/desktop pendiente si sigue sin Browser callable.
- Preview funcional: ruta aislada existente /previews/noviembre, fixtures sin datos ni mensajes reales. Despliegue y versión/alias oficiales se verifican antes del cierre. No se atribuye una prueba de navegador al DOM simulado.
- Recuperación: revertir este PR o restaurar dpl_12ZajPf2J7EPQ8dZFV84a4F5akb7 / afa4b624 para conservar campaña activa y diseño anterior. Sin migraciones ni datos que restaurar.
- STOP: entrega del rediseño con validaciones proporcionales, deployment y receipt/AlanOS; fallo fuera del carrito: registrar y no ampliar a otra superficie.

## Cambios y validaciones

- CartDrawer: encabezado compacto «Tu carrito» con cantidad derivada; miniaturas Next/Image de las fotos existentes; filas separadas, nombre/presentación/precio unitario, controles y quitar accesibles. Panel móvil94dvh y desktop520px, cuerpo min-h-0 desplazable y resumen fijo con safe area. Vacío con acción para seguir comprando; CTA desactivado sin productos.
- CartCoupon: incentivo/cupón integrados en un bloque oliva, importe faltante o ahorro en primer plano, progress nativo14px y estado guardado breve. Condiciones presentes y copy de confirmación del footer reducido. Sin modificar cálculo ni WhatsApp.
- Preview reutilizada; se corrige una frase anterior que decía gate económico aunque la activación pública ya estaba autorizada. Fixtures/aislamiento siguen iguales.
- 81/81 tests PASS. Typecheck y lint focal PASS. Fixture React19/jsdom PASS: controles reales sumar/restar/quitar, contador de cabecera, estado vacío/CTA desactivado, seguir comprando, Tab/ShiftTab/foco/Escape, códigos, mínimo, fechas, recálculo, persistencia, paridad WhatsApp y aislamiento.
- Revisión React focal: import directo Next/Image ya instalado, fotos sólo al abrir carrito y tamaño declarado; estado derivado sin nuevos efectos; hooks/listeners y callbacks originales conservados; botones/iconos con nombre accesible y foco visible; sin cambios globales de CSS ni dependencias nuevas.
- Límites: QA visual320/390/desktop, imágenes remotas y comportamiento nativo/teclado móvil no verificados por Browser no callable. Las pruebas de foco son wiring en jsdom, no navegador. Build/preview, merge y producción se completan en el cierre del PR/AlanOS.
