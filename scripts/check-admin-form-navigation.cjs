// Executes the real submit handler captured while React renders AdminForm.
// No browser, Supabase, network, or business-data writes. Not a DOM/E2E test.
/* eslint-disable @typescript-eslint/no-require-imports -- CJS loader hooks are required to execute the real TSX handler without a bundler. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const frameworkErrors = [];
let focusedErrors = 0;
global.reportError = (error) => frameworkErrors.push(error);
global.requestAnimationFrame = (callback) => { focusedErrors++; callback(); return 0; };
const NativeFormData = global.FormData;
global.FormData = class extends NativeFormData {
  constructor(source) { super(); if (source) for (const [key, value] of source) this.append(key, value); }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
const ts = require(path.join(root, 'node_modules/typescript'));
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022,
  } }).outputText, filename);
};
const React = require(path.join(root, 'node_modules/react'));
const { renderToStaticMarkup } = require(path.join(root, 'node_modules/react-dom/server'));
const runtime = require(path.join(root, 'node_modules/react/jsx-runtime'));
const { getRedirectError } = require(path.join(root, 'node_modules/next/dist/client/components/redirect'));
let submit;
for (const key of ['jsx', 'jsxs']) {
  const original = runtime[key];
  runtime[key] = (type, props, ...rest) => {
    if (type === 'form') submit = props.onSubmit;
    return original(type, props, ...rest);
  };
}
const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'components/admin/admin-form.tsx');
const component = new Module(sourcePath, module);
component.filename = sourcePath;
component.paths = Module._nodeModulePaths(root);
component._compile(ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022,
} }).outputText, sourcePath);
const { AdminForm } = component.exports;
const data = new NativeFormData();
data.set('bannerLink-legacy', '/catalogo');
const event = () => ({ preventDefault() {}, currentTarget: data });
const flush = () => new Promise((resolve) => setImmediate(resolve));
function prepare(action) {
  frameworkErrors.length = 0; focusedErrors = 0;
  renderToStaticMarkup(React.createElement(AdminForm, { action }, React.createElement('input', { name: 'bannerLink-legacy', defaultValue: '/catalogo' })));
  assert.equal(typeof submit, 'function');
}

(async () => {
  const redirect = getRedirectError('/admin/home?saved=1', 'push');
  redirect.handled = true; // Matches Next's Server Action reducer.
  prepare(async (payload) => { assert.equal(payload.get('bannerLink-legacy'), '/catalogo'); throw redirect; });
  await submit(event()); await flush();
  assert.equal(focusedErrors, 0, 'a successful redirect must not display/focus a save error');
  assert.deepEqual(frameworkErrors, [redirect], 'the original control-flow signal must reach React/Next');

  prepare(async () => ({ error: 'Revisá el enlace.', field: 'bannerLink-legacy' }));
  await submit(event()); await flush();
  assert.equal(focusedErrors, 1); assert.deepEqual(frameworkErrors, []);
  prepare(async () => { throw new Error('private network error'); });
  await submit(event()); await flush();
  assert.equal(focusedErrors, 1); assert.deepEqual(frameworkErrors, []);

  let calls = 0, finish;
  prepare(async () => { calls++; await new Promise((resolve) => { finish = resolve; }); });
  const first = submit(event()); const duplicate = submit(event());
  assert.equal(calls, 1, 'double submission remains blocked');
  finish(); await first; await duplicate; await flush();
  assert.equal(focusedErrors, 0); assert.deepEqual(frameworkErrors, []);
  console.log('PASS: real AdminForm handler propagates Next redirects, keeps application/network errors recoverable, and blocks duplicate submission.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
