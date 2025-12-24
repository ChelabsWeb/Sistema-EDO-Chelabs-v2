import gsap from 'gsap'

// Register GSAP plugins if needed
if (typeof window !== 'undefined') {
  gsap.registerPlugin()
}

/**
 * Animación de entrada de página con stagger
 */
export const pageEnter = (elements: Element[] | NodeListOf<Element>) => {
  gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out"
    }
  )
}

/**
 * Animación de cards con efecto bounce
 */
export const staggerCards = (cards: Element[] | NodeListOf<Element>) => {
  gsap.fromTo(
    cards,
    { opacity: 0, scale: 0.95, y: 20 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "back.out(1.7)"
    }
  )
}

/**
 * Animación de contador numérico
 */
export const animateCounter = (element: Element, endValue: number) => {
  const obj = { value: 0 }
  gsap.to(obj, {
    value: endValue,
    duration: 1.5,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString()
    }
  })
}

/**
 * Animación de fade in con slide
 */
export const fadeInUp = (element: Element, delay: number = 0) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay,
      ease: "power2.out"
    }
  )
}

/**
 * Animación de scale para hover de cards
 */
export const cardHoverIn = (element: Element) => {
  gsap.to(element, {
    scale: 1.02,
    y: -4,
    boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
    duration: 0.3,
    ease: "power2.out"
  })
}

export const cardHoverOut = (element: Element) => {
  gsap.to(element, {
    scale: 1,
    y: 0,
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    duration: 0.3,
    ease: "power2.out"
  })
}

/**
 * Animación de pulso para alertas
 */
export const pulseAnimation = (element: Element) => {
  gsap.to(element, {
    scale: 1.02,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  })
}

/**
 * Animación de shake para errores
 */
export const shakeAnimation = (element: Element) => {
  gsap.fromTo(
    element,
    { x: 0 },
    {
      x: 10,
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      ease: "power2.inOut"
    }
  )
}

/**
 * Timeline de entrada del dashboard
 */
export const dashboardEnter = (container: Element) => {
  const tl = gsap.timeline()

  const header = container.querySelector('.page-header')
  const stats = container.querySelectorAll('.stat-card')
  const cards = container.querySelectorAll('.action-card')
  const alert = container.querySelector('.alert-card')

  if (header) {
    tl.from(header, { opacity: 0, y: -20, duration: 0.4 })
  }

  if (stats.length) {
    tl.from(stats, {
      opacity: 0,
      y: 20,
      scale: 0.95,
      stagger: 0.08,
      duration: 0.4
    }, '-=0.2')
  }

  if (alert) {
    tl.from(alert, { opacity: 0, x: -20, duration: 0.3 }, '-=0.2')
  }

  if (cards.length) {
    tl.from(cards, {
      opacity: 0,
      scale: 0.95,
      stagger: 0.05,
      duration: 0.4
    }, '-=0.2')
  }

  return tl
}

/**
 * Animación para expandir/colapsar filas de tabla
 */
export const expandRow = (element: Element) => {
  gsap.fromTo(
    element,
    { height: 0, opacity: 0 },
    { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
  )
}

export const collapseRow = (element: Element) => {
  gsap.to(element, {
    height: 0,
    opacity: 0,
    duration: 0.3,
    ease: "power2.in"
  })
}

/**
 * Animación de números incrementales para stats
 */
export const animateStats = (container: Element) => {
  const statElements = container.querySelectorAll('[data-animate-value]')

  statElements.forEach((el) => {
    const value = parseInt(el.getAttribute('data-animate-value') || '0', 10)
    animateCounter(el, value)
  })
}
