# Categorías de Home siempre visibles

## PATCH MODE / preflight
Autorización: requisito mobile definitivo, propuesta validada por el usuario el 20/10/2026 11:32 Argentina. Baseline main cd0c39c. Contrato Alanos leído: Execution_Runtime_Contract.md c74478a; contexto TierraSana_Estado_Actual.md 1cac1bf; Capacity Policy 6020333. S/T1/R1, un escritor. Superficie permitida: HomeCategories en components/home-discovery.tsx. Congelados: Shorts, navegación, datos/imágenes/nombres/orden/enlaces y resto de la Home.

Delta: renderizar content.categoryCards íntegro; quitar estado, recorte y expansión; grilla de tres columnas mobile con nombres de 12px e imágenes de 72px; escala responsive. No se hardcodea el catálogo.

Aceptación: todas visibles, mismos datos/orden/URLs, scroll vertical natural sin overflow horizontal; Shorts intactos. Validado localmente a 390px y 320px: 13 categorías del catálogo de prueba, 0 botones de expansión, todas las imágenes cargadas, 0 overflow horizontal. Se expandió el baseline y se compararon nombre, orden, href e imagen de cada categoría: igualdad completa. HomeShorts y todo el código posterior permanecen idénticos al baseline.

Checks: 16 pruebas de carrusel, banners e imágenes aprobadas; eslint del componente sin errores; build de producción aprobado (146 páginas). Sin dependencia, esquema ni dato modificado. Capturas: [antes](screens/categorias-antes-mobile.jpg) y [después](screens/categorias-despues-mobile.jpg).

Implementado y listo para preview independiente. No mergeado ni publicado en producción.

Rollback: revertir este commit; sin migración ni datos. STOP antes de publicar sin aceptación del release concreto. Rama/PR independiente del ERP.
