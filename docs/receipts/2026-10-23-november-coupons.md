# Noviembre Tierra Sana — cupón y carrito

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
