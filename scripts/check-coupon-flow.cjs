// Real React components mounted in jsdom. No browser layout engine or network.
// Install jsdom in a temporary QA prefix and expose it with NODE_PATH.
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");
const dom = new JSDOM('<html><body><button id="origin">Origen</button><div id="root"></div></body></html>', { url: "https://qa.example.test/", pretendToBeVisual: true });
for (const name of ["window", "document", "HTMLElement", "HTMLInputElement", "Event", "CustomEvent", "KeyboardEvent", "MouseEvent", "sessionStorage", "localStorage"]) global[name] = dom.window[name];
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.IS_REACT_ACT_ENVIRONMENT = true;
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) { return resolve.call(this, request.startsWith("@/") ? path.join(root, request.slice(2)) : request, ...args); };
const ts = require(path.join(root, "node_modules/typescript"));
for (const ext of [".tsx", ".ts"]) require.extensions[ext] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const React = require(path.join(root, "node_modules/react"));
const { createRoot } = require(path.join(root, "node_modules/react-dom/client"));
const { act } = React;
const { CartProvider, useCart } = require(path.join(root, "components/cart-provider.tsx"));
const { CartDrawer } = require(path.join(root, "components/cart-drawer.tsx"));
const { NOVEMBER_PROMOTION } = require(path.join(root, "lib/promotions.ts"));
const approved = { ...NOVEMBER_PROMOTION, commercialApproved: true };
let now = Date.parse("2026-10-23T12:00:00-03:00");
Date.now = () => now;
let popupTimer;
let popupDelay;
const originalTimeout = window.setTimeout.bind(window);
window.setTimeout = (fn, ms, ...args) => { if (ms === 1000) { popupTimer = fn; popupDelay = ms; return 999999; } return originalTimeout(fn, ms, ...args); };
// jsdom doesn't implement native dialogs. These stubs test wiring only.
dom.window.HTMLDialogElement.prototype.showModal = function() { this.open = true; this.querySelector("button")?.focus(); };
dom.window.HTMLDialogElement.prototype.close = function() { this.open = false; };
let cart;
let openedUrl;
window.open = (url) => { openedUrl = url; return null; };
function Harness() {
  cart = useCart();
  return React.createElement(React.Fragment, null,
    React.createElement("button", { id: "open-cart", onClick: cart.openCart }, "Abrir"),
    React.createElement(CartDrawer, { items: cart.items, isOpen: cart.isOpen, subtotal: cart.subtotal, onClose: cart.closeCart, onCheckout: cart.clearCart, onRemove: cart.removeItem, onUpdateQuantity: cart.updateQuantity }));
}
let reactRoot;
const container = document.getElementById("root");
const flush = () => new Promise((r) => setImmediate(r));
async function mount(props = {}) { reactRoot = createRoot(container); await act(async () => { reactRoot.render(React.createElement(CartProvider, props, React.createElement(Harness))); await flush(); }); await act(async () => { await new Promise((resolve) => setTimeout(resolve, 5)); }); }
async function unmount() { await act(async () => { reactRoot.unmount(); await flush(); }); }
async function click(text) { const button = [...container.querySelectorAll("button")].find((b) => b.textContent.trim() === text); assert.ok(button, `missing button ${text}`); await act(async () => { button.click(); await flush(); }); }
async function clickLabel(label) { const button = [...container.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === label); assert.ok(button, `missing button ${label}`); await act(async () => { button.click(); await flush(); }); }
async function apply(code) { if (!document.getElementById("cart-coupon")) await act(async () => { document.getElementById("coupon-entry-toggle").click(); await flush(); }); await act(async () => { const input = document.getElementById("cart-coupon"); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, code); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); }); await act(async () => { container.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); await flush(); }); }
function item(price) { const presentation = { etiqueta: "unidad", precio: price, measurementKind: "unit", amountValue: 1, amountUnit: "unit", amountInBaseUnits: 1 }; return { product: { id: "test", nombre: "Canasta de prueba", categoria: "QA", presentaciones: [presentation], imagen: "", descripcion: "", destacado: false }, presentation, quantity: 1 }; }
async function seed(price, key = "tierra-sana-cart") { await act(async () => { localStorage.setItem(key, JSON.stringify([item(price)])); window.dispatchEvent(new Event("storage")); await flush(); }); }
async function resumeTime(value) { now = Date.parse(value); await act(async () => { window.dispatchEvent(new Event("focus")); await flush(); }); }

