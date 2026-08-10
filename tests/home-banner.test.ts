import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveHomeBannerPaths,
  resolveHomeBannerSavePaths,
} from "../lib/home-banner.ts";

const fallbackDesktopPath = "/hero-optimized/banner-home.webp";

test("public home uses independent desktop and mobile banners", () => {
  assert.deepEqual(
    resolveHomeBannerPaths({
      desktopPath: "/desktop.webp",
      mobilePath: "/mobile.webp",
      fallbackDesktopPath,
    }),
    {
      desktopPath: "/desktop.webp",
      mobilePath: "/mobile.webp",
    },
  );
});

test("public home falls back from mobile to desktop", () => {
  assert.deepEqual(
    resolveHomeBannerPaths({
      desktopPath: "/desktop.webp",
      mobilePath: null,
      fallbackDesktopPath,
    }),
    {
      desktopPath: "/desktop.webp",
      mobilePath: "/desktop.webp",
    },
  );
});

test("replacing only desktop preserves the existing mobile banner", () => {
  assert.deepEqual(
    resolveHomeBannerSavePaths({
      existingDesktopPath: "/desktop-old.webp",
      existingMobilePath: "/mobile.webp",
      uploadedDesktopPath: "/desktop-new.webp",
      fallbackDesktopPath,
    }),
    {
      desktopPath: "/desktop-new.webp",
      mobilePath: "/mobile.webp",
    },
  );
});

test("replacing only mobile preserves the existing desktop banner", () => {
  assert.deepEqual(
    resolveHomeBannerSavePaths({
      existingDesktopPath: "/desktop.webp",
      existingMobilePath: "/mobile-old.webp",
      uploadedMobilePath: "/mobile-new.webp",
      fallbackDesktopPath,
    }),
    {
      desktopPath: "/desktop.webp",
      mobilePath: "/mobile-new.webp",
    },
  );
});

test("saving without uploads preserves both existing banners", () => {
  assert.deepEqual(
    resolveHomeBannerSavePaths({
      existingDesktopPath: "/desktop.webp",
      existingMobilePath: "/mobile.webp",
      fallbackDesktopPath,
    }),
    {
      desktopPath: "/desktop.webp",
      mobilePath: "/mobile.webp",
    },
  );
});

test("a legacy home without paths uses the bundled desktop for both viewports", () => {
  assert.deepEqual(
    resolveHomeBannerPaths({
      desktopPath: null,
      mobilePath: null,
      fallbackDesktopPath,
    }),
    {
      desktopPath: fallbackDesktopPath,
      mobilePath: fallbackDesktopPath,
    },
  );
});
