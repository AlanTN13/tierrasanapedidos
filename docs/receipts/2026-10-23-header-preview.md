# Header responsive — preview del 23/10/2026

## Panel centrado e información de otras localidades

- EXECUTION PREFLIGHT / PATCH MODE: S / T1 / R1. Baseline PR12 `25785cb`; runtime `c74478a3` y estado canónico `7a378914` verificados. El usuario solicita panel centrado/flotante y aclara que las zonas actuales mantienen entrega sin costo; para otras localidades calculan el envío e informan su costo.
- Delta: sólo JSX/presentación y texto del diálogo existente de entregas en `storefront.tsx`. Centrar con margen y esquinas completas en mobile/desktop; conservar zonas actuales, incorporar aclaración de cotización por localidad y coordinación. Sin calculador/tarifas automáticas, sin nuevas zonas, sin cambios en franja/header/categorías/cupón/carrito/WhatsApp o backend.
- Aceptación/validación proporcionada: tipos, lint focal, build de la misma rama y un smoke Home; comparar que todo el código fuera del diálogo sea idéntico al baseline. No tests nuevos de estilos/copy; QA visual nativo pendiente mientras Chrome no esté disponible.
- Gate/recuperación/STOP: preview exclusiva, sin merge/promoción; volver a `25785cb` revierte sólo este ajuste. Resultado final de commit/build/URL en el mismo PR.
- QA ejecutada en este ajuste: typecheck y lint focal PASS; comparación de código confirma que todo fuera del JSX del diálogo es idéntico a `25785cb`. No se añaden tests de copy/estilo ni se repiten los checks de cupón/header intactos. Posición/scroll y aceptación visual nativa pendientes; resultado de build/HTTP en PR.

## Ajuste de entregas solicitado sobre la preview

- EXECUTION PREFLIGHT / PATCH MODE: S / T1 / R1. El usuario señala la franja en `image(20261023-172455).png` y solicita una invitación explícita a hacer clic para ver información de entregas. Baseline PR12/head `4fc9e62`; runtime vigente `c74478a3` y estado canónico `fb9c347b` verificados. Continúa la autorización de preview exclusiva.
- Delta permitido: copy/affordance de `ShippingTicker` y apertura del panel existente de entregas en mobile/desktop. Se detectó `lg:hidden` en el panel, que impedía mostrar información en desktop; corregirlo es necesario para que funcione el CTA. Preservar literalmente información comercial existente y el resto del header/categorías/carrito/campaña/datos.
- Aceptación/QA: CTA explícito, subrayado y con indicación visual; botón y estados accesibles; panel visible en ambos tamaños, cierre/Escape/Tab/foco; tipos/lint y build, un smoke HTTP de Home. QA nativo sigue pendiente si Browser no está disponible.
- Validación local de este ajuste: typecheck, lint focal de storefront y render SSR de ShippingTicker extraído del TSX real PASS: copy mobile/desktop, botón nativo, asociación al diálogo y aria-expanded false/true. Información comercial del panel comparada literalmente con el baseline: idéntica. Foco/Tab/Escape implementados, sin afirmación de prueba nativa. Build/URL/cierre final en PR.
- Producción/rollback/STOP: sólo rama PR12 en borrador; volver a `4fc9e62` descarta este ajuste; no merge/promoción ni cambio productivo. Publicación/verificación final en el cuerpo del mismo PR.

## EXECUTION PREFLIGHT

- Rol y superficie real: Dirección de Ejecución Técnica; header público de Tierra Sana.
- Resultado y autorización: «mandale y vemos como queda, mandalo a preview no lo mandes a produ». Header desktop/mobile basado en bocetos, logo existente, Instagram visible, buscador permanente en mobile/amplio en desktop; categorías y fotos actuales preservadas.
- Contexto verificado: `AlanTN13/Alanos/Alan/01_Architecture/Execution_Runtime_Contract.md`, blob `c74478a3d868c5f9dd4bdc91a5414073dc469624`; estado canónico vigente leído; web `main`/producción `fe3f6c7234cc0168605588b9518ad062eba27bdc`, árbol `25480f6fbfa0a63d00b28411461841cf2b75b647`. Header local idéntico al remoto, blob `a888435be3bfe231c563ec74927ad1646647167a`.
- Budget M / T1 / R1: presentación y navegación pública, aisladas en rama; sin cambios económicos o datos.
- Dentro: `components/header.tsx`, sólo franja de entregas en `components/storefront.tsx`, verificación focal y este receipt. Fuera: fotos/estructura de categorías, carrusel/banners, catálogo, precios/stock, carrito/cupón, mensaje/seguridad de WhatsApp, ERP, recetas/Shorts, logística, pagos, datos, Supabase/RLS, DNS y producción.
- Aceptación: logo/enlace Instagram reales; buscador controlado que consulta el catálogo; menú/categorías/carrito navegables; foco/teclado/controles accesibles; layouts 320/390/desktop; build y preview READY del commit correcto.
- Permisos y recuperación: sólo preview de rama, PR en borrador sin merge/promoción. Producción inicial `dpl_7wzAF37EJmSYdGZscvLdFT3FnU6k` READY con aliases oficiales; debe seguir igual. Rollback de preview: cerrar PR/eliminar rama o revertir delta, sin efecto productivo.
- STOP: preview funcional entregada; no publicar en producción. Si no hay navegador callable, distinguir comprobaciones de código/DOM/HTTP de QA visual real y dejarlo explícito.

