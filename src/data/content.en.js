// ─────────────────────────────────────────────────────────────
//  Site content in ENGLISH — mirror of `content.js`.
//
//  Everything that is NOT prose (links, repo URLs, stack lists, icon
//  names, tones, commands) is spread in from the Spanish file and only
//  the translated fields are overridden. That is deliberate: a repo URL
//  or a tone token duplicated across two files is a pair that silently
//  drifts apart. Prose is the only thing that genuinely differs.
//
//  Numbers are the exception that proves the rule: they are re-derived
//  from `medidas.js` here because English writes 7.2 where Spanish
//  writes 7,2. Same single source, two formats.
// ─────────────────────────────────────────────────────────────
import { MEDIDAS, num } from './medidas.js'
import {
  profile as profileEs,
  labMetrics as labMetricsEs,
  skills as skillsEs,
  projects as projectsEs,
  timeline as timelineEs,
} from './content.js'

export { incidentes, incidentesMeta } from './incidentes.en.js'

const n = (v) => num(v, 'en')

/** Merges translations into the Spanish records, matching by `id`. */
const traducirPorId = (base, traducciones) =>
  base.map((item) => ({ ...item, ...(traducciones[item.id] ?? {}) }))

export const profile = {
  ...profileEs,
  rol: 'IT Incident Manager · Incident Analyst',
  target: 'Junior SRE / DevOps Engineer',
  ubicacion: 'Buenos Aires, Argentina · Remote / Hybrid',
  disponibilidad: 'Open to new opportunities',
  cv: '/cv-samuel-garcia-baciliadis-sre-en.pdf',
  cvArchivo: 'CV-Samuel-Garcia-Baciliadis-SRE-EN.pdf',
}

export const hero = {
  headline: ['From the critical incident', 'to resilience by design.'],
  subtitle:
    'I run P1/P2 incidents in high-volume environments — Fintech and Telco — leading War Rooms, restoring service and closing the loop with RCAs that stop the same failure from coming back. Today I am taking that operational discipline into SRE and DevOps: observability, automation and systems that fail rarely and recover fast.',
  terminal: {
    titulo: 'incident-console — bash',
    prompt: 'samuel@sre-lab:~$',
    comando: 'kubectl get incidents --severity=P1 --status=resolved',
    salida: [
      { k: 'MTTD measured in lab', v: `${n(MEDIDAS.mttd)} s — with a published log`, tone: 'ok' },
      { k: 'War Rooms led', v: 'Fintech · Telco', tone: 'accent' },
      { k: 'Improvement loop', v: 'Detect → Mitigate → RCA → Prevent', tone: 'muted' },
      { k: 'Status', v: 'ONLINE — open to offers', tone: 'ok' },
    ],
  },
  sandbox: {
    tag: 'Live sandbox',
    titulo: 'Inject failures live',
    texto:
      'Chaos engineering with auto-healing, runbooks and a console: break something and watch it recover. Runs in your browser, nothing to install.',
    cta: 'Open the Chaos Lab',
  },
}

export const metrics = [
  { valor: '8+', unidad: 'years', label: 'in IT operations and N2-N3 technical support' },
  { valor: 'P1/P2', unidad: '', label: 'end-to-end critical incident management' },
  { valor: '24×7', unidad: '', label: 'high-availability production environments' },
  { valor: '15+', unidad: 'tools', label: 'for monitoring, observability and automation' },
]

export const labMetrics = {
  ...labMetricsEs,
  label: 'Key Infrastructure Metrics',
  titulo: 'Numbers that came from breaking things, not from estimating them',
  bajada:
    'Every figure comes from a run with its log published: environment, measurement method and sample count. Where the result depends on a configuration decision, the cost of that decision is there too.',
  verBitacora: 'Read the log',
  items: traducirPorId(labMetricsEs.items, {
    autohealing: {
      valor: n(MEDIDAS.autohealing),
      titulo: 'Kubernetes auto-healing',
      resumen: `Back to ${MEDIDAS.replicas}/${MEDIDAS.replicas} pods Ready after killing a pod under live traffic.`,
      evidencia: `${MEDIDAS.autohealingOk} of ${MEDIDAS.autohealingTotal} requests returned 200: the Service pulled the dead pod out of rotation before the probe could notice.`,
      metodo: `Internal probe against the Service at ~${MEDIDAS.sondaReqPorSegundo} req/s · Kubernetes ${MEDIDAS.kubernetes}`,
    },
    rolling: {
      unidad: 'failures',
      titulo: 'Rolling updates with nothing dropped',
      resumen: `Requests lost during the deploy, after adding a ${MEDIDAS.preStopSegundos} s preStop hook.`,
      evidencia: `${MEDIDAS.rollingFallosConHook} in ${MEDIDAS.rollingTotalConHook} requests, against ${MEDIDAS.rollingFallosSinHook} in ${MEDIDAS.rollingTotalSinHook} without the hook (${n(MEDIDAS.rollingPorcentajeSinHook)}%). They were not 5xx but code 000: kube-proxy routing to an nginx that had already closed its listener. The price is a rollout ~${n(MEDIDAS.rolloutCostoSegundos)} s slower.`,
      metodo: 'A/B in the same cluster and the same session, toggling only the hook',
    },
    mttd: {
      valor: n(MEDIDAS.mttd),
      titulo: 'Incident MTTD',
      resumen: 'From the moment the 5xx rate spikes until the alert catches it.',
      evidencia: `Drops to ${n(MEDIDAS.mttdSensible)} s by requiring a single evaluation above the threshold, at the cost of firing on any transient spike. Total cycle MTTR: ${n(MEDIDAS.mttr)} s.`,
      metodo: `Markers in Elasticsearch, not a stopwatch · ${MEDIDAS.ventanaSegundos} s window, ${MEDIDAS.umbralPorcentaje}% threshold`,
    },
  }),
  nota: {
    titulo: 'The number I was not looking for',
    texto: `${Math.round(MEDIDAS.ventanaInstrumento[0])} of the ${Math.round(MEDIDAS.mttr)} seconds of MTTR were not the incident: they were my own sliding window measuring. The proof is that this segment came out at ${n(MEDIDAS.ventanaInstrumento[0])} s and ${n(MEDIDAS.ventanaInstrumento[1])} s across two runs whose MTTDs differed by more than 2×. It is a constant of the instrument, not of the system — which means part of the MTTR reported to the business is latency of the observability stack itself.`,
  },
}

