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

  return (
    <article className={`card card-hover overflow-hidden ${abierto ? 'border-accent/40' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierto}
        className="flex w-full items-start gap-4 p-6 text-left"
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${t.icon}`}>
          <Icono size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 className="text-base font-semibold text-white">{skill.titulo}</h3>
            <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${t.chip}`}>
              {skill.nivel}
            </span>
          </div>
          <p className="mt-1 font-mono text-[11.5px] text-slate-500">{skill.tagline}</p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">{skill.descripcion}</p>
        </div>

        <ChevronDown
          size={18}
          className={`mt-1 shrink-0 text-slate-500 transition-transform duration-300 ${abierto ? 'rotate-180 text-accent' : ''}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          abierto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="grid gap-2 border-t border-base-600 px-6 py-5 sm:grid-cols-2">
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
  const [abierto, setAbierto] = useState('incident')

  return (
    <Section id="skills" label={skillsMeta.label} titulo={skillsMeta.titulo} bajada={skillsMeta.bajada}>
      <div className="grid gap-5 lg:grid-cols-2">
        {skills.map((s) => (
          <SkillCard
            key={s.id}
            skill={s}
            abierto={abierto === s.id}
            onToggle={() => setAbierto(abierto === s.id ? null : s.id)}
          />
        ))}
      </div>

      <p className="mt-6 text-center font-mono text-[11px] text-slate-600">
        {skillsMeta.hint}
      </p>
    </Section>
  )
}