## PATCH MODE

- Baseline: PR11 aprobado y producción vigente.
- Delta exacto: composición del header responsive e Instagram; franja de entregas estática y discreta que conserva el acceso a las condiciones existentes.
- Superficie permitida: header, franja y QA focal/documentación.
- Superficies congeladas: todas las listadas fuera de alcance; categorías mantienen enlaces, fotos y presentación actuales.
- Validación focalizada: tipos/lint, búsqueda/menú/Instagram/carrito/foco y preservación de categorías; no repetir suite económica intacta.
- Smoke máximo: una pasada proporcional de preview Home/catálogo y verificación de versión/target, más confirmación de producción intacta.
- STOP/rollback: sin merge, sin producción, sin credenciales/dependencias nuevas ni infra de pruebas extensa.

## Estado

Implementado y verificado localmente. No mergeado ni publicado en producción. El resultado final de build, commit y URL de preview se registra en el cuerpo del PR asociado a esta rama.

## Delta

- Desktop: logo original con proporciones reales, buscador ancho sin mínimos que fuerzan overflow, Instagram y carrito oliva; enlaces existentes de secciones y rail de categorías en fila inferior.
- Mobile: menú, logo original, Instagram y carrito; búsqueda permanente debajo, texto de 16px para evitar zoom de foco de iOS. Menú conserva las categorías y puede desplazarse dentro de la pantalla; Escape devuelve foco al botón.
- Franja de envíos estática y breve, con el botón y modal de condiciones existentes. No altera zonas/tarifas ni logística.
- Se conservan fotos/componentes de categorías, banners y carrito. El cambio original sólo afectaba ShippingTicker; el ajuste posterior autorizado incluye estado/foco/presentación del panel existente de entregas para habilitarlo en desktop. Información comercial del panel idéntica al baseline. El header reutiliza el enlace Instagram ya existente.

## QA realmente ejecutado

- `npm run typecheck`: PASS.
- `npx --no-install eslint components/header.tsx components/storefront.tsx`: PASS.
- Smoke React 19 SSR con componentes reales: formularios desktop/mobile presentes, búsqueda controlada/vacía, enlaces Instagram reales, contadores/carrito, las 16 categorías y estado activo, logo original y menú cerrado. PASS; no equivale a interacción nativa.
- Revisión React: sin dependencias nuevas; hooks/eventos con cleanup y actualización funcional de menú; límites de cliente existentes, etiquetas/foco y controles táctiles; sin cambios de consultas o backend.
- QA visual/interactivo nativo 320/390/desktop: PENDIENTE; Chrome/Browser no callable. No se afirma prueba de navegación, foco nativo o desbordes por inspeccionar SSR.
- Fixture jsdom no disponible en este entorno. Instalación temporal offline bloqueada por cache/permisos; no se alteraron permisos, dependencias o configuración del proyecto para sortearlo. No se afirma PASS interactivo.
- Suite económica del cupón no repetida: sus archivos no cambian.

## Preview y recuperación

- Rama `preview/header-responsive-2026-10-23`, creada desde `fe3f6c7`. Target exclusivamente preview; ver commit, deployment y URL verificados en el PR.
- No mergear/promover sin una nueva indicación del usuario. Producción debe conservar `dpl_7wzAF37EJmSYdGZscvLdFT3FnU6k` / `fe3f6c7` y aliases oficiales.
- Revertir estos dos componentes en la rama o cerrar el PR descarta el diseño sin afectar la web pública.
