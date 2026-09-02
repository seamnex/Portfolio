import { useVista } from '../../navegacion/VistaProvider'

/**
 * El panel de una vista principal.
 *
 * Ojo con las clases: `hidden` es un atributo y Tailwind lo respeta desde
 * el preflight, pero cualquier utilidad de `display` (`grid`, `flex`)
 * sobre el mismo nodo le ganaría por especificidad y la vista apagada se
 * vería igual que la activa. Por eso acá no va ninguna: el espaciado lo
 * ponen los hijos.
 *
 * Y no hay un `{activa && ...}` a propósito. Ocultar no es desmontar: el
 * simulacro que quedó corriendo y lo que se tipeó en la consola son
 * estado local de sus componentes, y desmontarlos al cambiar de pestaña
 * los borraría. Ver el comentario largo en `navegacion/VistaProvider`.
 */
export default function Vista({ id, titulo, children }) {
  const { vista } = useVista()

  return (
    <div
      id={`vista-${id}`}
      role="tabpanel"
      // `aria-label` y no `aria-labelledby`: las pestañas se renderizan en
      // la barra y en la fila compacta de móvil según el ancho, así que no
      // hay un id de pestaña que esté garantizado en el DOM.
      aria-label={titulo}
      hidden={vista !== id}
    >
      {children}
    </div>
  )
}

/**
 * Cabecera de una vista: la que abre la página cuando no hay hero.
 *
 * Su `h1` es el que le da a la vista su nivel superior de encabezado; de
 * ahí para abajo cada bloque del laboratorio entra como `h2` (ver
 * `ui/Bloque`). En la vista de perfil no se usa: ese `h1` lo pone el hero.
 */
export function EncabezadoVista({ label, titulo, bajada, children }) {
  return (
    <header className="relative z-10 border-b border-base-600/60 pb-12 pt-28 sm:pt-32">
      <div className="container-x">
        <p className="section-label flex items-center gap-3">
          <span className="h-px w-8 bg-accent/60" />
          {label}
        </p>
        <h1 className="heading-2">{titulo}</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-400">{bajada}</p>
        {children}
      </div>
    </header>
  )
}
