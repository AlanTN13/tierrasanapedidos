# Carrusel de portada — 21/10/2026

EXECUTION PREFLIGHT / PATCH MODE
- Rol: ejecución técnica, repo AlanTN13/tierrasanapedidos. Resultado autorizado: administrador con hasta cuatro banners de portada y carrusel público responsive.
- Fuentes leídas: Alan/01_Architecture/Execution_Runtime_Contract.md c74478a; Capacity Policy 6020333; TierraSana_Estado_Actual.md 3b32e83; TierraSana_Decisiones.md 45a12ee. Main remoto confirmado aefece51; baseline local reconstruido y árbol idéntico cb9aa4ff7ebbed5cfc1e84b1631ebbd70515252f.
- M/T2/R2; un implementador. Contexto sólo de Home, imágenes y formularios. Reutilizar Storage, AdminForm, permisos y caché; sin dependencias nuevas. Reservar integración para errores, responsive y compatibilidad.
- Permitido: HomeForm, Hero, acción/lecturas/tipos de Home y columna aditiva hero_banners. Congelados: ERP restante, catálogo, ventas/compras, precios/costos/stock, auth/RLS, categorías, recetas/Shorts y navegación.
- Diseño: array JSON de 1–4 banners en home_settings; conservar campos legacy y respaldo estático. Imagen desktop y mobile opcional por banner, orden editable. Validación previa a uploads; persistencia única; no borrar imágenes previas. Sin carga de contenido ficticio en producción.
- Aceptación: máximo cuatro, reordenar/quitar, conservar imágenes al fallar, fallback mobile/legacy; automático/manual, teclado/táctil, pausa y movimiento reducido; desktop/mobile sin overflow.
- Checks: tests de validación/guardado, suite existente, lint/types/build y smoke con fixtures de componentes reales. Un único smoke proporcional; sin escrituras reales.
- Producción: preparar PR, preview y SQL aditivo para revisión. Publicación y aplicación de SQL productivo requieren aceptación del release. Rollback: revertir código; conservar columna y assets para compatibilidad, sin restaurar datos comerciales.
- STOP: no publicar sin aceptación; detener ante necesidad de cambiar permisos o reglas ajenas a Home.

## Evidencia y estado
En implementación. El CLI de Supabase no pudo crear el archivo de migración por escritura de telemetría fuera del workspace; no se pidió ampliar permisos ni se modificó base de datos. El SQL se entrega como preparación revisable.

## Implementación y verificación local
- HomeForm: 1–4 banners, agregar/quitar y ordenar con identidad estable; desktop + mobile opcional, descripción accesible, preview y dimensiones; límite de 4 MiB agregado comprobado antes de invocar la acción y en servidor. AdminForm sigue reteniendo campos/archivos y bloqueando doble envío.
- Guardado: autenticación administrativa existente, rutas previas leídas desde servidor, validación de todos los ítems antes del primer upload, nombres versionados con UUID, una escritura final del array y espejo del primer banner en los campos legacy. Los archivos previos no se borran. Un fallo posterior al upload puede dejar un asset sin uso; no afecta la portada publicada ni dispara limpieza masiva.
- Hero: imagen fija si hay uno; varios con avance cada 6 s, flechas/indicadores, teclado y gesto horizontal. Pausa por hover/foco, pestaña oculta y preferencia de movimiento reducido; interacción manual pausa hasta reanudar. Se respeta la proporción natural sin recortar el contenido; se recomienda mismo tamaño por dispositivo para evitar cambios de altura.
- Lectura compatible con esquema previo (select * y fallback legacy). Antes del SQL, el admin informa que la carga múltiple aún no está habilitada; no se simula un guardado exitoso.
- Preview /previews/home-banners usa componentes reales y persistencia exclusivamente en memoria/blob de la pestaña; nunca usa Server Actions ni escribe en Storage/Supabase. Sólo accesible en development o VERCEL_ENV=preview; devuelve notFound en producción. Se reinicia al recargar.
- SQL aditivo revisable: supabase/setup/home_banner_carousel.sql. Columna nullable JSONB y constraint de 1–4; sin reemplazar contenido ni modificar RLS/grants. No aplicado. CLI supabase migration new falló antes de crear historia por telemetría fuera del workspace.
- Checks ejecutados: 61/61 tests (10 nuevos de colección), typecheck, build Next.js aprobado (147 páginas; ruta de demo protegida por entorno), lint sin errores con un warning previo de catalog-data; git diff --check limpio. Smoke SSR con componentes reales: un banner sin controles, cuatro indicadores, fuentes desktop/mobile, ocho campos de archivo y límite Agregar deshabilitado.
- QA en navegador local bloqueado por el sandbox: Next start no puede abrir puerto (listen EPERM) y Chrome headless aborta al iniciar. No se pidió ampliar permisos ni se afirma revisión visual/responsive ejecutada. La preview remota se entrega para probar interacción y responsive; tampoco se afirma un upload/guardado real contra Supabase.
- Producción verificada mediante Vercel: main aefece51 / dpl_7hPNXnT9UAXeiayf35RwSUr8W7m6 READY; no se modificó.

## Release y recuperación
Orden propuesto tras aceptación: aplicar SQL aditivo, verificar lectura/fallback legacy y permisos existentes, integrar PR, esperar deployment READY y comprobar /admin/home + Home. Cargar las imágenes elegidas por el responsable como operación habitual; ninguna imagen ficticia se publica.
Rollback: restaurar deployment anterior o revertir PR; conservar columna nullable y archivos anteriores. Los campos legacy reflejan el primer banner para que el código anterior siga mostrando una portada válida. No tocar datos comerciales.

Estado: implementado y probado automáticamente; pendiente PR/preview remotos, aceptación de release, SQL y validación real del guardado. Eficiencia: un único escritor; baseline exacto reutilizado; tests del delta y un ciclo global centralizado; sin auditoría ni módulos nuevos.
