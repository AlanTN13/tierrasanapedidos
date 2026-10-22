# Enlace opcional por banner — 22/10/2026

## EXECUTION PREFLIGHT / PATCH MODE
- Resultado/autorización: el usuario pidió sumar una URL por banner y publicar en producción en este hilo. Autorización específica vigente; sin nueva confirmación.
- Superficie real: copia aislada en el workspace de la implementación existente, verificada contra los 324 blobs de main 5210ecaf; conectores GitHub/Vercel para publicación. Chrome no tiene herramienta callable en esta reanudación; no se sustituye por navegador integrado.
- Contexto/revisiones: AGENTS técnico dfa783c8; Execution_Runtime_Contract c74478a3 y Capacity Policy 60203336 leídos en este ciclo de conversación y reutilizados; TierraSana_Estado_Actual 1470635b; Vercel confirma producción 5210ecaf / dpl_9kwqbgJ4y242Lr7AwpmFfs7ngxSf. Guías locales Next 16.2.6 de navegación y componentes cliente leídas antes de editar.
- M/T2/R2; arquitectura existente, un escritor; reutilizar JSONB hero_banners, sin SQL nuevo ni dependencias. Sólo modelo/validación de banners, formulario Home y render del carrusel. Congelados: módulos restantes, contenido comercial, imágenes existentes, auth/RLS/permisos.
- Diseño: URL opcional HTTP(S) o ruta interna; imagen enlazada en la misma pestaña; sin URL conserva comportamiento. Validación antes de uploads y defensa al leer; enlaces independientes de controles y swipe.
- Validación: pruebas focales de URL/guardado/compatibilidad, render SSR de componentes reales, lint/types/build y preview/producción READY con SHA y alias. No inventar prueba de guardado real, que depende de sesión admin del sitio.
- Recuperación: revertir sólo este delta o volver al deployment anterior; propiedades opcionales en JSON compatibles con código anterior. Sin restauración de datos ni limpieza de assets.
- STOP: target/HEAD diferente, necesidad de tocar auth/RLS o datos comerciales; no ampliar alcance. Capacidad: una pasada de reconocimiento, checks globales centralizados y reserva para release; sin agentes.

## Estado
Implementado y validado localmente; publicación autorizada y en preparación. El cierre de integración/deploy se registra en el PR y en AlanOS para no generar commits de documentación encadenados en producción.

## Implementación y evidencia
- Campo «Enlace del banner (opcional)» por ítem en /admin/home. Acepta URL HTTP(S) completa o ruta interna (/catalogo); vacío quita el enlace. Abre en la misma pestaña. Cada URL acompaña a la identidad del banner al ordenar o quitar.
- Propiedad opcional linkUrl dentro de hero_banners. No requiere SQL, nuevas columnas, cambios de políticas ni credenciales. El persist existente guarda la colección completa en una sola operación y mantiene el espejo legacy del primer banner. Formularios anteriores que omiten el campo conservan el enlace existente.
- Normalización/validación compartida en lectura, guardado y render. Rechaza scripts/data, URLs ambiguas // o con barras inversas, espacios/controles internos, credenciales en URL y longitudes mayores a 2048; rechaza errores antes de cualquier upload. Un valor inválido legado deja la imagen sin enlace.
- Enlace nativo accesible alrededor de la imagen. Flechas/indicadores/pausa son controles hermanos y no activan el link. Un swipe horizontal que cambia el banner cancela el click de navegación resultante. Sin URL se conserva el render de la portada.
- **65/65 tests aprobados**, incluidos cuatro nuevos de destinos seguros, lectura, guardado/reordenado/borrado del enlace y validación total antes de uploads. Typecheck y lint focalizado sin errores. Build Next.js 16.2.6 completo aprobado (147 páginas).
- Smoke SSR con componentes reales: href correcto y destino en la misma pestaña, imagen dentro del enlace, controles fuera de él, banner sin URL/URL inválida sin ancla, campo precompletado por banner. Se conserva el smoke anterior de un banner fijo/cuatro controles/ocho uploads/límite cuatro. Revisión React focal: hooks, identidad al ordenar, accesibilidad, sin dependencias ni consultas adicionales.
- Sin edición de datos reales ni enlaces asignados a banners del negocio. Guardado real en admin y navegación/click/swipe en Chrome quedan fuera de lo demostrado: no hay herramienta de control local disponible en esta reanudación. No se declara E2E ni aceptación operativa.

## Recuperación
Revertir el delta o restaurar dpl_9kwqbgJ4y242Lr7AwpmFfs7ngxSf / main 5210ecaf. El código anterior ignora linkUrl y sigue leyendo las imágenes; conservar columna JSONB y archivos. No realizar rollback de datos.
