# Google Analytics 4 — Tierra Sana

## EXECUTION PREFLIGHT / PATCH MODE

- Resultado: conectar GA4 creado por el usuario para la web; tras ofrecer integrar al recibir el ID, aporta captura con G-QKBQWT7D0K / flujo16214071834 / propiedad561033199 / URL oficial. ID público, sin API secrets. No repetir creación de propiedad/flujo.
- Contexto: AGENTS, Runtimec74478a3, canónico93e6c09d; web main09e46b68/treea5a79a04, cuatro shells actuales verificados; guía local Next16 Scripts y docs oficiales Google SPA/pageviews leídos.
- S/T1/R1, un escritor, sin agentes. Superficie: bootstrap/GoogleAnalytics compartido y montaje en cuatro shells públicos. next/script afterInteractive, host exacto www/apex y fuera de /admin. Sin dependencia/GTM/root/admin nuevos. No repetir page_view manual: GA4 enhanced measurement/history del flujo existente es el único dueño de navegación.
- Alcance inicial: visitas/tráfico y medición mejorada del flujo. Sin nuevos eventos ecommerce/cupón/purchase, ni considerar apertura de WhatsApp como venta. No cambios en interfaz/carrito/catálogo/precios/stock/ERP/Supabase/logística/pagos/campaña/carrusel. No captura manual de datos personales.
- Aceptación: sólo dominio público carga tag/una inicialización; preview/local/admin no envían; fuente/tests/tipos/lint, build y smoke. Recepción real en Analytics sólo se acredita con navegador/Realtime, no con HTML. No control de navegador disponible; no fabricar eventos de compradores.
- Publicación como parte de conexión solicitada a la web oficial, rama feat/google-analytics-2026-10-27/PR; preview y QA antes de merge, comprobar árbol/deployment/dominio. Rollback: revertir PR o dpl_BfrnBqc8BacY336ScD2NYoBvaQPt/main09e46b68; retirar montaje desactiva medición, sin borrar propiedad/datos. STOP ante fallo de guard/build o destino distinto.

## Configuración

- Measurement ID G-QKBQWT7D0K centralizado en lib/google-analytics.ts. Cambiar allí para otro flujo; no requiere variables secretas.
- Sólo hostname tierrasanadietetica.com/www.tierrasanadietetica.com, monta únicamente shells de Home/catálogo/categorías/producto/recetas. No carga en previews o localhost. Sin medición en layout/admin.
- Mantener Page loads y Page changes based on browser history events en medición mejorada del flujo. No sumar manual page_view ni otro tag/GTM con el mismo ID, para evitar duplicados.

## Estado

Implementado y QA local PASS (tipos,lint focal max-warnings0 y3 tests de guard/dedupe). Última orden del usuario: guardar todo en Git para cambio de cuenta GPT. Se guarda rama/PR draft y handoff docs/HANDOFF.md; no merge ni Analytics productivo en este checkpoint. Build/evidencia de preview en PR; recepción real GA pendiente. Producción conocida sigue PR17/main09e46b68. No confundir preview con envío real: sólo hosts oficiales inicializan.
