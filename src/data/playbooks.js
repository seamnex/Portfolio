// ─────────────────────────────────────────────────────────────
//  Runbooks de incidente — el Command Center.
//
//  QUÉ ES ESTO Y QUÉ NO ES, porque la distinción es la misma que
//  sostiene el resto del sitio:
//
//   · Los post-mortems de `incidentes.js` son incidentes que PASARON en
//     los labs, con bitácora publicada y números medidos.
//   · Esto es PROCEDIMIENTO: la secuencia que se sigue cuando aparece
//     cada síntoma. Los comandos son los que se escribirían de verdad;
//     las salidas son ilustrativas y están rotuladas como tales en cada
//     bloque que imprime la consola, no solo en el aviso de la sección.
//
//  Un runbook con salidas inventadas y sin rótulo sería exactamente el
//  tipo de demo que este sitio no tiene en ninguna otra parte. Con el
//  rótulo puesto, es lo que es: la parte del oficio que se puede mostrar
//  sin un cluster productivo detrás.
//
//  El orden de los pasos no es decorativo. En los tres el diagnóstico va
//  ANTES de la mitigación por el mismo motivo: reiniciar primero borra
//  la evidencia y garantiza que el incidente vuelva.
//
//  Lo técnico —comando y salida— no se traduce: es lo que se vería en
//  una terminal. El texto humano vive en `ui.playbooks` de cada idioma.
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {object} Paso
 * @property {string}   id       clave de traducción en `ui.playbooks.escenarios[].pasos`
 * @property {string}   comando  lo que se escribe en la terminal
 * @property {string[]} salida   respuesta ilustrativa, línea por línea
 * @property {string}   [tone]   tono de la salida en la consola
 */

