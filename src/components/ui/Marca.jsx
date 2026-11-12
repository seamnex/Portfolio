/**
 * La marca de cada sección: la barra del incidente de la portada en
 * miniatura (detectar · cortar · medir). Reemplaza a la raya de los
 * rótulos: el sitio firma sus secciones con su propio hallazgo y no con
 * el adorno de cualquier portfolio.
 */
export default function Marca({ className = 'w-8' }) {
  return (
    <span className={`flex h-1.5 shrink-0 overflow-hidden rounded-[1px] opacity-80 ${className}`} aria-hidden="true">
      <span className="h-full w-[34%] bg-warn/80" />
      <span className="h-full w-[6%] border-l border-base-900 bg-ok/80" />
      <span className="rayado h-full flex-1 border-l border-base-900 text-slate-400" />
    </span>
  )
}
