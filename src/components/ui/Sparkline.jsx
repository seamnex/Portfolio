// ─────────────────────────────────────────────────────────────
//  Sparkline en SVG, sin librería de gráficos.
//
//  Dibuja EXACTAMENTE las muestras que recibe: un punto por dato, sin
//  suavizado ni interpolación. Una curva bonita sobre cuatro muestras
//  insinúa una densidad de datos que no existe, y en un panel cuyo
//  argumento es "estos números son reales" ese detalle importa.
//
//  Con menos de dos muestras no dibuja nada: una línea recta trazada con
//  un solo punto no es una tendencia.
// ─────────────────────────────────────────────────────────────
const TRAZO = {
  ok: 'stroke-ok',
  accent: 'stroke-accent',
  warn: 'stroke-warn',
  crit: 'stroke-crit',
  muted: 'stroke-slate-600',
}

const RELLENO = {
  ok: 'fill-ok/10',
  accent: 'fill-accent/10',
  warn: 'fill-warn/10',
  crit: 'fill-crit/10',
  muted: 'fill-slate-700/20',
}

const BARRA = {
  ok: 'fill-ok/70',
  accent: 'fill-accent/70',
  warn: 'fill-warn/70',
  crit: 'fill-crit/70',
  muted: 'fill-slate-600/70',
}

export default function Sparkline({ datos, tone = 'accent', tipo = 'linea', alto = 34, etiqueta }) {
  const puntos = (datos ?? []).filter((d) => Number.isFinite(d))
  if (puntos.length < 2) return <div style={{ height: alto }} aria-hidden="true" />

  const ancho = 100
  const max = Math.max(...puntos)
  const min = Math.min(...puntos)
  // Serie plana: se dibuja a media altura en vez de dividir por cero.
  const rango = max - min || 1
  const y = (v) => alto - 2 - ((v - min) / rango) * (alto - 4)
  const x = (i) => (puntos.length === 1 ? 0 : (i / (puntos.length - 1)) * ancho)

  const comun = {
    viewBox: `0 0 ${ancho} ${alto}`,
    preserveAspectRatio: 'none',
    className: 'w-full',
    style: { height: alto },
    role: etiqueta ? 'img' : 'presentation',
    'aria-label': etiqueta,
  }

  if (tipo === 'barras') {
    // Las barras se usan para series discretas —un despliegue por día, una
    // corrida roja o verde— donde unir los puntos con una línea sugeriría
    // una continuidad entre días que no hay.
    const paso = ancho / puntos.length
    const base = max || 1
    return (
      <svg {...comun}>
        {puntos.map((v, i) => {
          const h = v === 0 ? 1 : Math.max(1.5, (v / base) * (alto - 4))
          return (
            <rect
              key={i}
              x={i * paso + paso * 0.18}
              y={alto - h}
              width={paso * 0.64}
              height={h}
              className={v === 0 ? BARRA.muted : BARRA[tone] ?? BARRA.accent}
            />
          )
        })}
      </svg>
    )
  }

  const linea = puntos.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')
  const area = `0,${alto} ${linea} ${ancho},${alto}`

  return (
    <svg {...comun}>
      <polygon points={area} className={RELLENO[tone] ?? RELLENO.accent} />
      <polyline
        points={linea}
        fill="none"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={TRAZO[tone] ?? TRAZO.accent}
      />
    </svg>
  )
}
