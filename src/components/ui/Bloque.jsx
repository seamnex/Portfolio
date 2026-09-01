/**
 * Cabecera de un bloque dentro del Observability Hub.
 *
 * Es la misma cabecera que pone `Section`, bajada un nivel: adentro de una
 * pestaña el título ya no abre una sección de la página sino un panel, así
 * que va como `h3`, con menos aire arriba y sin el `py-20` que separaba
 * secciones. El `id` se mantiene porque sigue siendo el ancla del nav: los
 * enlaces a #telemetria, #caos, #playbooks y #slo apuntan acá.
 *
 * `scroll-mt-36` y no `scroll-mt-24`: el salto tiene que dejar visible la
 * barra de pestañas que está justo encima del bloque, o quien llega por un
 * enlace del nav aterriza en un panel sin saber que hay otros dos.
 */
export default function Bloque({ id, label, titulo, bajada, children, className = '' }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`scroll-mt-36 ${className}`}>
      <header className="max-w-3xl">
        {label && (
          <p className="section-label flex items-center gap-2.5 text-[11px] tracking-[0.2em]">
            <span className="h-px w-6 bg-accent/60" />
            {label}
          </p>
        )}
        <h3 id={`${id}-titulo`} className="mt-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {titulo}
        </h3>
        {bajada && <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">{bajada}</p>}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  )
}
