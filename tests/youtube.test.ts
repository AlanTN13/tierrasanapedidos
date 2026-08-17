import assert from "node:assert/strict";
import test from "node:test";
import {
  getYouTubeEmbedUrl,
  getYouTubeVideoId,
  normalizeOptionalYouTubeUrl,
} from "../lib/youtube.ts";

const VIDEO_ID = "dQw4w9WgXcQ";

test("acepta una URL válida de YouTube Shorts", () => {
  assert.equal(
    getYouTubeVideoId(`https://www.youtube.com/shorts/${VIDEO_ID}`),
    VIDEO_ID,
  );
});

test("acepta una URL válida de YouTube watch", () => {
  assert.equal(
    getYouTubeVideoId(`https://youtube.com/watch?v=${VIDEO_ID}`),
    VIDEO_ID,
  );
});

test("acepta una URL válida de youtu.be", () => {
  assert.equal(
    getYouTubeVideoId(`https://youtu.be/${VIDEO_ID}`),
    VIDEO_ID,
  );
});

test("rechaza una URL externa aunque contenga un ID de video", () => {
  assert.equal(
    getYouTubeVideoId(`https://example.com/watch?v=${VIDEO_ID}`),
    null,
  );
  assert.throws(
    () => normalizeOptionalYouTubeUrl(`https://example.com/watch?v=${VIDEO_ID}`),
    /YouTube no es válida/,
  );
});

test("normaliza la URL y genera un embed sin cookies para el estado inicial", () => {
  assert.equal(
    normalizeOptionalYouTubeUrl(`https://youtu.be/${VIDEO_ID}`),
    `https://www.youtube.com/watch?v=${VIDEO_ID}`,
  );
  assert.equal(
    getYouTubeEmbedUrl(`https://www.youtube.com/shorts/${VIDEO_ID}`),
    `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&playsinline=1`,
  );
});

test("activa reproducción inline sólo después del toque del usuario", () => {
  assert.equal(
    getYouTubeEmbedUrl(`https://www.youtube.com/shorts/${VIDEO_ID}`, {
      autoplay: true,
    }),
    `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&playsinline=1&autoplay=1`,
  );
});