export const about = {
  label: 'About me',
  titulo: 'A hybrid profile: whoever puts out the fire knows where the short circuit was',
  bajada:
    'Incident management experience is not a stepping stone towards SRE: it is precisely the input that makes SRE practice worth anything.',
  parrafos: [
    'I am a hybrid profile: I come from the operational trenches — the 3 AM call, the service down, the customer waiting — and I bring back to them the engineering practices that keep that call from happening again.',
    'For years I ran critical incidents at Personal Pay (Fintech) and Telecom Argentina (Telco): coordinating War Rooms with infrastructure, development and business teams, prioritising under pressure by real impact, communicating status to stakeholders and closing every event with an actionable RCA. That work left me with one conviction: most incidents are not surprises — they are technical debt and missing observability collecting their bill.',
    'That is why I specialise in SRE and DevOps today. Managing incidents under ITIL gives me something no course teaches: understanding what fails, why it fails and which signals were pointing at it beforehand. Combined with Docker, Kubernetes, Infrastructure as Code, CI/CD and scripting, that perspective turns into prevention: alerts that matter, runbooks that run themselves and architectures that degrade gracefully instead of falling over.',
  ],
  puente: {
    label: 'The bridge',
    reactivo: { etiqueta: 'Reactive · ITIL', texto: 'Detect, mitigate and restore service under pressure' },
    preventivo: { etiqueta: 'Preventive · SRE', texto: 'Instrument, automate and design so it does not happen again' },
  },
  comoTrabajo: 'How I work',
  principios: [
    {
      titulo: 'MTTR is attacked before the incident',
      texto:
        'An incident that resolves fast was built long before: with correct instrumentation, alerts carrying signal (not noise), current runbooks and clear ownership.',
    },
    {
      titulo: 'Without an RCA, the incident is not over',
      texto:
        'Restoring service is half the job. The other half is root cause, the preventive action and following it through to a real close.',
    },
    {
      titulo: 'Blameless by default',
      texto:
        'Systems fail, not people. Blameless post-mortems are the ones that produce real improvements, because information flows without fear.',
    },
    {
      titulo: 'Automate whatever repeats',
      texto:
        'Any manual task executed twice under pressure is a candidate for a script. Toil eats the time that should go to reliability.',
    },
  ],
}

export const skillsMeta = {
  label: 'Areas of specialisation',
  titulo: 'Technical stack and working domains',
  bajada:
    'Four blocks that reinforce each other: what observability detects, incident process manages, DevOps practice prevents and code automates.',
  hint: 'Click any card to expand the tooling detail',
}

export const skills = traducirPorId(skillsEs, {
  incident: {
    tagline: 'The critical event, end to end',
    nivel: 'Expert',
    descripcion:
      'P1/P2 incident coordination, War Room leadership, impact-based prioritisation, stakeholder communication and closure with root cause.',
    items: [
      'ITIL v4 (Incident, Problem & Change)',
      'SLA / SLO / SLI management',
      'RCA and blameless post-mortems',
      'P1/P2 War Room leadership',
      'MTTR / MTTD reduction',
      'Jira Service Management · ServiceNow',
      'Escalation and 24×7 on-call',
      'Executive availability reporting',
    ],
  },
  observability: {
    titulo: 'Observability & Monitoring',
    tagline: 'Detect before the user does',
    nivel: 'Advanced',
    descripcion:
      'Instrumentation, alert tuning and analysis of metrics, logs and traces to shorten time to detection and diagnosis.',
    items: [
      'Dynatrace (APM and alerting)',
      'Datadog (dashboards and monitors)',
      'Zabbix (infrastructure)',
      'Elastic / Kibana (log analytics)',
      'Control-M (batch and scheduling)',
      'AWS CloudWatch',
      'Threshold and SLO definition',
      'Noise and alert-fatigue reduction',
    ],
  },
  devops: {
    tagline: 'The active specialisation track',
    nivel: 'Actively training',
    descripcion:
      'Personal labs covering containers, orchestration, infrastructure as code and continuous integration pipelines.',
    items: [
      'Linux (administration and troubleshooting)',
      'Docker · images and compose',
      'Kubernetes (workloads and services)',
      'Vagrant · VirtualBox (local IaC)',
      'Maven (build lifecycle)',
      'Git / GitHub · workflows',
      'CI/CD (pipelines and automation)',
      'AWS · Chocolatey',
    ],
  },
  dev: {
    titulo: 'Development & Automation',
    tagline: 'Scripts that remove toil',
    nivel: 'Intermediate',
    descripcion:
      'Automation of operational tasks, internal tooling and web development for dashboards and personal projects.',
    items: [
      'Python (automation and parsing)',
      'Bash scripting',
      'React · JavaScript (ES6+)',
      'Node.js',
      'HTML5 · CSS3 · Tailwind',
      'REST APIs and integrations',
      'PowerShell',
      'Technical documentation and runbooks',
    ],
  },
})

export const projectsMeta = {
  label: 'DevOps Labs',
  titulo: 'What I build to understand how things break',
  bajada:
    'Every lab starts from a concrete operational question. These are not course exercises: they are environments where I reproduce failures, measure detection and prove the response works before needing it in production.',
  problema: 'The problem',
  solucion: 'The solution',
  codigo: 'Code',
  demo: 'Demo',
  filtros: { todos: 'All', 'DevOps Lab': 'DevOps Labs', 'Proyecto Web': 'Web projects' },
}

