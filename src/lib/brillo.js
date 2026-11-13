// ─────────────────────────────────────────────────────────────
//  El brillo de las tarjetas sigue al puntero.
//
//  Un solo listener delegado en el documento, no uno por tarjeta: escribe
//  la posición del mouse, relativa a la `.card` que tiene debajo, en dos
//  variables CSS (`--mx`, `--my`) que usa el `::before` de `.card`.
//
//  Va con `requestAnimationFrame` para no medir ni escribir más de una
//  vez por cuadro, y solo existe donde hay un puntero que flota: en un
//  teléfono no se registra nada.
// ─────────────────────────────────────────────────────────────
export function seguirPuntero() {
  if (typeof window === 'undefined') return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  let pendiente = null
  let cuadro = 0

  const pintar = () => {
    cuadro = 0
    const e = pendiente
    const tarjeta = e?.target?.closest?.('.card')
    if (!tarjeta) return
    const r = tarjeta.getBoundingClientRect()
    tarjeta.style.setProperty('--mx', `${e.clientX - r.left}px`)
    tarjeta.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  document.addEventListener(
    'pointermove',
    (e) => {
      pendiente = e
      if (!cuadro) cuadro = requestAnimationFrame(pintar)
    },
    { passive: true },
  )
}
