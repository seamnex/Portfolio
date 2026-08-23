// ─────────────────────────────────────────────────────────────
//  Servicios que vigila el panel de estado.
//
//  REGLA: acá solo entra lo que se puede COMPROBAR desde el navegador
//  del visitante. Nada de semáforos decorativos.
//
//   · tipo 'origen'  → una petición real y cronometrada al origen que
//                      sirve esta página. Mide lo que mide: que el
//                      sitio responde, y en cuánto.
//   · tipo 'actions' → última corrida de GitHub Actions en main,
//                      leída de la API pública. Es el mismo dato que
//                      muestra el badge del repo.
//
//  Lo que NO está acá y podría tentar: Vercel y Elastic. La API de
//  deployments de Vercel exige un token —que en un sitio estático
//  significa publicarlo—, y el stack de Elastic corre en un lab local
//  que no está expuesto a internet. Un servicio que no se puede
//  consultar se muestra como "sin datos", no como verde.
//
//  Las descripciones viven en `ui.estado.servicios` de cada idioma;
//  acá queda solo lo técnico, que no se traduce.
// ─────────────────────────────────────────────────────────────

export const OWNER = 'seamnex'

export const servicios = [
  {
    id: 'origen',
    tipo: 'origen',
    etiqueta: 'edge · origen del sitio',
    // Un archivo chico y siempre presente: mide la ida y vuelta, no la descarga.
    recurso: '/favicon.svg',
  },
  {
    id: 'ci-portfolio',
    tipo: 'actions',
    repo: `${OWNER}/Portfolio`,
    etiqueta: 'github-actions · Portfolio',
  },
  {
    id: 'ci-k8s-lab',
    tipo: 'actions',
    repo: `${OWNER}/k8s-lab`,
    etiqueta: 'github-actions · k8s-lab',
  },
]

/**
 * Repos de los labs que tienen pipeline propio, para el badge de CI de
 * las tarjetas de proyecto. Los que no están acá no muestran badge: un
 * "passing" verde sobre un repo sin workflows sería directamente falso.
 *
 * Se indexa por la URL del repo tal como aparece en `projects[].links.repo`,
 * así la tarjeta no necesita saber nada de este archivo más que buscarse.
 */
export const pipelines = {
  [`https://github.com/${OWNER}/k8s-lab`]: {
    repo: `${OWNER}/k8s-lab`,
    workflow: 'lint',
  },
}
