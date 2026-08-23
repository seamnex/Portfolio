import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useContenido } from '../../i18n/LanguageProvider'

/** Copia rápida de comandos, mails o handles. */
export default function CopyButton({ value, label, className = '' }) {
  const { ui } = useContenido()
  const [copiado, setCopiado] = useState(false)
  // Sin `label` explícito muestra "Copiar" en el idioma activo; con él —el
  // caso del email en el hero— muestra el valor y traduce solo el aria-label.
  const etiqueta = label ?? ui.acciones.copiar

  useEffect(() => {
    if (!copiado) return
    const t = setTimeout(() => setCopiado(false), 1800)
    return () => clearTimeout(t)
  }, [copiado])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Fallback para contextos sin permisos de clipboard
      const ta = document.createElement('textarea')
      ta.value = value
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiado(true)
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={`${ui.acciones.copiar}: ${value}`}
      className={`inline-flex items-center gap-1.5 rounded-md border border-base-600 px-2.5 py-1.5 font-mono text-[11px] text-slate-400 transition-colors hover:border-accent/50 hover:text-accent ${className}`}
    >
      {copiado ? <Check size={13} className="text-ok" /> : <Copy size={13} />}
      {copiado ? ui.acciones.copiado : etiqueta}
    </button>
  )
}
