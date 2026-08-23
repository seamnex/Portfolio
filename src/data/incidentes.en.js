// ─────────────────────────────────────────────────────────────
//  Incident log (EN) — mirror of `incidentes.js`.
//
//  Same rule applies: every number comes from `medidas.js`, which
//  comes from a lab run with a published log. English formats the
//  decimals with a point, which is exactly why the raw values live
//  in one place and the formatting happens here.
// ─────────────────────────────────────────────────────────────
import { MEDIDAS as M, num } from './medidas.js'

const n = (v) => num(v, 'en')

export const incidentesMeta = {
  label: 'Incident log',
  titulo: 'Post-mortems: the format I use when the incident is real',
  bajada:
    'Four faults injected on purpose in my labs, written up the way a production post-mortem should be: timeline, root cause, impact and corrective actions with their cost. The value is not the incident — I caused it — but the method and what each one left measured.',
  aviso:
    'Faults injected in a lab environment, not production incidents from an employer. Every number links to the repo log where it was measured.',
  cta: 'Open post-mortem',
  pista: 'Inside the report: ← → switch incident · Esc closes',
}

export const incidentes = [
  {
    id: 'inc-5xx',
    codigo: 'INC-2026-01',
    titulo: 'HTTP 5xx spike and automatic remediation',
    resumen:
      'An injected degradation, caught by a threshold rule and stopped by an automatic runbook. The finding was not the incident: it was discovering that 45 of the 75 s of MTTR came from the measuring instrument itself.',
    severidad: 'P1',
    tono: 'crit',
    servicio: 'api-demo · Elasticsearch + Kibana stack',
    lab: 'observability-lab',
    fecha: 'August 2026',
    estado: 'Closed',
    duracion: `${n(M.mttr)} s`,
    impactoUsuario: 'Simulated: elevated error rate during the experiment window',
    deteccion: `Threshold rule: > ${M.umbralPorcentaje}% 5xx over a ${M.ventanaSegundos} s sliding window`,
    metricas: [
      { k: 'MTTD', v: `${n(M.mttd)} s`, tone: 'crit' },
      { k: 'MTTR', v: `${n(M.mttr)} s`, tone: 'warn' },
      { k: 'Instrument latency', v: `${n(M.ventanaInstrumento[0])} s`, tone: 'muted' },
    ],
    timeline: [
      {
        t: 'T+0 s',
        texto:
          'The generator injects the degradation and writes a marker into Elasticsearch. That marker — not a stopwatch — is the time origin for everything that follows.',
        tone: 'crit',
      },
      {
        t: `T+${n(M.mttd)} s`,
        texto: `The threshold rule crosses ${M.umbralPorcentaje}% of 5xx within the ${M.ventanaSegundos} s window and fires the alert. This is the measured MTTD.`,
        tone: 'warn',
      },
      {
        t: `T+${n(M.mttr)} s`,
        texto:
          'The automatic runbook actually stops the fault — it does not simulate stopping it — and the error rate returns to baseline. Cycle closed: total MTTR.',
        tone: 'ok',
      },
    ],
    causaRaiz: [
      'Cause of the event: degradation induced on purpose by the load generator. No mystery there, and the post-mortem does not pretend otherwise.',
      `Cause of the MTTD: the ${M.ventanaSegundos} s sliding window needs to accumulate samples before the percentage crosses the threshold. An alert cannot be faster than the window feeding it.`,
      `Unplanned finding: ${n(M.ventanaInstrumento[0])} s and ${n(M.ventanaInstrumento[1])} s of latency across two runs whose MTTDs differed by more than 2×. That consistency proves the segment belongs to the instrument, not the system.`,
    ],
    impacto: `On users, none: it is a lab. On the measurement, plenty — over half the reported MTTR was not the incident. If that same instrument measured production, the number reaching the business would be inflated by ~${n(M.ventanaInstrumento[0])} s per event and nobody would notice.`,
    acciones: [
      {
        texto: `Alternative rule requiring a single evaluation above the threshold: brings MTTD down to ${n(M.mttdSensible)} s.`,
        estado: 'Verified',
      },
      {
        texto:
          'Document the cost of that rule: it fires on any transient spike. It stays an informed option, not the default.',
        estado: 'Done',
      },
      {
        texto:
          'Minimum sample floor in the rule: without it, two failed requests out of three read as a 66% error rate and page for nothing.',
        estado: 'Done',
      },
      {
        texto: 'Report MTTR splitting incident from instrument. One number merges two things that get fixed differently.',
        estado: 'Done',
      },
    ],
    leccion:
      'Before chasing the system MTTR, measure the MTTR of the tool measuring it. Part of what gets reported as time-to-resolve is latency of the observability stack itself.',
    repo: 'https://github.com/seamnex/observability-lab#bitácora-de-corridas',
  },

  {
    id: 'inc-rolling',
    codigo: 'INC-2026-02',
    titulo: 'Requests dropped during a rolling update',
    resumen:
      'A deploy that looked clean was losing 8 of every 425 requests. They were not 5xx: they were code 000 — connection refused — invisible to any monitor that only watches status codes.',
    severidad: 'P2',
    tono: 'warn',
    servicio: 'nginx Deployment · ClusterIP Service',
    lab: 'k8s-lab',
    fecha: 'August 2026',
    estado: 'Closed · fixed and verified',
    duracion: 'Rollout window',
    impactoUsuario: `${M.rollingFallosSinHook} of ${M.rollingTotalSinHook} requests with no response (${n(M.rollingPorcentajeSinHook)}%)`,
    deteccion: 'External probe against the Service during the rollout, counting response codes',
    metricas: [
      { k: 'Before the fix', v: `${M.rollingFallosSinHook} / ${M.rollingTotalSinHook}`, tone: 'crit' },
      { k: 'After the fix', v: `${M.rollingFallosConHook} / ${M.rollingTotalConHook}`, tone: 'ok' },
      { k: 'Cost of the fix', v: `+${n(M.rolloutCostoSegundos)} s rollout`, tone: 'muted' },
    ],
    timeline: [
      {
        t: 'Rollout',
        texto:
          'The rolling update starts. Kubernetes reports the deploy as successful: no pod entered CrashLoop and the final state is the expected one.',
        tone: 'muted',
      },
      {
        t: 'During',
        texto: `The probe records ${M.rollingFallosSinHook} failures in ${M.rollingTotalSinHook} requests (${n(M.rollingPorcentajeSinHook)}%). The detail that matters: code 000, not 5xx. The server did not answer badly — it did not answer.`,
        tone: 'crit',
      },
      {
        t: 'Diagnosis',
        texto:
          'kube-proxy kept routing to a pod whose nginx had already closed the listener. Removing the endpoint from the Service and sending SIGTERM to the container are asynchronous: nothing guarantees the order.',
        tone: 'warn',
      },
      {
        t: 'Fix',
        texto: `A ${M.preStopSegundos} s preStop hook: the container waits before terminating, so by the time it closes, endpoint removal has already propagated.`,
        tone: 'accent',
      },
      {
        t: 'Verification',
        texto: `A/B in the same cluster and the same session, toggling only the hook: ${M.rollingFallosConHook} failures in ${M.rollingTotalConHook} requests.`,
        tone: 'ok',
      },
    ],
    causaRaiz: [
      'A race between two concurrent events: removing the pod from the Service (which kube-proxy has to propagate) and closing the process inside the container. Kubernetes triggers both together and orders neither.',
      'While propagation is still in flight, kube-proxy sends traffic to a listener that no longer exists: connection refused, which the client sees as code 000.',
      'Why it went unnoticed for so long: a 5xx rate dashboard stays perfectly green throughout the event. The failure never gets far enough to produce an HTTP response.',
    ],
    impacto: `${n(M.rollingPorcentajeSinHook)}% of traffic during every deploy window. In a lab that is an anecdote; in a system deploying several times a day it is a recurring error rate no dashboard shows and everyone blames on "something with the network".`,
    acciones: [
      { texto: `${M.preStopSegundos} s preStop hook on the Deployment.`, estado: 'Done' },
      {
        texto: `Accept the cost explicitly: the rollout takes ~${n(M.rolloutCostoSegundos)} s longer. Cheap next to ${n(M.rollingPorcentajeSinHook)}% of dropped requests.`,
        estado: 'Done',
      },
      {
        texto: 'Validate the hypothesis as an A/B before trusting it, rather than accepting "it stopped happening after the change".',
        estado: 'Verified',
      },
      {
        texto: 'Count connection-level codes alongside HTTP status in the probe: 000 is a failure class of its own.',
        estado: 'Done',
      },
    ],
    leccion:
      'A deploy Kubernetes reports as successful can still be dropping traffic. And if monitoring only watches status codes, the failure does not exist for anyone until a user reports it.',
    repo: 'https://github.com/seamnex/k8s-lab#el-fix-cerrar-la-ventana-del-experimento-2',
  },

  {
    id: 'inc-autoheal',
    codigo: 'INC-2026-03',
    titulo: 'Pod killed under live traffic: auto-healing',
    resumen:
      'Killing a pod while the Service takes sustained traffic. Back to 3/3 Ready in 7.2 s with zero requests lost: load balancing pulled it out of rotation before the probe could notice.',
    severidad: 'P3',
    tono: 'ok',
    servicio: `${M.replicas}-replica Deployment · Kubernetes ${M.kubernetes}`,
    lab: 'k8s-lab',
    fecha: 'August 2026',
    estado: 'Closed · no impact',
    duracion: `${n(M.autohealing)} s`,
    impactoUsuario: `None — ${M.autohealingOk} of ${M.autohealingTotal} requests returned 200`,
    deteccion: `Internal probe against the Service at ~${M.sondaReqPorSegundo} req/s throughout the experiment`,
    metricas: [
      { k: 'Back to 3/3 Ready', v: `${n(M.autohealing)} s`, tone: 'ok' },
      { k: 'Successful requests', v: `${M.autohealingOk} / ${M.autohealingTotal}`, tone: 'ok' },
      { k: 'User impact', v: 'Zero', tone: 'ok' },
    ],
    timeline: [
      {
        t: 'T+0 s',
        texto: `A pod is deleted by hand with traffic in flight (~${M.sondaReqPorSegundo} req/s against the Service).`,
        tone: 'warn',
      },
      {
        t: 'Immediately',
        texto:
          'The endpoint leaves the Service. The probe records not a single failed request: balancing stopped sending it traffic before a retry was ever needed.',
        tone: 'ok',
      },
      {
        t: `T+${n(M.autohealing)} s`,
        texto: `The ReplicaSet brings up the replacement and the Deployment is back to ${M.replicas}/${M.replicas} Ready.`,
        tone: 'ok',
      },
    ],
    causaRaiz: [
      'Injected fault: deliberate deletion of a pod. The goal was to measure recovery, not to uncover a cause.',
      'What the experiment does explain is why the number is zero: endpoint removal is immediate when the pod terminates gracefully, so traffic is redirected before anyone gets an error.',
      'The contrast that gives INC-2026-02 its meaning: the same mechanism, when racing against process shutdown during a rollout, does drop requests. The happy path and the broken one differ in ordering, not in design.',
    ],
    impacto:
      'None. Worth writing up anyway: an experiment with a clean result sets the baseline the failing one is measured against.',
    acciones: [
      { texto: 'Record the number as the cluster recovery baseline.', estado: 'Done' },
      {
        texto: 'Repeat the scenario during a rollout, where termination is not graceful. That led to INC-2026-02.',
        estado: 'Done',
      },
    ],
    leccion:
      'Auto-healing is not the same as service continuity. Here they coincided; in the rolling update they did not. Measuring one says nothing about the other.',
    repo: 'https://github.com/seamnex/k8s-lab#bitácora-de-experimentos',
  },

  {
    id: 'inc-pdb',
    codigo: 'INC-2026-04',
    titulo: 'Eviction blocked by PodDisruptionBudget (HTTP 429)',
    resumen:
      'Second consecutive eviction against the Eviction API: 429. Not a failure — the control doing its job. Documented because a 429 without context reads as an error and gets "fixed" by deleting the PDB.',
    severidad: 'P4',
    tono: 'accent',
    servicio: `${M.replicas}-replica Deployment · PodDisruptionBudget`,
    lab: 'k8s-lab',
    fecha: 'August 2026',
    estado: 'Closed · expected behaviour',
    duracion: 'Immediate',
    impactoUsuario: 'None — the PDB is precisely what prevented it',
    deteccion: 'Direct call to the Eviction API, checking the response code',
    metricas: [
      { k: 'First eviction', v: 'Accepted', tone: 'ok' },
      { k: 'Second eviction', v: 'HTTP 429', tone: 'accent' },
      { k: 'Replicas affected', v: `1 of ${M.replicas}`, tone: 'muted' },
    ],
    timeline: [
      {
        t: 'Eviction 1',
        texto: 'The Eviction API accepts it: enough capacity remains to satisfy the disruption budget.',
        tone: 'ok',
      },
      {
        t: 'Eviction 2',
        texto:
          'The API answers 429 Too Many Requests. With the previous pod still out, granting this one would take the service below the declared minimum.',
        tone: 'accent',
      },
      {
        t: 'Reading it right',
        texto:
          'The 429 is not a permanent rejection: it means "not now". A node drain retries until the budget allows it, so maintenance serialises itself.',
        tone: 'muted',
      },
    ],
    causaRaiz: [
      'There is no root cause to fix: the PodDisruptionBudget did exactly what it was asked to do.',
      'The experiment exists to verify the control is live. A misconfigured PDB gives no warning: you find out on maintenance day, once it has already taken the service down.',
      'The real operational risk is interpretation: whoever sees a 429 mid-drain without knowing what it is deletes the PDB to "unblock" and removes the only protection in place.',
    ],
    impacto:
      'None on the service, which is the point: the disruption budget stopped maintenance from pushing availability below the declared minimum.',
    acciones: [
      { texto: 'Verify the PDB with the Eviction API instead of assuming it works because it is declared.', estado: 'Done' },
      { texto: 'Document the 429 in the node-drain runbook with the correct reading next to it.', estado: 'Done' },
      {
        texto: 'Add the PDB check to the CI that already validates manifests with yamllint and kubeconform.',
        estado: 'Pending',
      },
    ],
    leccion:
      'A safety control that was never tested is an assumption. And an error code with no context in a runbook is an invitation to disable it under pressure.',
    repo: 'https://github.com/seamnex/k8s-lab#bitácora-de-experimentos',
  },
]
