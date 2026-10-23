# Los más elegidos — preview del 23/10/2026

## Revisión de descripción y tarjeta contenida

- Pedido/corrección explícita: el usuario observa que faltan descripciones y que el agregar queda suelto, especialmente en desktop. Mostrar la descripción existente y recuperar una tarjeta claramente delimitada con compra integrada. Se conserva mobile con dos productos completos y tercero asomando. Videos de recetas después; sólo preview.
- Contexto verificado: runtime `c74478a3d868c5f9dd4bdc91a5414073dc469624`; estado canónico `580771c03c35b982459231301934ae6e5f8cbc2b`, Alanos/main `b1ebf44b4bc53afcc8964448840660a6073c404c`. PR14 draft/open head `9cbc1fdf72757809e82d0e6629e78192dc5a059c`, árbol `cf0b671857c381c7dc7a8b84d1181f5592a3facc`, componente remoto `b23806c8f6c144cc53f414abe0fba346351ed4f5`. Main/producción sigue `67966a4b`. Guía CSS local Next16 leída.
- PATCH MODE / S-T1-R1: sólo FeaturedProducts y este receipt. Descripción del catálogo de hasta dos líneas si existe, sin copy inventado; borde exterior/sombra leve, separador de foto y franja de compra con fondo suave dentro del mismo marco. Nombre/descripción con tamaños legibles en desktop. Geometría mobile, datos/precios, orden, selección, fotos, enlaces, callback/cantidad y feedback intactos; sin dependencias/migraciones/consultas nuevas. Otras superficies y videos congelados.
- Aceptación/checks: descripción real presente y ausencia sin texto vacío/inventado, cada compra dentro de su artículo; tipos/lint focal, fixture DOM de compra/descripcion existente, build y un smoke de preview. No tests permanentes de estilos ni repetir suite económica intacta; no reintentar navegador nativo sin nueva capacidad (Browser no callable, fallo headless previo SIGABRT/EPERM).
- Permiso/rollback/STOP: actualizar misma rama/PR14, sin merge/promoción. Revertir revisión o cerrar PR conserva producción PR13. STOP al entregar preview corregida con evidencia y límites. El preflight anterior conserva el historial; esta corrección sustituye el diseño de contenedor abierto.

### QA focal de esta corrección

- Tipos y lint del componente final: PASS.
- Fixture ReactDOM/jsdom actualizada PASS: descripción original con espacios recortados, ausencia cuando está vacía, botón/compra dentro de su artículo; compra con presentación/precio/cantidad correctos, un llamado por click, repetición/unidad, feedback/check, enlaces, producto sin presentación/vacío y datos intactos. Fixture temporal fuera del repo; no prueba de layout nativo.
- La regla de ancho/scroll móvil y los activos de imagen no cambian respecto del head anterior; se conserva su evidencia de CSS compilado/HTTP. No se repiten pruebas económicas o de estilos intactos.
- Build/head/URL y un smoke final del contenido/estructura se cierran en el cuerpo del PR14. Native QA visual320/390/desktop sigue pendiente.

## EXECUTION PREFLIGHT / PATCH MODE

- Rol/superficie: Dirección de Ejecución Técnica, bloque Home «Los más elegidos».
- Resultado/autorización: usuario aprueba el boceto de tarjetas limpias con precio/«+» en una fila, dos productos completos y tercero asomando; acepta título menor y recorte limpio. «Perfecto aprobado» habilita implementación en preview; videos de recetas expresamente después. Sin nueva orden de producción para este bloque.
- Contexto: runtime Alanos `Alan/01_Architecture/Execution_Runtime_Contract.md` blob `c74478a3d868c5f9dd4bdc91a5414073dc469624`; estado Tierra Sana `d6bffce03afda8de675140eb5a9e72acc72bac6d`, Alanos/main `f6df59f55580d30ca0fdc34345bc89b6795b8c0f`. Web/main `67966a4b2a9f34fd1f8953f86a7374127f30164d`, árbol `efd7a091d1c961b28e3e677fed704c1363473176`; FeaturedProducts remoto `f6d24983c6110916e5d91fd67bae9e9f9fdda7cc`. Guía local Next16/Image leída.
- S/T1/R1. Delta: tarjetas adaptables, título discreto, foto/redondeo sin sombra pesada, precio/«+» juntos y feedback accesible. En mobile ancho de tarjeta `50% - 22px`, gap10px: dos tarjetas completas más24px del siguiente producto cuando existe. Scroll-snap nativo, recorte limpio y scrollbar discreta real. Grilla desktop4/6 conservada; no indicadores de páginas ficticias del boceto.
- Permitido: sólo `components/featured-products.tsx` y este receipt. Congelado: datos/orden/selección/fotos de productos, presentación predeterminada, cantidad1 por click, precios, carrito/cupón/WhatsApp, ERP/Supabase/stock, hero/recetas compactas, carrusel/banners, header/entregas, catálogo general, pagos/logística, videos/Shorts y sus contenidos. No nuevas consultas/dependencias del proyecto/migraciones; no se publica la imagen generada del boceto.
- Aceptación: mobile320/390 dos productos más indicio del siguiente por CSS, enlaces de producto, acción de compra real con presentación correcta y feedback, controles accesibles; desktop existente. Checks proporcionales: tipos/lint focal, chequeo del flujo de agregar, build preview, un smoke Home/activos. Sin tests permanentes de estilos ni repetición de suite económica intacta.
- Límite QA: Browser/Chrome no callable; intento headless de la tarea anterior terminó SIGABRT/EPERM. Sin nueva evidencia no se repite. QA visual/interactivo nativo320/390/desktop no se acredita por código/DOM/HTTP.
- Permiso/rollback/STOP: rama `preview/featured-products-2026-10-23`, PR en borrador, preview revisable; sin merge/promoción. Producción baseline PR13 `dpl_FqNNvwUec2VPtjC5cBdN6gnQw5t1` / `67966a4b`. Recuperación: cerrar PR/revertir rama; no datos que restaurar. STOP en entrega de preview; videos de recetas quedan para siguiente alcance.

## QA y despliegue

- Tipos y lint focal: PASS. Suite existente `tests/product-purchase.test.ts`: 2/2 PASS, sin cambios de lógica o tests nuevos permanentes.
- Fixture temporal React19/ReactDOM real + jsdom PASS: monta el componente real con Next/Image/Link, agrega la presentación preferida con precio/cantidad correctos, un llamado por click, segundo click agrega otra unidad, producto por unidad, confirmación/check accesible, destinos, producto sin presentación omitido, lista vacía y datos originales intactos. No es E2E ni navegador nativo. Dependencia de fixture únicamente en `/tmp`, sin cambios al proyecto.
- Compilación CSS Tailwind/PostCSS: inspeccionada la regla real `flex-basis: calc(50% - 22px)` y variante192px. La geometría prevista deja24px del tercero en mobile; no se usa como certificación de layout nativo.
- Fotos originales reutilizadas con `object-contain`, sin recortar etiquetas ni modificar activos. No se inventan productos ni precios, ni se cambia la selección actual.
- QA visual/interactivo nativo320/390/desktop pendiente por la capacidad de navegador ya documentada; no se repite el intento fallido.
- Cierre final de SHA/build/URL/smoke/producción preservada en el cuerpo del PR asociado.
