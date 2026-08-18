import assert from "node:assert/strict";
import test from "node:test";
import {
  getContinuousCarouselDelta,
  normalizeLoopScrollLeft,
  shouldAnimateContinuousCarousel,
  shouldHoldContinuousCarouselPointer,
} from "../lib/continuous-carousel.ts";

test("sólo anima cuando hay loop, movimiento permitido y ninguna pausa", () => {
  const readyState = {
    itemCount: 3,
    cycleWidth: 700,
    prefersReducedMotion: false,
    isPaused: false,
  };

  assert.equal(shouldAnimateContinuousCarousel(readyState), true);
  assert.equal(
    shouldAnimateContinuousCarousel({
      ...readyState,
      prefersReducedMotion: true,
    }),
    false,
  );
  assert.equal(
    shouldAnimateContinuousCarousel({ ...readyState, isPaused: true }),
    false,
  );
  assert.equal(
    shouldAnimateContinuousCarousel({ ...readyState, itemCount: 1 }),
    false,
  );
});

test("sólo mantiene la pausa activa durante un drag real de mouse", () => {
  assert.equal(shouldHoldContinuousCarouselPointer("mouse", 0), true);
  assert.equal(shouldHoldContinuousCarouselPointer("mouse", 1), false);
  assert.equal(shouldHoldContinuousCarouselPointer("touch", 0), false);
  assert.equal(shouldHoldContinuousCarouselPointer("pen", 0), false);
});

test("calcula un avance continuo proporcional al tiempo", () => {
  assert.equal(getContinuousCarouselDelta(16, 15), 0.24);
  assert.equal(getContinuousCarouselDelta(40, 15), 0.6);
});

test("limita frames largos para evitar saltos al volver a la pestaña", () => {
  assert.equal(getContinuousCarouselDelta(1000, 15), 0.96);
});

test("no avanza con tiempo o velocidad inválidos", () => {
  assert.equal(getContinuousCarouselDelta(0, 15), 0);
  assert.equal(getContinuousCarouselDelta(16, 0), 0);
  assert.equal(getContinuousCarouselDelta(Number.NaN, 15), 0);
});

test("mantiene la posición dentro de la copia central del loop", () => {
  assert.equal(normalizeLoopScrollLeft(1000, 1000), 1000);
  assert.equal(normalizeLoopScrollLeft(1499, 1000), 1499);
});

test("normaliza ambos extremos sin cambiar la posición visual", () => {
  assert.equal(normalizeLoopScrollLeft(499, 1000), 1499);
  assert.equal(normalizeLoopScrollLeft(1500, 1000), 500);
  assert.equal(normalizeLoopScrollLeft(2600, 1000), 600);
});

test("ignora un ancho de ciclo inválido", () => {
  assert.equal(normalizeLoopScrollLeft(250, 0), 250);
  assert.equal(normalizeLoopScrollLeft(250, Number.NaN), 250);
});
