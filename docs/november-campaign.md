# Noviembre Tierra Sana 2026

## Configuración y activación

Fuente única: `lib/promotions.ts`, `NOVEMBER_PROMOTION`.

| Parámetro | Valor preparado |
|---|---|
| Código | TIERRASANA10 |
| Descuento | 10% del subtotal de productos |
| Mínimo | Estrictamente más de $30.000, antes de descontar |
| Tope | Sin tope de descuento (`maximumDiscountCents: null`) |
| Inicio interno | Activa desde 23/10/2026 00:00 Argentina = 03:00 UTC; no se muestra fecha inicial |
| Fin exclusivo | 01/12/2026 00:00 Argentina = 03:00 UTC |
| Activación pública | `commercialApproved: true`, autorizada explícitamente por el usuario el 23/10/2026 |

**Campaña activa por decisión expresa del usuario del 23/10/2026.** Después de explicar por qué no aparecía el pop-up y ofrecer activarlo desde hoy, respondió «sisi porfa». Luego indicó sólo fecha tope 30/11 y cambiar el cupón a tierrasana10. Esa autorización reemplaza la espera comercial anterior; no se presenta como una validación de rentabilidad. Código canónico TIERRASANA10, acepta minúsculas/espacios al ingresarlo; NOVIEMBRE10 deja de ser válido. La interfaz muestra sólo «Válido hasta el 30/11», calculado desde el fin exclusivo en Buenos Aires. No hay toggle público ni cambio por query string.

El navegador revalida al llegar a los límites de fecha, al recuperar foco y al abrir WhatsApp. Las fechas no dependen de la zona horaria del dispositivo. Corrección vigente del usuario: el modal del cupón aparece 1 segundo después de entrar a la Home, sin abrir el carrito. Navegar por catálogo, productos o recetas no dispara el aviso. Al cerrarlo o aplicar el cupón, no vuelve durante la sesión. La ruta aislada de preview también simula este disparador de 1 segundo. Si hay otro diálogo abierto, una pestaña oculta o un campo en edición, espera a que se pueda mostrar sin interrumpir. Se cierra con botón, fondo o Escape; usa diálogo nativo para foco/teclado. El cierre se conserva en sessionStorage. El código va en localStorage, separado del carrito; un código válido bajo el mínimo queda pendiente y vuelve a aplicar al cumplirlo. Uno desconocido o inactivo no sustituye el cupón anterior.

## Revisión comercial del 23/10/2026

Se consultó `https://www.tierrasanadietetica.com/api/catalog`: HTTP200, 208 productos. Las siguientes son **canastas simuladas con precios públicos vigentes en esa consulta**, no pedidos históricos ni evidencia de frecuencia de compra. No se modificó catálogo ni se escribieron pedidos.

| Canasta | Contenido | Subtotal | Descuento propuesto | Total estimado | Descuento efectivo |
|---|---|---:|---:|---:|---:|
| Desayuno / snacks | Granola crocante 500g $6.290; avena tradicional 1kg $2.900; nuez mariposa 250g $6.500; mix semillas 250g $1.990; almendra 250g $7.500 | $25.180 | $0 | $25.180 | 0% (no supera el mínimo) |
| Despensa / semillas | 2 garbanzos 1kg a $3.190; 2 lentejas 1kg a $4.190; harina avena 1kg $3.200; mix semillas 1kg $6.690 | $24.650 | $0 | $24.650 | 0% (no supera el mínimo) |
| Frutos secos | Almendra 1kg $28.000; nuez mariposa 500g $12.500 | $40.500 | $4.050 | $36.450 | 10% |

El descuento es el 10% del subtotal sin tope monetario, por corrección explícita del usuario. Esto **no acredita rentabilidad**. Faltan costos actuales completos por SKU/presentación, envase, preparación, costos de entrega absorbidos y objetivo de contribución. AlanOS ya advertía costos incompletos/estimados: no se convirtieron en cero ni se usaron costos históricos de chat como vigentes. La validación debe comparar `subtotal - descuento - costo de mercadería - costos variables absorbidos` con el margen objetivo aprobado, incluyendo canastas de baja contribución.

**Riesgo económico pendiente:** no se acreditó rentabilidad con costos vigentes completos. El responsable autorizó expresamente activar el beneficio desde hoy después de informar el bloqueo; se registra esa decisión sin inventar una validación económica. No se agregan exclusiones ni acumulaciones. Las condiciones logísticas existentes se conservan; el descuento toma sólo productos y las condiciones promocionales muestran solamente «No incluye envío» como aclaración logística, sin tarifas inventadas. No se afirma haber revalidado zonas o mínimos de envío.

