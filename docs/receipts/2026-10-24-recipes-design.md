# Recetas — diseño conjunto en PR17

## EXECUTION PREFLIGHT / PATCH MODE

- Resultado autorizado: «espectacular, ahora me quedaria receta y el interior de recetas». Categorías/producto aceptados; extender el estilo aprobado al índice y ficha de recetas, conservando publicación conjunta.
- Rol/superficie: ejecución web pública; rama fix/recipes-mobile-blank-2026-10-24, PR17 draft, head20c8dc05/treeb288dfab. Producción22c3b008 sin cambios.
- Contexto leído: AGENTS; Runtime Contract c74478a3; Capacity Policy60203336; Estado Actual canónico blob56543b14; guías locales Next16 CSS, Images y Server/Client Components. Capturas privadas del índice y Bocaditos de banana inspeccionadas, sin subirlas al repo.
- Budget M/T1/R1, arquitectura existente A0, un escritor. Plan suficiente: tarjetas compactas con marco/pie crema, ficha con foto acotada y resumen a su lado, lectura y compra ordenadas. Sin nuevas dependencias o consultas.
- Superficies permitidas: app/recetas/page.tsx, app/recetas/[slug]/page.tsx, RecipesStorefrontShell, RecipeProductsPicker, tarjeta presentacional compartida índice/relacionadas, este receipt.
- Congelados: contenido/fotos/orden/productos asociados reales, fetch/cache/metadata/404/static params, selección/default/presentaciones/precio/quantity1/callbacks del carrito, header/categorías/producto aprobados, HomeShorts/movimiento/modal y diagnóstico existente, cupón/WhatsApp, ERP/Supabase/stock/logística/pagos.
- Validación: tipos/lint focal, tests existentes recipe-cart, comparación de handlers/selección contra baseline, build preview y un smoke HTTP índice/ficha. Checklist React, targets44px, min-w0 y grids minmax0; no confundir SSR con QA visual nativa.
- Capacidad: reconocimiento focal y evidencia previa reutilizados; sin agentes, sin suite global repetida. Reserva para integrar/probar/ajustar preview.
- Recuperación: revertir este commit conserva diseño categorías/producto y baseline del carrusel; cerrar PR conserva producción22c3b008. STOP si exige cambiar datos/negocio o arquitectura.
- Gate conjunto: revisar diseño y cerrar defecto real de fila de recetas vacía en el teléfono. Observación temporal sólo preview; retirar antes de merge. Últimos logs24/10 15:28UTC son desktop1440/touch0, no iPhone; no prueban el caso móvil. No publicar partes ni declarar ese bug corregido.

## Estado

Implementado en la preview conjunta. Sin merge/despliegue productivo.

## Delta

- Índice: fondo natural liso, título32/40px y contador, grilla2/3/4; tarjetas con foto4:3, marco oliva, descripción original y pie crema con tiempo/Ver receta.
- Ficha: foto máximo480px y resumen a su lado desde768px; mobile apila. Título32/40px, metadatos en pequeñas superficies crema, ingredientes y pasos legibles con numeración. Desde1024px la compra queda en columna propia; mobile conserva ingredientes→compra→preparación.
- Picker: foto contenida, producto/precio/presentación agrupados, casilla con objetivo44px y select44px/16px en mobile, CTA48px. Selección/default/quantity1/feedback y apertura del carrito preservados.
- Instagram pasa de otro bloque con foto grande a una franja compacta; mismos destinos/condición. Recetas relacionadas reutilizan RecipeCard, componente de servidor sin hooks ni nuevas consultas; mismas cuatro recetas/orden. Sin cambiar imágenes/textos de recetas o datos reales; sólo copy de encabezado de página y presentación.

## QA ejecutado

- Tipos y ESLint focal con max-warnings0 PASS. La primera ejecución detectó un prefijo de ruta reemplazado al reescribir JSX; restaurado literalmente desde baseline antes del PASS, sin publicar esa iteración.
- Tests existentes recipe-cart:6/6 PASS (defaults, cantidad1, omitir sin presentación, sin productos, una apertura del carrito).
- Comparación AST de on*/checked/value/disabled de los cuatro archivos existentes PASS; estado/hooks/selección del picker y prefijo completo de la ficha (generateStaticParams, fetch paralelo,404, related) idénticos al baseline PASS.
- Checklist React aplicado: server/client boundary existente, sin nuevos hooks/listeners/deps/queries; keys estables, labels/foco semántico, min-w0/grids minmax0, targets44/48px, movimiento hover respeta reduced-motion en tarjeta nueva. No se toca corrección relative de productos destacados.
- Build remoto y smoke HTTP índice/Bocaditos se verifican en el cierre de PR17. No hay control de navegador disponible: estos checks no certifican layout320/390 o interacción nativa. Preview para revisión visual; pendiente móvil heredado sigue abierto, sin atribuir causa.
