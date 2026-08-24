// ─────────────────────────────────────────────────────────────
//  Ejercita el intérprete de la consola sin navegador.
//
//  `src/lib/comandos.js` es una función pura justamente para esto: recibe
//  la entrada y un contexto, devuelve líneas. Se puede correr en Node y
//  probar los tres escenarios que en un navegador cuesta reproducir a
//  mano —el panel todavía consultando, todo verde, y con fallos y límite
//  de API—, en los dos idiomas y con o sin un simulacro de caos en curso,
//  en menos de un segundo.
//
//  Lo que busca: que ningún comando lance, y que ninguna línea llegue a
//  la pantalla con `undefined` adentro. Ese `undefined` es la forma que
//  toma una traducción faltante cuando el build no la detecta.
//
//  Uso:  npm run verificar:consola
// ─────────────────────────────────────────────────────────────
import { COMANDOS, ejecutar } from '../src/lib/comandos.js'
import { servicios } from '../src/data/servicios.js'
import { ESCENARIOS, FASES, lineaDeFase, resultadoSimulado } from '../src/lib/caos.js'
import * as es from '../src/data/content.js'
import * as en from '../src/data/content.en.js'

// Los tres estados en los que puede estar el panel cuando alguien escribe
// `status` o `curl /health`. El tercero es el que más importa: es el que
// aparece cuando la API de GitHub corta por límite de consultas.
const ESCENARIOS_PANEL = {
  consultando: {
    agregado: 'cargando',
    verificadoEn: null,
    resultados: Object.fromEntries(servicios.map((s) => [s.id, { estado: 'consultando', tipo: s.tipo }])),
    pipelineDe: () => null,
  },
  operativo: {
    agregado: 'ok',
    verificadoEn: Date.now(),
    resultados: {
      origen: { estado: 'ok', tipo: 'origen', latencia: 42, codigo: 200, entorno: 'ejemplo.dev' },
      'ci-portfolio': { estado: 'ok', tipo: 'actions', numero: 12, workflow: 'ci', rama: 'main' },
      'ci-k8s-lab': { estado: 'ok', tipo: 'actions', numero: 3, workflow: 'lint', rama: 'main' },
    },
    pipelineDe: (url) => (url?.endsWith('k8s-lab') ? { estado: 'ok', numero: 3, repo: 'seamnex/k8s-lab' } : null),
  },
  degradado: {
    agregado: 'degradado',
    verificadoEn: Date.now(),
    resultados: {
      origen: { estado: 'desconocido', tipo: 'origen', motivo: 'red' },
      'ci-portfolio': { estado: 'fallo', tipo: 'actions', numero: 13, workflow: 'ci', rama: 'main' },
      'ci-k8s-lab': { estado: 'desconocido', tipo: 'actions', motivo: 'limite' },
    },
    pipelineDe: () => ({ estado: 'fallo', numero: 13, repo: 'seamnex/k8s-lab' }),
  },
}

// Todo lo que ofrece el autocompletado, más las entradas raras que un
// visitante curioso va a escribir apenas vea un cursor parpadeando.
const ENTRADAS = [
  ...COMANDOS.map((c) => c.trim()),
  'chaos latencia',
  'chaos api-caida',
  'chaos error-500',
  'chaos heal',
  'chaos no-existe',
  'CHAOS LATENCIA',
  'incident inc-rolling',
  'incident INC-2026-01',
  'incident no-existe',
  'incident',
  'lang fr',
  'lang',
  'kubectl get servicios',
  'rm -rf /',
  'HELP',
  '?',
  '   ',
  '',
]

// Y el sandbox de caos suma una dimensión más: los comandos que muestran
// estado tienen una salida distinta con un simulacro en curso, y esa es
// justo la que puede filtrar un `undefined` sin que nadie la mire.
const CAOS = {
  'sin-simulacro': { escenario: null },
  'con-simulacro': { escenario: ESCENARIOS[0] },
}

const errores = []
let ejecuciones = 0

