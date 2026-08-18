"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  getContinuousCarouselDelta,
  normalizeLoopScrollLeft,
  shouldAnimateContinuousCarousel,
  shouldHoldContinuousCarouselPointer,
} from "@/lib/continuous-carousel";
import { getDefaultRecipeCartItems } from "@/lib/recipe-cart";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import type { HomeContent, HomeRecipeHighlight } from "@/types/home";

const COLLAPSED_CATEGORY_COUNT = 12;
const SHORTS_AUTOPLAY_SPEED_PX_PER_SECOND = 24;
const SHORTS_INTERACTION_PAUSE_MS = 4000;
const SHORTS_DRAG_THRESHOLD_PX = 8;
const SHORTS_LOOP_COPIES = ["before", "primary", "after"] as const;

export function HomeCategories({
  content,
}: {
  content: HomeContent;
}) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const hasExtraCategories =
    content.categoryCards.length > COLLAPSED_CATEGORY_COUNT;
  const visibleCategories =
    hasExtraCategories && !showAllCategories
      ? content.categoryCards.slice(0, COLLAPSED_CATEGORY_COUNT - 1)
      : content.categoryCards;

  return (
    <section
      id="categorias"
      aria-labelledby="categorias-title"
      className="container-shell pb-9 sm:pb-12"
    >
      <h2
        id="categorias-title"
        className="font-display text-2xl font-semibold text-olive-dark sm:text-3xl"
      >
        Categorías
      </h2>

      <div className="mt-4 grid grid-cols-6 items-start gap-x-1.5 gap-y-5 sm:mt-5 sm:grid-cols-7 sm:gap-x-4 lg:grid-cols-10 xl:grid-cols-13">
        {visibleCategories.map((card) => (
          <Link
            key={card.category}
            href={`/categoria/${card.slug}`}
            className="group min-w-0 text-center focus:outline-none"
            aria-label={`Ver productos de ${card.title}`}
          >
            <span className="relative mx-auto block aspect-square w-full max-w-[3.4rem] overflow-hidden rounded-full bg-olive-soft/45 shadow-[0_8px_18px_rgba(63,74,47,0.12)] ring-1 ring-olive/12 transition duration-200 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-olive sm:max-w-[5.75rem]">
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 639px) 56px, (max-width: 1023px) 92px, 110px"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </span>
            <span className="mt-2 block text-[9px] leading-[1.15] font-semibold text-olive-dark sm:text-xs sm:leading-4">
              {card.title}
            </span>
          </Link>
        ))}

        {hasExtraCategories ? (
          <button
            type="button"
            onClick={() => setShowAllCategories((current) => !current)}
            className="group min-w-0 text-center focus:outline-none"
            aria-expanded={showAllCategories}
          >
            <span className="mx-auto flex aspect-square w-full max-w-[3.4rem] items-center justify-center rounded-full border border-dashed border-olive/35 bg-white/72 text-xl font-medium text-olive-dark transition group-hover:-translate-y-0.5 group-hover:bg-olive-soft/40 group-focus-visible:ring-2 group-focus-visible:ring-olive sm:max-w-[5.75rem] sm:text-2xl">
              {showAllCategories ? "−" : "+"}
            </span>
            <span className="mt-2 block text-[9px] leading-[1.15] font-semibold text-olive-dark sm:text-xs sm:leading-4">
              {showAllCategories ? "Ver menos" : "Ver más categorías"}
            </span>
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function HomeShorts({
  content,
  onBuyIngredients,
}: {
  content: HomeContent;
  onBuyIngredients: (recipe: HomeRecipeHighlight) => void;
}) {
  const shorts = content.recipeHighlights
    .filter(
      (recipe) =>
        recipe.youtubeUrl && getYouTubeEmbedUrl(recipe.youtubeUrl),
    );
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [loopCycleWidth, setLoopCycleWidth] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const loopCycleWidthRef = useRef(0);
  const lastAnimationTimeRef = useRef<number | null>(null);
  const interactionResumeTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
    hasCapture: boolean;
  } | null>(null);
  const didDragRef = useRef(false);
  const activeRecipe =
    shorts.find((recipe) => recipe.slug === activeSlug) ?? null;
  const activeEmbedUrl = activeRecipe?.youtubeUrl
    ? getYouTubeEmbedUrl(activeRecipe.youtubeUrl, { autoplay: true })
    : null;
  const activePurchasableCount = activeRecipe
    ? getDefaultRecipeCartItems(activeRecipe.products).length
    : 0;
  const isCarouselPaused =
    isManuallyPaused ||
    isInteractionPaused ||
    isHoverPaused ||
    isPointerActive ||
    Boolean(activeSlug);

  const pauseForInteraction = useCallback(() => {
    setIsInteractionPaused(true);

    if (interactionResumeTimerRef.current) {
      clearTimeout(interactionResumeTimerRef.current);
    }

    interactionResumeTimerRef.current = setTimeout(() => {
      setIsInteractionPaused(false);
      interactionResumeTimerRef.current = null;
    }, SHORTS_INTERACTION_PAUSE_MS);
  }, [setIsInteractionPaused]);

  const normalizeCarouselPosition = useCallback(() => {
    const carousel = carouselRef.current;
    const cycleWidth = loopCycleWidthRef.current;

    if (!carousel || cycleWidth <= 0) {
      return;
    }

    const normalizedScrollLeft = normalizeLoopScrollLeft(
      carousel.scrollLeft,
      cycleWidth,
    );

    if (Math.abs(normalizedScrollLeft - carousel.scrollLeft) > 0.5) {
      carousel.scrollLeft = normalizedScrollLeft;
    }
  }, []);

  const measureCarousel = useCallback(() => {
    const carousel = carouselRef.current;

    if (!carousel || shorts.length < 2) {
      loopCycleWidthRef.current = 0;
      setLoopCycleWidth(0);
      return;
    }

    const primaryFirstCard = carousel.querySelector<HTMLElement>(
      '[data-loop-copy="primary"][data-short-index="0"]',
    );
    const afterFirstCard = carousel.querySelector<HTMLElement>(
      '[data-loop-copy="after"][data-short-index="0"]',
    );
    const nextCycleWidth =
      primaryFirstCard && afterFirstCard
        ? afterFirstCard.offsetLeft - primaryFirstCard.offsetLeft
        : 0;

    if (nextCycleWidth <= 0) {
      return;
    }

    loopCycleWidthRef.current = nextCycleWidth;
    setLoopCycleWidth(nextCycleWidth);

    const normalizedScrollLeft = normalizeLoopScrollLeft(
      carousel.scrollLeft || nextCycleWidth,
      nextCycleWidth,
    );

    if (Math.abs(normalizedScrollLeft - carousel.scrollLeft) > 0.5) {
      carousel.scrollLeft = normalizedScrollLeft;
    }
  }, [setLoopCycleWidth, shorts.length]);

  const moveCarousel = useCallback(
    (direction: -1 | 1) => {
      const carousel = carouselRef.current;
      const primaryCards = carousel?.querySelectorAll<HTMLElement>(
        '[data-loop-copy="primary"][data-short-index]',
      );

      if (!carousel || !primaryCards || primaryCards.length === 0) {
        return;
      }

      const firstCard = primaryCards[0];
      const secondCard = primaryCards[1];
      const cardStep = secondCard
        ? secondCard.offsetLeft - firstCard.offsetLeft
        : firstCard.offsetWidth;

      carousel.scrollBy({
        left: cardStep * direction,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion],
  );

  const closeModal = useCallback((restoreFocus = true) => {
    pauseForInteraction();
    setActiveSlug(null);

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        activeTriggerRef.current?.focus({ preventScroll: true });
      });
    }
  }, [pauseForInteraction, setActiveSlug]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    const measureFrame = window.requestAnimationFrame(measureCarousel);
    window.addEventListener("resize", measureCarousel);

    return () => {
      window.cancelAnimationFrame(measureFrame);
      window.removeEventListener("resize", measureCarousel);
    };
  }, [measureCarousel]);

  useEffect(() => {
    return () => {
      if (interactionResumeTimerRef.current) {
        clearTimeout(interactionResumeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldAnimateContinuousCarousel({
      itemCount: shorts.length,
      cycleWidth: loopCycleWidth,
      prefersReducedMotion,
      isPaused: isCarouselPaused,
    })) {
      lastAnimationTimeRef.current = null;
      return;
    }

    let animationFrame = 0;

    const animateCarousel = (currentTime: number) => {
      const carousel = carouselRef.current;
      const previousTime = lastAnimationTimeRef.current;
      lastAnimationTimeRef.current = currentTime;

      if (carousel && previousTime !== null) {
        carousel.scrollLeft += getContinuousCarouselDelta(
          currentTime - previousTime,
          SHORTS_AUTOPLAY_SPEED_PX_PER_SECOND,
        );
        normalizeCarouselPosition();
      }

      animationFrame = window.requestAnimationFrame(animateCarousel);
    };

    animationFrame = window.requestAnimationFrame(animateCarousel);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      lastAnimationTimeRef.current = null;
    };
  }, [
    isCarouselPaused,
    loopCycleWidth,
    normalizeCarouselPosition,
    prefersReducedMotion,
    shorts.length,
  ]);

  useEffect(() => {
    if (!activeSlug) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSlug, closeModal]);

  if (shorts.length === 0) {
    return null;
  }

  function playShort(
    recipe: HomeRecipeHighlight,
    trigger: HTMLButtonElement,
  ) {
    if (didDragRef.current) {
      return;
    }

    pauseForInteraction();
    const primaryTrigger = Array.from(
      carouselRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-loop-copy="primary"][data-short-slug]',
      ) ?? [],
    ).find((button) => button.dataset.shortSlug === recipe.slug);
    activeTriggerRef.current = primaryTrigger ?? trigger;
    setActiveSlug(recipe.slug);
  }

  function handleTrackPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const shouldHoldPointer = shouldHoldContinuousCarouselPointer(
      event.pointerType,
      event.button,
    );

    setIsPointerActive(shouldHoldPointer);
    pauseForInteraction();
    didDragRef.current = false;

    if (event.pointerType !== "mouse") {
      setIsHoverPaused(false);
    }

    if (!shouldHoldPointer) {
      dragStateRef.current = null;
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      hasCapture: false,
    };
  }

  function handleTrackPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const distance = event.clientX - dragState.startX;

    if (
      !didDragRef.current &&
      Math.abs(distance) > SHORTS_DRAG_THRESHOLD_PX
    ) {
      didDragRef.current = true;
      dragState.hasCapture = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (didDragRef.current) {
      event.preventDefault();
      event.currentTarget.scrollLeft = dragState.startScrollLeft - distance;
      normalizeCarouselPosition();
    }
  }

  function handleTrackPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    setIsPointerActive(false);
    pauseForInteraction();

    if (!dragState || dragState.pointerId !== event.pointerId) {
      window.setTimeout(() => {
        didDragRef.current = false;
      }, 0);
      return;
    }

    dragStateRef.current = null;

    if (
      dragState.hasCapture &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  }

  function handleCarouselNavigation(direction: -1 | 1) {
    pauseForInteraction();
    moveCarousel(direction);
  }

  function toggleCarouselAutoplay() {
    if (isManuallyPaused) {
      if (interactionResumeTimerRef.current) {
        clearTimeout(interactionResumeTimerRef.current);
        interactionResumeTimerRef.current = null;
      }
      setIsInteractionPaused(false);
      setIsManuallyPaused(false);
      return;
    }

    setIsManuallyPaused(true);
  }

  function buyActiveRecipe() {
    if (!activeRecipe) {
      return;
    }

    closeModal(false);
    onBuyIngredients(activeRecipe);
  }

  return (
    <section
      id="ideas"
      aria-labelledby="shorts-title"
      className="container-shell pb-12 sm:pb-16"
    >
      <div className="flex items-end justify-between gap-4">
        <h2
          id="shorts-title"
          className="font-display text-2xl font-semibold text-olive-dark sm:text-3xl"
        >
          Mirá y descubrí
        </h2>
        <Link
          href="/recetas"
          className="shrink-0 text-xs font-semibold text-olive-dark underline decoration-olive/25 underline-offset-4 hover:text-olive sm:text-sm"
        >
          Ver más recetas →
        </Link>
      </div>

      <div
        ref={carouselRef}
        role="group"
        aria-roledescription="carrusel"
        aria-label="Recetas en video"
        onScroll={normalizeCarouselPosition}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={handleTrackPointerUp}
        onPointerCancel={handleTrackPointerUp}
        onWheel={pauseForInteraction}
        onMouseEnter={() => {
          if (
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
          ) {
            setIsHoverPaused(true);
          }
        }}
        onMouseLeave={() => {
          setIsHoverPaused(false);
          pauseForInteraction();
        }}
        className="mt-4 flex max-w-full cursor-grab gap-2 overflow-x-auto overscroll-x-contain select-none active:cursor-grabbing sm:mt-5 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SHORTS_LOOP_COPIES.flatMap((copy) =>
          shorts.map((recipe, index) => {
            const isPrimaryCopy = copy === "primary";

            return (
              <button
                key={`${copy}-${recipe.slug}`}
                data-loop-copy={copy}
                data-short-index={index}
                data-short-slug={recipe.slug}
                type="button"
                tabIndex={isPrimaryCopy ? 0 : -1}
                aria-hidden={isPrimaryCopy ? undefined : true}
                onClick={(event) => playShort(recipe, event.currentTarget)}
                onFocus={isPrimaryCopy ? pauseForInteraction : undefined}
                onKeyDown={
                  isPrimaryCopy
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          playShort(recipe, event.currentTarget);
                        }
                      }
                    : undefined
                }
                aria-label={
                  isPrimaryCopy ? `Reproducir ${recipe.title}` : undefined
                }
                aria-pressed={
                  isPrimaryCopy ? recipe.slug === activeSlug : undefined
                }
                className="group flex basis-[47%] shrink-0 flex-col overflow-hidden rounded-[1.2rem] bg-white text-left shadow-[0_10px_26px_rgba(47,51,40,0.11)] ring-1 ring-olive/8 transition select-none hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(47,51,40,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 sm:rounded-[1.45rem] lg:basis-[240px] xl:basis-[260px]"
              >
                <span className="relative block aspect-[4/5] w-full overflow-hidden bg-olive-soft/25">
                  <Image
                    src={recipe.heroImage}
                    alt=""
                    fill
                    draggable={false}
                    sizes="(max-width: 1023px) 50vw, 260px"
                    className="object-cover transition duration-500 group-hover:scale-[1.035]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/94 text-olive-dark shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition group-hover:scale-105 sm:h-13 sm:w-13">
                      <PlayIcon />
                    </span>
                  </span>
                </span>
                <span className="line-clamp-2 min-h-[3.75rem] px-3 py-3 text-[13px] leading-[1.15rem] font-semibold text-olive-dark sm:min-h-[4.25rem] sm:px-4 sm:py-3.5 sm:text-base sm:leading-5">
                  {recipe.title}
                </span>
              </button>
            );
          }),
        )}
      </div>

      {shorts.length > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3 pr-16 sm:mt-4 sm:pr-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleCarouselNavigation(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-olive/12 bg-white text-olive-dark shadow-sm hover:bg-olive-soft/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/35"
              aria-label="Mover carrusel a la izquierda"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => handleCarouselNavigation(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-olive/12 bg-white text-olive-dark shadow-sm hover:bg-olive-soft/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/35"
              aria-label="Mover carrusel a la derecha"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          {prefersReducedMotion ? (
            <span className="text-[10px] font-semibold tracking-wide text-foreground/52 uppercase">
              Movimiento reducido
            </span>
          ) : (
            <button
              type="button"
              onClick={toggleCarouselAutoplay}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-olive/12 bg-white text-olive-dark shadow-sm hover:bg-olive-soft/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive/35"
              aria-label={
                isManuallyPaused
                  ? "Reanudar carrusel automático"
                  : "Pausar carrusel automático"
              }
              title={isManuallyPaused ? "Reanudar" : "Pausar"}
            >
              {isManuallyPaused ? <CarouselPlayIcon /> : <PauseIcon />}
            </button>
          )}
        </div>
      ) : null}

      {activeRecipe && activeEmbedUrl ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-5">
          <button
            type="button"
            onClick={() => closeModal()}
            className="absolute inset-0 bg-[#20251b]/68 backdrop-blur-[3px]"
            aria-label={`Cerrar video de ${activeRecipe.title}`}
          />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`short-modal-title-${activeRecipe.slug}`}
            className="relative z-10 max-h-[calc(100dvh-1rem)] w-full max-w-[20rem] overflow-y-auto rounded-[1.7rem] bg-[#fffdf9] shadow-[0_28px_90px_rgba(20,24,17,0.42)] ring-1 ring-white/55 sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-[21rem]"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => closeModal()}
              className="absolute top-3 right-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/94 text-2xl leading-none font-medium text-olive-dark shadow-[0_8px_22px_rgba(20,24,17,0.24)] hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-olive-dark"
              aria-label={`Cerrar video de ${activeRecipe.title}`}
            >
              <span aria-hidden="true">×</span>
            </button>

            <div className="relative aspect-[9/16] bg-black">
              <iframe
                src={activeEmbedUrl}
                title={`Video: ${activeRecipe.title}`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="p-4 sm:p-5">
              <h3
                id={`short-modal-title-${activeRecipe.slug}`}
                className="text-lg leading-tight font-semibold text-olive-dark sm:text-xl"
              >
                {activeRecipe.title}
              </h3>
              <div className="mt-4 grid gap-2.5">
                <button
                  type="button"
                  disabled={activePurchasableCount === 0}
                  onClick={buyActiveRecipe}
                  className="w-full rounded-full bg-olive px-5 py-3 text-sm font-semibold text-white hover:bg-olive-dark focus:outline-none focus:ring-2 focus:ring-olive/35 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Agregar ingredientes
                </button>
                <Link
                  href={`/recetas/${activeRecipe.slug}`}
                  onClick={() => closeModal(false)}
                  className="text-center text-sm font-semibold text-olive-dark hover:text-olive"
                >
                  Ver receta →
                </Link>
              </div>
              {activePurchasableCount === 0 ? (
                <p className="mt-3 text-center text-xs text-foreground/58">
                  Esta receta todavía no tiene productos comprables asociados.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="ml-0.5 h-6 w-6"
      fill="currentColor"
    >
      <path d="M8.4 5.6v12.8L18 12 8.4 5.6Z" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${direction === "left" ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" />
    </svg>
  );
}

function CarouselPlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M8.5 5.8v12.4L18 12 8.5 5.8Z" />
    </svg>
  );
}
