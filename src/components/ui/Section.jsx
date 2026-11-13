import Marca from './Marca'
import { useRevelar } from '../../lib/revelar'

export default function Section({ id, label, titulo, bajada, children, className = '' }) {
  const cabecera = useRevelar()
  const cuerpo = useRevelar()

  return (
    <section id={id} className={`relative z-10 scroll-mt-24 py-10 sm:py-12 ${className}`}>
      <div className="container-x">
        <header ref={cabecera} data-revelar="1" className="max-w-3xl">
          {label && (
            <p className="section-label flex items-center gap-3">
              <Marca />
              {label}
            </p>
          )}
          <h2 className="heading-2">{titulo}</h2>
          {bajada && <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-slate-400">{bajada}</p>}
        </header>
        <div ref={cuerpo} data-revelar="2" className="mt-8 sm:mt-10">{children}</div>
      </div>
    </section>
  )
}
