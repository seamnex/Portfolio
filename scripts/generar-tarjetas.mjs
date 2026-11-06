// ─────────────────────────────────────────────────────────────
//  Genera las tarjetas 1200×627 de cada proyecto en
//  public/proyectos/<id>.png — el formato de imagen que LinkedIn
//  muestra en la sección Proyectos y al compartir un link.
//
//  Misma estética que la og-card del sitio (scripts/generar-og.mjs):
//  fondo #0B0F19, grilla tenue, glow cyan, Inter + JetBrains Mono.
//  Las fuentes se reutilizan del mismo cache.
//
//  Cada tarjeta dibuja las etapas del proyecto como una fila de
//  "checks" de status page. Los textos viven acá y no en content.js
//  porque una tarjeta necesita frases de 30 caracteres, no párrafos.
//
//  Uso:  npm run tarjetas
// ─────────────────────────────────────────────────────────────
import { Resvg } from '@resvg/resvg-js'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const SALIDA = join(raiz, 'public', 'proyectos')
const CACHE = join(raiz, 'scripts', '.fuentes')

const ANCHO = 1200
const ALTO = 627

const C = {
  fondo: '#0B0F19',
  hondo: '#070A12',
  borde: '#1B2333',
  panel: '#111827',
  acento: '#06B6D4',
  acentoSoft: '#14B8A6',
  ok: '#10B981',
  warn: '#F59E0B',
  crit: '#FB7185',
  texto: '#E2E8F0',
  medio: '#94A3B8',
  tenue: '#64748B',
}

// estado de cada etapa: ok (verde), manual (ámbar: la hace una persona a
// propósito), alerta (coral: la etapa trata de fallas).
export const TARJETAS = [
  {
    id: 'vagrant-lab',
    categoria: 'DEVOPS LAB · INFRASTRUCTURE AS CODE',
    titulo: ['Tres VMs desde código,', 'reproducibles y descartables'],
    bajada: 'Vagrant · VirtualBox · Ansible · Bash',
    etapas: [
      { nombre: 'vagrant', estado: 'ok' },
      { nombre: 'bootstrap', estado: 'ok' },
      { nombre: 'ansible', estado: 'ok' },
      { nombre: 'nginx', estado: 'ok' },
      { nombre: 'http 200', estado: 'ok' },
    ],
  },
  {
    id: 'observability-lab',
    categoria: 'DEVOPS LAB · OBSERVABILIDAD',
    titulo: ['Del síntoma', 'a la causa raíz'],
    bajada: 'Elasticsearch · Kibana · Python · detección y remediación',
    etapas: [
      { nombre: 'falla', estado: 'alerta' },
      { nombre: 'logs', estado: 'ok' },
      { nombre: 'umbral', estado: 'ok' },
      { nombre: 'alerta', estado: 'alerta' },
      { nombre: 'runbook', estado: 'ok' },
    ],
  },
  {
    id: 'k8s-lab',
    categoria: 'DEVOPS LAB · ORQUESTACIÓN',
    titulo: ['Romper Kubernetes', 'para ver qué protege'],
    bajada: 'Kubernetes · probes · preStop · PodDisruptionBudget · CI',
    etapas: [
      { nombre: 'healing', estado: 'ok' },
      { nombre: 'rolling', estado: 'ok' },
      { nombre: 'rollback', estado: 'ok' },
      { nombre: 'probes', estado: 'alerta' },
      { nombre: 'pdb', estado: 'ok' },
    ],
  },
  {
    id: 'cicd-pipeline',
    categoria: 'DEVOPS LAB · CI/CD',
    titulo: ['Del commit a la imagen', 'escaneada y publicada'],
    bajada: 'GitHub Actions · Docker · Trivy · GHCR · releases por tag',
    etapas: [
      { nombre: 'lint', estado: 'ok' },
      { nombre: 'tests', estado: 'ok' },
      { nombre: 'build', estado: 'ok' },
      { nombre: 'trivy', estado: 'ok' },
      { nombre: 'ghcr', estado: 'ok' },
    ],
  },
  {
    id: 'terraform-gcp-lab',
    categoria: 'DEVOPS LAB · INFRASTRUCTURE AS CODE',
    titulo: ['Google Cloud en código,', 'planeado en cada PR'],
    bajada: 'Terraform · módulos · state en GCS · dev / prod · WIF sin claves',
    etapas: [
      { nombre: 'fmt', estado: 'ok' },
      { nombre: 'validate', estado: 'ok' },
      { nombre: 'tflint', estado: 'ok' },
      { nombre: 'plan', estado: 'ok' },
      { nombre: 'apply', estado: 'manual' },
    ],
  },
  {
    id: 'sre-slo-lab',
    categoria: 'SRE LAB · SLOs Y ERROR BUDGET',
    titulo: ['Alertar por el budget,', 'no por el síntoma'],
    bajada: 'Prometheus · Grafana · Alertmanager · burn rate multiventana',
    etapas: [
      { nombre: 'SLI', estado: 'ok' },
      { nombre: 'SLO', estado: 'ok' },
      { nombre: 'budget', estado: 'ok' },
      { nombre: 'burn', estado: 'alerta' },
      { nombre: 'page', estado: 'alerta' },
    ],
  },
  {
    id: 'incident-postmortems',
    categoria: 'INCIDENT MANAGEMENT · BLAMELESS · ES / EN',
    titulo: ['Del War Room', 'a la acción con fecha'],
    bajada: '3 postmortems simulados · 3 runbooks · plantilla reutilizable',
    etapas: [
      { nombre: 'detectar', estado: 'alerta' },
      { nombre: 'mitigar', estado: 'manual' },
      { nombre: '5 porqués', estado: 'ok' },
      { nombre: 'acciones', estado: 'ok' },
      { nombre: 'runbook', estado: 'ok' },
    ],
  },
]

