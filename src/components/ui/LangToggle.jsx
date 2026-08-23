import { Languages } from 'lucide-react'
import { IDIOMAS_DISPONIBLES, useContenido } from '../../i18n/LanguageProvider'

/**
 * Selector de idioma. Segmentado y con las dos opciones siempre visibles a
 * propósito: un botón que solo muestra el idioma activo obliga a adivinar si
 * indica el estado actual o la acción, y un ícono de bandera representa países,
 * no idiomas — el español de este sitio no es el de ninguna bandera en
 * particular.
 */
export default function LangToggle({ className = '' }) {
  const { lang, cambiar, ui } = useContenido()

  return (
    <div
      role="group"
      aria-label={ui.idioma.cambiar}
      className={`inline-flex items-center gap-0.5 rounded-lg border border-base-600 bg-base-900/60 p-0.5 ${className}`}
    >
      <Languages size={13} className="ml-1.5 mr-0.5 shrink-0 text-slate-500" aria-hidden="true" />
      {IDIOMAS_DISPONIBLES.map((codigo) => {
        const activo = codigo === lang
        return (
          <button
            key={codigo}
            type="button"
            onClick={() => cambiar(codigo)}
            aria-pressed={activo}
            aria-label={ui.idioma.a[codigo]}
            className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              activo ? 'bg-accent/15 text-accent' : 'text-slate-500 hover:text-white'
            }`}
          >
            {codigo}
          </button>
        )
      })}
    </div>
  )
}
