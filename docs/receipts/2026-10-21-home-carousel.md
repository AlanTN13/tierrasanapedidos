# Carrusel de portada — 21/10/2026

## Cierre de publicación — 22/10/2026

**Vigente:** SQL aplicado, PR #4 integrado y release de código publicado. La portada existente continúa como una sola imagen fija; no se agregaron banners de prueba. El guardado real desde /admin/home queda pendiente por falta de sesión administrativa del sitio en el Chrome disponible.

### Preflight de reanudación / PATCH MODE
- Superficie real: Chrome habitual, perfil alan, sesión existente de Supabase; GitHub y Vercel mediante conectores autorizados. Sin navegador integrado ni otro perfil.
- Resultado y autorización: completar la publicación del carrusel ya desarrollado. El usuario reafirmó autorización de producción y SQL aditivo el 22/10; no fue necesaria una nueva confirmación.
- Contexto leído: Execution_Runtime_Contract.md blob c74478a3d868c5f9dd4bdc91a5414073dc469624; Capacity Policy blob 60203336a5d23a910b62b75fecf420a258ec077f; TierraSana_Estado_Actual.md blob 57d1738257caae39115b79408157075d5def01eb; AGENTS técnico dfa783c8483b937985003de40cfe3d1a19d0b783.
- M/T2/R2; un ejecutor, arquitectura existente. Reutilizada evidencia de 61 tests, typecheck y build del mismo commit 4b4ffb9; no se repitieron suites ni se cambió código.
- Permitido: SQL preparado, merge/publicación, smoke de Home/admin y actualización documental. Congelados: otros módulos, catálogo, precios, stock, datos comerciales, auth, RLS y grants.
- Aceptación: target inequívoco; esquema/configuración verificados antes y después; deploy READY asociado al dominio; comportamiento público desktop/mobile; límite de sesión declarado. Recuperación: deployment previo o revertir código conservando columna/archivos. STOP ante target incorrecto, cambio lateral o necesidad de modificar permisos.
- Capacidad: reconocimiento único de PR/SQL/contexto; un escritor por superficie; QA focalizado y reserva para integración. No se abrió auditoría general ni trabajo adicional.

### Supabase: aplicado y verificado
- Organización observada en Chrome: Tierra Sana, eylurapgozocmrizqamp. Proyecto abierto desde su tarjeta: tierra sana Project, **vaermgfmwqvhebotcnsy**, main PRODUCTION, Healthy. No se adivinó el identificador ni se usó el conector de la otra cuenta.
- Antes: public.home_settings tenía seis columnas; una fila main; RLS true. Políticas home_settings_admin_manage (private.is_admin, authenticated) y home_settings_public_read (id main, anon/authenticated).
- Ejecutado por SQL Editor el contenido exacto de supabase/setup/home_banner_carousel.sql del PR: BEGIN/COMMIT, hero_banners JSONB nullable, constraint home_settings_hero_banners_count de 1–4 elementos para arrays y rechazo de otros tipos no NULL. Resultado: Success. No rows returned.
- Después: columna jsonb / nullable YES; constraint validada true. hero_banners quedó NULL. Permanecieron el id check, PK y las mismas dos políticas con RLS true.
- Comparación completa de la configuración previa, excluyendo sólo la nueva columna: MD5 **70c3d05670690f4a8aaf4ea695b710b5** antes/después; legacy_unchanged true. Incluye timestamps y alt, no sólo rutas.
- Portada conservada: /storage/product-images/home/hero-desktop-msnlmb1l.webp; móvil /storage/product-images/home/hero-mobile-msnlivpo.webp; alt Armá tu pedido en 3 pasos. updated_at se mantuvo 2026-08-10T19:02:31.143657+00:00.
- No se ejecutó UPDATE/INSERT de configuración ni de datos comerciales; sin modificación de RLS, grants ni autenticación.

### Integración y producción comprobadas
- Premerge: PR OPEN, mergeable true, no draft; head exacto **4b4ffb9be1e8ebeb7b11f0debe97afbcc5408371**, base aefece51ec37ae257b7bfb702f8be82c6974d664; Vercel success. Sin workflows de GitHub Actions asociados; los 61 tests/types/build son evidencia previa del mismo commit, no una corrida nueva.
- Merge squash con expected_head_sha: **f1a48bcf26c767e891214fc603d06d64236d1017**. GitHub confirmó merged true.
- Deployment de código: **dpl_DqhK8nS5ey6PXk85DKUeRfPTPuGb**, target production, READY, commit f1a48bcf. Build remoto completado; check Vercel success.
- Consulta por www.tierrasanadietetica.com resolvió exactamente al nuevo deployment/commit, con alias raíz y www asignados. Este cierre documental posterior sólo actualiza este archivo; no cambia código validado.
- Smoke en el Chrome habitual sobre el dominio tras READY: contenedor Banners de Tierra Sana y un banner sin controles de rotación; portada heredada intacta. Desktop cargado desde su ruta real, 1600×600 naturales, render 1440×540. A 390 px cargó la variante móvil real, 1122×1402 naturales, render 390×487.32; ancho del documento y viewport 390, sin desborde horizontal. Override de viewport restablecido.
- Consola de Home sin errores ni warnings en el corte de la prueba. /previews/home-banners devuelve 404 en producción.
- /admin/home redirige a /admin/login?next=%2Fadmin%2Fhome, login sin sidebar/topbar. No hay sesión válida del sitio aunque sí de Supabase: **no se probaron formulario interno, upload, guardado real ni rotación con 2–4 banners en producción**. No se eludió autenticación ni se solicitaron secretos.
- Capturas: tierrasana-home-desktop.jpg, tierrasana-home-mobile.jpg y admin-login.jpg; conservadas como evidencia del smoke. La aceptación de la operación habitual por el responsable no se presume.

### Recuperación
Restaurar dpl_7hPNXnT9UAXeiayf35RwSUr8W7m6 / aefece51ec37ae257b7bfb702f8be82c6974d664, o revertir el merge de PR #4 y publicar. Conservar hero_banners nullable y assets anteriores; los campos legacy siguen válidos. No restaurar ni modificar datos comerciales.

---

## Preparación e implementación del 21/10/2026 — histórico
Los estados pendientes que siguen pertenecen a la preparación original y fueron sustituidos por el cierre del 22/10 de arriba.

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
