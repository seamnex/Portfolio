import { useMemo, useState } from 'react'
import { ExternalLink, Github, Sparkles, TriangleAlert, Wrench } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useEstado } from '../estado/EstadoProvider'
import Bloque from './ui/Bloque'
import CopyButton from './ui/CopyButton'
import CIBadge from './ui/CIBadge'

// Las categorías se escriben igual en los dos idiomas porque son el prefijo
// que usa el filtro; lo que cambia es la etiqueta visible, que sale de
// `projectsMeta.filtros`.
const CATEGORIAS = ['DevOps Lab', 'Proyecto Web']

function ProjectCard({ p, meta, pipeline }) {
  const activo = p.estado === 'Activo' || p.estado === 'Active'

  return (
    <article className="card card-hover group flex flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{p.categoria}</p>
          <h3 className="mt-2 text-lg font-semibold text-white transition-colors group-hover:text-accent">
            {p.titulo}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
            activo ? 'border-ok/30 bg-ok/10 text-ok' : 'border-warn/30 bg-warn/10 text-warn'
          }`}
        >
          {p.estado}
        </span>
      </div>

      {/* Badge de CI: se renderiza solo si el repo tiene workflows. Un lab sin
          pipeline no lleva badge — ver `pipelines` en data/servicios.js. */}
      <CIBadge pipeline={pipeline} className="mt-4 self-start" />

      <div className="mt-5 space-y-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-crit">
            <TriangleAlert size={12} /> {meta.problema}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">{p.problema}</p>
        </div>
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ok">
            <Wrench size={12} /> {meta.solucion}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">{p.solucion}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-1.5">
        {p.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-[12.5px] text-slate-500">
            <Sparkles size={12} className="mt-1 shrink-0 text-accent/70" />
            {h}
          </li>
        ))}
      </ul>

      {p.comando && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-base-600 bg-base-900/60 px-3 py-2.5">
          <code className="truncate font-mono text-[12px] text-accent">
            <span className="text-ok">$</span> {p.comando}
          </code>
          <CopyButton value={p.comando} className="shrink-0 border-0 px-1.5" />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-1.5">
        {p.stack.map((s) => (
          <span key={s} className="pill group-hover:border-accent/25 group-hover:text-slate-300">
            {s}
          </span>
        ))}
      </div>

      {/* Sin repo ni demo publicados, no mostramos la barra vacía */}
      {(p.links.repo || p.links.demo) && (
        <div className="mt-6 flex gap-2 border-t border-base-600 pt-5">
          {p.links.repo && (
            <a
              href={p.links.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost flex-1 px-3 py-2 text-xs"
            >
              <Github size={14} /> {meta.codigo}
            </a>
          )}
          {p.links.demo && (
            <a
              href={p.links.demo}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost flex-1 px-3 py-2 text-xs"
            >
              <ExternalLink size={14} /> {meta.demo}
            </a>
          )}
        </div>
      )}
    </article>
  )
}

export default function Projects() {
  const { projects, projectsMeta } = useContenido()
  const { pipelineDe } = useEstado()
  const [filtro, setFiltro] = useState('todos')

  // Se ofrecen solo los filtros que tienen al menos un proyecto detrás: una
  // pestaña que no muestra nada es peor que no tener la pestaña. Y si queda una
  // sola categoría, la barra entera sobra — filtrar tres items entre "Todos" y
  // su única categoría no decide nada.
  const filtros = useMemo(() => {
    const disponibles = CATEGORIAS.filter((c) => projects.some((p) => p.categoria.startsWith(c)))
    return disponibles.length > 1 ? ['todos', ...disponibles] : []
  }, [projects])

  const visibles =
    filtro === 'todos' ? projects : projects.filter((p) => p.categoria.startsWith(filtro))

  return (
    <Bloque id="labs" label={projectsMeta.label} titulo={projectsMeta.titulo} bajada={projectsMeta.bajada}>
      {filtros.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {filtros.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFiltro(id)}
              className={`rounded-lg border px-4 py-2 font-mono text-[11.5px] transition-all ${
                filtro === id
                  ? 'border-accent/50 bg-accent/10 text-accent'
                  : 'border-base-600 text-slate-400 hover:border-accent/30 hover:text-white'
              }`}
            >
              {projectsMeta.filtros[id]}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {visibles.map((p) => (
          <ProjectCard key={p.id} p={p} meta={projectsMeta} pipeline={pipelineDe(p.links.repo)} />
        ))}
      </div>
    </Bloque>
  )
}
