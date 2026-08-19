import { useState } from 'react'
import { ExternalLink, Github, Sparkles, TriangleAlert, Wrench } from 'lucide-react'
import { projects } from '../data/content'
import Section from './ui/Section'
import CopyButton from './ui/CopyButton'

const filtros = [
  { id: 'todos', label: 'Todos' },
  { id: 'DevOps Lab', label: 'DevOps Labs' },
  { id: 'Proyecto Web', label: 'Proyectos Web' },
]

function ProjectCard({ p }) {
  const activo = p.estado === 'Activo'

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

      <div className="mt-5 space-y-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-crit">
            <TriangleAlert size={12} /> El problema
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">{p.problema}</p>
        </div>
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ok">
            <Wrench size={12} /> La solución
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
          <CopyButton value={p.comando} label="Copiar" className="shrink-0 border-0 px-1.5" />
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
            <Github size={14} /> Código
          </a>
        )}
        {p.links.demo && (
          <a
            href={p.links.demo}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-ghost flex-1 px-3 py-2 text-xs"
          >
            <ExternalLink size={14} /> Demo
          </a>
        )}
      </div>
      )}
    </article>
  )
}

export default function Projects() {
  const [filtro, setFiltro] = useState('todos')

  const visibles =
    filtro === 'todos' ? projects : projects.filter((p) => p.categoria.startsWith(filtro))

  return (
    <Section
      id="labs"
      label="DevOps Labs & Proyectos"
      titulo="Lo que construyo para entender cómo se rompe"
      bajada="Cada laboratorio nace de una pregunta operativa concreta. No son ejercicios de curso: son entornos donde reproduzco fallas, mido detección y valido que la respuesta funcione antes de necesitarla en producción."
    >
      <div className="mb-8 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f.id)}
            className={`rounded-lg border px-4 py-2 font-mono text-[11.5px] transition-all ${
              filtro === f.id
                ? 'border-accent/50 bg-accent/10 text-accent'
                : 'border-base-600 text-slate-400 hover:border-accent/30 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {visibles.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
      </div>
    </Section>
  )
}
