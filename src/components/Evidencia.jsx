import { ArrowRight, Github } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useVista } from '../navegacion/VistaProvider'
import Section from './ui/Section'

/**
 * Tres labs en la vista Perfil, con el resultado que midió cada uno.
 *
 * Quien llega desde LinkedIn lee Perfil y se va: si los repos solo viven
 * al final de Chaos Lab, nunca los ve. Esto no es una segunda galería:
 * es una lista corta con el dato medido (el primer highlight del lab,
 * tal cual figura en `projects`) y el enlace al código. El detalle
 * completo sigue en Chaos Lab, a un clic.
 */
export default function Evidencia() {
  const { evidencia, projects, projectsMeta } = useContenido()
  const { irA } = useVista()
  const labs = evidencia.ids.map((id) => projects.find((p) => p.id === id)).filter(Boolean)

  return (
    <Section id="evidencia" titulo={evidencia.titulo} bajada={evidencia.bajada}>
      <ul className="card divide-y divide-base-600 lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {labs.map((lab) => (
          <li key={lab.id} className="flex flex-col p-6">
            <p className="text-[13px] text-slate-500">{lab.categoria.replace(/^DevOps Lab · /, '')}</p>
            <h3 className="mt-1 text-base font-semibold leading-snug text-white">{lab.titulo}</h3>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-300">{lab.highlights[0]}</p>
            <a
              href={lab.links.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 self-start text-[13px] font-medium text-accent transition-colors hover:text-white"
            >
              <Github size={15} aria-hidden="true" />
              {projectsMeta.codigo}
              <span className="sr-only"> · {lab.titulo}</span>
            </a>
          </li>
        ))}
      </ul>

      <a
        href="#labs"
        onClick={(e) => {
          e.preventDefault()
          irA(null, 'labs')
        }}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-white"
      >
        {evidencia.verTodos} <ArrowRight size={15} aria-hidden="true" />
      </a>
    </Section>
  )
}