## Diseño vigente del pop-up

Corrección del usuario: mínimo superior a $30.000 y rediseño acotado del modal. Composición con panel verde oliva, 10% protagonista, fondo crema, tipografía editorial local, detalle botánico vectorial y bloque de código con copiar. Dos columnas en escritorio; apilado en móvil. Cierre accesible y comportamiento de Home1s conservados. Sin imágenes externas ni dependencias nuevas. La condición de compra y la aclaración «No incluye envío» siguen visibles.

## Preview y aislamiento

`/previews/noviembre` existe sólo en desarrollo y en deployments Vercel de preview. En producción devuelve 404. Simula 15/11/2026 y aprobación económica para probar límites con fixtures identificados, sin alterar catálogo. Carrito y cupón usan claves separadas con sufijo preview. El botón de WhatsApp muestra el mensaje de prueba dentro del drawer; no abre ni envía mensajes. Fuera de esa ruta rige la configuración pública activa con su reloj real y vencimiento automático.

## Cálculo y WhatsApp

Importes internos en centavos enteros; 10% redondeado al centavo más cercano, sin tope monetario y limitado únicamente al subtotal para evitar totales negativos. $30.001 produce $3.000,10 de descuento y $27.000,90 de total. El incentivo propone la cantidad de pesos enteros para superar el mínimo ($1 al estar justo en $30.000). Nunca se altera un precio unitario ni se incluye envío en la base del descuento.

`createWhatsAppUrl` vuelve a sumar las líneas y valida el cupón/fecha al click: no acepta el total descontado de la UI como autoridad. Incluye detalle, subtotal, código, porcentaje, importe, total y coordinación de entrega/retiro. Conserva el número y el comportamiento anterior de abrir WhatsApp y vaciar el carrito. Eso es una intención de compra, no venta confirmada; no se escribe una venta.

## Medición

Instrumentación sin datos personales en `dataLayer` y evento DOM `tierra-sana:campaign`: `promotion_view`, `promotion_copy`, `promotion_dismiss`, `coupon_apply` (estado/subtotal/descuento), `coupon_remove` y `whatsapp_order_intent` (subtotal/descuento/total/estado). No se emite `purchase`.

**No hay colector GA4/GTM configurado en el código vigente.** Emitir eventos no equivale a tener un dashboard o medición persistente. Antes de la campaña, conectar el consumidor de analítica aprobado y comprobar recepción; no se inventó un measurement ID ni se desplegó un servicio de tracking. Las ventas confirmadas deberán medirse desde la fuente operativa, nunca por apertura de WhatsApp.

## QA y rollback

- `npm test`: escenarios numéricos, códigos, gate, fechas UTC-03, recálculo, ausencia de tope y configuración, centavos y coincidencia WhatsApp.
- `node scripts/check-coupon-flow.cjs` con jsdom disponible en NODE_PATH: componentes React reales, DOM simulado, almacenamiento, navegación/remontaje, cantidades, eliminación, flujo de cupón/modal, mensajes WhatsApp y aislamiento preview. No prueba layout ni comportamiento nativo del navegador.
- `npm run typecheck`, `npm run lint`, `npm run build`.
- QA obligatorio pendiente de navegador real: 320/390/desktop sin desbordes, modal nativo con Tab/ShiftTab/Escape/restauración de foco, copiar código y navegación real por las cuatro superficies públicas.

El23/10 el usuario ordenó publicar técnicamente después de comunicar que Browser no está disponible. Se conserva la limitación de QA visual y se continúa con la publicación autorizada, sin presentar esa prueba como realizada. Posteriormente autorizó la activación pública inmediata del código TIERRASANA10; `commercialApproved=true`. Se conserva el QA visual pendiente y la falta de validación económica, sin confundir autorización con evidencia de margen.

Rollback de esta activación: revertir el PR y redesplegar, o restaurar `dpl_2XcpSL6itsc7gCGnkHbW9DPtevKd` (main cc10d26c, campaña apagada). Sin migraciones ni restauración de datos. Desactivar `commercialApproved` y desplegar corta la oferta en el cliente nuevo; el código persistido no vence las reglas. Carritos ya abiertos con una versión antigua requieren recarga; la confirmación humana por WhatsApp conserva el control final.
