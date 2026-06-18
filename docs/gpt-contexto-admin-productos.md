# Contexto para GPT: Tierra Sana / Admin de Productos

## Qué es este proyecto

`Tierra Sana` es un MVP de catálogo y pedidos por WhatsApp para una dietética boutique.

Stack principal:

- Next.js 16.2.6
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- Supabase Auth + base de datos

Importante:

- El proyecto usa App Router.
- Hay una instrucción local que dice que esta versión de Next puede diferir de versiones anteriores, así que antes de tocar cosas sensibles conviene revisar `node_modules/next/dist/docs/`.

## Qué parte venimos trabajando

Estamos trabajando en el backoffice, específicamente en:

- `/admin/products`

El objetivo de esta pantalla es administrar productos con:

- SKU base
- stock real por producto
- presentaciones derivadas
- precios
- costos
- alertas de stock

## Problema UX que detectamos

La versión anterior de la lista de productos mostraba demasiada información de una sola vez y no ayudaba a responder preguntas básicas como:

- cuánto stock tengo de este producto
- qué presentaciones activas existen
- qué SKU tiene cada presentación
- cuál es la referencia de alerta
- qué necesito expandir y qué no

La crítica principal fue:

- “mucha info y no dice nada”
- no había jerarquía visual
- no estaba claro qué era resumen y qué era detalle
- no existía una interacción clara de expandir/plegar

## Decisión de diseño / UX que ya implementamos

La pantalla de productos se refactorizó para separar claramente:

1. Resumen rápido del producto
2. Detalle técnico expandible

### Ahora cada producto muestra primero

- nombre del producto
- estado (`Activo` / `Inactivo`)
- estado de stock (`Stock critico` o `Stock saludable`)
- slug
- SKU base
- stock disponible ahora
- referencia de alerta
- cantidad de presentaciones activas
- cantidad de SKUs activos
- precio de venta o rango
- costo base
- lectura rápida de comprado / vendido / archivadas / estado

### Y recién al expandir muestra

- descripción
- métricas adicionales
- panel de estado de inventario
- tabla de presentaciones
- SKU de cada presentación
- equivalencia base
- stock posible por presentación
- presentaciones archivadas

### Interacción nueva

Cada tarjeta de producto tiene:

- botón `Ver detalle`
- botón `Ocultar detalle`
- botón `Editar`

Esto permite leer la lista sin quedar obligado a ver toda la parte técnica.

## Archivos importantes

### Ruta principal del módulo

- [app/admin/products/page.tsx](/Users/alanfernandez/Desktop/pedido_tierrasana/app/admin/products/page.tsx)

Esta página:

- exige usuario admin
- trae productos, categorías, resumen de inventario y costo más reciente
- renderiza `ProductsList`

### Componente principal de la UI

- [components/admin/products-list.tsx](/Users/alanfernandez/Desktop/pedido_tierrasana/components/admin/products-list.tsx)

Acá está la mayor parte del trabajo reciente:

- filtros
- paginación
- resumen de métricas
- tarjetas por producto
- expand/collapse
- tabla de presentaciones

### Datos de catálogo

- [lib/catalog-data.ts](/Users/alanfernandez/Desktop/pedido_tierrasana/lib/catalog-data.ts)

Este archivo maneja:

- lectura de productos y categorías
- presentaciones
- compatibilidad con fallback local desde `data/products.json`
- integración con Supabase

Tipo importante:

- `AdminCatalogProduct`

Incluye:

- `uuid`
- `slug`
- `baseSku`
- `name`
- `description`
- `isActive`
- `categoryIds`
- `presentations`

### Operaciones de inventario y admin

- [lib/admin-operations.ts](/Users/alanfernandez/Desktop/pedido_tierrasana/lib/admin-operations.ts)

Este archivo define y calcula estructuras como:

- `InventorySummaryRecord`
- `AdminPresentationOption`
- `AdminPurchaseProductOption`
- métricas del dashboard

`InventorySummaryRecord` es importante porque le da a la UI cosas como:

- `quantityPurchased`
- `quantitySold`
- `stockCurrent`
- `stockCurrentLabel`
- `stockBaseUnits`
- `stockBaseLabel`
- `lowStockThreshold`
- `lowStockThresholdLabel`
- `smallestPresentationLabel`
- `smallestPresentationSku`
- `isLowStock`

## Qué cambio concreto quedó hecho

En `components/admin/products-list.tsx` se agregó o reforzó:

- búsqueda por nombre / SKU base / SKU de presentación / categoría
- filtro por estado
- filtro por alerta
- métricas resumen arriba de la lista
- cards de producto con mejor jerarquía
- detalle expandible por producto
- tabla real de presentaciones dentro del detalle

## Estado actual

Lo implementado ya quedó con lint pasando:

- `npm run lint`

Limitación de verificación visual:

- intentamos revisar la pantalla desde el navegador local
- el servidor cargó, pero la sesión caía en login del admin
- por eso no hubo validación visual autenticada completa desde browser automation

## Qué debería entender otro GPT antes de proponer cambios

1. No queremos volver a una UI que muestre todo expandido siempre.
2. La prioridad es claridad operativa, no “mostrar todos los datos posibles”.
3. El usuario necesita responder rápido:
   - cuánto stock hay
   - qué presentaciones existen
   - qué SKU tiene cada una
   - cuándo hay alerta
4. La parte técnica debe existir, pero detrás de una interacción clara.
5. Si se proponen más cambios, deberían mejorar:
   - jerarquía visual
   - escaneabilidad
   - comprensión del stock
   - relación entre stock base y presentaciones

## Posibles próximos temas para conversar con GPT

- si conviene abrir por defecto los productos con stock crítico
- si conviene mostrar una fila tipo acordeón en vez de cards
- si el resumen debería mostrar “stock base” y “stock posible por presentación” de forma más directa
- si hace falta una columna o badge especial para SKU
- si conviene separar mejor “inventario” de “catálogo”
- si la tabla expandida debería tener CTA para editar presentaciones

## Prompt sugerido para continuar la conversación

Podés arrancar con algo como esto:

```md
Estoy trabajando en un proyecto Next.js 16 con Supabase llamado Tierra Sana.
Venimos refactorizando la pantalla `/admin/products` para mejorar la UX del inventario.

Contexto clave:
- cada producto tiene un SKU base
- cada producto puede tener múltiples presentaciones con sus propios SKU
- hay stock base y equivalencias por presentación
- la UI anterior mostraba demasiada información de una sola vez y era confusa
- ya migramos la vista a un patrón resumen + detalle expandible

Quiero que revises la estrategia UX/UI y me propongas mejoras concretas sin volver a una interfaz hiperexpandida ni demasiado técnica.
Priorizá claridad operativa, escaneabilidad y comprensión del stock.
```

