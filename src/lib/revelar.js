import { useEffect, useRef } from 'react'

// ─────────────────────────────────────────────────────────────
//  Revelado al hacer scroll.
//
//  Un solo IntersectionObserver para todo el sitio. Un bloque marcado con
//  `data-revelar` entra una vez, cuando asoma por abajo, y no vuelve a
//  esconderse: no es un efecto de ida y vuelta, es la página armándose.
//
//  El estado oculto vive en CSS detrás de `html.revelar`, que solo se
//  pone acá. Si no hay IntersectionObserver, si se pidió menos movimiento
//  o si este módulo no llegara a correr, todo queda visible.
//
//  Las vistas apagadas (`hidden`) no intersectan: sus bloques se revelan
//  recién cuando la pestaña se abre, que es cuando hay alguien mirando.
// ─────────────────────────────────────────────────────────────

let observador = null

export function prepararRevelado() {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  observador = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        // Atributo y no clase: React reescribe `className` en cada render
        // que lo cambie, pero no toca un atributo que él no puso.
        e.target.setAttribute('data-visto', '')
        observador.unobserve(e.target)
      }
    },
    // Dispara un poco antes del borde inferior, así el bloque ya está
    // entrando cuando llega a la zona donde se lee.
    { rootMargin: '0px 0px -6% 0px', threshold: 0 },
  )
  document.documentElement.classList.add('revelar')
}

/** Ref para un bloque con `data-revelar`. Sin observador, no hace nada. */
export function useRevelar() {
  const ref = useRef(null)

  useEffect(() => {
    const nodo = ref.current
    if (!nodo || !observador) return
    observador.observe(nodo)
    return () => observador?.unobserve(nodo)
  }, [])

  return ref
}
