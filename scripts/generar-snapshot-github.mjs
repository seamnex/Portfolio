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
//  Nunca rompe el build: si GitHub no responde (o también acá se agotó el
//  cupo), se conserva la foto anterior. Con GITHUB_TOKEN definido usa el
//  cupo autenticado, pero no lo necesita.
// ─────────────────────────────────────────────────────────────
import { readFile, writeFile } from 'node:fs/promises'
import { REPO_DESPLIEGUE } from '../src/data/dora.js'
import { normalizarCorrida } from '../src/lib/dora.js'

const DESTINO = new URL('../public/github-snapshot.json', import.meta.url)

async function anterior() {
  try {
    return JSON.parse(await readFile(DESTINO, 'utf8'))
  } catch {
    return null
  }
}

async function main() {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const url = `https://api.github.com/repos/${REPO_DESPLIEGUE}/actions/runs?branch=main&per_page=100`
  let res
  try {
    res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) })
  } catch (error) {
    return conservar(`sin respuesta de GitHub (${error.name})`)
  }
  if (!res.ok) return conservar(`GitHub respondió ${res.status}`)

  const datos = await res.json()
  const corridas = (datos?.workflow_runs ?? []).map(normalizarCorrida)
  if (corridas.length === 0) return conservar('GitHub no devolvió corridas')

  const snapshot = {
    capturado: new Date().toISOString(),
    historial: { [REPO_DESPLIEGUE]: { estado: 'ok', repo: REPO_DESPLIEGUE, corridas } },
  }
  await writeFile(DESTINO, `${JSON.stringify(snapshot)}\n`)
  console.log(`✔ snapshot de GitHub: ${corridas.length} corridas de ${REPO_DESPLIEGUE}`)
}

async function conservar(motivo) {
  const previo = await anterior()
  console.warn(
    previo
      ? `· snapshot de GitHub sin actualizar (${motivo}); se conserva el del ${previo.capturado}`
      : `· snapshot de GitHub no generado (${motivo}); el tablero no tendrá respaldo`,
  )
}

main().catch((error) => conservar(error.message))