export const projects = traducirPorId(projectsEs, {
  'vagrant-lab': {
    titulo: 'Virtualisation environment with Vagrant + VirtualBox',
    categoria: 'DevOps Lab · Infrastructure as Code',
    estado: 'In progress',
    problema:
      'Testing server configurations and failure scenarios in production is not an option. I needed a local environment that was reproducible, disposable and versioned.',
    solucion:
      'A multi-VM lab defined in code with a Vagrantfile: three Ubuntu nodes on a private network and two provisioning layers. A Bash bootstrap for the bare minimum, and an Ansible playbook describing the end state of each role — Nginx on the app nodes, Docker on the monitoring one — instead of a sequence of steps.',
    highlights: [
      'Infrastructure reproducible from code',
      'Idempotent provisioning: re-runnable against a node in any state',
      'Real verification over HTTP, not just "systemd says started"',
    ],
  },
  'observability-lab': {
    titulo: 'Monitoring dashboard & log analytics',
    categoria: 'DevOps Lab · Observability',
    estado: 'In progress',
    problema:
      'Late detection is the main driver of a high MTTR. I wanted to reproduce the full loop in a lab: metric → threshold → alert → diagnosis.',
    solucion:
      'A containerised stack with Elasticsearch and Kibana, plus a closed detection-and-response loop: the generator injects the degradation and leaves a marker, the threshold rule catches it and computes MTTD, and the automatic runbook actually stops the fault — which is what makes MTTR measurable. Timings come from subtracting timestamps, not from a stopwatch.',
    highlights: [
      `MTTD measured: ${n(MEDIDAS.mttd)} s — and ${n(MEDIDAS.mttdSensible)} s with the more sensitive rule`,
      'Automatic remediation that acts rather than simulates',
      'Every alert parameter justified, including the minimum sample floor',
    ],
  },
  'k8s-lab': {
    titulo: 'Kubernetes laboratory cluster',
    categoria: 'DevOps Lab · Orchestration',
    estado: 'In progress',
    problema:
      'Understanding the resilience of a distributed system requires breaking it: seeing what happens when a pod dies, a node goes down or a deploy goes wrong.',
    solucion:
      'A local cluster with five faults injected by hand and a log of what each one measured. Two of the five experiments hit the user, and I fixed one of them: the rolling update was dropping requests due to a race between removing the pod from the Service and closing the process. The hypothesis was verified as an A/B before being accepted.',
    highlights: [
      `preStop hook: from ${MEDIDAS.rollingFallosSinHook} failures in ${MEDIDAS.rollingTotalSinHook} requests to ${MEDIDAS.rollingFallosConHook} in ${MEDIDAS.rollingTotalConHook}`,
      'PodDisruptionBudget verified with the Eviction API (429 on the second eviction)',
      'CI validating the manifests: yamllint + kubeconform on every push',
    ],
  },
})

export const timelineMeta = {
  label: 'Career & learning',
  titulo: 'Career map: from the help desk to designing for resilience',
  bajada:
    'A deliberate progression: first understand the user, then the system, then the incident — and today, the engineering that prevents it.',
}

// El timeline no tiene `id`, así que se traduce por posición: el orden es
// significativo (cronológico inverso) y no cambia sin que se note.
export const timeline = timelineEs.map((item, i) => ({
  ...item,
  ...[
    {
      periodo: 'Present',
      rol: 'SRE / DevOps specialisation',
      org: 'Self-directed training and personal labs',
      resumen:
        'An active specialisation track in DevOps culture and tooling: containers, orchestration, infrastructure as code and CI/CD, with hands-on personal labs.',
      bullets: [
        'Docker, Kubernetes and Linux administration',
        'Local IaC with Vagrant and VirtualBox · builds with Maven',
        'Python and Bash scripting applied to operational automation',
        'Git/GitHub and CI/CD pipeline fundamentals',
      ],
    },
    {
      periodo: 'May 2024 – Present',
      rol: 'IT Incident Manager · Incident Analyst',
      org: 'Personal Pay',
      resumen:
        'Critical incident management on a high-volume financial platform, where every minute of downtime hits users and the business directly.',
      bullets: [
        'Leading P1/P2 War Rooms through to service restoration',
        'Root cause analysis (RCA) and follow-up on preventive actions',
        'Monitoring and diagnosis with Dynatrace, Datadog and Elastic/Kibana',
        'Communicating status and impact to technical and business stakeholders',
        'Working against SLAs with sustained focus on reducing MTTR',
      ],
    },
    {
      periodo: 'Telco',
      rol: 'Incident Analyst · IT Operations',
      org: 'Telecom Argentina',
      resumen:
        'Operating critical services on large-scale telecommunications infrastructure, on 24×7 rotations with demanding availability targets.',
      bullets: [
        'End-to-end incident lifecycle management',
        'Infrastructure and batch process monitoring (Zabbix, Control-M)',
        'Coordination across infrastructure, network and development teams',
        'Documentation of operational procedures and runbooks',
      ],
    },
    {
      periodo: 'Earlier career',
      rol: 'Help Desk Lead · N2-N3 Technical Support',
      org: 'Operations and Service Desk',
      resumen:
        'Coordinating operational support teams, focused on SLA compliance, service quality and second- and third-line technical resolution.',
      bullets: [
        'Leading and training support teams',
        'Ticket queue management and SLA compliance',
        'N2-N3 troubleshooting across systems and platforms',
        'Continuous improvement of support and escalation processes',
      ],
    },
  ][i],
}))

export const contacto = {
  label: 'Contact',
  titulo: "Let's talk about reliability",
  bajada:
    'I am open to Incident Management, SRE or Junior DevOps roles, and to projects where service availability is a requirement rather than a wish. I reply within 24 business hours.',
}

