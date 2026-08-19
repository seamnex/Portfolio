export default function Section({ id, label, titulo, bajada, children, className = '' }) {
  return (
    <section id={id} className={`relative z-10 scroll-mt-24 py-20 sm:py-28 ${className}`}>
      <div className="container-x">
        <header className="max-w-3xl">
          {label && (
            <p className="section-label flex items-center gap-3">
              <span className="h-px w-8 bg-accent/60" />
              {label}
            </p>
          )}
          <h2 className="heading-2">{titulo}</h2>
          {bajada && <p className="mt-4 text-base leading-relaxed text-slate-400">{bajada}</p>}
        </header>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}
