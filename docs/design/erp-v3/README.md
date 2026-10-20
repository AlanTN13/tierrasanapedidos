# Tierra Sana ERP V3 — análisis y propuesta visual

> Actualización 20/10/2026: propuesta y alcance aprobados. Implementación real de los ocho módulos en este PR. Estado y validación actuales: [receipt de implementación](../../receipts/2026-10-20-erp-v3.md). El texto siguiente conserva el diagnóstico de la etapa 1–2; sus pendientes de implementación fueron superados por esta aprobación. La demo HTML sigue siendo una referencia histórica con datos ficticios, no el acceso al ERP actualizado.

## EXECUTION PREFLIGHT
- Rol/superficie: Dirección de Ejecución Técnica; análisis y propuesta visual sobre AlanTN13/tierrasanapedidos. CasaItaliaERP sólo como referencia de diseño, sin modificar ese repositorio.
- Autorización: pedido del 19/10/2026 a las 21:08 Argentina, etapas 1 y 2. La implementación de los módulos espera validación de esta propuesta; producción exige aceptación explícita nueva.
- Baseline técnico: main y producción `cd0c39cb03fbac2f7992a989feb44c7c0707bf4d`, deployment `dpl_DFGyKNt6cZXxTf84KPT46SeWEzdj` READY. Worktree y rama `design/erp-v3-proposal` aislados.
- Contexto leído: AGENTS.md de Tierra Sana; Alan/01_Architecture/Execution_Runtime_Contract.md `c74478a3d868c5f9dd4bdc91a5414073dc469624`; Execution_Capacity_Efficiency_Policy_V1.md `60203336a5d23a910b62b75fecf420a258ec077f`; TierraSana_Estado_Actual.md `c58a799b7f451fda30ff7af158aee54d471c4ee0`. Referencia Casa Italia: main `d87df8c5e75edb494c7cf10be103fef2fc1e3c24`, AGENTS `98e3075adc7defb8565401f01786ac9387fa7325`. Guías locales de Next 16.2.6 para layouts/CSS.
- Budget/tipo/riesgo: M / T1 / R1 para diagnóstico y demo estática; evolución integral posterior L/R2 a dividir por módulos. Un solo implementador; sin delegación.
- Alcance: diagnóstico focalizado, lenguaje visual, prototipo navegable con datos ficticios de Resumen/Ventas/Productos y flujo de nueva venta, referencia móvil de categorías, plan de implementación y validación. Sólo archivos de propuesta; ninguna acción conectada a datos.
- Congelado: rutas y módulos reales, autenticación, AdminForm y manejo de errores publicado, Server Actions, Supabase, esquema/RLS, conversiones/cálculos de negocio, precios/costos/stock/historia, checkout, storefront y producción. Los datos de la demo son ilustrativos.
- Aceptación: desktop/mobile legibles; tres vistas de referencia coherentes; búsqueda/filtros y detalles demostrables; estados de costo incompleto, estimado, stock negativo y sin cliente; sin llamadas de escritura; mobile sin overflow horizontal. Preview de rama y PR de propuesta, sin merge.
- Rollback: cerrar PR y descartar rama; producción no cambia. STOP antes de implementar módulos, cambiar reglas/datos o publicar sin la validación requerida por el usuario.

## CAPACITY PLAN / snapshot
Reconocimiento único: layout/CSS, dashboard, listados y formularios existentes, tipos y métricas de admin-operations; shell/UI/tabla/modal de Casa Italia. No auditoría general ni reconstrucción. Prototipo estático independiente: no instalar frameworks ni copiar la arquitectura de Casa Italia. Validar interacción y responsive en una pasada con ajustes focalizados. Suite existente una vez y control de delta antes del PR. Reservar margen para corregir layout móvil. Escalar si una pantalla requiere un cambio de negocio o migración.

## Diagnóstico