// ─────────────────────────────────────────────────────────────
//  CV in PDF — see the Spanish file for why almost everything is
//  derived from the other exports rather than written twice.
// ─────────────────────────────────────────────────────────────
export const cv = {
  titular: 'IT Incident Manager · Incident Analyst → Junior SRE / DevOps Engineer',
  resumen:
    'Over 8 years in IT operations, focused on critical P1/P2 incident management in Fintech and Telecommunications: leading War Rooms, restoring service under pressure and closing out with RCAs and preventive actions. Today I am directing that discipline towards SRE and DevOps — observability, automation and reliability — through personal labs where I inject faults, measure detection and recovery, and publish the log of every run.',
  secciones: {
    perfil: 'Professional profile',
    competencias: 'Technical skills',
    experiencia: 'Professional experience',
    labs: 'Personal labs · measured results',
    formacion: 'Education',
  },
  competencias: [
    {
      grupo: 'Incident and operations management',
      items: 'ITIL v4 (Incident, Problem & Change) · P1/P2 War Rooms · RCA and blameless post-mortems · SLA/SLO/SLI · MTTR and MTTD reduction · 24×7 on-call · Jira Service Management · ServiceNow',
    },
    {
      grupo: 'Observability and monitoring',
      items: 'Dynatrace · Datadog · Elastic/Kibana · Zabbix · Control-M · AWS CloudWatch · threshold and SLO definition · noise and alert-fatigue reduction',
    },
    {
      grupo: 'DevOps, containers and cloud',
      items: 'Linux · Docker · Kubernetes · Vagrant/VirtualBox (IaC) · Ansible · GitHub Actions · CI/CD · Maven · AWS · Git/GitHub',
    },
    {
      grupo: 'Automation and development',
      items: 'Python · Bash · PowerShell · REST APIs · JavaScript/React · Node.js · technical documentation and runbooks',
    },
  ],
  formacion: [
    { titulo: 'Higher Technical Degree in Computer Science', org: 'Tertiary education', detalle: '' },
    { titulo: 'Kubernetes', org: 'Udemy', detalle: 'In progress' },
    { titulo: 'Web Design', org: 'Udemy', detalle: '' },
    {
      titulo: 'SRE / DevOps specialisation',
      org: 'Self-directed',
      detalle: 'Containers, orchestration, IaC and CI/CD through personal labs',
    },
  ],
  etiquetas: {
    stack: 'Stack',
    contexto: 'Context',
  },
  nota: 'Every lab metric is published with its log — environment, method and samples — in the repos at github.com/seamnex.',
}