(async () => {
  await mount(); document.getElementById("open-cart").focus(); await click("Abrir");
  assert.match(container.textContent, /Tu carrito está vacío/);
  assert.ok([...container.querySelectorAll("button")].find((b) => b.textContent.trim() === "Enviar pedido por WhatsApp").disabled);
  assert.equal(document.activeElement.getAttribute("aria-label"), "Cerrar carrito");
  assert.equal(document.getElementById("cart-coupon"), null, "coupon entry starts collapsed");
  await click("¿Tenés un cupón de descuento?");
  assert.equal(document.activeElement.id, "cart-coupon", "opening entry focuses the labeled input");
  await click("Ocultar campo"); assert.equal(document.getElementById("cart-coupon"), null);
  const conditionsToggle = container.querySelector('[aria-controls="coupon-conditions"]');
  assert.ok(document.getElementById("coupon-conditions").hidden, "terms start collapsed");
  await act(async () => { conditionsToggle.click(); await flush(); });
  assert.equal(conditionsToggle.getAttribute("aria-expanded"), "true");
  assert.ok(!document.getElementById("coupon-conditions").hidden);
  await act(async () => { conditionsToggle.click(); await flush(); });
  assert.ok(document.getElementById("coupon-conditions").hidden);
  await click("Seguir comprando"); assert.equal(cart.isOpen, false);
  assert.equal(document.activeElement.id, "open-cart", "closing restores the originating control");
  await unmount();
  await seed(35000); await mount({ promotion: { ...NOVEMBER_PROMOTION, commercialApproved: false } }); await click("Abrir"); await apply("TIERRASANA10");
  assert.match(container.textContent, /todavía no está habilitada/); assert.equal(cart.quote.discountCents, 0);
  await unmount();
  dom.reconfigure({ url: "https://qa.example.test/catalogo" }); popupTimer = undefined; popupDelay = undefined;
  await mount();
  assert.equal(popupTimer, undefined, "catalog navigation does not trigger the coupon popup");
  await unmount(); dom.reconfigure({ url: "https://qa.example.test/" });
  await mount();
  assert.equal(popupDelay, 1000, "Home starts coupon popup after one second without opening cart");
  assert.ok(!container.querySelector("dialog").open);
  await unmount();
  await mount();
  assert.equal(popupDelay, 1000, "returning to Home uses the same one-second delay");
  await click("Abrir");
  await apply("inexistente"); assert.match(container.textContent, /no existe/);
  await apply(" tierrasana10 "); assert.equal(cart.quote.discountCents, 350000); assert.match(container.textContent, /10% OFF aplicado/);
  assert.equal(document.getElementById("cart-coupon"), null, "successful apply collapses the entry field");
  assert.equal(document.activeElement.id, "coupon-entry-toggle", "applying restores focus to the entry toggle");
  assert.equal(container.querySelector("progress"), null, "applied discount has no redundant progress block");
  await apply("TIERRASANA10"); assert.equal(cart.quote.discountCents, 350000, "no duplicate discount");
  await act(async () => cart.closeCart()); await click("Abrir"); assert.equal(cart.quote.totalCents, 3150000);
  await unmount(); await mount(); await click("Abrir");
  assert.equal(cart.couponCode, "TIERRASANA10", "remount/navigation restores coupon");
  assert.equal(cart.quote.discountCents, 350000);
  await seed(19000); assert.equal(cart.quote.discountCents, 0); assert.match(container.textContent, /para superar/);
  await seed(30000); assert.equal(cart.quote.discountCents, 0); assert.match(container.textContent, /falta.*1.*para superar/);
  await seed(30001); assert.equal(cart.quote.discountCents, 300010); assert.equal(cart.quote.totalCents, 2700090);
  await seed(40000); assert.equal(cart.quote.discountCents, 400000);
  const frozen = JSON.stringify(cart.items[0].presentation);
  await clickLabel("Sumar Canasta de prueba"); assert.equal(cart.quote.discountCents, 800000);
  assert.ok(container.querySelector('[aria-label="2 productos"]'), "header count follows quantity controls");
  await clickLabel("Restar Canasta de prueba"); assert.equal(JSON.stringify(cart.items[0].presentation), frozen);
  await clickLabel("Quitar Canasta de prueba unidad"); assert.equal(cart.quote.discountCents, 0);
  const drawer = container.querySelector("aside");
  const controls = [...drawer.querySelectorAll('button:not([disabled]), input, a[href], [tabindex="0"]')];
  controls.at(-1).focus(); document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  assert.equal(document.activeElement, controls[0], "Tab wraps within the cart");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
  assert.equal(document.activeElement, controls.at(-1), "Shift+Tab wraps within the cart");
  await act(async () => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); await flush(); });
  assert.equal(cart.isOpen, false, "Escape closes the redesigned cart");
  await seed(35000); await click("Abrir"); await click("Enviar pedido por WhatsApp");
  const message = new URL(openedUrl).searchParams.get("text");
  assert.match(message, /Subtotal:.*35\.000/); assert.match(message, /Descuento 10%:.*3\.500/); assert.match(message, /31\.500/);
  assert.equal(cart.items.length, 0, "baseline clears cart on WhatsApp intent");
  assert.ok(window.dataLayer.some((x) => x.event === "whatsapp_order_intent"));
  assert.ok(!window.dataLayer.some((x) => x.event === "purchase"));
  await seed(35000); await click("Abrir"); await resumeTime("2026-12-01T03:00:00Z");
  assert.equal(cart.quote.discountCents, 0); assert.match(container.textContent, /venció/);
  await click("Enviar pedido por WhatsApp"); assert.ok(!new URL(openedUrl).searchParams.get("text").includes("Cupón:"));
  await resumeTime("2026-10-23T02:59:59.999Z"); assert.equal(cart.quote.status, "upcoming");
  await resumeTime("2026-10-23T03:00:00Z"); assert.equal(cart.quote.status, "minimum");
  await seed(35000); await click("Abrir"); await click("Quitar cupón"); assert.equal(cart.quote.discountCents, 0);
  await act(async () => cart.closeCart());
  assert.ok(!container.querySelector("dialog").open, "popup is delayed");
  await act(async () => { popupTimer(); await flush(); }); assert.ok(container.querySelector("dialog").open);
  const modal = container.querySelector("dialog"); assert.equal(modal.getAttribute("aria-labelledby"), "promotion-title");
  assert.match(modal.textContent, /TIERRASANA10/); assert.match(modal.textContent, /Válido hasta el 30\/11/); assert.doesNotMatch(modal.textContent, /Del 1|23\/10|NOVIEMBRE10/);
  await click("Aplicar al carrito"); assert.equal(cart.isOpen, true); assert.equal(cart.quote.discountCents, 350000);
  await act(async () => cart.closeCart()); await act(async () => { popupTimer(); await flush(); }); assert.ok(!modal.open, "dismissed during session");
  await unmount(); await mount(); await act(async () => { popupTimer(); await flush(); }); assert.ok(!container.querySelector("dialog").open, "dismissal survives navigation");
  await unmount();
  const publicCart = localStorage.getItem("tierra-sana-cart");
  const publicCoupon = localStorage.getItem("tierra-sana-coupon-v1-public");
  await mount({ promotion: approved, previewNow: Date.parse("2026-11-15T12:00:00-03:00") });
  assert.equal(cart.items.length, 0, "preview isolates fixture cart");
  await seed(40000, "tierra-sana-cart-preview"); await click("Abrir"); await apply("TIERRASANA10");
  openedUrl = null; await click("Enviar pedido por WhatsApp"); assert.equal(openedUrl, null);
  assert.match(container.querySelector("textarea").value, /36\.000/);
  assert.equal(localStorage.getItem("tierra-sana-cart"), publicCart);
  assert.equal(localStorage.getItem("tierra-sana-coupon-v1-public"), publicCoupon);
  await unmount(); await mount({ promotion: approved, previewNow: Date.parse("2026-11-15T12:00:00-03:00") });
  assert.equal(cart.quote.discountCents, 400000, "preview reload restores state");
  await unmount(); dom.window.close();
  console.log("PASS: real React DOM coupon flow, thresholds, quantity/removal, persistence, date boundaries, modal wiring, WhatsApp parity, event semantics, preview isolation.");
  console.log("LIMIT: jsdom has no layout engine; 320/390/desktop visuals and native-dialog focus/Escape behavior require browser QA.");
})().catch(async (error) => { console.error(error); process.exitCode = 1; if (reactRoot) await act(async () => reactRoot.unmount()); dom.window.close(); });