| Hallazgo | Evidencia | Consecuencia | Respuesta propuesta |
|---|---|---|---|
| Estilo de storefront dentro del admin | globals.css, PageHeader, surface-panel/organic-outline, títulos serif, radios de hasta 2rem | Mucha altura y decoración para consultar pocos registros | Tokens exclusivos bajo el shell admin: base gris, blanco, oliva, tipografía de sistema, radios de 8–12px |
| Ventas y productos como grandes tarjetas | sales-overview.tsx, products-list.tsx | Consultar y comparar exige mucho desplazamiento; algunos datos de producto quedan en expansión | Tabla compacta desktop; filas de lectura móvil con detalle completo accesible |
| Métricas de Ventas ligadas a la página | paginatedSales alimenta facturación/margen/ticket | Cambian al paginar; son correctas como página pero no equivalen a totales de período | Período y alcance explícitos. Validar en implementación si se agregan resúmenes del resultado filtrado; no cambiar silenciosamente la base del cálculo |
| Calidad de costo poco visible | SaleItemRecord: unitCostSnapshotCents y usesEstimatedCost; dashboard suma totalMarginCents | Un margen puede parecer concluyente con costos faltantes o estimados | Calidad visible junto al valor; costo 0/sin traza no se presenta como gratuito; no imputar ni recalcular históricos |
| Cliente es texto opcional existente | campo channel en TransactionForm | Identificación incompleta, sin maestro de clientes | Mostrar “Sin identificar” y conservar campo opcional; no agregar módulo ni esquema |
| Alertas mezclan stock base y equivalencias | InventorySummaryRecord y AdminPresentationOption | Riesgo de confundir paquetes posibles con kg/g/unidades disponibles | Stock base con unidad siempre visible; equivalencias en detalle, sin cambiar conversiones |
| Navegación móvil horizontal | admin-mobile-nav | Módulos fuera de vista | Menú accesible desplegable que conserva ocho módulos; cerrar al navegar |
| Categorías parcialmente ocultas y texto de 9px | HomeCategories, COLLAPSED_CATEGORY_COUNT y showAllCategories | Requiere expansión y cuesta leer títulos en celulares | Corrección aparte: renderizar todas las categoryCards en grilla, sin botón, nombres legibles |

## Qué se adapta de Casa Italia
Fuente: apps/web/src/components/erp-shell.tsx, erp-ui.tsx, app/globals.css y app/products/product-management.tsx. Se adaptan shell separado, toolbar, búsqueda/filtros con conteo y limpieza, métricas compactas, tabla con números alineados, badges y detalle/modal con cabecera y cuerpo desplazable. Casa usa sidebar de 190px y celdas de 7–9px; Tierra Sana propone sidebar de 216px y controles de 36–40px desktop / 44px touch. Su home redirige según permisos: no contiene un dashboard comercial equivalente; el dashboard de esta propuesta es propio de Tierra Sana. No se copian módulos, permisos, APIs ni reglas. Tampoco barras de progreso decorativas de métricas: todo gráfico debe representar datos reales al implementar.

## Lenguaje visual
- Fondo `#f5f6f7`, superficie blanca, texto `#202824`, secundario `#66716a`, bordes `#e1e6e2`; marca oliva `#586841`, activo suave `#edf1e8`.
- Fuente de sistema moderna, 14px base; títulos 26px; tabla 13px; métricas 25px; números tabulares. Touch: mínimo 44px en acciones.
- Sidebar clara en grupos Operación (Resumen, Ventas, Compras, Productos, Inventario) y Web (Home, Categorías, Recetas). Mismas ocho rutas; “Inventario” conserva /admin/stock-movements.
- Cabecera de contexto y acción primaria; sin banner ornamental. Búsqueda/filtros unidos a la tabla. Detalle lateral para consulta y rutas existentes para edición/alta; nunca eliminar pantallas de detalle.
- En móvil la tabla se transforma en filas etiquetadas con acceso al detalle, sin perder campos; menú y diálogos con foco/escape y scroll seguro.

## Datos y semántica
La demo se identifica permanentemente como datos ilustrativos y no consulta ni persiste información. Los importes y alertas no son el informe real. En producción se reutilizarán las fuentes actuales. Ventas del período = registros, no cobros bancarios ni contabilidad fiscal; ticket = total de ese mismo conjunto / operaciones. La cobertura de costo debe explicitar denominador y trazabilidad; la demo usa un estado ilustrativo y no establece una nueva fórmula de margen. “Sin costo confirmado” se distingue de “Estimado” y de “Costo registrado”, sin prometer verificación comercial. No deduplicar ventas ni cambiar saldos. La rotación se expresa en presentaciones vendidas, sin sumar gramos y unidades entre sí.

## Plan después de validar el diseño
1. Shell, tokens admin, navegación y componentes comunes; estilos acotados para no alterar la web pública ni AdminForm.
2. Productos: adaptar ProductsList y su view model, conservar búsqueda/estado/stock/paginación; costo base y unidad visibles, detalle y presentaciones activas/archivadas accesibles.
3. Ventas/Compras: conservar TransactionForm y payloads; buscador más directo, fila compacta, resumen de total siempre accesible, unidades explícitas. Reutilizar detalle y exportación.
4. Dashboard: conectar mismos agregados, rotación, últimas operaciones y alertas. Acordar el alcance del período y señalización de cobertura antes de alterar agregaciones; distinguir lo no concluyente.
5. Inventario, Home, Categorías y Recetas: aplicar patrón común; mantener ajustes, razones e historial y todas sus funciones actuales.
6. Integración/regresión: desktop 1440/1024 y móvil 390/320; navegación de ocho módulos, formularios y estados, SKU repetido, archivos conservados, doble envío, unidades, filtros/paginación y detalles.

