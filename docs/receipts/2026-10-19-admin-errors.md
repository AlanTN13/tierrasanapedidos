# Manejo de errores del backoffice

## EXECUTION PREFLIGHT / PATCH MODE
- Rol/superficie: ejecución técnica, AlanTN13/tierrasanapedidos, rama aislada.
- Resultado autorizado: pedido del usuario del 19/10 para corregir manejo de errores; diagnóstico confirmado en Vercel (POST /admin/products/new, constraint products_base_sku_unique_idx, digest 3553137440).
- Baseline: main 23cfa34d52a9278b3c9878e756d0f7dc3f42073f, mismo commit de producción dpl_FBKjZf52HLWXdggLT7DBwkrmyWrR.
- Contexto leído: AGENTS.md dfa783c8483b937985003de40cfe3d1a19d0b783; AlanOS Execution_Runtime_Contract.md c74478a3d868c5f9dd4bdc91a5414073dc469624; TierraSana_Estado_Actual.md 86882c2f2ea2e9400aa879de5095a2870bf64da3 (técnica verificada aparte en Git/Vercel). Guías de errores y formularios incluidas en Next 16.2.6.
- Budget/tipo/riesgo: M / T1 / R1 para código y preview. Publicación productiva R2 requiere autorización explícita.
- Delta: feedback compartido en formularios de guardado, errores esperables de productos como resultado seguro, prevalidación de identidad antes de subir imágenes/escribir, prevención de doble envío y fallback del segmento admin.
- Congelado: esquema/índices/RLS/autenticación, datos reales, precios/stock, ventas/compras, checkout, infraestructura y producción. No se elimina el índice único.
- Aceptación: SKU/slug duplicados muestran explicación; entrada y archivo permanecen; corrección permite reintentar; fallos inesperados no revelan SQL ni datos internos; redirects y guardado normal se conservan; validación, tests, typecheck, lint/build y un smoke local sin base real.
- Recuperación: rama/PR aislados; descartar o revertir commit. STOP ante necesidad de migrar esquema, modificar datos o publicar sin autorización.

## Implementación y validación
- `AdminForm` captura FormData antes de deshabilitar controles y evita el reset automático: conserva campos, checkboxes y archivo ante rechazo. Mutex de envío y fieldset deshabilitado mientras guarda. Alert accesible, foco al aviso y enlace al campo corregible.
- Productos: campos y valores numéricos válidos; slug/SKU base/SKU de presentaciones duplicados se revisan antes de upload o escrituras. El índice único sigue siendo la defensa ante carreras y su error también se traduce a un mensaje seguro.
- Fallos inesperados de productos se registran en servidor con referencia corta, sin mostrar detalles internos. Un guardado parcial devuelve el ID ya creado y el reintento reutiliza presentaciones propias por SKU. No hay reintento automático ni garantía de transacción atómica.
- La imagen anterior sólo se retira después del guardado completo; un fallo de limpieza no convierte un guardado exitoso en error. Un upload seguido de un fallo aún puede dejar un archivo sin uso; no se agregó limpieza masiva.
- El wrapper se aplica a productos, categorías, home y formularios de compras/ventas. En estos últimos sólo cambian la experiencia de error y el bloqueo de envío; su lógica de negocio no se modificó. Recetas mantiene su flujo existente.
- `app/admin/error.tsx`: recuperación de render con reintento o vuelta al resumen, referencia digest y sin mostrar `error.message`.

### Checks ejecutados
- `npm test`: 46 pruebas aprobadas, 0 fallos; 16 nuevas cubren traducción segura, valores inválidos, fila correcta, duplicados, edición propia y recuperación de presentaciones.
- `npm run typecheck`: aprobado.
- `npm run lint`: aprobado sin errores; conserva un warning previo de import sin uso en `lib/catalog-data.ts:20`.
- `npm run build`: aprobado, 146 páginas estáticas.
- `git diff --check`: aprobado.
- Smoke en Chrome sobre el ProductForm real con una Server Action local simulada (sin credenciales ni base de datos): SKU duplicado mostró aviso y foco al campo; nombre/slug/descripción/categoría/precio/medida y archivo se conservaron. Durante envío se vieron controles y botón deshabilitados. Un error inesperado sólo mostró el mensaje genérico, sin el marcador interno. Tras un error parcial, la corrección redirigió con el mismo productId simulado y los datos/archivo originales. Las rutas temporales de prueba fueron retiradas antes del commit.
- Revisión React: hooks sin efectos de sincronización, controles originales preservados, submit accesible, sin cambios de autenticación ni dependencias.

### Estado y límites
- Implementado y validado localmente en rama aislada. No se ejecutaron escrituras sobre Supabase real ni smoke de guardado productivo; las consultas de identidad se probaron con un doble de sólo lectura.
- No mergeado ni desplegado a producción al registrar este receipt. Pendiente revisión/publicación autorizada y aceptación real de Ileana.
- La operación sigue siendo de varios pasos. Ante un fallo de red con resultado incierto se indica revisar el listado antes de reenviar; no se afirma que nada se haya guardado.
- Rollback: revertir el commit del PR; no requiere migración ni restauración de datos.
- Código local: commit `1577e5b` en `fix/admin-form-error-handling`. El push a `AlanTN13/tierrasanapedidos` fue rechazado por revisión automática: considera que falta autorización específica para enviar el código a GitHub. No se intentó otro canal para eludirlo. Pendiente autorización de ese envío y apertura del PR; producción sigue sin cambios.

## Autorización de publicación
- 19/10/2026, 15:22 Argentina: el usuario respondió afirmativamente a «¿Me autorizás a subirla a AlanTN13/tierrasanapedidos y publicarla en la web?». Se autoriza push al repositorio existente, PR, merge y despliegue del parche validado.
- Preflight de release: main sigue en `23cfa34`; dominio `www.tierrasanadietetica.com` apunta a `dpl_FBKjZf52HLWXdggLT7DBwkrmyWrR`, proyecto `prj_AHXrhnaoiwzQ4MrmvohCDJBOqZ9f`, equipo `team_Dd84rleycBIFoY84LaXy5BYj`, target production. Sin cambios concurrentes de base. Se conserva el alcance; no se autorizan escrituras de prueba en datos reales.
