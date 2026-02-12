import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

/**
 * useAnimeOnScroll – triggers anime.js animations when elements scroll into view.
 * Pass a CSS selector; elements get class "anime-visible" + animate in via anime.js.
 *
 * @param {string} selector - CSS selector for target elements
 * @param {object} animeProps - anime.js property overrides (translateY, opacity, etc.)
 * @param {object} options - { threshold, rootMargin, staggerDelay }
 */
const useAnimeOnScroll = (
  selector,
  animeProps = {},
  options = {}
) => {
  const hasRun = useRef(new Set());

  useEffect(() => {
    const {
      threshold = 0.15,
      rootMargin = '0px 0px -40px 0px',
      staggerDelay = 80,
    } = options;

    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    // set initial hidden state via inline style (avoids flash)
    elements.forEach((el) => {
      if (!el.dataset.animeInit) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.dataset.animeInit = 'true';
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const toAnimate = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun.current.has(entry.target)) {
            hasRun.current.add(entry.target);
            toAnimate.push(entry.target);
            observer.unobserve(entry.target);
          }
        });

        if (toAnimate.length > 0) {
          animate(toAnimate, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 700,
            ease: 'outQuart',
            delay: stagger(staggerDelay),
            ...animeProps,
          });
        }
      },
      { threshold, rootMargin }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector]);
};

export default useAnimeOnScroll;
