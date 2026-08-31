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

// Las muestras anteriores a la ventana resaltada. Siguen dibujándose —
// esconderlas sería recortar la serie hasta que diga lo que conviene—,
// pero atenuadas, para que se vea cuál es el tramo que la anotación de
// al lado está leyendo.
const BARRA_TENUE = {
  ok: 'fill-ok/25',
  accent: 'fill-accent/25',
  warn: 'fill-warn/25',
  crit: 'fill-crit/25',
  muted: 'fill-slate-600/25',
}

const REFERENCIA = {
  ok: 'stroke-ok/60',
  accent: 'stroke-accent/60',
  warn: 'stroke-warn/60',
  crit: 'stroke-crit/60',
  muted: 'stroke-slate-500/70',
}

/**
 * @param {number[]}  datos        la serie, tal cual se midió
 * @param {object[]}  referencias  líneas horizontales de comparación:
 *                                 `{ valor, tone }`. Se dibujan punteadas
 *                                 y solo si el valor cae dentro del rango
 *                                 de la serie: una referencia clavada al
 *                                 borde del gráfico sugiere una distancia
 *                                 que el dibujo no está mostrando.
 * @param {number}    ventana      cuántas barras finales van a tono pleno
 */
export default function Sparkline({
  datos,
  tone = 'accent',
  tipo = 'linea',
  alto = 34,
  etiqueta,
  referencias = [],
  ventana,
}) {
  const puntos = (datos ?? []).filter((d) => Number.isFinite(d))
  if (puntos.length < 2) return <div style={{ height: alto }} aria-hidden="true" />

  const ancho = 100
  const max = Math.max(...puntos)
  const min = Math.min(...puntos)
  // Serie plana: se dibuja a media altura en vez de dividir por cero.
  const rango = max - min || 1
  const y = (v) => alto - 2 - ((v - min) / rango) * (alto - 4)
  const x = (i) => (puntos.length === 1 ? 0 : (i / (puntos.length - 1)) * ancho)

  const lineasRef = (referencias ?? [])
    .filter((r) => r && Number.isFinite(r.valor) && r.valor >= min && r.valor <= max)
    .map((r, i) => (
      <line
        key={`ref-${i}`}
        x1="0"
        x2={ancho}
        y1={y(r.valor).toFixed(2)}
        y2={y(r.valor).toFixed(2)}
        strokeWidth="1"
        strokeDasharray="3 3"
        vectorEffect="non-scaling-stroke"
        className={REFERENCIA[r.tone] ?? REFERENCIA.muted}
      />
    ))

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
    const desde = ventana ? Math.max(0, puntos.length - ventana) : 0
    return (
      <svg {...comun}>
        {puntos.map((v, i) => {
          const h = v === 0 ? 1 : Math.max(1.5, (v / base) * (alto - 4))
          const paleta = i < desde ? BARRA_TENUE : BARRA
          return (
            <rect
              key={i}
              x={i * paso + paso * 0.18}
              y={alto - h}
              width={paso * 0.64}
              height={h}
              className={v === 0 ? paleta.muted : paleta[tone] ?? paleta.accent}
            />
          )
        })}
        {lineasRef}
      </svg>
    )
  }

  const linea = puntos.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')
  const area = `0,${alto} ${linea} ${ancho},${alto}`

  return (
    <svg {...comun}>
      <polygon points={area} className={RELLENO[tone] ?? RELLENO.accent} />
      {lineasRef}
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
