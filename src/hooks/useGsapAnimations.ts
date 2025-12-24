'use client'

import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'

/**
 * Hook for animating dashboard page elements
 */
export function useDashboardAnimation(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const header = container.querySelector('.page-header')
    const stats = container.querySelectorAll('.stat-card')
    const cards = container.querySelectorAll('.action-card')
    const alert = container.querySelector('.alert-card')

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

    // Set initial state
    gsap.set([header, ...stats, ...cards, alert].filter(Boolean), {
      opacity: 0,
      y: 20
    })

    // Animate header
    if (header) {
      tl.to(header, { opacity: 1, y: 0, duration: 0.5 })
    }

    // Animate stats with stagger
    if (stats.length) {
      tl.to(stats, {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.1,
        duration: 0.5
      }, "-=0.3")
    }

    // Animate alert
    if (alert) {
      tl.to(alert, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
    }

    // Animate action cards
    if (cards.length) {
      tl.to(cards, {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.4
      }, "-=0.2")
    }

    return () => {
      tl.kill()
    }
  }, [containerRef])
}

/**
 * Hook for animating stat counters
 */
export function useCounterAnimation(
  ref: RefObject<HTMLElement | null>,
  value: number,
  duration: number = 1.5
) {
  useEffect(() => {
    if (!ref.current || value === 0) return

    const element = ref.current
    const obj = { value: 0 }

    gsap.to(obj, {
      value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString()
      }
    })
  }, [ref, value, duration])
}

/**
 * Hook for card hover animations
 */
export function useCardHover(cardRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!cardRef.current) return

    const card = cardRef.current

    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.02,
        y: -4,
        boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
        duration: 0.3,
        ease: "power2.out"
      })
    }

    const handleMouseLeave = () => {
      gsap.to(card, {
        scale: 1,
        y: 0,
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        duration: 0.3,
        ease: "power2.out"
      })
    }

    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [cardRef])
}

/**
 * Hook for stagger animation on mount
 */
export function useStaggerAnimation(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  options?: {
    delay?: number
    stagger?: number
    duration?: number
  }
) {
  useEffect(() => {
    if (!containerRef.current) return

    const elements = containerRef.current.querySelectorAll(selector)
    if (!elements.length) return

    gsap.fromTo(
      elements,
      { opacity: 0, y: 20, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: options?.duration ?? 0.5,
        stagger: options?.stagger ?? 0.08,
        delay: options?.delay ?? 0,
        ease: "back.out(1.4)"
      }
    )
  }, [containerRef, selector, options])
}

/**
 * Hook for page transition animations
 */
export function usePageTransition(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    )
  }, [containerRef])
}
