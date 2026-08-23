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
      periodo: 'Fintech',
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

  nav: {
    inicio: 'Home',
    'sobre-mi': 'Profile',
    skills: 'Skills',
    metricas: 'Metrics',
    postmortems: 'Post-mortems',
    labs: 'Labs',
    consola: 'Console',
    trayectoria: 'Career',
    contacto: 'Contact',
    cta: 'Get in touch',
    abrir: 'Open menu',
    cerrar: 'Close menu',
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
