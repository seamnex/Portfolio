import { useId, useMemo, useState } from 'react'
import { ChevronDown, ExternalLink, Github, Sparkles, TriangleAlert, Wrench } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useEstado } from '../estado/EstadoProvider'
import Bloque from './ui/Bloque'
import CopyButton from './ui/CopyButton'
import CIBadge from './ui/CIBadge'

// Las categorías se escriben igual en los dos idiomas porque son el prefijo
// que usa el filtro; lo que cambia es la etiqueta visible, que sale de
// `projectsMeta.filtros`.
const CATEGORIAS = ['DevOps Lab', 'Proyecto Web']

// Cuántos labs se muestran antes de "Ver los N". Siete tarjetas completas
// hacían de esta vista un muro de ~15.000 px en el teléfono, y el cierre
// de contacto quedaba donde nadie llega. Cuatro y no tres: en la grilla de
// dos columnas, tres dejaban una tarjeta huérfana. Los primeros del array son los
// destacados: el orden de `projects` en content.js es la curaduría.
const DESTACADOS = 4

function ProjectCard({ p, meta, pipeline }) {
  const activo = p.estado === 'Activo' || p.estado === 'Active'
  // Cerrada, la tarjeta dice qué problema ataca el lab; la solución, los
  // logros, el comando y el stack son para quien quiere profundizar.
  const [abierta, setAbierta] = useState(false)
  const idDetalle = useId()

  return (
    <article className="card card-hover group flex min-w-0 flex-col p-6">
      {/* La misma tarjeta 1200×627 que usan el repo y LinkedIn. En la grilla
          alcanza la de 600 px; la de 1200 queda para pantallas de alta
          densidad. width/height reservan el espacio y evitan el salto de
          layout mientras carga. */}
      {p.imagen && (
        <img
          src={`${p.imagen}-600.png`}
          srcSet={`${p.imagen}-600.png 600w, ${p.imagen}.png 1200w`}
          sizes="(min-width: 768px) 560px, 100vw"
          width={1200}
          height={627}
          loading="lazy"
          decoding="async"
          alt=""
          className="mb-5 h-auto w-full rounded-lg border border-base-600 transition-colors group-hover:border-accent/30"
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-accent">{p.categoria}</p>
          <h3 className="mt-2 text-lg font-semibold text-white transition-colors group-hover:text-accent">
            {p.titulo}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-xs uppercase tracking-wider ${
            // Activo en gris neutro: el ámbar queda para alertas y simulacros.
            activo ? 'border-base-500 bg-base-800 text-slate-300' : 'border-warn/30 bg-warn/10 text-warn'
          }`}
        >
          {p.estado}
        </span>
      </div>

      {/* Badge de CI: se renderiza solo si el repo tiene workflows. Un lab sin
          pipeline no lleva badge — ver `pipelines` en data/servicios.js. */}
      <CIBadge pipeline={pipeline} className="mt-4 self-start" />

      <div className="mt-5">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-crit">
          <TriangleAlert size={12} /> {meta.problema}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.problema}</p>
      </div>

      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        aria-controls={idDetalle}
        className="toque mt-4 inline-flex items-center gap-1.5 self-start py-1.5 font-mono text-xs text-accent transition-colors hover:text-white"
      >
        {abierta ? meta.verMenos : meta.verMas}
        <ChevronDown size={14} className={`transition-transform duration-200 ${abierta ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <div id={idDetalle} hidden={!abierta}>
      <div className="mt-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ok">
            <Wrench size={12} /> {meta.solucion}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.solucion}</p>
        </div>
      </div>

      <ul className="mt-5 space-y-1.5">
        {p.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-[13px] text-slate-500">
            <Sparkles size={12} className="mt-1 shrink-0 text-accent/70" />
            {h}
          </li>
        ))}
      </ul>

      {p.comando && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-base-600 bg-base-900/60 px-3 py-2.5">
          <code className="min-w-0 truncate font-mono text-xs text-accent">
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
      </div>

      {/* Sin repo ni demo publicados, no mostramos la barra vacía */}
      {(p.links.repo || p.links.demo) && (
        <div className="mt-6 flex gap-2 border-t border-base-600 pt-5">
          {p.links.repo && (
            <a
              href={p.links.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost toque flex-1 px-3 py-2 text-xs"
            >
              <Github size={14} /> {meta.codigo}
            </a>
          )}
          {p.links.demo && (
            <a
              href={p.links.demo}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost toque flex-1 px-3 py-2 text-xs"
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
  const [todos, setTodos] = useState(false)

  // Se ofrecen solo los filtros que tienen al menos un proyecto detrás: una
  // pestaña que no muestra nada es peor que no tener la pestaña. Y si queda una
  // sola categoría, la barra entera sobra — filtrar tres items entre "Todos" y
  // su única categoría no decide nada.
  const filtros = useMemo(() => {
    const disponibles = CATEGORIAS.filter((c) => projects.some((p) => p.categoria.startsWith(c)))
    return disponibles.length > 1 ? ['todos', ...disponibles] : []
  }, [projects])

  const filtrados =
    filtro === 'todos' ? projects : projects.filter((p) => p.categoria.startsWith(filtro))
  const visibles = todos ? filtrados : filtrados.slice(0, DESTACADOS)

  return (
    <Bloque id="labs" label={projectsMeta.label} titulo={projectsMeta.titulo} bajada={projectsMeta.bajada}>
      {filtros.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {filtros.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFiltro(id)}
              className={`rounded-lg border px-4 py-2 font-mono text-xs transition-all ${
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

      {filtrados.length > DESTACADOS && (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => setTodos((v) => !v)} aria-expanded={todos} className="btn-ghost">
            {todos ? projectsMeta.verMenosLabs : projectsMeta.verTodos(filtrados.length)}
            <ChevronDown size={16} className={`transition-transform duration-200 ${todos ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>
      )}
    </Bloque>
  )
}
