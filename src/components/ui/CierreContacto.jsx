import { useId } from 'react'
import { ArrowRight, Download } from 'lucide-react'
import { useContenido } from '../../i18n/LanguageProvider'
import { useVista } from '../../navegacion/VistaProvider'

/**
 * El cierre de las vistas Observabilidad y Laboratorio.
 *
 * Esas vistas son donde el visitante queda más convencido —acaba de ver
 * el sitio medirse o romperse y recuperarse— y antes terminaban en el
 * footer, sin ningún camino a la conversación. Este bloque es ese camino:
 * las mismas dos acciones que la portada, CV y contacto, nada más.
 */
export default function CierreContacto() {
  const { profile, ui } = useContenido()
  const { irA } = useVista()
  const t = ui.cierre
  const idTitulo = useId()

  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-6 rounded-2xl border border-base-600 bg-base-700/40 px-6 py-8 sm:px-10 md:flex-row md:items-center md:justify-between"
    >
      <div className="max-w-xl">
        <h2 id={idTitulo} className="text-2xl font-bold tracking-tight text-white">
          {t.titulo}
        </h2>
        <p className="mt-2 text-base leading-relaxed text-slate-400">{t.texto}</p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-3">
        <button type="button" onClick={() => irA('perfil', 'contacto')} className="btn-primary">
          {ui.acciones.contactar} <ArrowRight size={16} aria-hidden="true" />
        </button>
        <a href={profile.cv} download={profile.cvArchivo} className="btn-ghost">
          <Download size={16} aria-hidden="true" /> {ui.acciones.descargarCV}
        </a>
      </div>
    </section>
  )
}
