// ─────────────────────────────────────────────────────────────
//  Ejercita el intérprete de la consola sin navegador.
//
//  `src/lib/comandos.js` es una función pura justamente para esto: recibe
//  la entrada y un contexto, devuelve líneas. Se puede correr en Node y
//  probar los tres escenarios que en un navegador cuesta reproducir a
//  mano —el panel todavía consultando, todo verde, y con fallos y límite
//  de API—, en los dos idiomas, en menos de un segundo.
//
//  Lo que busca: que ningún comando lance, y que ninguna línea llegue a
//  la pantalla con `undefined` adentro. Ese `undefined` es la forma que
//  toma una traducción faltante cuando el build no la detecta.
//
//  Uso:  npm run verificar:consola
// ─────────────────────────────────────────────────────────────
import { COMANDOS, ejecutar } from '../src/lib/comandos.js'
import { servicios } from '../src/data/servicios.js'
import * as es from '../src/data/content.js'
import * as en from '../src/data/content.en.js'

// Los tres estados en los que puede estar el panel cuando alguien escribe
// `status` o `curl /health`. El tercero es el que más importa: es el que
// aparece cuando la API de GitHub corta por límite de consultas.
const ESCENARIOS = {
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

const errores = []
let ejecuciones = 0

for (const [lang, contenido] of [
  ['es', es],
  ['en', en],
]) {
  for (const [escenario, parcial] of Object.entries(ESCENARIOS)) {
    const estado = { servicios, ...parcial }

    for (const entrada of ENTRADAS) {
      const donde = `[${lang}/${escenario}] "${entrada}"`
      let resultado
      try {
        resultado = ejecutar(entrada, { ui: contenido.ui, lang, contenido, estado })
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

// Los comandos que abren algo tienen que devolver la acción correspondiente,
// o el botón queda decorativo: la línea dice "abriendo…" y no abre nada.
{
  const ctx = { ui: es.ui, lang: 'es', contenido: es, estado: { servicios, ...ESCENARIOS.operativo } }
  const esperado = [
    ['clear', 'limpiar'],
    ['cv', 'descargar-cv'],
    ['lang en', 'cambiar-idioma'],
    [`incident ${es.incidentes[0].id}`, 'abrir-postmortem'],
  ]
  for (const [entrada, tipo] of esperado) {
    const { accion } = ejecutar(entrada, ctx)
    if (accion?.tipo !== tipo) errores.push(`"${entrada}" debía devolver la acción "${tipo}" y devolvió ${JSON.stringify(accion)}`)
  }
}

if (errores.length) {
  console.error(`\n✖ ${errores.length} problema(s) en la consola:\n`)
  for (const e of errores) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`✔ consola verificada: ${ejecuciones} ejecuciones en 2 idiomas × 3 escenarios, sin errores`)
