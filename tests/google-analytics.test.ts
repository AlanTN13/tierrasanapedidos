import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { GOOGLE_ANALYTICS_BOOTSTRAP, GOOGLE_ANALYTICS_ID } from "../lib/google-analytics.ts";

function fixture(hostname: string, pathname = "/") {
  const scripts: Array<{ async?: boolean; src?: string }> = [];
  const window = { location: { hostname, pathname }, dataLayer: [] as unknown[][] };
  const context = { window, document: {
    createElement: () => ({}),
    head: { appendChild: (script: { async?: boolean; src?: string }) => scripts.push(script) },
  } };
  return { window, scripts, run: () => runInNewContext(GOOGLE_ANALYTICS_BOOTSTRAP, context) };
}

test("inicializa una vez en ambos hosts públicos y usa el flujo correcto", () => {
  for (const host of ["www.tierrasanadietetica.com", "tierrasanadietetica.com"]) {
    const f = fixture(host, "/producto/semillas-de-amaranto");
    f.run(); f.run();
    assert.equal(f.scripts.length, 1);
    assert.equal(f.scripts[0].async, true);
    assert.equal(f.scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`);
    assert.deepEqual(Array.from(f.window.dataLayer[1]), ["config", GOOGLE_ANALYTICS_ID]);
    assert.equal(f.window.dataLayer.length, 2);
  }
});

test("no carga ni crea eventos en preview, localhost o dominios parecidos", () => {
  for (const host of ["localhost", "127.0.0.1", "tierrasanapedidos.vercel.app", "tierrasanadietetica.com.evil.test"]) {
    const f = fixture(host); f.run();
    assert.equal(f.scripts.length, 0);
    assert.equal(f.window.dataLayer.length, 0);
  }
});

test("no inicializa en administración o login", () => {
  for (const path of ["/admin", "/admin/login", "/admin/productos"]) {
    const f = fixture("www.tierrasanadietetica.com", path); f.run();
    assert.equal(f.scripts.length, 0);
    assert.equal(f.window.dataLayer.length, 0);
  }
});