## Web mobile: ticket y PR independientes
Superficie exacta: HomeCategories en components/home-discovery.tsx. Eliminar COLLAPSED_CATEGORY_COUNT, hasExtraCategories, visibleCategories/showAllCategories de ese componente y el botón. Renderizar content.categoryCards completo, conservando imágenes/títulos/orden/href. Mantener useState y lógica de Shorts porque siguen siendo necesarios. Grilla propuesta: 3 columnas en 320–639px; 4 en tablet pequeña; escalar a la grilla desktop. Validación: comparar cantidad, orden, enlaces e imágenes contra la entrada; nombres legibles; todos visibles sin expansión; scroll vertical; 0 overflow horizontal; Shorts y resto de la Home sin cambios. No se aplicó este parche en esta etapa de propuesta.

## Cambios que necesitan otra aprobación
Maestro de clientes, detección/conciliación automática de duplicados, corrección de costos históricos, nuevos métodos de costeo o margen, saldos/conversiones, migraciones e índices, reportes nuevos y correcciones masivas. Ninguno se implementa en este alcance.

## Validación y entrega
- Prototipo: `/previews/erp-v3.html`. Vistas `#resumen`, `#ventas`, `#productos`, `#nueva-venta` y `#web-mobile`. Los otros cinco módulos muestran alcance y ruta a preservar, no una implementación funcional nueva.
- `npm test`: 46 aprobadas, 0 fallos. Incluye manejo de errores, SKU, conversiones, banners, Shorts y YouTube del baseline.
- `node --check` del script de la demo: aprobado.
- `npm run lint`: 0 errores; conserva el warning previo de import no utilizado en lib/catalog-data.ts:20. Consola Chrome de la demo: sin errores ni warnings en el corte de revisión.
- Smoke Chrome: búsqueda de venta por código, paginación 4/8 (totales del resultado constantes), filtro de costos a revisar, detalle con costo incompleto, cierre con Escape; búsqueda de producto con acentos y filtro de costo faltante; detalle con unidad de costo y stock.
- Nueva venta simulada: buscar y agregar otro producto, cambiar presentación y cantidad, total de ejemplo $28.190; simulación de guardado sin persistir. Quitar todas las filas mostró un aviso y conservó el nombre del cliente escrito.
- Responsive comprobado a 1440px, 390px y 320px: Ventas, Productos, Nueva venta y grilla móvil sin overflow horizontal. Productos también verificado a 1024px. Menú móvil mantiene los ocho módulos; diálogos nativos permiten Escape y administran el foco. Total móvil de nueva venta en barra fija.
- Referencia de categorías: 13 ejemplos con assets existentes, todas las imágenes cargadas y categorías en el DOM sin expansión. No es una captura ni el conjunto completo del catálogo real; el parche aprobado debe usar `content.categoryCards` íntegro y nunca esta lista de ejemplo.
- Sólo documentación, capturas de datos ficticios y HTML estático. Ningún TSX/Server Action/estilo real, dependencia, schema o dato fue modificado. CSP de la demo bloquea conexiones y envíos de formularios (`default-src 'none'`, `form-action 'none'`). Sin almacenamiento local ni APIs.
- Capturas de propuesta en `screens/`: Dashboard, Ventas, Productos y Nueva venta desktop; Productos y categorías mobile. No se incluyen capturas con datos operativos reales en el repositorio público.
- Pendiente aceptación visual. No mergear este prototipo como implementación del ERP. Después de la validación se implementan los componentes reales en otra entrega y el parche de categorías en su PR independiente.
- Rollback de esta propuesta: cerrar el PR y descartar la rama. El dominio productivo conserva el commit `cd0c39c`.

## Comparación y estándar de continuidad

| Antes (código actual) | Propuesta |
|---|---|
| Título serif grande, gradientes y tarjetas redondeadas | Tipografía de sistema, superficies blancas y cabeceras compactas |
| Tarjetas por producto y venta | Filas comparables, números alineados, acciones junto al registro |
| Stock y costo repartidos en expansiones | Stock base visible, costo con unidad y detalle completo |
| Indicadores limitados a la página visible | Alcance explícito y resultados del filtro, a validar al conectar |
| Margen difícil de interpretar con faltantes | Estado de calidad junto al importe o “No concluyente” |
| Módulos en una tira horizontal móvil | Menú con grupos y ocho entradas accesibles |
| Carga larga con total al final | Resumen lateral desktop y barra de total móvil |
| Home con once categorías más expansión | Grilla propuesta de todas las categorías, sin botón |

Hallazgo diferido de fiabilidad: `getSafeRawInventorySummary` y `getSafeRawStockMovements` convierten errores en listas vacías. La implementación del ERP debería distinguir error/indisponibilidad de saldo cero con un resultado de lectura explícito. No se cambió ese comportamiento en esta etapa, ni se aprovechó para ajustar saldos. También se preservará el fallback de costo que `mapSales` ya aplica al leer ventas; su estado estimado debe seguir visible.
