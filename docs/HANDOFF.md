# Tierra Sana — continuidad al cambiar cuenta de GPT

Checkpoint:27/10/2026. Última orden: «guardate todo en git porque voy a cambiar la cuenta de gpt por la de nexops». No depender del historial de este chat ni del workspace local.

## Fuentes y accesos

- Código: https://github.com/AlanTN13/tierrasanapedidos . El pedido guarda el avance en este repositorio; no cambia su propietario ni transfiere repositorios.
- Contrato obligatorio antes de ejecutar: https://github.com/AlanTN13/Alanos/blob/main/Alan/01_Architecture/Execution_Runtime_Contract.md y AGENTS.md de este repo.
- Estado canónico: https://github.com/AlanTN13/Alanos/blob/main/Alan/02_ProyectosPropios/Tierra_Sana/TierraSana_Estado_Actual.md . Leer su sección más reciente, preservar históricos y comprobar HEAD/delta.
- La cuenta nueva necesita acceso a ambos repositorios y al proyecto Vercel existente. Las conexiones/sesiones de GPT no se transfieren por guardar este documento. No copiar tokens, claves o sesiones al repo. Reutilizar destinos existentes, no recrear proyectos.

## Publicado y aceptado

- Web: https://www.tierrasanadietetica.com/ . Último release conocido main09e46b68420915a6bac4423cd771a123813dfebf / PR17, árbola5a79a04afb5168a98baf192cd399704c1b07e06; verificar proveedor antes de asumir que sigue vigente.
- Vercel: team_Dd84rleycBIFoY84LaXy5BYj / prj_AHXrhnaoiwzQ4MrmvohCDJBOqZ9f. Deployment dpl_BfrnBqc8BacY336ScD2NYoBvaQPt, READY/production/main y dominio comprobados al24/10. Rollback anterior a PR17: dpl_2SL6MVGP1TUN5jb3H86xFUZNnejm/main22c3b008.
- Header con Instagram, categorías con foto, banners actuales; Home destacados y recetas compactas. Categorías/catálogo, ficha de producto, listado/ficha de recetas y footer oliva publicados juntos por orden expresa. Footer entrega información mediante details; no modificar condiciones de entrega por un rediseño.
- Carrito/cupón/WhatsApp existentes: funcionan con catálogo original; apertura de WhatsApp no es venta confirmada. No cuentas de cliente, checkout tradicional, cambios ERP/stock/precios/logística/pagos.
- Promoción: fuente real lib/promotions.ts: TIERRASANA10,10% sobre productos, subtotal estrictamente superior a$30.000, sin tope, no incluye envío;23/10/2026 00:00 hasta1/12/2026 00:00 Argentina (30/11 inclusive), commercialApproved=true ya vigente por autorización previa. No recuperar NOVIEMBRE10/$20.000/tope$3.000 ni el código mal transcrito de resúmenes.
- Popup: Home después de1s, cierre por sesión, mobile compacto centrado, Ver productos lleva a destacados. No decir «tu primera compra». Preservar configuración actual, no reactivar por memoria.

## Pendiente real del carrusel mobile

- Captura de iPhone mostró fila completa de recetas vacía conservando alto/título/controles. Sigue abierto, sin causa demostrada ni arreglo. Emulación desktop no equivale a prueba de ese teléfono.
- PR16 no cambió movimiento. PR17 publicó diseño aceptado conservando HomeShorts exacto al blob fb9269e1c585a39af7eea47eee550a1722b8c20a. Diagnóstico temporal eliminado; no restaurar logs/acciones del release anterior por defecto.
- PR15 sí corrigió escala25% de toda la página: conservar relative en FeaturedProductCard, que contiene labels sr-only absolutos. No volver a recortar root/zoom para ocultar overflow.
- Receipt: docs/receipts/2026-10-24-recipes-mobile-blank.md; cierre/despliegue PR17 y docs/receipts/2026-10-24-storefront-release.md. Browser no disponible en este ciclo; no afirmar QA nativa ni reinstalar/workaround repetido sin nueva capacidad.

## Trabajo actual: Google Analytics

- El usuario creó GA4 y envió captura del flujo correcto. Cuenta Tierra Sana, propiedad Tierra Sana — Web (561033199), flujo Mi sitio16214071834, URL oficial. Measurement ID **G-QKBQWT7D0K** (el penúltimo carácter es cero). No API secrets.
- Objetivos elegidos: Generate leads y Understand web and/or app traffic. Flujo con Enhanced measurement encendido en la captura. Verificar dentro de Page views que cambios de historial estén habilitados para Next.
- Rama **feat/google-analytics-2026-10-27** desde main09e46b68. Código: lib/google-analytics.ts, components/google-analytics.tsx y montaje en cuatro shells públicos. next/script afterInteractive; sólo hostname www/apex, guard inicial /admin y deduplicación. Sin nuevas dependencias/GTM/root/admin, sin efectos de React ni nuevas consultas.
- Visitas/tráfico/medición mejorada inicial. No se programaron eventos de ecommerce/cupón/add_to_cart/compra/WhatsApp: son un alcance posterior; no presentarlos como implementados. Page views automáticos del flujo, sin page_view manual que los duplique.
- QA local: tipos PASS, lint focal max-warnings0 PASS,3 tests de bootstrap PASS: hosts oficiales/doble inicio, bloqueo previews/local/dominios parecidos, bloqueo admin/login inicial. Ningún test envía tráfico real a Google.
- **Analytics todavía no publicado en producción en este checkpoint.** PR draft/build preview y evidencia vigente se encuentran en la rama/PR y en la nueva sección canónica. El guard bloquea envío real desde preview por diseño; tener HTML o build no acredita recepción en GA.
- Para completar: revisar PR/build, comprobar alcance/HEAD, publicar la integración según la autorización vigente y verificar en el navegador oficial Tag Assistant/Network y Analytics Realtime/DebugView. La recepción real sigue pendiente; no fingir validación con collect de servidor ni generar ventas de prueba. No contar WhatsApp como purchase.
- Configuración/QA/rollback en docs/receipts/2026-10-27-google-analytics.md. Revertir este PR o retirar montaje desactiva tag; no borrar propiedad/históricos. Preservar el diseño aprobado.

## Forma de retomar

Leer este documento, AGENTS y contrato/estado canónico; abrir el PR de feat/google-analytics-2026-10-27 y comprobar evidencia. Continuar desde el checkpoint, sin rehacer home/carrito/cupón ni pedir aprobaciones técnicas ya dadas. Separar implementado, mergeado, desplegado y recepción real de eventos. Actualizar receipt y canónico al cerrar.
