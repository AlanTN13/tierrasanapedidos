const MAX_ANIMATION_FRAME_MS = 64;

export function shouldAnimateContinuousCarousel({
  itemCount,
  cycleWidth,
  prefersReducedMotion,
  isPaused,
}: {
  itemCount: number;
  cycleWidth: number;
  prefersReducedMotion: boolean;
  isPaused: boolean;
}) {
  return (
    itemCount >= 2 &&
    cycleWidth > 0 &&
    !prefersReducedMotion &&
    !isPaused
  );
}

export function getContinuousCarouselDelta(
  elapsedMs: number,
  pixelsPerSecond: number,
) {
  if (
    !Number.isFinite(elapsedMs) ||
    !Number.isFinite(pixelsPerSecond) ||
    elapsedMs <= 0 ||
    pixelsPerSecond <= 0
  ) {
    return 0;
  }

  return (
    (Math.min(elapsedMs, MAX_ANIMATION_FRAME_MS) / 1000) * pixelsPerSecond
  );
}

export function normalizeLoopScrollLeft(
  scrollLeft: number,
  cycleWidth: number,
) {
  if (
    !Number.isFinite(scrollLeft) ||
    !Number.isFinite(cycleWidth) ||
    cycleWidth <= 0
  ) {
    return scrollLeft;
  }

  const lowerBoundary = cycleWidth * 0.5;
  const upperBoundary = cycleWidth * 1.5;
  let normalizedScrollLeft = scrollLeft;

  while (normalizedScrollLeft < lowerBoundary) {
    normalizedScrollLeft += cycleWidth;
  }

  while (normalizedScrollLeft >= upperBoundary) {
    normalizedScrollLeft -= cycleWidth;
  }

  return normalizedScrollLeft;
}
