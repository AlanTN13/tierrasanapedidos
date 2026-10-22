"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { normalizeHomeBannerLink, type HomeBanner } from "@/lib/home-banner";
import styles from "./hero-banner-carousel.module.css";

const ROTATION_MS = 6000;
const subscribeMotion = (listener: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const readMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribeVisibility = (listener: () => void) => {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};
const readVisibility = () => document.hidden;
const serverMotion = () => true;

export function HeroBannerCarousel({ banners }: { banners: HomeBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const suppressLinkClickUntil = useRef(0);
  const reducedMotion = useSyncExternalStore(subscribeMotion, readMotion, serverMotion);
  const hidden = useSyncExternalStore(subscribeVisibility, readVisibility, serverMotion);
  const multiple = banners.length > 1;
  const active = banners.length ? index % banners.length : 0;
  const banner = banners[active];
  const stopped = paused || reducedMotion;

  useEffect(() => {
    if (!multiple || stopped || hovered || focused || hidden) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % banners.length), ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [multiple, stopped, hovered, focused, hidden, banners.length]);

  function goTo(next: number) {
    setIndex((next + banners.length) % banners.length);
    setPaused(true);
  }

  if (!banner) return null;

  const linkUrl = normalizeHomeBannerLink(banner.linkUrl);
  const image = (
    <picture key={banner.id} className={`block ${styles.image}`}>
      <source media="(min-width: 768px)" srcSet={banner.desktopPath} />
      <source media="(max-width: 767px)" srcSet={banner.mobilePath || banner.desktopPath} />
      {/* Natural proportions preserve text and artwork in uploaded banners. */}
      <img src={banner.mobilePath || banner.desktopPath} alt={banner.alt} loading="eager" fetchPriority={active === 0 ? "high" : "auto"} className="block h-auto w-full" />
    </picture>
  );

  return (
    <div
      role="region"
      aria-roledescription={multiple ? "carrusel" : undefined}
      aria-label="Banners de Tierra Sana"
      className="relative w-full overflow-hidden bg-white/55"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (!multiple) return;
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          goTo(active + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}
      onTouchStart={(event) => { suppressLinkClickUntil.current = 0; const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
      onTouchEnd={(event) => {
        if (!touch.current || !multiple) return;
        const point = event.changedTouches[0];
        const dx = point.clientX - touch.current.x;
        const dy = point.clientY - touch.current.y;
        touch.current = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          suppressLinkClickUntil.current = Date.now() + 500;
          goTo(active + (dx < 0 ? 1 : -1));
        }
      }}
      onTouchCancel={() => { touch.current = null; }}
    >
      <div aria-live={stopped || focused || hovered ? "polite" : "off"} aria-atomic="true">
        <div role="group" aria-roledescription={multiple ? "diapositiva" : undefined} aria-label={multiple ? `${active + 1} de ${banners.length}` : undefined}>
          {linkUrl ? (
            <a href={linkUrl} aria-label={banner.alt || "Abrir enlace del banner"} className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-olive" onClick={(event) => {
              if (event.detail !== 0 && Date.now() < suppressLinkClickUntil.current) {
                event.preventDefault();
              }
              suppressLinkClickUntil.current = 0;
            }}>{image}</a>
          ) : image}
        </div>
      </div>
      {multiple ? (
        <>
          <button type="button" onClick={() => goTo(active - 1)} aria-label="Banner anterior" className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-olive-dark shadow-sm focus-visible:outline-2 focus-visible:outline-olive sm:left-4">‹</button>
          <button type="button" onClick={() => goTo(active + 1)} aria-label="Banner siguiente" className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl text-olive-dark shadow-sm focus-visible:outline-2 focus-visible:outline-olive sm:right-4">›</button>
          <div className="flex flex-wrap items-center justify-center gap-1 bg-white py-1.5">
            {banners.map((item, position) => (
              <button type="button" key={item.id} onClick={() => goTo(position)} aria-label={`Ver banner ${position + 1}`} aria-current={active === position ? "true" : undefined} className="flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-olive">
                <span className={`h-2.5 rounded-full transition-all motion-reduce:transition-none ${active === position ? "w-6 bg-olive" : "w-2.5 bg-olive/30"}`} />
              </button>
            ))}
            <button type="button" onClick={() => setPaused((current) => !current)} disabled={reducedMotion} aria-label={stopped ? "Reanudar carrusel" : "Pausar carrusel"} className="ml-1 rounded-full px-3 py-2 text-xs font-semibold text-olive-dark focus-visible:outline-2 focus-visible:outline-olive disabled:opacity-50">{reducedMotion ? "Movimiento reducido" : paused ? "Reanudar" : "Pausar"}</button>
          </div>
        </>
      ) : null}
    </div>
  );
}
