import assert from "node:assert/strict";
import test from "node:test";
import { MAX_BANNER_UPLOAD_BYTES, resolveHomeBanners, type HomeBanner } from "../lib/home-banner.ts";
import { saveHomeBannerCollection } from "../lib/home-banner-save.ts";

const old: HomeBanner = { id: "legacy", desktopPath: "/old.webp", mobilePath: "/mobile.webp", alt: "Anterior" };
const image = () => new File(["fake image"], "banner.webp", { type: "image/webp" });
function form(ids: string[]) {
  const data = new FormData();
  ids.forEach((id) => data.append("bannerId", id));
  return data;
}

test("legacy, empty and malformed values preserve the existing banner", () => {
  for (const value of [null, [], {}, [{ desktopPath: "javascript:bad" }]]) assert.deepEqual(resolveHomeBanners(value, old), [old]);
});

test("public banners keep order, cap at four, reject duplicate ids and unsafe paths", () => {
  const banners = Array.from({ length: 5 }, (_, i) => ({ ...old, id: `b-${i}` }));
  assert.deepEqual(resolveHomeBanners([banners[0], banners[0], { ...old, id: "bad", desktopPath: "//evil.test/x" }, ...banners.slice(1)], old), banners.slice(0, 4));
});

test("saving four images preserves supplied order and uses one persistence operation", async () => {
  const data = form(["four", "two", "one", "three"]);
  for (const id of data.getAll("bannerId")) data.set(`bannerDesktopFile-${id}`, image());
  const uploads: string[] = [];
  let persisted: HomeBanner[] = [];
  await saveHomeBannerCollection(data, [], {
    upload: async (_file, id) => { uploads.push(id); return `/${id}.webp`; },
    persist: async (banners) => { persisted = banners; },
  });
  assert.deepEqual(uploads, ["four", "two", "one", "three"]);
  assert.deepEqual(persisted.map((banner) => banner.id), uploads);
  assert.ok(persisted.every((banner) => banner.mobilePath === null));
});

test("zero, five and duplicate banners are rejected before any side effects", async () => {
  for (const ids of [[], ["a", "b", "c", "d", "e"], ["legacy", "legacy"]]) {
    let effects = 0;
    await assert.rejects(saveHomeBannerCollection(form(ids), [old], {
      upload: async () => { effects++; return "/bad.webp"; }, persist: async () => { effects++; },
    }), /entre 1 y 4/);
    assert.equal(effects, 0);
  }
});

test("all slides are validated before the first upload", async () => {
  const data = form(["first", "missing"]);
  data.set("bannerDesktopFile-first", image());
  let uploaded = false;
  await assert.rejects(saveHomeBannerCollection(data, [], { upload: async () => { uploaded = true; return "/new.webp"; }, persist: async () => assert.fail("must not persist") }), /imagen para computadora/);
  assert.equal(uploaded, false);
});

test("reordering/removing keeps authoritative paths; hidden path tampering is ignored", async () => {
  const second = { ...old, id: "second", desktopPath: "/second.webp" };
  const data = form(["second", "legacy"]);
  data.set("existingHeroBannerPath", "/injected.webp");
  const result = await saveHomeBannerCollection(data, [old, second], { upload: async () => assert.fail("must not upload"), persist: async () => {} });
  assert.deepEqual(result.map((b) => b.desktopPath), ["/second.webp", "/old.webp"]);
  assert.equal((await saveHomeBannerCollection(form(["legacy"]), [old, second], { upload: async () => assert.fail(), persist: async () => {} })).length, 1);
});

test("desktop-only replacement preserves mobile; explicit removal falls back to desktop", async () => {
  const data = form(["legacy"]);
  data.set("bannerDesktopFile-legacy", image());
  const deps = { upload: async () => "/new.webp", persist: async () => {} };
  let saved = await saveHomeBannerCollection(data, [old], deps);
  assert.equal(saved[0].desktopPath, "/new.webp");
  assert.equal(saved[0].mobilePath, "/mobile.webp");
  data.set("removeBannerMobile-legacy", "on");
  saved = await saveHomeBannerCollection(data, [old], deps);
  assert.equal(saved[0].mobilePath, null);
});

test("mobile-only replacement preserves desktop and overrides the remove checkbox", async () => {
  const data = form(["legacy"]);
  data.set("bannerMobileFile-legacy", image());
  data.set("removeBannerMobile-legacy", "on");
  const [saved] = await saveHomeBannerCollection(data, [old], { upload: async () => "/mobile-new.webp", persist: async () => {} });
  assert.equal(saved.desktopPath, "/old.webp");
  assert.equal(saved.mobilePath, "/mobile-new.webp");
});

test("unsupported or oversized files never upload", async () => {
  for (const file of [new File(["bad"], "bad.pdf", { type: "application/pdf" }), new File([new Uint8Array(MAX_BANNER_UPLOAD_BYTES + 1)], "large.webp", { type: "image/webp" })]) {
    const data = form(["legacy"]);
    data.set("bannerDesktopFile-legacy", file);
    await assert.rejects(saveHomeBannerCollection(data, [old], { upload: async () => assert.fail("must not upload"), persist: async () => assert.fail("must not persist") }), /imágenes|4 MB/);
  }
});

test("upload or persistence failures leave the existing collection unchanged", async () => {
  const before = structuredClone(old);
  const data = form(["legacy"]);
  data.set("bannerDesktopFile-legacy", image());
  await assert.rejects(saveHomeBannerCollection(data, [old], { upload: async () => { throw Error("offline"); }, persist: async () => assert.fail("must not persist") }), /offline/);
  await assert.rejects(saveHomeBannerCollection(data, [old], { upload: async () => "/unused.webp", persist: async () => { throw Error("database unavailable"); } }), /database unavailable/);
  assert.deepEqual(old, before);
});