// Versión en inglés de cada tarjeta, para el sitio en EN. Solo se escribe lo
// que cambia; las etapas se traducen por posición.
const EN = {
  'vagrant-lab': {
    titulo: ['Three VMs from code,', 'reproducible and disposable'],
    etapas: ['vagrant', 'bootstrap', 'ansible', 'nginx', 'http 200'],
  },
  'observability-lab': {
    categoria: 'DEVOPS LAB · OBSERVABILITY',
    titulo: ['From the symptom', 'to the root cause'],
    bajada: 'Elasticsearch · Kibana · Python · detection and remediation',
    etapas: ['fault', 'logs', 'threshold', 'alert', 'runbook'],
  },
  'k8s-lab': {
    categoria: 'DEVOPS LAB · ORCHESTRATION',
    titulo: ['Breaking Kubernetes', 'to see what it protects'],
  },
  'cicd-pipeline': {
    titulo: ['From commit to image,', 'scanned and published'],
    bajada: 'GitHub Actions · Docker · Trivy · GHCR · tag-based releases',
  },
  'terraform-gcp-lab': {
    titulo: ['Google Cloud as code,', 'planned on every PR'],
    bajada: 'Terraform · modules · state in GCS · dev / prod · keyless WIF',
  },
  'sre-slo-lab': {
    categoria: 'SRE LAB · SLOs AND ERROR BUDGET',
    titulo: ['Alert on the budget,', 'not on the symptom'],
    bajada: 'Prometheus · Grafana · Alertmanager · multi-window burn rate',
  },
  'incident-postmortems': {
    titulo: ['From the War Room', 'to a dated action item'],
    bajada: '3 simulated postmortems · 3 runbooks · reusable template',
    etapas: ['detect', 'mitigate', '5 whys', 'actions', 'runbook'],
  },
}

