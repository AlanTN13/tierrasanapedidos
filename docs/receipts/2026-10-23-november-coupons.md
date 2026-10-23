# Noviembre Tierra Sana — cupón y carrito

## Activación pública autorizada — 23/10/2026 (decisión vigente)

EXECUTION PREFLIGHT / PATCH MODE
- Rol/superficie: Dirección de Ejecución Técnica, campaña existente PR7/main cc10d26cae58274e70b2731ded762cce4f689a7e.
- Resultado/autorización: después de explicar el bloqueo y preguntar si habilitar desde hoy el 10% sin tope por compras >$30.000, el usuario respondió «sisi porfa». Luego corrigió: sólo fecha tope 30/11 y código tierrasana10. Autoriza activación pública inmediata y reemplaza el gate de espera anterior; no acredita una validación de costos que no se hizo.
- Contexto leído: Execution_Runtime_Contract.md c74478a3d868c5f9dd4bdc91a5414073dc469624; TierraSana_Estado_Actual.md 583b4bd6b56281272d78276ca0e206d70dd091d3; TierraSana_Campana_Noviembre_2026.md 579b89e2877281c4176ce8e836b98b000d8e69f2. Guía local Next16 de Server/Client Components.
- Budget S / T2 / R2: cambio acotado que afecta descuentos estimados; un escritor. Configuración, copy de fecha/código, pruebas y documentación únicamente.
- Baseline congelado: diseño/trigger Home1s/cierre por sesión, cálculo/WhatsApp/storage y todas las superficies ajenas al cupón. No datos, ERP, catálogo/precios/stock, logística, banners, pagos ni Supabase.
- Delta: TIERRASANA10 (ingreso sin distinción de mayúsculas); activo desde 23/10/2026 Argentina hasta 30/11 inclusive; fecha pública sólo «Válido hasta el 30/11»; 10% sin tope y mínimo estricto >$30.000.
- Aceptación: probar configuración pública real, código viejo rechazado, límites de fecha Argentina, WhatsApp/paridad, Home1s y persistencia. Suite existente, tipos/lint focal, fixture DOM y build del proveedor. QA visual nativo sigue pendiente, ya comunicado.
- Producción autorizada. Rollback: restaurar dpl_2XcpSL6itsc7gCGnkHbW9DPtevKd/main cc10d26c (campaña apagada), o revertir este PR y desplegar; sin restaurar datos.
- STOP: despliegue READY del commit integrado y smoke acotado del dominio oficial, más receipt/AlanOS. Fallo fuera de campaña: rollback y escalar sin ampliar alcance.

Validación del delta: 81/81 tests PASS. Incluye configuración pública activa hoy, rechazo de NOVIEMBRE10, aceptación tierrasana10 y límites de fecha, paridad de totales WhatsApp. Typecheck, lint focal y fixture React DOM PASS. Fixture ejecutado con configuración pública real activa al 23/10: Home1s, fecha final sin inicio visible, aplicar/quitar, persistencia y WhatsApp; gate desactivado probado aparte. PR y deployment se completan en el cierre.

Las secciones siguientes conservan evidencia histórica; sus bloqueos/fechas/código quedan sustituidos por esta decisión vigente.

## EXECUTION PREFLIGHT / DELIVERY DESIGN

