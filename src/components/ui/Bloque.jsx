/**
 * Cabecera de un bloque dentro de una vista del laboratorio.
 *
 * Es la misma cabecera que pone `Section`, con menos aire arriba: en una
 * vista de observabilidad o de caos, la página entera es el laboratorio y
 * lo que separa un bloque del siguiente es el `space-y` de la vista, no
 * el `py-20` que separaba secciones de la portada.
 *
 * El título va como `h2` y no como `h3`: el `h1` de la vista lo pone
 * `EncabezadoVista`, así que estos bloques son el segundo nivel. Cuando
 * vivían adentro del hub —una sección más de la portada— eran el tercero.
 *
 * El `id` se mantiene porque sigue siendo el ancla del sitio: los enlaces
 * a #telemetria, #caos, #playbooks o #slo apuntan acá, y el proveedor de
 * vistas los traduce a la vista que hay que abrir antes de saltar.
 *
 * `scroll-mt-28` y no `scroll-mt-24`: deja el bloque un poco más abajo de
 * la barra fija, que es donde están las pestañas desde las que se llegó.
 */
export default function Bloque({ id, label, titulo, bajada, children, className = '' }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`scroll-mt-28 ${className}`}>
      <header className="max-w-3xl">
        {label && (
          <p className="section-label flex items-center gap-2.5 text-[11px] tracking-[0.2em]">
            <span className="h-px w-6 bg-accent/60" />
            {label}
          </p>
        )}
        <h2 id={`${id}-titulo`} className="mt-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
          {titulo}
        </h2>
        {bajada && <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">{bajada}</p>}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  )
}
