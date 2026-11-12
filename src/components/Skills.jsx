import { useState } from 'react'
import { Activity, ChevronDown, Container, ShieldAlert, Terminal } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import Section from './ui/Section'

const iconos = { ShieldAlert, Activity, Container, Terminal }

const tonos = {
  crit: { icon: 'text-crit bg-crit/10 border-crit/25', chip: 'border-crit/30 bg-crit/10 text-crit', bar: 'bg-crit' },
  accent: { icon: 'text-accent bg-accent/10 border-accent/25', chip: 'border-accent/30 bg-accent/10 text-accent', bar: 'bg-accent' },
  ok: { icon: 'text-ok bg-ok/10 border-ok/25', chip: 'border-ok/30 bg-ok/10 text-ok', bar: 'bg-ok' },
  soft: { icon: 'text-accent-soft bg-accent-soft/10 border-accent-soft/25', chip: 'border-accent-soft/30 bg-accent-soft/10 text-accent-soft', bar: 'bg-accent-soft' },
}

function SkillCard({ skill, abierto, onToggle }) {
  const Icono = iconos[skill.icono]
  const t = tonos[skill.tone]

  const idPanel = `skill-${skill.id}-items`
  const idTagline = `skill-${skill.id}-tagline`

  return (
    <article className={`card card-hover overflow-hidden ${abierto ? 'border-base-500' : ''}`}>
      {/* El botón vive dentro del h3 y se estira sobre toda la cabecera con
          un ::after: se puede tocar en cualquier parte, pero el lector de
          pantalla lee un nombre corto y el h3 sigue en el índice de títulos. */}
      <div className="relative flex items-start gap-4 p-6">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${t.icon}`} aria-hidden="true">
          <Icono size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="text-base font-semibold text-white">
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={abierto}
                aria-controls={idPanel}
                aria-describedby={idTagline}
                className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-accent"
              >
                {skill.titulo}
              </button>
            </h3>
            <span className={`rounded-md border px-2 py-0.5 font-mono text-xs uppercase tracking-wider ${t.chip}`}>
              {skill.dominio}
            </span>
          </div>
          <p id={idTagline} className="mt-1 font-mono text-xs text-slate-500">{skill.tagline}</p>
        </div>

        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`mt-1 shrink-0 text-slate-500 transition-transform duration-300 ${abierto ? 'rotate-180 text-accent' : ''}`}
        />
      </div>

      <div
        id={idPanel}
        className={`grid transition-all duration-300 ease-out ${
          abierto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          {/* La descripción va adentro: cerradas, las cuatro tarjetas se leen
              como un índice de una línea cada una. */}
          <p className="border-t border-base-600 px-6 pt-5 text-sm leading-relaxed text-slate-400">{skill.descripcion}</p>
          <ul className="grid gap-2 px-6 py-5 sm:grid-cols-2">
            {skill.items.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[13px] text-slate-400">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${t.bar}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

export default function Skills() {
  const { skills, skillsMeta } = useContenido()
  // Cerradas al llegar: la cabecera de cada tarjeta ya dice el dominio y el
  // resumen, y abiertas por defecto sumaban media pantalla en el teléfono.
  const [abierto, setAbierto] = useState(null)

  return (
    <Section id="skills" label={skillsMeta.label} titulo={skillsMeta.titulo} bajada={skillsMeta.bajada}>
      <div className="grid items-start gap-5 lg:grid-cols-2">
        {skills.map((s) => (
          <SkillCard
            key={s.id}
            skill={s}
            abierto={abierto === s.id}
            onToggle={() => setAbierto(abierto === s.id ? null : s.id)}
          />
        ))}
      </div>

    </Section>
  )
}