- Rol: Dirección de Ejecución Técnica. Autorización: request del 23/10/2026, implementación, preview y publicación técnica; activación comercial condicionada a rentabilidad.
- Contexto leído: AlanOS Execution_Runtime_Contract.md blob c74478a3d868c5f9dd4bdc91a5414073dc469624; Capacity Policy 60203336a5d23a910b62b75fecf420a258ec077f; Decision Framework ca30a979de125f78dabb3ae4d0abe64c0c818404; TierraSana_Estado_Actual.md e4be42c1e06de08011b9de86d59e2c2fa8f6e49e; Growth 9e73773ec1ca3c06f5ea13b8167cd2c1b0e7476e.
- Snapshot: main 7f68cfbe / árbol fb217c0d; copia local verificada por hash Git contra todos los blobs remotos, sin diferencias; sin PR abiertos. Next 16.2.6, React19, carrito localStorage compartido por cuatro shells públicos, sin cupones ni analítica instalada.
- Budget M / T2 / R2: estimación comercial sin cobros ni escrituras de pedidos. Un implementador; revisión focalizada y QA integral centralizado. No requiere agentes, servicios ni dependencias runtime nuevas.
- Alcance: configuración promocional, cálculo reutilizable, estado del cupón, modal, carrito, WhatsApp, pruebas, preview, despliegue y continuidad. Congelados: ERP, datos reales, catálogo, precios, stock, pagos, logística, banners, recetas/Shorts, auth y RLS.
- A0 no alcanza porque no existe cupón; A1 extiende proveedor/drawer, función compartida de cálculo para UI y WhatsApp. No migración Supabase, nuevo checkout ni motor de promociones.
- Configuración central: código, porcentaje, mínimo estricto, tope, fechas Argentina y aprobación comercial falsa por defecto. Invariantes: un cupón, importes en centavos, sin descuento sobre envío, apertura de WhatsApp no es venta.
- Gate económico: documentación contiene costos incompletos/históricos; catálogo público acredita precios, no rentabilidad actual. Analizar canastas de productos vigentes sin inferir costos; mantener commercialApproved=false hasta validación económica explícita.
- Preview aislada en /previews/noviembre sólo desarrollo/Vercel preview: campaña aprobada simulada y reloj noviembre. Producción responde 404; no hay parámetro público para activar descuentos.
- Aceptación: todos los escenarios del request; límites temporales a 03:00Z (medianoche Buenos Aires), persistencia/navegación, coincidencia WhatsApp/UI, modal teclado/Escape/foco, 320/390/desktop, sin cupón y gate bloqueado.
- Recuperación: desactivar aprobación comercial; revertir PR o restaurar deployment dpl_F89GxzxWReVVaw8zeRxVZxqUcAWq. Estado del cupón separado del carrito; no hay datos que restaurar.
- STOP: QA y publicación técnica verificadas, gate económico documentado. Escalar sólo ante cambio material de alcance o necesidad de datos/permisos no autorizados.
- Capacidad: contexto focalizado reutilizado; tests focalizados durante implementación; suite/tipos/lint/build centralizados al integrar; reservar correcciones de E2E. No expandir a una integración de analytics externa sin configuración aprobada.

## Evidencia final

- Implementados: pop-up diferido con copiar/aplicar/cierre de sesión; un cupón persistente por carrito; mínimo estricto; incentivo; recálculo en centavos y tope configurable; WhatsApp revalida al click y conserva la confirmación humana. Se mantienen las cuatro superficies públicas y el comportamiento de limpiar carrito al abrir WhatsApp.
- Preview de fixtures aislada en almacenamiento y en deploys preview; sin enviar mensajes. Gate comercial público false. No hubo cambios en Supabase ni datos del negocio.
- `npm test`: **78/78 PASS** (65 existentes + 13 de promoción/WhatsApp).
- `node scripts/check-coupon-flow.cjs` con jsdom23.2.0 en NODE_PATH: **PASS** de componentes React19 reales en DOM simulado: código inválido, mínimo, aplicar/quitar, reintento sin duplicación, agregar/quitar/cantidades, remontaje/navegación y recarga de estado, coincidencia WhatsApp, 1/11 y 1/12, gate, wiring modal y aislamiento de fixtures. No es un navegador ni acredita render/foco nativo.
- `npm run typecheck`: PASS. `npm run lint`: 0 errores; un warning previo en lib/catalog-data.ts no modificado. `npm run build`: PASS, 148 páginas. El primer build detectó Date.now durante prerender Next16; se corrigió con snapshot de reloj estable e inicio tras hidratación, sin cambiar layouts ni caché.
- Revisión focalizada React: sin dependencias runtime nuevas, SSR estable, estado derivado en cálculo único, timers/listeners con cleanup, diálogos etiquetados, input con label/status y botones semánticos. Diff limitado a tres archivos existentes (provider/drawer/WhatsApp) y archivos propios de campaña/pruebas/documentación.
- Revisión económica documentada en `docs/november-campaign.md`: 208 productos de catálogo público, canastas simuladas $25.180/$24.650/$40.500 y descuentos propuestos $2.518/$2.465/$3.000. No hay costos actuales completos para validar margen: **BLOCKED_COMMERCIAL**, aprobación false. Sin revisión de historia ni modificación de logística.
- Instrumentación de eventos sin PII preparada; no hay colector de analytics configurado ni se afirma recepción persistente. Abrir WhatsApp emite intención, nunca purchase.
- **Pendiente QA navegador real:** 320/390/desktop, desbordes, copiar desde clipboard, teclado/foco/Escape del dialog nativo y navegación real entre cuatro rutas. Tool Browser no callable al momento de la entrega; no se sustituyó por control de Chrome fuera de las herramientas autorizadas.
- El intento de servidor local fue denegado por el entorno (listen EPERM). No se elevó ni se eludió; smoke HTTP previsto sobre la preview autorizada de Vercel.
- Preparación de preview en rama `feat/november-coupons`; identificadores de PR/deployment y smoke HTTP se agregan al cierre del PR/AlanOS. No confundir build local aprobado con preview remota ni con publicación en producción. Producción conserva main7f68cfbe hasta completar QA requerido.
- Recuperación: revertir el PR o deployment anterior dpl_F89GxzxWReVVaw8zeRxVZxqUcAWq. STOP seguro: implementación verificable en preview, sin habilitar descuentos públicos y con gates comercial/QA explícitos.


