// ─────────────────────────────────────────────────────────────
//  Snapshot del historial de GitHub Actions para el tablero DORA.
//
//  El tablero lee la API pública de GitHub desde el navegador, y esa API
//  da 60 consultas por hora por IP. Detrás del NAT de una empresa —que es
//  exactamente desde donde entra un reclutador— el cupo puede estar
//  agotado antes de que la página cargue, y el tablero quedaba con tres
//  tarjetas en "sin datos": la vista que prueba que el sitio no es una
//  maqueta, rota.
//
//  Este script corre en cada build y guarda en `public/` la última foto
//  conocida. El navegador sigue pidiendo el dato en vivo; solo si la API
//  no responde usa la foto, y la rotula como tal con su fecha. Como cada
//  push a main dispara un build, la foto nunca queda más vieja que el
//  último despliegue.
//
//  También guarda la última corrida TERMINADA de cada repo vigilado (el
//  panel de estado y los badges de CI de las tarjetas): sin ella, un
//  visitante con el cupo agotado veía "unknown" en cada tarjeta. Se
//  muestra rotulada como último dato conocido, nunca como medida ahora.
//
//  Nunca rompe el build: si GitHub no responde (o también acá se agotó el
//  cupo), se conserva la foto anterior. Con GITHUB_TOKEN definido usa el
//  cupo autenticado, pero no lo necesita.
// ─────────────────────────────────────────────────────────────
import { readFile, writeFile } from 'node:fs/promises'
import { REPO_DESPLIEGUE } from '../src/data/dora.js'
import { REPOS_VIGILADOS } from '../src/data/servicios.js'
import { normalizarCorrida } from '../src/lib/dora.js'
import { resultadoDeCorrida } from '../src/lib/estado.js'

const DESTINO = new URL('../public/github-snapshot.json', import.meta.url)

async function anterior() {
  try {
    return JSON.parse(await readFile(DESTINO, 'utf8'))
  } catch {
    return null
  }
}

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

/** Corridas de main de un repo, o un motivo si GitHub no las dio. */
async function corridasDe(repo, porPagina) {
  const url = `https://api.github.com/repos/${repo}/actions/runs?branch=main&per_page=${porPagina}`
  let res
  try {
    res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) })
  } catch (error) {
    return { motivo: `sin respuesta de GitHub (${error.name})` }
  }
  if (!res.ok) return { motivo: `GitHub respondió ${res.status}` }
  const datos = await res.json()
  return { runs: datos?.workflow_runs ?? [] }
}

/**
 * La última corrida terminada. En el build del sitio, la corrida en curso
 * suele ser la de este mismo push: la foto toma la anterior, que sí tiene
 * resultado.
 */
function ultimaTerminada(repo, runs) {
  const run = runs.find((r) => r.status === 'completed')
  return run ? resultadoDeCorrida(run, repo) : null
}

async function main() {
  const previo = await anterior()
  const snapshot = {
    capturado: new Date().toISOString(),
    historial: previo?.historial ?? {},
    ultimas: previo?.ultimas ?? {},
  }
  const avisos = []

  for (const repo of REPOS_VIGILADOS) {
    const esDespliegue = repo === REPO_DESPLIEGUE
    const { runs, motivo } = await corridasDe(repo, esDespliegue ? 100 : 10)
    if (!runs) {
      avisos.push(`${repo}: ${motivo}`)
      continue
    }
    if (esDespliegue && runs.length > 0) {
      snapshot.historial[repo] = { estado: 'ok', repo, corridas: runs.map(normalizarCorrida) }
    }
    const ultima = ultimaTerminada(repo, runs)
    if (ultima) snapshot.ultimas[repo] = ultima
  }

  const conDatos = Object.keys(snapshot.ultimas).length
  if (avisos.length === REPOS_VIGILADOS.length) {
    return conservar(previo, avisos[0])
  }
  await writeFile(DESTINO, `${JSON.stringify(snapshot)}
`)
  console.log(`✔ snapshot de GitHub: ${conDatos} repos con última corrida`)
  for (const aviso of avisos) console.warn(`· sin actualizar ${aviso}; queda el dato anterior`)
}

function conservar(previo, motivo) {
  console.warn(
    previo
      ? `· snapshot de GitHub sin actualizar (${motivo}); se conserva el del ${previo.capturado}`
      : `· snapshot de GitHub no generado (${motivo}); el sitio no tendrá respaldo`,
  )
}

main().catch(async (error) => conservar(await anterior(), error.message))