export const PLAYBOOKS = [
  {
    id: 'memory-leak',
    icono: 'MemoryStick',
    severidad: 'P2',
    servicio: 'web',
    senal: 'container_memory_working_set_bytes{pod=~"web-.*"} / container_spec_memory_limit_bytes > 0.9 for 10m',
    pasos: [
      {
        id: 'confirmar',
        comando: 'kubectl top pods -l app=web --sort-by=memory',
        tone: 'muted',
        salida: [
          'NAME                    CPU(cores)   MEMORY(bytes)',
          'web-6f8b7c9d4-2xk7p     42m          967Mi',
          'web-6f8b7c9d4-9lm3q     38m          512Mi',
          'web-6f8b7c9d4-tq8vn     40m          198Mi',
        ],
      },
      {
        id: 'evidencia',
        comando: 'kubectl describe pod web-6f8b7c9d4-2xk7p | grep -A4 "Last State"',
        tone: 'crit',
        salida: [
          '    Last State:     Terminated',
          '      Reason:       OOMKilled',
          '      Exit Code:    137',
          '      Started:      Mon, 31 Mar 2025 03:14:07 -0300',
          '      Finished:     Mon, 31 Mar 2025 04:02:55 -0300',
        ],
      },
      {
        id: 'capturar',
        comando: 'kubectl exec web-6f8b7c9d4-2xk7p -- kill -QUIT 1 && kubectl cp web-6f8b7c9d4-2xk7p:/tmp/heap.hprof ./heap.hprof',
        tone: 'accent',
        salida: ['heap dump escrito en /tmp/heap.hprof (412 MiB)', 'copiado a ./heap.hprof'],
      },
      {
        id: 'mitigar',
        comando: 'kubectl rollout restart deployment/web',
        tone: 'ok',
        salida: ['deployment.apps/web restarted'],
      },
      {
        id: 'verificar',
        comando: 'kubectl top pods -l app=web --sort-by=memory',
        tone: 'ok',
        salida: [
          'NAME                    CPU(cores)   MEMORY(bytes)',
          'web-7c4d9f2a1-b8k2m     39m          186Mi',
          'web-7c4d9f2a1-h3p9x     41m          191Mi',
          'web-7c4d9f2a1-n6t4w     37m          179Mi',
        ],
      },
    ],
  },
  {
    id: 'high-cpu',
    icono: 'Cpu',
    severidad: 'P2',
    servicio: 'web',
    senal: 'rate(container_cpu_usage_seconds_total{pod=~"web-.*"}[5m]) > 0.9 for 5m',
    pasos: [
      {
        id: 'confirmar',
        comando: 'kubectl top pods -l app=web --sort-by=cpu',
        tone: 'muted',
        salida: [
          'NAME                    CPU(cores)   MEMORY(bytes)',
          'web-6f8b7c9d4-2xk7p     958m         204Mi',
          'web-6f8b7c9d4-9lm3q     944m         198Mi',
          'web-6f8b7c9d4-tq8vn     951m         201Mi',
        ],
      },
      {
        id: 'correlacionar',
        comando: 'kubectl rollout history deployment/web --revision=0 | tail -3',
        tone: 'warn',
        salida: [
          'REVISION  CHANGE-CAUSE',
          '17        image: web:1.8.2   (2025-03-31 02:51)',
          '18        image: web:1.9.0   (2025-03-31 03:08)   <-- 6 min antes de la alerta',
        ],
      },
      {
        id: 'culpable',
        comando: 'kubectl exec web-6f8b7c9d4-2xk7p -- py-spy top --pid 1 --duration 10',
        tone: 'crit',
        salida: [
          'Total Samples 1000',
          '%Own   %Total  Function (filename)',
          '71.4%  71.4%   _compile_pattern (re/__init__.py)',
          ' 8.1%  79.5%   validate_payload (app/schema.py)',
          ' 3.2%  82.7%   handle (app/http.py)',
        ],
      },
      {
        id: 'mitigar',
        comando: 'kubectl rollout undo deployment/web --to-revision=17',
        tone: 'ok',
        salida: ['deployment.apps/web rolled back'],
      },
      {
        id: 'verificar',
        comando: 'kubectl top pods -l app=web --sort-by=cpu',
        tone: 'ok',
        salida: [
          'NAME                    CPU(cores)   MEMORY(bytes)',
          'web-5a2c8e7b3-k9v4r     46m          193Mi',
          'web-5a2c8e7b3-m2x8t     44m          188Mi',
          'web-5a2c8e7b3-w7q1c     43m          190Mi',
        ],
      },
    ],
  },
  {
    id: 'db-connections',
    icono: 'Database',
    severidad: 'P1',
    servicio: 'postgres',
    senal: 'pg_stat_activity_count / pg_settings_max_connections > 0.95 for 2m',
    pasos: [
      {
        id: 'confirmar',
        comando: 'psql -c "SELECT count(*) FROM pg_stat_activity" -c "SHOW max_connections"',
        tone: 'crit',
        salida: [' count ', '-------', '   198', '(1 row)', '', ' max_connections ', '-----------------', ' 200'],
      },
      {
        id: 'quienes',
        comando: 'psql -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state ORDER BY 2 DESC"',
        tone: 'warn',
        salida: [
          '        state        | count ',
          '---------------------+-------',
          ' idle in transaction |   171',
          ' active              |    19',
          ' idle                |     8',
          '(3 rows)',
        ],
      },
      {
        id: 'contener',
        comando:
          "psql -c \"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < now() - interval '5 minutes';\"",
        tone: 'ok',
        salida: ['pg_terminate_backend', '----------------------', '(164 rows)'],
      },
      {
        id: 'mitigar',
        comando: 'kubectl set env deployment/web DB_POOL_MAX=10 && kubectl rollout status deployment/web',
        tone: 'ok',
        salida: [
          'deployment.apps/web env updated',
          'Waiting for deployment "web" rollout to finish: 2 of 3 updated replicas are available...',
          'deployment "web" successfully rolled out',
        ],
      },
      {
        id: 'verificar',
        comando: 'psql -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state ORDER BY 2 DESC"',
        tone: 'ok',
        salida: [
          '        state        | count ',
          '---------------------+-------',
          ' idle                |    24',
          ' active              |     6',
          '(2 rows)',
        ],
      },
    ],
  },
]

export const IDS_PLAYBOOK = PLAYBOOKS.map((p) => p.id)

export function playbookPorId(id) {
  return PLAYBOOKS.find((p) => p.id === id) ?? null
}

/** Ids de paso de un playbook, para verificar que estén traducidos todos. */
export function pasosDe(id) {
  return playbookPorId(id)?.pasos.map((p) => p.id) ?? []
}