## Corrección aprobada del usuario — 23/10/2026

- Scope lock: quitar el tope de $3.000 y reducir la aclaración logística de las condiciones promocionales a «No incluye envío».
- `maximumDiscountCents=null`: $40.000 descuenta $4.000; $80.000 descuenta $8.000. Sin cambios en mínimo, porcentaje, vigencia, gate económico, módulos o datos del negocio.
- Se ajustaron las expectativas de pruebas y el análisis de canastas: $40.500 ahora descuenta $4.050 y totaliza $36.450. La evaluación económica inicial con tope queda superada por esta decisión.
- El texto de confirmación del pedido dentro de WhatsApp conserva el contrato original; la corrección de copy se aplica a las condiciones de la promoción.
- Parche en la misma rama/PR7. Validaciones y deployment del delta se registran en el cierre del PR y AlanOS.

- Aclaración posterior del usuario: el pop-up informa el cupón desde la primera navegación, sin abrir el carrito. Se conserva el plazo inicial de 8s entre páginas mediante sessionStorage; al estar ocupado el foco/otro diálogo, se posterga sin perder el aviso. Cerrar o aplicar impide reaparecer en la sesión. Vigencia y bloqueo comercial se conservan.
- Validación del delta: 14 pruebas de promoción/WhatsApp y fixture React DOM PASS; pruebas de $40.000/$80.000, copy reducido y timer de primera navegación (tras navegar a los 3s quedan 5s). Tipos y lint focal PASS. Preview actualizada en el mismo PR7.


## Corrección de disparador — Home al segundo

- Restricción vinculante del usuario: «al segundo que voy a la home». Sustituye la espera anterior de 8s y el disparador desde cualquier página.
- Cambio limitado a PromotionPopup: temporizador de 1.000ms al entrar a `/`, o a la simulación aislada de preview. Catálogo/productos/recetas no disparan el pop-up. Se conserva cierre por sesión, vigencia, bloqueo económico, foco ocupado y las condiciones sin tope.
- Prueba React DOM: fuera de Home no se programa el aviso; Home programa 1.000ms sin abrir carrito; volver a Home mantiene 1.000ms; el cierre sigue conservado en sesión. Flujo restante PASS. Typecheck y lint focal PASS.
- Preview y docs actualizadas en PR7; no se modifica producción ni se activa campaña comercial.


## Corrección de mínimo y diseño — 23/10/2026

- Usuario autoriza subir la compra mínima a **más de $30.000** y mejorar el diseño del pop-up. Se modifica la configuración central; se mantienen 10% sin tope, Home1s, cierre por sesión, vigencia y bloqueo económico.
- Popup: composición editorial crema/oliva, panel de descuento protagonista, tipografía display existente, detalle botánico SVG, cupón con copiar y CTA integrado. Modal nativo y semántica/foco se conservan. No se tocó el resto de la web ni se agregaron assets/dependencias.
- QA: **80/80 tests**, typecheck, lint focal y fixture React DOM PASS. $25.000 y $30.000 no aplican; $30.001 descuenta $3.000,10; $35.000 descuenta $3.500; $40.000 descuenta $4.000. Carrito y WhatsApp coinciden; persistencia, cierre y timing Home1s conservados.
- Las canastas de $25.180 y $24.650 pasan a descuento0 por mínimo; la de $40.500 conserva descuento$4.050 y total$36.450. No es validación de costos/rentabilidad ni una modificación de precios.
- Continúa pendiente QA visual en navegador320/390/desktop y aprobación económica. Publicación de preview en el mismo PR7, sin merge/producción. Build y despliegue del delta se registran en el cierre del PR y AlanOS.

## Autorización de publicación técnica — 23/10/2026

- Después de informar la falta de control de Chrome y el estado de preview, el usuario instruye expresamente: «mandalo a produ nomas». Autoriza integrar/publicar la funcionalidad con las limitaciones de QA comunicadas; esto no convierte el QA visual pendiente en aprobado.
- La publicación conserva exactamente el código validado de35009417, mínimo>$30.000, 10% sin tope, Home1s, nuevo diseño y `commercialApproved=false`. No se infiere aprobación económica ni se habilita descuento público.
- El delta posterior a35009417 es sólo documentación de esta autorización. Se reutilizan los80tests, fixture React DOM, tipos/lint/build y preview READY del mismo código; el nuevo build del proveedor se verifica antes de integrar.
- Merge, commit productivo, deployment/alias, smoke HTTP y logs efectivos quedan en el cierre de PR7 y AlanOS. Rollback: deployment anterior dpl_F89GxzxWReVVaw8zeRxVZxqUcAWq o revertir PR7; sin datos que restaurar.
