import { useEffect, useId, useRef, useState } from 'react'
import { useContenido } from '../../i18n/LanguageProvider'

/**
 * Una sigla técnica con su definición en lenguaje simple.
 *
 * MTTD, p95 o CFR no le dicen nada a quien filtra CVs, y es justo quien
 * tiene que entender qué significa el número. La definición sale de
 * `ui.glosario` y se muestra al pasar el mouse, al enfocar con teclado o
 * al tocar en el teléfono; Escape la cierra sin mover el foco (WCAG
 * 1.4.13). El texto visible no cambia: la sigla sigue siendo la que usa
 * quien sí es técnico.
 */
export default function Sigla({ id, children }) {
  const { ui } = useContenido()
  const definicion = ui.glosario[id]
  const idTip = useId()
  const [abierta, setAbierta] = useState(false)
  const [descartada, setDescartada] = useState(false)
  const raiz = useRef(null)
  const visible = abierta && !descartada

  // Tocar afuera la cierra. En iOS tocar una zona no enfocable no quita el
  // foco del <abbr>, así que el onBlur solo no alcanza en el teléfono.
  useEffect(() => {
    if (!visible) return
    const alTocar = (e) => {
      if (!raiz.current?.contains(e.target)) setAbierta(false)
    }
    document.addEventListener('pointerdown', alTocar)
    return () => document.removeEventListener('pointerdown', alTocar)
  }, [visible])

  if (!definicion) return children

  return (
    <span
      ref={raiz}
      className="relative inline"
      onMouseEnter={() => {
        setDescartada(false)
        setAbierta(true)
      }}
      onMouseLeave={() => setAbierta(false)}
    >
      <abbr
        tabIndex={0}
        aria-describedby={idTip}
        onFocus={() => {
          setDescartada(false)
          setAbierta(true)
        }}
        onBlur={() => setAbierta(false)}
        // Abre siempre, no alterna: en un toque el foco ya la abrió y el
        // click llega después; si alternara, la cerraría en el mismo gesto.
        // Se cierra con Escape, al perder el foco o tocando afuera.
        onClick={() => {
          setDescartada(false)
          setAbierta(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setDescartada(true)
        }}
        className="cursor-help no-underline decoration-slate-500 decoration-dotted underline-offset-4 [text-decoration-line:underline]"
      >
        {children ?? id}
      </abbr>
      <span
        role="tooltip"
        id={idTip}
        className={`absolute left-0 top-full z-40 mt-2 w-[min(17rem,80vw)] rounded-lg border border-base-500 bg-base-900 px-3 py-2.5 text-left font-sans text-[13px] font-normal normal-case leading-snug tracking-normal text-slate-300 shadow-xl shadow-black/50 transition-opacity duration-150 ${
          visible ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {definicion}
      </span>
    </span>
  )
}