function enIngles(t) {
  const tr = EN[t.id] ?? {}
  return {
    ...t,
    ...tr,
    etapas: t.etapas.map((e, i) => ({ ...e, nombre: tr.etapas?.[i] ?? e.nombre })),
  }
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const COLOR_ESTADO = { ok: C.ok, manual: C.warn, alerta: C.crit }

async function fuentes() {
  const archivos = ['Inter-400.ttf', 'Inter-600.ttf', 'Inter-800.ttf', 'JetBrainsMono-500.ttf'].map((f) =>
    join(CACHE, f),
  )
  const faltan = archivos.filter((f) => !existsSync(f))
  if (faltan.length) {
    throw new Error('Faltan fuentes en scripts/.fuentes: corré `npm run og` una vez para bajarlas.')
  }
  return archivos
}

function construirSvg(t) {
  let grilla = ''
  for (let x = 0; x <= ANCHO; x += 40) grilla += `<line x1="${x}" y1="0" x2="${x}" y2="${ALTO}"/>`
  for (let y = 0; y <= ALTO; y += 40) grilla += `<line x1="0" y1="${y}" x2="${ANCHO}" y2="${y}"/>`

  // Las etapas ocupan el ancho útil (1056 px) repartido en partes iguales,
  // con un conector entre cada una: se lee como un pipeline de izquierda a
  // derecha aunque la tarjeta se vea en miniatura.
  const n = t.etapas.length
  const gap = 28
  const anchoEtapa = (1056 - gap * (n - 1)) / n
  const y = 420
  const etapas = t.etapas
    .map((e, i) => {
      const x = 72 + i * (anchoEtapa + gap)
      const color = COLOR_ESTADO[e.estado]
      const conector =
        i < n - 1
          ? `<line x1="${x + anchoEtapa + 4}" y1="${y + 36}" x2="${x + anchoEtapa + gap - 4}" y2="${y + 36}" stroke="${C.tenue}" stroke-width="2"/>`
          : ''
      return `
    <g>
      <rect x="${x}" y="${y}" width="${anchoEtapa}" height="72" rx="12" fill="${C.panel}" stroke="${C.borde}"/>
      <circle cx="${x + 26}" cy="${y + 36}" r="7" fill="${color}"/>
      <text x="${x + 44}" y="${y + 43}" font-family="JetBrains Mono" font-weight="500" font-size="21" fill="${C.texto}">${esc(e.nombre)}</text>
      ${conector}
    </g>`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.fondo}"/>
      <stop offset="100%" stop-color="${C.hondo}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.12" r="0.62">
      <stop offset="0%" stop-color="${C.acento}" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="${C.acentoSoft}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${C.acento}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="filo" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.acento}"/>
      <stop offset="55%" stop-color="${C.acentoSoft}"/>
      <stop offset="100%" stop-color="${C.acento}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${ANCHO}" height="${ALTO}" fill="url(#fondo)"/>
  <g stroke="${C.borde}" stroke-width="1" opacity="0.28">${grilla}</g>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${ANCHO}" height="5" fill="url(#filo)"/>

  <circle cx="79" cy="82" r="6" fill="${C.ok}"/>
  <text x="98" y="88" font-family="JetBrains Mono" font-weight="500" font-size="17" letter-spacing="2.6" fill="${C.medio}">${esc(t.categoria)}</text>
  <text x="1128" y="88" text-anchor="end" font-family="JetBrains Mono" font-weight="500" font-size="17" fill="${C.acento}">${esc(t.id)}</text>

  <text x="72" y="208" font-family="Inter" font-weight="800" font-size="60" fill="${C.texto}">${esc(t.titulo[0])}</text>
  <text x="72" y="280" font-family="Inter" font-weight="800" font-size="60" fill="${C.acento}">${esc(t.titulo[1])}</text>

  <text x="72" y="340" font-family="Inter" font-weight="600" font-size="24" fill="${C.medio}">${esc(t.bajada)}</text>

  <line x1="72" y1="382" x2="1128" y2="382" stroke="${C.borde}" stroke-width="1"/>

  ${etapas}

  <text x="72" y="580" font-family="JetBrains Mono" font-weight="500" font-size="18" fill="${C.tenue}">github.com/seamnex/${esc(t.id)}</text>
  <text x="1128" y="580" text-anchor="end" font-family="JetBrains Mono" font-weight="500" font-size="18" fill="${C.tenue}">Samuel García Baciliadis · SRE / DevOps</text>
</svg>`
}

const archivosFuente = await fuentes()
await mkdir(SALIDA, { recursive: true })

const solo = process.argv[2]
const render = (t, ancho) =>
  new Resvg(construirSvg(t), {
    fitTo: { mode: 'width', value: ancho },
    font: { fontFiles: archivosFuente, loadSystemFonts: false, defaultFontFamily: 'Inter' },
  })
    .render()
    .asPng()

for (const base of TARJETAS.filter((t) => !solo || t.id === solo)) {
  for (const [sufijo, t] of [
    ['', base],
    ['-en', enIngles(base)],
  ]) {
    const png = render(t, ANCHO)
    await writeFile(join(SALIDA, `${t.id}${sufijo}.png`), png)

    // Versión de 600 px para las tarjetas del sitio: en una columna de ~560 px,
    // bajar la de 1200 sería pagar el doble de bytes por píxeles que no se ven.
    // La de 1200 queda para LinkedIn, los repos y las pantallas de alta densidad.
    const chica = render(t, ANCHO / 2)
    await writeFile(join(SALIDA, `${t.id}${sufijo}-600.png`), chica)
    console.log(
      `✔ public/proyectos/${t.id}${sufijo}.png — ${ANCHO}×${ALTO}, ${(png.length / 1024).toFixed(1)} KB · -600: ${(chica.length / 1024).toFixed(1)} KB`,
    )
  }
}
