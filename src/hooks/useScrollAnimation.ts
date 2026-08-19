'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useScrollAnimation(deps: any[] = [], options: ScrollAnimationOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -50px 0px' } = options;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    const el = ref.current;
    if (el) {
      const animateElements = el.querySelectorAll('.scroll-animate');
      animateElements.forEach((child) => {
        if (!child.classList.contains('animate-in')) {
          observer.observe(child);
        }
      });
      // Also observe the container itself if it has the class
      if (el.classList.contains('scroll-animate') && !el.classList.contains('animate-in')) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin, ...deps]);

  return ref;
}

export function useScrollAnimationCallback() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  const observe = useCallback((el: HTMLElement | null) => {
    if (el && observerRef.current) {
      observerRef.current.observe(el);
    }
  }, []);

  return observe;
}
