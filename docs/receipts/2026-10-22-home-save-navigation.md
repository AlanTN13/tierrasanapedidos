# Guardado de banners — corrección de navegación, 22/10/2026

## EXECUTION PREFLIGHT / PATCH MODE
- Usuario reporta que no puede guardar y aporta image(2).png e image(3).png. Se inspeccionaron ambas: URL /admin/home?saved=1, éxito y error genérico simultáneos. Consola muestra warnings de precarga CSS, no un error de guardado. Logs error/fatal de producción sin entradas en la ventana consultada.
- Baseline vigente verificado: main cca5d4f4 / árbol 47f60e17 / deployment dpl_E6E8RRFAdM22xhd2AGbgr5AMv4Ed READY. Contexto: TierraSana_Estado_Actual bf6f58fa; contratos c74478a3/60203336 y AGENTS dfa783c8 reutilizados de esta conversación.
- Resultado: corregir el flujo de confirmación del guardado solicitado, manteniendo enlaces/carrusel y el manejo de errores reales. Autorización de publicación del mismo resultado vigente en el hilo; no se solicita de nuevo.
- S/T2/R2, un escritor, sin cambio de arquitectura ni dependencias del proyecto. Superficie dueña: adaptador AdminForm, donde se captura cualquier rechazo del Server Action. No tocar validación/persistencia del negocio, SQL/RLS/auth, imágenes, catálogo, stock ni otros módulos.
- Causa de código: Next 16.2.6 rechaza la promesa del Server Action con NEXT_REDIRECT al navegar después de una escritura; el catch genérico del cliente lo transforma en UNKNOWN_SAVE_ERROR, bloqueando el control de flujo que restablece el formulario. El reducer del framework documenta explícitamente ese rechazo y el remount de RedirectBoundary. No se certifica el último guardado del usuario únicamente por saved=1.
- Plan mínimo: ejecutar la acción en una transición React y dejar que los errores de control de flujo de Next se propaguen mediante unstable_rethrow antes del manejo genérico. Conservar FormData previa al disabled, bloqueo doble envío, campos/archivos, foco y mensajes de errores reales.
- Aceptación: redirección no se presenta como fallo; errores reales siguen visibles/recuperables; tipos/lint/build y regresiones existentes pasan; preview/producción verificadas por SHA. Guardado real con sesión y UI no disponibles por ausencia de herramienta de Chrome; declarar ese límite.
- Recuperación: revertir sólo adaptador o restaurar deployment anterior, sin SQL ni restauración de datos. STOP ante necesidad de tocar permisos/otros módulos. Sin agentes, un ciclo focal y validación global centralizada.

## Estado
Corregido y validado localmente; release en preparación. El cierre de merge/deploy se registra en el PR y en AlanOS sin encadenar deployments sólo documentales. No se repitió un guardado real ni se modificaron datos del negocio durante el diagnóstico.

## Evidencia del defecto y de la corrección
- Se capturó el handleSubmit del componente real mediante render React y se invocó con una acción que rechaza con el mismo tipo de NEXT_REDIRECT handled=true que emite el reducer de Next. No es una copia del handler ni un DOM simulado.
- **Baseline anterior: reproducción FAIL esperada**, a successful redirect must not display/focus a save error (1 !== 0). El catch activaba el aviso genérico.
- **Componente corregido: PASS.** La señal original de navegación llega a React/Next; no activa el aviso. También PASS el error de validación retornado, fallo de red inesperado recuperable y bloqueo de envío duplicado. Fixture local de FormData, sin llamadas externas ni escrituras del negocio. No certifica navegación completa en un navegador.
- Comando reproducible sin dependencias nuevas: node scripts/check-admin-form-navigation.cjs. Un argumento opcional permite evaluar el componente baseline para reproducir la falla anterior.
- 65/65 pruebas existentes PASS; typecheck, lint focal y build Next 16.2.6 de 147 páginas PASS. Smoke SSR anterior del carrusel/enlace/formulario PASS; imágenes y campos conservan su render. No se alteraron la captura de FormData, el fieldset disabled, resume, foco o textos de fallas reales.
- Sin control de Chrome disponible: no se afirma que el último envío del usuario haya persistido ni que se haya probado un guardado real con su sesión. La corrección demuestra la causa reproducible del falso error de redirección; el gate operativo se mantiene explícito.

## Recuperación
Restaurar dpl_E6E8RRFAdM22xhd2AGbgr5AMv4Ed / cca5d4f4 o revertir este adaptador. Conservar enlaces, JSONB, imágenes y datos; sin SQL ni rollback de contenido.