for (const [lang, contenido] of [
  ['es', es],
  ['en', en],
]) {
  for (const [escenario, parcial] of Object.entries(ESCENARIOS_PANEL)) {
    const estado = { servicios, ...parcial }

    for (const [situacion, caos] of Object.entries(CAOS)) {
      for (const entrada of ENTRADAS) {
        const donde = `[${lang}/${escenario}/${situacion}] "${entrada}"`
        let resultado
        try {
          resultado = ejecutar(entrada, { ui: contenido.ui, lang, contenido, estado, caos })
        } catch (e) {
          errores.push(`${donde} lanzó: ${e.message}`)
          continue
        }

        if (!Array.isArray(resultado.lineas)) {
          errores.push(`${donde} no devolvió un array de líneas`)
          continue
        }

        for (const linea of resultado.lineas) {
          const texto = linea.t === 'kv' ? `${linea.k} ${linea.v}` : linea.texto
          if (texto === undefined) {
            errores.push(`${donde} produjo una línea sin texto: ${JSON.stringify(linea)}`)
          } else if (String(texto).includes('undefined')) {
            errores.push(`${donde} filtró "undefined" a la pantalla: ${JSON.stringify(texto)}`)
          }
        }

        ejecuciones++
      }
    }
  }
}

// Los comandos que abren algo tienen que devolver la acción correspondiente,
// o el botón queda decorativo: la línea dice "abriendo…" y no abre nada.
{
  const base = { ui: es.ui, lang: 'es', contenido: es, estado: { servicios, ...ESCENARIOS_PANEL.operativo } }
  const esperado = [
    ['clear', 'limpiar', {}],
    ['cv', 'descargar-cv', {}],
    ['lang en', 'cambiar-idioma', {}],
    [`incident ${es.incidentes[0].id}`, 'abrir-postmortem', {}],
    [`chaos ${ESCENARIOS[0].id}`, 'inyectar-caos', { escenario: null }],
    // `chaos heal` solo tiene sentido con un simulacro activo: sin él
    // contesta que no hay nada que restaurar y no devuelve acción.
    ['chaos heal', 'restaurar-caos', { escenario: ESCENARIOS[0] }],
  ]
  for (const [entrada, tipo, caos] of esperado) {
    const { accion } = ejecutar(entrada, { ...base, caos })
    if (accion?.tipo !== tipo) errores.push(`"${entrada}" debía devolver la acción "${tipo}" y devolvió ${JSON.stringify(accion)}`)
  }

  // Y al revés: restaurar sin simulacro NO puede devolver una acción, o la
  // consola diría "restaurando" sobre un sistema que nunca se rompió.
  const { accion: sinNada } = ejecutar('chaos heal', { ...base, caos: { escenario: null } })
  if (sinNada) errores.push(`"chaos heal" sin simulacro devolvió una acción: ${JSON.stringify(sinNada)}`)
}

// Las líneas de la bitácora del sandbox de caos no pasan por el intérprete
// —las escribe el proveedor cuando entra cada fase—, así que el barrido de
// arriba no las toca. Se ejercitan acá: todos los escenarios, todas las
// fases, los dos idiomas. Una fase sin traducir sale como `undefined` en el
// medio de un log que pretende parecer real.
let lineasCaos = 0
for (const [lang, contenido] of [
  ['es', es],
  ['en', en],
]) {
  for (const escenario of ESCENARIOS) {
    const textos = contenido.ui.caos
    const rotulos = [
      textos.escenarios[escenario.id]?.titulo,
      textos.escenarios[escenario.id]?.descripcion,
      textos.activo(textos.escenarios[escenario.id]?.titulo),
      textos.autoHealing(7),
      ...FASES.map((f) => textos.nombresFase[f.id]),
      ...FASES.map((f) => lineaDeFase(f, escenario, contenido.ui).texto),
      textos.fases.restaurado(escenario, contenido.ui),
    ]

    for (const texto of rotulos) {
      if (texto === undefined || String(texto).includes('undefined')) {
        errores.push(`[${lang}] caos "${escenario.id}": texto sin traducir → ${JSON.stringify(texto)}`)
      }
      lineasCaos++
    }

    // El resultado simulado tiene que quedar marcado. Si `simulado` se
    // perdiera, el panel mostraría un valor inventado como si lo hubiera medido.
    const simulado = resultadoSimulado(escenario, { estado: 'ok', tipo: 'origen', latencia: 40, codigo: 200 })
    if (!simulado.simulado) errores.push(`caos "${escenario.id}": el resultado simulado no viene marcado`)
    if (simulado.estado === 'ok') errores.push(`caos "${escenario.id}": el resultado simulado quedó en verde`)
  }
}

if (errores.length) {
  console.error(`\n✖ ${errores.length} problema(s) en la consola:\n`)
  for (const e of errores) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(
  `✔ consola verificada: ${ejecuciones} ejecuciones en 2 idiomas × 3 escenarios × 2 situaciones de caos,` +
    ` más ${lineasCaos} rótulos del sandbox de caos, sin errores`,
)
