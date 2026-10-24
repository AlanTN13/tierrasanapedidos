# Publicación conjunta del storefront — PR17

## EXECUTION PREFLIGHT / PATCH MODE

- Orden vigente: después de aceptar categorías/producto/recetas/footer y de informar repetidamente que el blanco mobile seguía pendiente, el usuario indica «mandate todo a produ nomas». Autoriza publicación conjunta de los diseños aceptados. No se inventa una corrección del carrusel ni se amplía la implementación para intentar otra hipótesis.
- Contexto: AGENTS; Runtime Contract c74478a3; Estado Actual canónico actualizado con footer68bf800c; PR17 draft32bbb488/treec088f7f2/base22c3b008. Team team_Dd84rleycBIFoY84LaXy5BYj / proyecto prj_AHXrhnaoiwzQ4MrmvohCDJBOqZ9f, Vercel Git/main/production.
- Budget S/T1/R1 para cierre de entrega ya probada, un escritor. Publicar diseños aceptados; recuperar HomeShorts del blob productivo fb9269e1 y quitar acción/observación temporal. Sin nuevo movimiento/render del carrusel; su código final debe ser idéntico a main22c3b008.
- La incidencia real del teléfono queda abierta como deuda existente. Los6 reportes recientes son desktop1396/touch0/iosfalse, sin muestra del teléfono. No atribuir causa ni afirmar QA iPhone. El gate previo de cierre conjunto fue una decisión de staging del agente: la orden actual publica el diseño aceptado conservando el baseline del carrusel, sin declarar resuelto ese defecto. Supersede ese gate en receipts históricos, no su evidencia.
- Congelados: catálogo/precios/stock/ERP/Supabase, logística/pagos, header/banners/cupón/carrito/WhatsApp pedido, helpers y tests existentes. Sin credenciales/migraciones/configuración de promoción/servicios nuevos.
- Validaciones: limpieza exacta contra baseline y lista final de archivos; tipos/lint focal y tests existentes de selección/recetas/carrusel; preview final limpia READY/CI y smoke proporcional; squash con SHA esperado, comprobar árbol idéntico, producción READY/main y dominio oficial al mismo SHA, HTTP200 de páginas públicas y error/fatal del deployment. Reusar QA visual aceptado, no confundirlo con navegación nativa móvil.
- Rollback autorizado ante regresión: revertir PR17 o restaurar dpl_2SL6MVGP1TUN5jb3H86xFUZNnejm/main22c3b008. Sin rollback de datos. STOP por build/error/falla de árbol o dominio incorrectos, sin ampliar superficie.

## Preparación

Diagnóstico retirado. HomeShorts vuelve al código productivo exacto; no hay nueva lógica del carrusel en esta publicación. Diseños aceptados de categorías/producto/recetas/footer incluidos. La apertura de WhatsApp no se considera venta; ni promoción ni flujo comercial cambian por este PR.

QA/despliegue efectivos y límites se completan en PR17 y estado canónico al obtener evidencia del proveedor. Este receipt no acredita por sí mismo merge ni producción.

## QA local de versión limpia

Tipos PASS; ESLint focal de los11 TSX involucrados max-warnings0 PASS;16/16 tests existentes (8 carrusel,2 selección de producto,6 receta-carrito) PASS. HomeShorts exactamente igual al blob fb9269e1; referencias de observación/acción ausentes en app/components/lib PASS. Sin cambios de helpers/tests ni lógica comercial. QA previo de handlers/presentaciones y contenido de entregas preservados se reutiliza; la limpieza sólo quita observación.