export const ui = {
  idioma: {
    etiqueta: 'Language',
    cambiar: 'Change site language',
    a: { es: 'Ver el sitio en español', en: 'View this site in English' },
  },

  // Las tres vistas principales. Ver el comentario largo en content.js:
  // `nav` es la pestaña de la barra, `titulo` el nombre completo que oye
  // un lector de pantalla, `resumen` lo que muestra el banner de la
  // portada y `aviso` el punto de "quedó algo corriendo acá".
  vistas: {
    aria: 'Main site views',
    perfil: {
      nav: 'Profile',
      navCorto: 'Profile',
      titulo: 'Profile & Career',
      resumen: 'who he is, how he works and where he has been',
    },
    observabilidad: {
      nav: 'Observability',
      navCorto: 'Observ.',
      titulo: 'Observability & Telemetry',
      resumen: 'DORA, p95, topology and error budget',
      aviso: 'drill running',
      label: 'Observability & SRE',
      bajada:
        'Everything this site measures about itself, with the source of every number in plain sight: DORA metrics from the pipeline that publishes this page, p95 latency measured from your browser, the live topology of what runs underneath and the error budget that comes out of the SLO. Nothing is preloaded or estimated.',
    },
    laboratorio: {
      nav: 'Chaos Lab',
      navCorto: 'Chaos',
      titulo: 'Chaos & Incident Lab',
      resumen: 'drills, runbooks and console',
      aviso: 'running',
      label: 'Chaos engineering & incident response',
      bajada:
        'The full incident cycle, in the order it happens: the fault is injected, the alert fires, the runbook walks the response step by step and the console logs every move. Drills are not cancelled when you switch views: whatever you leave running here keeps running.',
    },
  },

  nav: {
    cta: 'Get in touch',
    volverArriba: 'Back to top',
  },

  acciones: {
    descargarCV: 'Download CV',
    verLabs: 'See Labs & Projects',
    contactar: 'Get in touch',
    copiar: 'Copy',
    copiado: 'Copied',
    abrir: 'open →',
    cerrar: 'Close',
  },

  duracion: {
    anio: 'year',
    anios: 'years',
    mes: 'month',
    meses: 'months',
    union: 'and',
  },

  estado: {
    label: 'Live status',
    titulo: 'System status',
    banner: {
      ok: 'All systems operational',
      degradado: 'Degraded service',
      caido: 'Outage detected',
      desconocido: 'Partially verified',
      cargando: 'Checking service status…',
    },
    chequeadoEn: 'Checked',
    reintentar: 'Check again',
    verDetalle: 'Show detail',
    ocultarDetalle: 'Hide detail',
    hace: (s) => (s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`),
    aviso:
      'Everything on this panel is queried from your browser right now: the latency comes from a real request to this site, and the CI status from the public GitHub API. Nothing is preloaded or simulated.',
    etiquetas: {
      ok: 'Operational',
      fallo: 'Failing',
      desconocido: 'No data',
      consultando: 'Checking…',
    },
    servicios: {
      origen: 'Round-trip latency against the origin serving this page.',
      'ci-portfolio': 'Latest run of the pipeline that builds and validates this site.',
      'ci-k8s-lab': 'Latest run of yamllint + kubeconform over the lab manifests.',
    },
    sinPipeline: 'No pipeline of its own yet',
    corrida: 'run',
    rama: 'branch',
    limiteApi: 'The public GitHub API rate-limits by IP. Try again in a few minutes.',
    sinRed: 'The service could not be reached from this browser.',
  },

  caos: {
    label: 'Chaos engineering',
    titulo: 'Break this site on purpose',
    bajada:
      'A full incident drill in ten seconds: the fault is injected, the alert fires, the status panel turns red, the log records every phase, and auto-healing brings the service back without anyone touching a thing.',
    aviso:
      'This is a drill and it is labelled as one everywhere: nothing breaks, no other visitor is affected, and the real checks keep running underneath. What turns red is the scenario, not the site.',
    simulacro: 'Drill',
    valorSimulado: 'simulated value',
    avisoPanel:
      'A chaos engineering drill is running: the flagged service is showing a deliberately fabricated value. The others are still real checks, and the measured value comes back as soon as the drill ends.',
    inyectar: 'Inject fault',
    enCurso: 'Injected',
    activo: (titulo) => `Drill running · ${titulo}`,
    listo: 'No drill running',
    listoDetalle: 'Pick a scenario to inject a controlled fault.',
    fase: 'Phase',
    restaurar: 'Restore now',
    autoHealing: (s) => `Auto-healing in ${s}s`,
    bitacoraVacia:
      'The drill log is written here. The same lines also land in the console further down.',
    nombresFase: {
      inyeccion: 'injection',
      deteccion: 'detection',
      diagnostico: 'diagnosis',
      remediacion: 'remediation',
      recuperado: 'recovered',
    },
    escenarios: {
      latencia: {
        titulo: 'Inject latency',
        descripcion:
          'The origin still answers 200, but it takes four seconds. The hardest kind of fault to catch: nothing is down, everything is slow.',
      },
      'api-caida': {
        titulo: 'Simulate API outage',
        descripcion:
          'The external dependency stops responding. The site has to degrade without dragging down the parts that still work.',
      },
      'error-500': {
        titulo: 'Simulate 500 error',
        descripcion:
          'A bad deploy starts returning 5xx. The threshold rule catches it and the rollback closes the loop.',
      },
    },
    fases: {
      inyeccion: (e) => `chaos: injecting "${e.id}" into ${e.servicio} · severity ${e.severidad}`,
      deteccion: (e) => `alert fired · ${e.senal}`,
      diagnostico: (e) => `diagnosis: the ${e.servicio} check confirms the condition · opening runbook`,
      remediacion: (e) => `automated remediation · ${e.remedio}`,
      recuperado: (e) => `${e.servicio} operational · auto-healing closed the loop with no manual intervention`,
      restaurado: (e) => `manual restore · "${e.id}" cancelled before auto-healing`,
    },
    consola: {
      titulo: 'Chaos engineering scenarios',
      pista: 'Use `chaos <id>` to inject, and `chaos heal` to restore early.',
      sinEscenario: 'No drill running.',
      enCurso: (id) => `drill "${id}" running · the red below belongs to the scenario, not the site`,
      inyectando: (id) => `Injecting scenario "${id}"…`,
      restaurando: (id) => `Restoring "${id}" without waiting for auto-healing…`,
      nadaQueRestaurar: 'There is no drill running.',
      noExiste: (id) => `chaos: no scenario named "${id}". Try \`chaos\`.`,
      seguiEnPanel: 'The phases are written here and in the Chaos section.',
    },
  },

  sandbox: {
    etiqueta: 'Interactive sandbox',
    titulo: 'Explore the SRE Interactive Sandbox',
    texto:
      'Nine panels on real data: DORA metrics from the pipeline that publishes this page, p95 latency measured live, the topology, a chaos engineering sandbox with auto-healing, step-by-step runbooks, the error budget, the post-mortems with their logs and a console that answers commands. It all runs in your browser and there is nothing to install.',
    abrir: 'Explore the sandbox',
    pie: 'switches view · no page reload',
    vivo: 'something is still running inside',
  },

  trayectoria: {
    verLogros: 'View highlights',
    ocultarLogros: 'Hide highlights',
    cuantos: (n) => `(${n})`,
    paralelo: (org) => `Alongside ${org} · ongoing`,
  },

  telemetria: {
    label: 'Telemetry & DORA',
    titulo: 'The dashboard this site points at itself',
    bajada:
      'DORA metrics computed over the pipeline that publishes this page, plus the latency your browser is measuring right now. Every tile shows the measured value on top and the declared target underneath: when they disagree, you can see it.',
    tablero: 'dora-board · portfolio',
    ventana: (d) => `${d}d window`,
    fuenteActions: 'source: github actions · main',
    objetivo: 'Target',
    cumple: 'met',
    noCumple: 'missed',
    sinDatos: 'no data',
    midiendo: 'measuring…',
    comoSeMide: 'How it is measured',
    aviso:
      'Deployment frequency, lead time and change failure rate come from the public GitHub Actions API, over the real runs on main. MTTD comes from the observability-lab, with its log published. The p95 latency is measured by your own browser while you look at this panel. The target is a declared goal, not a result, which is why it is labelled separately.',
    duranteSimulacro:
      'A chaos engineering drill is running. This dashboard deliberately ignores it: these numbers are real measurements and a drill does not change them.',
    muestras: (n) => `p95 over ${n} samples from this browser`,
    medianaDe: (n) => `median of ${n} deploys with a dated commit`,
    corridasVerdes: (n) => `${n} green runs on main`,
    fallidasDe: (f, t) => `${f} failed of ${t} completed runs`,
    mttdDetalle: (ventana, umbral) => `rule: ${umbral}% of 5xx over a ${ventana}s window`,
    anotaciones: {
      recuperado: (n) => `Recovery: CFR 0% over the last ${n} runs, with red ones before`,
      limpio: (n) => `CFR 0% over the last ${n} runs`,
      conFallas: (f, n) => `${f} failed over the last ${n} runs`,
      optimizado: (antes, ahora, dias) =>
        `Optimized: ${antes} → ${ahora} (median by halves of the ${dias}d window)`,
      arranque: (primera, estable) => `Cold start ${primera} ms → ${estable} ms once warm`,
      referenciaP50: (p50) => `Dashed line: measured p50, ${p50} ms`,
    },
    tiles: {
      despliegues: 'Deployment frequency',
      leadTime: 'Lead time for changes',
      cfr: 'Change failure rate',
      mttd: 'MTTD · detection',
      p95: 'Client p95 latency',
    },
    cadencia: {
      diario: 'daily cadence',
      semanal: 'weekly cadence',
      mensual: 'monthly cadence',
      esporadico: 'sporadic cadence',
    },
    unidades: {
      despliegues: (d) => `/ ${d}d`,
    },
    motivo: {
      limite: 'The public GitHub API rate-limited this IP. Try again in a few minutes.',
      red: 'The API could not be reached from this browser.',
      timeout: 'The API call took too long.',
      api: 'The API returned something unexpected.',
    },
  },

  // ── Command Center · incident runbooks ─────────────────────
  playbooks: {
    label: 'Command Center',
    titulo: 'The runbook, one step at a time, in the console below',
    bajada:
      'Three symptoms that show up on any on-call rotation: the process eating memory, the one eating CPU, and the exhausted connection pool. Each opens its runbook and runs one step at a time, in the order you would actually follow — diagnosis before mitigation, because restarting first destroys the evidence and guarantees the incident comes back.',
    aviso:
      'This is procedure, not a recorded run: the commands are the ones you would type, and the outputs are illustrative. There is no live cluster behind this, and every block the console prints says so in its own header. The incidents that did happen, with logs and measured numbers, are in the post-mortems section.',
    abrir: 'Open runbook',
    abierto: 'Open',
    pasosCount: (n) => `${n} steps`,
    sinPlaybook: 'No runbook open',
    sinPlaybookDetalle: 'Pick a symptom to open its procedure.',
    elegiUno: 'Pick one of the three runbooks above to open it here.',
    listoParaCorrer: 'Open, no step executed yet.',
    paso: 'Step',
    correrPrimero: 'Run first step',
    correrSiguiente: 'Next step',
    finalizado: 'Runbook complete',
    reiniciar: 'Restart the runbook',
    cerrar: 'Close the runbook',
    salidaEnConsola: 'Each step writes its output to the console further down.',
    completado: 'Runbook complete: the service was verified, not just mitigated.',
    escenarios: {
      'memory-leak': {
        titulo: 'Memory leak in the application',
        descripcion:
          'The pod grows to its limit and the kernel kills it. It restarts, grows again, and the graph draws a sawtooth.',
        hipotesis:
          'The first hypothesis to rule out is the cheapest one: that this is not a leak but a badly set limit. Only if usage grows monotonically between restarts is there something worth chasing in the heap.',
        pasos: {
          confirmar: {
            titulo: 'Confirm which pod, and how much',
            porQue:
              'Before calling it a leak you need to know whether usage is spread out or concentrated in one replica. If all three grow together the problem is the limit; if only one grows, it is that instance.',
          },
          evidencia: {
            titulo: 'Find the OOMKill in the previous state',
            porQue:
              'A pod that "restarted by itself" tells you nothing. `Reason: OOMKilled` with exit code 137 does: the kernel killed it for memory, which rules out an application crash.',
          },
          capturar: {
            titulo: 'Capture the heap BEFORE restarting',
            porQue:
              'This is the step everyone skips. The rollout restart below brings the service back and destroys the only evidence that explains why memory filled up. Without the dump, the incident closes as "restarted" and returns next week.',
          },
          mitigar: {
            titulo: 'Bring the service back',
            porQue:
              'With the evidence already saved, mitigating is cheap. The rollout restart replaces pods one at a time, so the service stays up while memory is reclaimed.',
          },
          verificar: {
            titulo: 'Verify, do not assume',
            porQue:
              'An incident does not close when the mitigation runs: it closes when the measurement confirms it. If usage returns to baseline the mitigation worked, and the dump analysis stays open.',
          },
        },
      },
      'high-cpu': {
        titulo: 'CPU pinned in production',
        descripcion:
          'All three replicas at 95% of their limit, latency through the roof and nothing down: the service answers, just late.',
        hipotesis:
          'With all three replicas identical at the same moment, the cause is almost never one sick instance: it is something that reached all of them at once. A deploy, or a traffic shift.',
        pasos: {
          confirmar: {
            titulo: 'Check whether it is one replica or all of them',
            porQue:
              'How the symptom is distributed is the first piece of the diagnosis. Three identical replicas pinned at once rules out a local problem and points at a common change.',
          },
          correlacionar: {
            titulo: 'Correlate with the last deploy',
            porQue:
              'The highest-yield question of any on-call shift: what changed? A rollout six minutes before the alert does not prove causation, but it orders the rest of the investigation and unlocks the rollback as a mitigation.',
          },
          culpable: {
            titulo: 'Find where the CPU is going',
            porQue:
              'A profiler on the live process turns the suspicion into a function name. Without this step the rollback fixes the symptom and nobody learns what caused it.',
          },
          mitigar: {
            titulo: 'Go back to the previous revision',
            porQue:
              'With the cause narrowed to the change, the rollback is the fastest and lowest-risk mitigation. Scaling out would have bought time while paying twice the infrastructure for the same bug.',
          },
          verificar: {
            titulo: 'Confirm it is back to baseline',
            porQue:
              'CPU back in the tens of millicores is what closes the mitigation. What follows is the fix for the pattern being recompiled on every request, and that is no longer on-call: that is backlog.',
          },
        },
      },
      'db-connections': {
        titulo: 'Connection pool exhausted',
        descripcion:
          'The database refuses new connections, the application returns 500s, and the pool is full of sessions doing nothing.',
        hipotesis:
          'A full pool rarely means too much traffic. It almost always means transactions nobody closed: connections taken, idle, and never returned.',
        pasos: {
          confirmar: {
            titulo: 'Measure how close to the ceiling it is',
            porQue:
              'Before touching anything you need to know whether you are ten connections short or two. 198 out of 200 explains the 500s without reading a single application log.',
          },
          quienes: {
            titulo: 'See what state those connections are in',
            porQue:
              'This is the figure that decides everything else. 171 in `idle in transaction` against 19 active says the problem is not load: these are open transactions the application never closed.',
          },
          contener: {
            titulo: 'Release the stuck sessions',
            porQue:
              'Killing only the ones idle for more than five minutes brings the service back without touching the 19 doing real work. This is containment, not a fix: kill and stop there, and the pool fills up again.',
          },
          mitigar: {
            titulo: 'Lower the per-replica pool',
            porQue:
              'Three replicas with a pool of 60 each ask a 200-connection database for 180. Lowering the per-replica maximum attacks the structural cause, and the rollout is verified before calling the incident contained.',
          },
          verificar: {
            titulo: 'Confirm the state settled',
            porQue:
              'With no `idle in transaction` left in the listing, containment worked. The real fix — the block that fails to close the transaction on error — becomes a post-mortem action item.',
          },
        },
      },
    },
    consola: {
      titulo: 'Incident runbooks available',
      pista: 'Use `playbook <id>` to open one and `playbook next` to run the following step.',
      sinPlaybook: 'No runbook open.',
      nadaAbierto: 'There is no runbook open. Try `playbook`.',
      yaTerminado: 'The runbook already reached its last step. Try `playbook restart`.',
      noExiste: (id) => `playbook: no runbook named "${id}". Try \`playbook\`.`,
      abriendo: (titulo) => `runbook opened · ${titulo}`,
      abiertoEn: (titulo, paso, total) => `open: ${titulo} · step ${paso}/${total}`,
      aviso: '# procedure · illustrative outputs, there is no live cluster behind this',
      senal: 'firing signal',
      paso: (n, total) => `step ${n}/${total}`,
      terminado: (titulo) => `runbook complete · ${titulo} · service verified, not just mitigated`,
      reiniciado: (titulo) => `runbook restarted · ${titulo}`,
      cerrado: (titulo) => `runbook closed · ${titulo}`,
    },
  },

  // ── SLO and error budget ───────────────────────────────────
  slo: {
    label: 'SLO & Error Budget',
    titulo: 'How many minutes of downtime each nine buys you',
    bajada:
      'An SLO is not a promise: it is a budget. Pick the target and see how much downtime it allows per period — and how much of that budget was eaten by the chaos engineering drills you ran in this session.',
    tablero: 'slo-calculator · allowed downtime',
    elegirObjetivo: 'Choose an availability target',
    elegirPeriodo: 'Choose the budget period',
    tablaAria: 'Maximum allowed downtime by period and availability target',
    periodo: 'Period',
    sinDatos: 'no data',
    periodos: {
      dia: 'per day',
      semana: 'per week',
      mes: 'per month',
      anio: 'per year',
    },
    notaTabla:
      'Pure arithmetic: (1 − target) × period. A month is 30 days and a year 365, which is the convention these tables are published with. The highlighted column is the chosen target; the other three sit beside it on purpose, because the question that matters is not how much 99.9% allows but what the next nine costs.',
    presupuestoDe: (objetivo, periodo) => `${objetivo} budget ${periodo}`,
    tiles: {
      presupuesto: 'Budget',
      consumido: 'Consumed',
      restante: 'Remaining',
    },
    niveles: {
      sano: 'Budget healthy',
      atencion: 'Budget needs attention',
      critico: 'Budget critical',
      agotado: 'Budget exhausted',
    },
    simulacrosCorridos: (n) => (n === 1 ? '1 drill in this session' : `${n} drills in this session`),
    sinSimulacros: 'you have not run any drill yet',
    porcentajeGastado: (p) => `${p}% of the budget`,
    desglose: {
      caido: (d) => `full outage: ${d}`,
      degradado: (d) => `degradation: ${d}`,
      enCurso: 'drill running · counting',
    },
    avisoSinSimulacros:
      'The consumption comes from the drills in the chaos engineering sandbox above. Inject one and watch it eat the budget in real time: ten seconds of drill are ten seconds of a 99.99% month.',
    avisoConSimulacros:
      'These seconds are wall-clock and measured, but the incident that produced them was simulated: this is budget spent on a drill, not on an outage. A drill counts in full, whether outage or degradation — weighting degradation would require knowing what fraction of requests failed, and that was not measured here.',
  },

  // ── Live topology ("Topology & Chaos" tab of the hub) ───────
  topologia: {
    label: 'Live topology',
    titulo: 'The pieces that serve this page, with their real health',
    tablero: 'topology · live',
    pista: 'hover or tab onto a node',
    bajada:
      'The three pieces that serve this page, with the health and latency being measured right now. Both arrows start at the browser because this site is static: there is no backend in between calling GitHub for you.',
    leyenda:
      'Same checks as the status panel at the top of the page. If you inject a fault in the chaos engineering sandbox, the affected node degrades here too and is labelled as a drill.',
    simulado: 'This node is degraded by a drill: the value is deliberately fabricated and the real check keeps running underneath.',
    desdeCache: 'not measured · response from cache',
    sinDato: '—',
    nodos: {
      cliente: {
        titulo: 'Browser Client',
        sub: 'your browser',
        descripcion:
          'The browser reading this. It is the one timing both requests in the diagram, so the latency you see is yours and not that of a synthetic monitor on another continent.',
      },
      edge: {
        titulo: 'Vercel Edge Network',
        sub: 'site origin',
        descripcion:
          'The edge that serves the HTML, the JS and the assets. Measured with a real, uncached request for a small file: it gives the round trip to the nearest PoP, not the download time.',
      },
      actions: {
        titulo: 'GitHub Actions API',
        sub: 'api.github.com',
        descripcion:
          'The public API behind the pipeline status and the DORA board numbers. It is the only external dependency of this site, which is why it gets its own node: when its rate limit kicks in, what goes without data is measurable and stated.',
      },
    },
    enlaces: {
      origen: 'GET /favicon.svg',
      actions: 'GET /actions/runs',
    },
    estados: {
      ok: 'operational',
      fallo: 'failing',
      corriendo: 'run in progress',
      consultando: 'checking…',
      desconocido: 'no data',
    },
    campos: {
      latencia: 'Latency',
      p50: 'p50',
      muestras: 'Samples',
      codigo: 'Response',
      entorno: 'Environment',
      corrida: 'Run',
      rama: 'Branch',
      fuente: 'Source',
    },
    unidades: {
      ms: 'ms',
      p95: 'ms p95',
    },
  },

  ci: {
    titulo: 'GitHub Actions',
    passing: 'passing',
    failing: 'failing',
    corriendo: 'running',
    desconocido: 'unknown',
    verCorrida: 'See the run on GitHub',
  },

  consola: {
    label: 'Console',
    titulo: 'Try the labs from here',
    bajada:
      'A real console, not a GIF. Type `help` to list the available commands: it queries the measured metrics, the live service status and the incident log without leaving the page.',
    titulobarra: 'portfolio-sandbox — sh',
    prompt: 'visitor@portfolio:~$',
    aviso:
      'Sandbox: kubectl output replays runs recorded in the labs — there is no live cluster behind it. `status` and `curl /health` do query live.',
    ayudaInicial: 'Type `help` to start, or `metrics` to go straight to the numbers.',
    ejecutar: 'Run',
    limpiar: 'Clear console',
    focoAria: 'Interactive console: type a command and press Enter',
    desconocido: (cmd) => `sh: ${cmd}: command not found. Try \`help\`.`,
    faltaArgumento: (cmd) => `${cmd}: missing argument. Try \`help\`.`,
    ayuda: {
      titulo: 'Available commands',
      comandos: [
        ['help', 'this help'],
        ['status', 'live service status (real query)'],
        ['metrics', 'metrics measured in the labs, with their method'],
        ['incidents', 'incident log'],
        ['incident <id>', 'opens the full post-mortem'],
        ['labs', 'published labs and their repos'],
        ['kubectl get pods', 'recorded output from k8s-lab'],
        ['kubectl get nodes', 'nodes of the lab cluster'],
        ['curl /health', 'health check assembled from the live checks'],
        ['curl /metrics', 'the same metrics in Prometheus format'],
        ['chaos', 'available chaos engineering scenarios'],
        ['chaos <id>', 'injects a simulated fault (auto-healing after 10s)'],
        ['chaos heal', 'restores without waiting for auto-healing'],
        ['playbook', 'incident runbooks available'],
        ['playbook <id>', 'opens a runbook (illustrative outputs)'],
        ['playbook next', 'runs the runbook\u2019s next step'],
        ['whoami', 'who writes all of this'],
        ['cv', 'download the CV'],
        ['contact', 'contact details'],
        ['lang <es|en>', 'switch the site language'],
        ['clear', 'clear the screen'],
      ],
      pista: '↑ / ↓ walk the history · Tab autocompletes',
    },
    kubectl: {
      pods: (s) =>
        `# recorded output · the third pod is the replacement from the auto-healing experiment (${s} s)`,
      nodes: '# recorded output · local single-node laboratory cluster',
    },
    metrics: { titulo: 'Measured metrics · source: the lab logs', metodo: 'method' },
    incidents: {
      titulo: 'Incident log — laboratory post-mortems',
      pista: 'Use `incident <id>` to open the full report.',
      noEncontrado: (id) => `incident: no incident named "${id}". Try \`incidents\`.`,
      abriendo: (cod) => `Opening post-mortem ${cod}…`,
    },
    labs: { titulo: 'Published labs' },
    status: { titulo: 'Live check from this browser', consultando: 'Checking services…' },
    whoami: [
      'Samuel Eduardo García Baciliadis',
      'IT Incident Manager · Incident Analyst → Junior SRE / DevOps',
      'Buenos Aires, Argentina · Remote / Hybrid',
      '',
      'I run P1/P2 incidents in Fintech and Telco. What you see on this site',
      'are labs where I break things on purpose to measure how they recover.',
    ],
    cv: { descargando: 'Downloading the SRE / DevOps-oriented CV…', enlace: 'If it does not start, open it here' },
    lang: {
      cambiado: (l) => `Language switched to ${l === 'es' ? 'Spanish' : 'English'}.`,
      invalido: 'lang: use `lang es` or `lang en`.',
    },
  },

  postmortem: {
    severidad: 'Severity',
    servicio: 'Service',
    lab: 'Lab',
    fecha: 'Date',
    estado: 'Status',
    duracion: 'Duration',
    impactoUsuario: 'User impact',
    deteccion: 'Detection',
    timeline: 'Timeline',
    causaRaiz: 'Root cause',
    impacto: 'Impact',
    acciones: 'Corrective actions',
    leccion: 'What it left behind',
    verBitacora: 'Read the log on GitHub',
    cerrar: 'Close post-mortem',
    anterior: 'Previous',
    siguiente: 'Next',
    resumenEjecutivo: 'Summary',
  },

  form: {
    nombre: 'Name',
    nombrePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'you@company.com',
    mensaje: 'Message',
    mensajePlaceholder: 'Tell me about the role, the team or the project.',
    enviar: 'Send message',
    enviando: 'Sending…',
    errores: {
      nombre: 'Please enter your name',
      email: 'Please enter a valid email',
      mensaje: 'Tell me a bit more (10 characters minimum)',
    },
    okFormspree: 'Message sent. I will reply within 24 business hours.',
    okMailto: 'Message drafted in your mail client. Thanks for writing!',
    error: 'The message could not be sent.',
    errorCta: 'Email me directly',
    errorCola: (email) => `or copy ${email}.`,
    pieFormspree: (email) => `I reply to the address you leave here. You can also write directly to ${email}`,
    pieMailto: (email) => `The form opens your mail client. You can also write directly to ${email}`,
    asunto: (nombre) => `Portfolio enquiry — ${nombre}`,
    tiempoRespuesta: 'Response time',
    sla: '< 24 business hours',
    slaTexto: '— the same SLA criterion I apply in operations.',
    githubLinea: 'GitHub · Labs and repos',
  },

  footer: {
    construido: 'Built with React, Tailwind CSS and Lucide.',
  },

  meta: {
    title: 'Samuel García Baciliadis — IT Incident Manager & SRE / DevOps',
    description:
      'Incident Manager with experience in Fintech and Telecommunications. Critical P1/P2 incident management, observability, RCA and MTTR reduction. Moving into SRE / DevOps.',
  },
}
