import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("serves source images without the metered Vercel optimizer", () => {
  const config = fs.readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");

  assert.match(config, /images:\s*\{[\s\S]*?unoptimized:\s*true/);
});

test("keeps independent source URLs for desktop and mobile home banners", () => {
  const hero = fs.readFileSync(new URL("../components/hero-banner-carousel.tsx", import.meta.url), "utf8");

  assert.match(hero, /srcSet=\{banner\.desktopPath\}/);
  assert.match(hero, /srcSet=\{banner\.mobilePath \|\| banner\.desktopPath\}/);
  assert.match(hero, /src=\{banner\.mobilePath \|\| banner\.desktopPath\}/);
});
