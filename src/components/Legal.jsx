import { X } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'

// ─────────────────────────────────────────────────────────────
//  Aviso de privacidad y aviso legal.
//
//  Dos <dialog> nativos y no un modal propio: showModal() ya atrapa el
//  foco, Esc cierra y, al cerrar, el foco vuelve solo al botón que lo
//  abrió. Viven montados siempre (vacíos de estado) para que el footer
//  y el formulario los abran desde cualquier vista con abrirAviso().
//
//  El texto sale de `ui.legal` en content.js / content.en.js, como todo
//  el copy del sitio.
// ─────────────────────────────────────────────────────────────

export const AVISOS = { privacidad: 'aviso-privacidad', aviso: 'aviso-legal' }

/** Abre uno de los avisos: 'privacidad' o 'aviso'. */
export function abrirAviso(cual) {
  document.getElementById(AVISOS[cual])?.showModal()
}

function Dialogo({ id, datos, cerrar, actualizado }) {
  const tituloId = `${id}-titulo`
  return (
    <dialog
      id={id}
      aria-labelledby={tituloId}
      // Clic en el fondo oscuro (el propio <dialog>, fuera de la tarjeta) cierra.
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="max-h-[85vh] w-[min(40rem,calc(100%-2rem))] overflow-y-auto rounded-xl border border-base-600 bg-base-700 p-0 text-slate-300 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={tituloId} className="text-xl font-semibold text-white">
            {datos.titulo}
          </h2>
          <button
            type="button"
            onClick={(e) => e.currentTarget.closest('dialog').close()}
            aria-label={cerrar}
            className="rounded-md border border-base-600 p-2 text-slate-400 transition-colors hover:border-accent/50 hover:text-accent"
          >
            <X size={16} />
          </button>
        </div>
        {datos.secciones.map(([titulo, texto]) => (
          <p key={titulo} className="text-sm leading-relaxed text-slate-400">
            <strong className="font-medium text-slate-200">{titulo}.</strong> {texto}
          </p>
        ))}
        <p className="font-mono text-[11px] text-slate-500">{actualizado}</p>
      </div>
    </dialog>
  )
}

export default function Legal() {
  const { ui } = useContenido()
  const { legal } = ui
  return (
    <>
      <Dialogo id={AVISOS.privacidad} datos={legal.privacidad} cerrar={legal.cerrar} actualizado={legal.actualizado} />
      <Dialogo id={AVISOS.aviso} datos={legal.aviso} cerrar={legal.cerrar} actualizado={legal.actualizado} />
    </>
  )
}
