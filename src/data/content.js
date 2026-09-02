// ─────────────────────────────────────────────────────────────
//  Contenido del sitio en ESPAÑOL. Editá acá, no en los componentes.
//
//  El sitio es bilingüe: este archivo y `content.en.js` exportan
//  exactamente los mismos nombres, y el proveedor de idioma elige de
//  cuál leer. Si agregás una clave acá, agregala allá — el componente
//  la va a buscar en los dos.
//
//  Los imports llevan la extensión `.js` a propósito: `scripts/generar-og.mjs`
//  importa este archivo desde Node, y Node ESM no resuelve extensiones
//  implícitas como sí hace Vite. Sin el `.js`, el sitio compila y
//  `npm run og` explota.
// ─────────────────────────────────────────────────────────────
import { MEDIDAS, num } from './medidas.js'

export { incidentes, incidentesMeta } from './incidentes.js'

const n = (v) => num(v, 'es')

// ── GitHub ───────────────────────────────────────────────────
// Poné GITHUB_PUBLICO en false si alguna vez los repos dejan de ser
// públicos: ahí desaparecen solos el ícono del nav, el del hero, el
// del contacto y el del footer.
const GITHUB_URL = 'https://github.com/seamnex'
const GITHUB_PUBLICO = true

export const profile = {
  nombre: 'Samuel Eduardo García Baciliadis',
  alias: 'Samuel García',
  rol: 'IT Incident Manager · Incident Analyst',
  target: 'Junior SRE / DevOps Engineer',
  ubicacion: 'Buenos Aires, Argentina · Remoto / Híbrido',
  disponibilidad: 'Disponible para nuevas oportunidades',
  email: 'seamsex@gmail.com',
  linkedin: 'https://www.linkedin.com/in/samuel-garcia-baciliadis/',
  github: GITHUB_PUBLICO ? GITHUB_URL : '',
  // Generado por `npm run cv` desde este mismo archivo. Ver scripts/generar-cv.mjs.
  cv: '/cv-samuel-garcia-baciliadis-sre.pdf',
  cvArchivo: 'CV-Samuel-Garcia-Baciliadis-SRE-ES.pdf',
}

export const hero = {
  headline: ['Del incidente crítico', 'a la resiliencia por diseño.'],
  subtitle:
    'Gestiono incidentes P1/P2 en entornos de alto volumen —Fintech y Telecomunicaciones— liderando War Rooms, restaurando el servicio y cerrando el ciclo con RCA que evitan la reincidencia. Hoy llevo esa disciplina operacional hacia SRE y DevOps: observabilidad, automatización y sistemas que fallan poco y se recuperan rápido.',
  terminal: {
    titulo: 'incident-console — bash',
    prompt: 'samuel@sre-lab:~$',
    comando: 'kubectl get incidents --severity=P1 --status=resolved',
    salida: [
      { k: 'MTTD medido en lab', v: `${n(MEDIDAS.mttd)} s — con bitácora`, tone: 'ok' },
      { k: 'War Rooms liderados', v: 'Fintech · Telco', tone: 'accent' },
      { k: 'Ciclo de mejora', v: 'Detectar → Mitigar → RCA → Prevenir', tone: 'muted' },
      { k: 'Estado', v: 'ONLINE — abierto a propuestas', tone: 'ok' },
    ],
  },
}

export const metrics = [
  { valor: '+8', unidad: 'años', label: 'en operaciones IT y soporte técnico N2-N3' },
  { valor: 'P1/P2', unidad: '', label: 'gestión de incidentes críticos end-to-end' },
  { valor: '24×7', unidad: '', label: 'entornos productivos de alta disponibilidad' },
  { valor: '15+', unidad: 'tools', label: 'de monitoreo, observabilidad y automatización' },
]

// ── Métricas de los labs ─────────────────────────────────────
// REGLA: acá va SOLO lo que está medido y tiene bitácora publicada en el repo.
// Si un número no se puede rastrear hasta una corrida real, no entra. Un
// entrevistador senior repregunta por el método, y "es una estimación" después
// de haberlo puesto como resultado cuesta más caro que no haberlo puesto.
// Los valores crudos viven en `medidas.js`; acá solo se les da formato.
export const labMetrics = {
  label: 'Métricas Clave de Infraestructura',
  titulo: 'Números que salieron de romper cosas, no de estimarlas',
  bajada:
    'Cada dato viene de una corrida con su bitácora publicada: entorno, método de medición y cantidad de muestras. Donde el resultado depende de una decisión de configuración, está también el costo de esa decisión.',
  verBitacora: 'Ver la bitácora',
  items: [
    {
      id: 'autohealing',
      icono: 'HeartPulse',
      tone: 'ok',
      valor: n(MEDIDAS.autohealing),
      unidad: 's',
      titulo: 'Auto-healing en Kubernetes',
      resumen: `Recuperación a ${MEDIDAS.replicas}/${MEDIDAS.replicas} pods Ready después de matar un pod en caliente.`,
      evidencia: `${MEDIDAS.autohealingOk} de ${MEDIDAS.autohealingTotal} peticiones respondieron 200: el Service sacó al pod muerto del balanceo antes de que la sonda llegara a notarlo.`,
      metodo: `Sonda interna al Service a ~${MEDIDAS.sondaReqPorSegundo} req/s · Kubernetes ${MEDIDAS.kubernetes}`,
      repo: 'https://github.com/seamnex/k8s-lab#bitácora-de-experimentos',
    },
    {
      id: 'rolling',
      icono: 'RefreshCw',
      tone: 'accent',
      valor: String(MEDIDAS.rollingFallosConHook),
      unidad: 'fallos',
      titulo: 'Rolling updates sin pérdidas',
      resumen: `Peticiones perdidas durante el deploy, tras sumar un preStop hook de ${MEDIDAS.preStopSegundos} s.`,
      evidencia: `${MEDIDAS.rollingFallosConHook} en ${MEDIDAS.rollingTotalConHook} peticiones, contra ${MEDIDAS.rollingFallosSinHook} en ${MEDIDAS.rollingTotalSinHook} sin el hook (${n(MEDIDAS.rollingPorcentajeSinHook)} %). No eran 5xx sino código 000: kube-proxy ruteando a un nginx que ya había cerrado el listener. Se paga con un rollout ~${n(MEDIDAS.rolloutCostoSegundos)} s más lento.`,
      metodo: 'A/B en el mismo cluster y la misma sesión, alternando solo el hook',
      repo: 'https://github.com/seamnex/k8s-lab#el-fix-cerrar-la-ventana-del-experimento-2',
    },
    {
      id: 'mttd',
      icono: 'Siren',
      tone: 'crit',
      valor: n(MEDIDAS.mttd),
      unidad: 's',
      titulo: 'MTTD de incidentes',
      resumen: 'Desde que la tasa de 5xx se dispara hasta que la alerta la detecta.',
      evidencia: `Baja a ${n(MEDIDAS.mttdSensible)} s exigiendo una sola evaluación sobre el umbral, a costa de disparar con cualquier pico transitorio. MTTR total del ciclo: ${n(MEDIDAS.mttr)} s.`,
      metodo: `Marcadores en Elasticsearch, no cronómetro · ventana ${MEDIDAS.ventanaSegundos} s, umbral ${MEDIDAS.umbralPorcentaje} %`,
      repo: 'https://github.com/seamnex/observability-lab#bitácora-de-corridas',
    },
  ],
  // El hallazgo que mejor distingue el perfil: cuestionar el propio instrumento.
  nota: {
    titulo: 'El dato que no esperaba',
    texto: `${Math.round(MEDIDAS.ventanaInstrumento[0])} de los ${Math.round(MEDIDAS.mttr)} segundos de MTTR no fueron el incidente: fueron mi ventana deslizante midiendo. La prueba es que ese tramo dio ${n(MEDIDAS.ventanaInstrumento[0])} s y ${n(MEDIDAS.ventanaInstrumento[1])} s en dos corridas cuyos MTTD diferían a más del doble. Es una constante del instrumento, no del sistema — y significa que parte del MTTR que se reporta al negocio es latencia de la propia observabilidad.`,
  },
}

export const about = {
  label: 'Sobre mí',
  titulo: 'Perfil híbrido: quien apaga el incendio sabe dónde estaba el cortocircuito',
  bajada:
    'La experiencia en gestión de incidentes no es un paso previo a SRE: es exactamente el insumo que hace valiosa la práctica SRE.',
  parrafos: [
    'Soy un perfil híbrido: vengo de la trinchera de la operación —la llamada a las 3 AM, el servicio caído, el cliente esperando— y hacia allí llevo las prácticas de ingeniería que evitan que esa llamada vuelva a ocurrir.',
    'Durante años gestioné incidentes críticos en Personal Pay (Fintech) y Telecom Argentina (Telecomunicaciones): coordiné War Rooms con equipos de infraestructura, desarrollo y negocio, prioricé bajo presión con criterio de impacto real, comuniqué estado a stakeholders y cerré cada evento con un RCA accionable. Ese trabajo me dejó una convicción: la mayoría de los incidentes no son sorpresas, son deuda técnica y falta de observabilidad que se cobran factura.',
    'Por eso hoy me especializo en SRE y DevOps. La gestión de incidentes bajo ITIL me da algo que no se aprende en un curso: entender qué falla, por qué falla y qué señales lo anticipaban. Sumado a Docker, Kubernetes, Infrastructure as Code, CI/CD y scripting, esa perspectiva se convierte en prevención: alertas que importan, runbooks que se ejecutan solos y arquitecturas que degradan con elegancia en lugar de caer.',
  ],
  puente: {
    label: 'El puente',
    reactivo: {
      etiqueta: 'Reactivo · ITIL',
      texto: 'Detectar, mitigar y restaurar el servicio bajo presión',
    },
    preventivo: {
      etiqueta: 'Preventivo · SRE',
      texto: 'Instrumentar, automatizar y diseñar para que no vuelva a pasar',
    },
  },
  comoTrabajo: 'Cómo trabajo',
  principios: [
    {
      titulo: 'El MTTR se ataca antes del incidente',
      texto:
        'Un incidente rápido de resolver se construye mucho antes: con instrumentación correcta, alertas con señal (no ruido), runbooks vigentes y ownership claro.',
    },
    {
      titulo: 'Sin RCA, el incidente no terminó',
      texto:
        'Restaurar el servicio es la mitad del trabajo. La otra mitad es la causa raíz, la acción preventiva y su seguimiento hasta el cierre real.',
    },
    {
      titulo: 'Blameless por default',
      texto:
        'Los sistemas fallan, no las personas. Los post-mortems sin culpa son los que producen mejoras reales, porque la información fluye sin miedo.',
    },
    {
      titulo: 'Automatizar lo que se repite',
      texto:
        'Toda tarea manual ejecutada dos veces bajo presión es una candidata a script. El toil consume el tiempo que debería ir a confiabilidad.',
    },
  ],
}

export const skillsMeta = {
  label: 'Áreas de especialización',
  titulo: 'Stack técnico y dominios de trabajo',
  bajada:
    'Cuatro bloques que se refuerzan entre sí: lo que detecto con observabilidad, lo gestiono con procesos de incidentes, lo previengo con prácticas DevOps y lo automatizo con código.',
  hint: 'Hacé click en cada tarjeta para desplegar el detalle de herramientas',
}

export const skills = [
  {
    id: 'incident',
    titulo: 'Incident & Operations Management',
    tagline: 'Gestión del evento crítico de punta a punta',
    icono: 'ShieldAlert',
    tone: 'crit',
    nivel: 'Experto',
    descripcion:
      'Coordinación de incidentes P1/P2, liderazgo de War Rooms, priorización por impacto, comunicación a stakeholders y cierre con causa raíz.',
    items: [
      'ITIL v4 (Incident, Problem & Change)',
      'Gestión de SLA / SLO / SLI',
      'RCA y post-mortems blameless',
      'Liderazgo de War Rooms P1/P2',
      'Reducción de MTTR / MTTD',
      'Jira Service Management · ServiceNow',
      'Escalamiento y guardias 24×7',
      'Reportería ejecutiva de disponibilidad',
    ],
  },
  {
    id: 'observability',
    titulo: 'Observabilidad & Monitoreo',
    tagline: 'Detectar antes que el usuario',
    icono: 'Activity',
    tone: 'accent',
    nivel: 'Avanzado',
    descripcion:
      'Instrumentación, tuning de alertas y análisis de métricas, logs y trazas para acortar el tiempo de detección y diagnóstico.',
    items: [
      'Dynatrace (APM y alertas)',
      'Datadog (dashboards y monitores)',
      'Zabbix (infraestructura)',
      'Elastic / Kibana (log analytics)',
      'Control-M (batch y scheduling)',
      'AWS CloudWatch',
      'Definición de umbrales y SLOs',
      'Reducción de ruido y fatiga de alertas',
    ],
  },
  {
    id: 'devops',
    titulo: 'DevOps & Cloud — in progress',
    tagline: 'La ruta de especialización activa',
    icono: 'Container',
    tone: 'ok',
    nivel: 'En formación activa',
    descripcion:
      'Laboratorios propios de contenedores, orquestación, infraestructura como código y pipelines de integración continua.',
    items: [
      'Linux (administración y troubleshooting)',
      'Docker · imágenes y compose',
      'Kubernetes (workloads y servicios)',
      'Vagrant · VirtualBox (IaC local)',
      'Maven (build lifecycle)',
      'Git / GitHub · flujos de trabajo',
      'CI/CD (pipelines y automatización)',
      'AWS · Chocolatey',
    ],
  },
  {
    id: 'dev',
    titulo: 'Desarrollo & Automatización',
    tagline: 'Scripts que eliminan toil',
    icono: 'Terminal',
    tone: 'soft',
    nivel: 'Intermedio',
    descripcion:
      'Automatización de tareas operativas, herramientas internas y desarrollo web para dashboards y proyectos propios.',
    items: [
      'Python (automatización y parsing)',
      'Bash scripting',
      'React · JavaScript (ES6+)',
      'Node.js',
      'HTML5 · CSS3 · Tailwind',
      'APIs REST e integraciones',
      'PowerShell',
      'Documentación técnica y runbooks',
    ],
  },
]

export const projectsMeta = {
  label: 'DevOps Labs',
  titulo: 'Lo que construyo para entender cómo se rompe',
  bajada:
    'Cada laboratorio nace de una pregunta operativa concreta. No son ejercicios de curso: son entornos donde reproduzco fallas, mido detección y valido que la respuesta funcione antes de necesitarla en producción.',
  problema: 'El problema',
  solucion: 'La solución',
  codigo: 'Código',
  demo: 'Demo',
  filtros: { todos: 'Todos', 'DevOps Lab': 'DevOps Labs', 'Proyecto Web': 'Proyectos Web' },
}

export const projects = [
  {
    id: 'vagrant-lab',
    titulo: 'Entorno de Virtualización con Vagrant + VirtualBox',
    categoria: 'DevOps Lab · Infrastructure as Code',
    estado: 'En curso',
    problema:
      'Probar configuraciones de servidores y escenarios de falla en producción no es opción. Hacía falta un entorno local reproducible, descartable y versionado.',
    solucion:
      'Laboratorio multi-VM definido por código con Vagrantfile: tres nodos Ubuntu en red privada y dos capas de provisioning. Un bootstrap en Bash para el piso mínimo, y un playbook de Ansible que describe el estado final de cada rol —Nginx en los nodos app, Docker en el de monitoreo— en lugar de una secuencia de pasos.',
    stack: ['Vagrant', 'VirtualBox', 'Ansible', 'Linux', 'Bash', 'IaC'],
    highlights: [
      'Infraestructura reproducible desde código',
      'Provisioning idempotente: re-ejecutable sobre un nodo en cualquier estado',
      'Verificación real por HTTP, no solo "systemd dice started"',
    ],
    links: { repo: 'https://github.com/seamnex/vagrant-lab', demo: null },
    comando: 'ANSIBLE=1 vagrant up',
  },
  {
    id: 'observability-lab',
    titulo: 'Dashboard de Monitoreo & Análisis de Logs',
    categoria: 'DevOps Lab · Observabilidad',
    estado: 'En curso',
    problema:
      'La detección tardía es la principal causa de un MTTR alto. Quise reproducir en laboratorio el ciclo completo: métrica → umbral → alerta → diagnóstico.',
    solucion:
      'Stack containerizado con Elasticsearch y Kibana, más un lazo cerrado de detección y respuesta: el generador inyecta la degradación y deja un marcador, la regla de umbral la detecta y calcula el MTTD, y el runbook automático corta la falla de verdad —lo que vuelve medible el MTTR—. Los tiempos salen de restar timestamps, no de un cronómetro.',
    stack: ['Docker', 'Elastic/Kibana', 'Python', 'Linux'],
    highlights: [
      `MTTD medido: ${n(MEDIDAS.mttd)} s — y ${n(MEDIDAS.mttdSensible)} s con la regla más sensible`,
      'Remediación automática que actúa, no que simula',
      'Cada parámetro de la alerta justificado, incluido el piso de muestras',
    ],
    links: { repo: 'https://github.com/seamnex/observability-lab', demo: null },
    comando: 'python scripts/alerta_5xx.py --remediar',
  },
  {
    id: 'k8s-lab',
    titulo: 'Cluster Kubernetes de Laboratorio',
    categoria: 'DevOps Lab · Orquestación',
    estado: 'En curso',
    problema:
      'Entender la resiliencia de un sistema distribuido exige romperlo: ver qué pasa cuando un pod muere, cuando un nodo se cae o cuando un deploy sale mal.',
    solucion:
      'Cluster local con cinco fallas inyectadas a mano y una bitácora de lo que midió cada una. Dos de los cinco experimentos impactaron al usuario, y uno de esos lo corregí: el rolling update perdía peticiones por una carrera entre la baja del pod del Service y el cierre del proceso. La hipótesis se verificó como A/B antes de darla por buena.',
    stack: ['Kubernetes', 'Docker', 'GitHub Actions', 'Linux', 'YAML'],
    highlights: [
      `preStop hook: de ${MEDIDAS.rollingFallosSinHook} fallos en ${MEDIDAS.rollingTotalSinHook} peticiones a ${MEDIDAS.rollingFallosConHook} en ${MEDIDAS.rollingTotalConHook}`,
      'PodDisruptionBudget verificado con la Eviction API (429 al segundo desalojo)',
      'CI que valida los manifiestos: yamllint + kubeconform en cada push',
    ],
    links: { repo: 'https://github.com/seamnex/k8s-lab', demo: null },
    comando: './scripts/medir_rollout.sh nginx:1.28-alpine',
  },
]

export const timelineMeta = {
  label: 'Trayectoria & aprendizaje',
  titulo: 'Mapa de carrera: de la mesa de ayuda al diseño de resiliencia',
  bajada:
    'Una progresión deliberada: primero entender al usuario, después el sistema, después el incidente y hoy la ingeniería que lo previene.',
}

export const timeline = [
  {
    periodo: 'Actualidad',
    rol: 'Especialización SRE / DevOps',
    org: 'Formación y laboratorios propios',
    tipo: 'formacion',
    resumen:
      'Ruta de especialización activa en cultura y herramientas DevOps: contenedores, orquestación, infraestructura como código y CI/CD, con laboratorios prácticos propios.',
    bullets: [
      'Docker, Kubernetes y administración de Linux',
      'IaC local con Vagrant y VirtualBox · builds con Maven',
      'Scripting en Python y Bash aplicado a automatización operativa',
      'Git/GitHub y fundamentos de pipelines CI/CD',
    ],
    tags: ['Docker', 'Kubernetes', 'Linux', 'Python', 'CI/CD'],
  },
  {
    periodo: 'Mayo 2024 – Presente',
    // La antigüedad NO se escribe acá: la calcula `lib/periodo.js` a partir
    // de este mes, para el sitio y para el CV. Un "2 años y 4 meses" a mano
    // envejece en treinta días y nadie vuelve a mirarlo.
    desde: '2024-05',
    rol: 'IT Incident Manager · Incident Analyst',
    org: 'Personal Pay',
    tipo: 'trabajo',
    resumen:
      'Gestión de incidentes críticos en una plataforma financiera de alto volumen transaccional, donde cada minuto de indisponibilidad tiene impacto directo en el usuario y en el negocio.',
    bullets: [
      'Liderazgo de War Rooms P1/P2 hasta la restauración del servicio',
      'Análisis de causa raíz (RCA) y seguimiento de acciones preventivas',
      'Monitoreo y diagnóstico con Dynatrace, Datadog y Elastic/Kibana',
      'Comunicación de estado e impacto a stakeholders técnicos y de negocio',
      'Trabajo sobre SLAs con foco sostenido en la reducción del MTTR',
    ],
    tags: ['ITIL', 'RCA', 'Dynatrace', 'Datadog', 'SLA/SLO'],
  },
  {
    periodo: 'Telecomunicaciones',
    rol: 'Incident Analyst · Operaciones IT',
    org: 'Telecom Argentina',
    tipo: 'trabajo',
    resumen:
      'Operación de servicios críticos en infraestructura de telecomunicaciones a gran escala, con esquemas 24×7 y alta exigencia de disponibilidad.',
    bullets: [
      'Gestión del ciclo de vida del incidente end-to-end',
      'Monitoreo de infraestructura y procesos batch (Zabbix, Control-M)',
      'Coordinación entre equipos de infraestructura, redes y desarrollo',
      'Documentación de procedimientos operativos y runbooks',
    ],
    tags: ['Zabbix', 'Control-M', '24×7', 'ServiceNow'],
  },
  {
    periodo: 'Trayectoria previa',
    rol: 'Líder de Mesa de Ayuda · Soporte Técnico N2-N3',
    org: 'Operaciones y Service Desk',
    tipo: 'trabajo',
    resumen:
      'Coordinación de equipos operativos de soporte, con foco en cumplimiento de SLAs, calidad de atención y resolución técnica en segundo y tercer nivel.',
    bullets: [
      'Liderazgo y capacitación de equipos de soporte',
      'Gestión de colas de tickets y cumplimiento de SLAs',
      'Troubleshooting N2-N3 sobre sistemas y plataformas',
      'Mejora continua de procesos de atención y escalamiento',
    ],
    tags: ['Service Desk', 'SLA', 'Jira', 'Liderazgo'],
  },
]

export const contacto = {
  label: 'Contacto',
  titulo: 'Hablemos de confiabilidad',
  bajada:
    'Estoy abierto a posiciones de Incident Management, SRE o DevOps Junior, y a proyectos donde la disponibilidad del servicio sea un requisito, no un deseo. Respondo dentro de las 24 horas hábiles.',
}

// ─────────────────────────────────────────────────────────────
//  CV en PDF — `npm run cv` lo genera desde acá.
//
//  Casi todo el contenido se deriva de los exports de arriba
//  (`timeline`, `projects`, `labMetrics`): el CV y el sitio cuentan
//  entonces literalmente la misma historia, y no puede pasar que una
//  métrica quede corregida en la web y vieja en el PDF que se manda por
//  mail. Acá solo vive lo que es propio del formato CV.
//
//  Los períodos salen de `timeline[].periodo`. Si querés fechas exactas
//  ("Jun 2024 – actualidad"), cambiálas ahí: las toma el CV y también la
//  sección de trayectoria del sitio.
// ─────────────────────────────────────────────────────────────
export const cv = {
  titular: 'IT Incident Manager · Incident Analyst → Junior SRE / DevOps Engineer',
  resumen:
    'Más de 8 años en operaciones IT, con foco en la gestión de incidentes críticos P1/P2 en Fintech y Telecomunicaciones: liderazgo de War Rooms, restauración del servicio bajo presión y cierre con RCA y acciones preventivas. Hoy oriento esa disciplina hacia SRE y DevOps —observabilidad, automatización y confiabilidad— con laboratorios propios donde inyecto fallas, mido detección y recuperación, y publico la bitácora de cada corrida.',
  secciones: {
    perfil: 'Perfil profesional',
    competencias: 'Competencias técnicas',
    experiencia: 'Experiencia profesional',
    labs: 'Laboratorios propios · resultados medidos',
    formacion: 'Formación',
  },
  competencias: [
    {
      grupo: 'Gestión de incidentes y operaciones',
      items: 'ITIL v4 (Incident, Problem & Change) · War Rooms P1/P2 · RCA y post-mortems blameless · SLA/SLO/SLI · reducción de MTTR y MTTD · guardias 24×7 · Jira Service Management · ServiceNow',
    },
    {
      grupo: 'Observabilidad y monitoreo',
      items: 'Dynatrace · Datadog · Elastic/Kibana · Zabbix · Control-M · AWS CloudWatch · definición de umbrales y SLOs · reducción de ruido y fatiga de alertas',
    },
    {
      grupo: 'DevOps, contenedores y cloud',
      items: 'Linux · Docker · Kubernetes · Vagrant/VirtualBox (IaC) · Ansible · GitHub Actions · CI/CD · Maven · AWS · Git/GitHub',
    },
    {
      grupo: 'Automatización y desarrollo',
      items: 'Python · Bash · PowerShell · APIs REST · JavaScript/React · Node.js · documentación técnica y runbooks',
    },
  ],
  formacion: [
    { titulo: 'Técnico Superior en Informática', org: 'Formación terciaria', detalle: '' },
    { titulo: 'Kubernetes', org: 'Udemy', detalle: 'En curso' },
    { titulo: 'Diseño Web', org: 'Udemy', detalle: '' },
    {
      titulo: 'Especialización SRE / DevOps',
      org: 'Formación autodirigida',
      detalle: 'Contenedores, orquestación, IaC y CI/CD con laboratorios propios',
    },
  ],
  etiquetas: {
    stack: 'Stack',
    contexto: 'Contexto',
  },
  nota: 'Cada métrica de los laboratorios está publicada con su bitácora —entorno, método y muestras— en los repos de github.com/seamnex.',
}

// ─────────────────────────────────────────────────────────────
//  Textos de interfaz — todo lo que antes estaba escrito a mano
//  dentro del JSX. Vive acá para que exista en los dos idiomas.
// ─────────────────────────────────────────────────────────────
export const ui = {
  idioma: {
    etiqueta: 'Idioma',
    cambiar: 'Cambiar idioma del sitio',
    a: { es: 'Ver el sitio en español', en: 'View this site in English' },
  },

  // ── Las tres vistas principales ─────────────────────────────
  // El sitio es tres vistas y una barra que elige cuál se mira. Cada una
  // lleva cuatro rótulos, y los cuatro se usan en lugares distintos:
  //
  //   · `nav`     — la pestaña de la barra. Corto por obligación: son
  //                 tres y tienen que entrar al lado del logo.
  //   · `titulo`  — el nombre completo de la vista. Es el `h1` de su
  //                 cabecera y el `aria-label` de su pestaña, así que un
  //                 lector de pantalla siempre oye el nombre entero
  //                 aunque el rótulo visible esté recortado.
  //   · `resumen` — qué hay adentro, en una línea. Lo usa el banner de
  //                 la portada, que es desde donde se decide entrar.
  //   · `aviso`   — el texto del punto que marca la pestaña cuando algo
  //                 quedó corriendo en esa vista.
  vistas: {
    aria: 'Vistas principales del sitio',
    perfil: {
      nav: 'Perfil',
      titulo: 'Perfil & Trayectoria',
      resumen: 'quién es, cómo trabaja y dónde estuvo',
    },
    observabilidad: {
      nav: 'Observabilidad',
      titulo: 'Observabilidad & Telemetría',
      resumen: 'DORA, p95, topología y presupuesto de error',
      aviso: 'con simulacro',
      label: 'Observabilidad & SRE',
      bajada:
        'Todo lo que este sitio mide de sí mismo, con la fuente de cada número a la vista: las métricas DORA del pipeline que publica esta página, la latencia p95 medida desde tu navegador, la topología en vivo de lo que hay abajo y el presupuesto de error que sale del SLO. Nada está precargado ni estimado.',
    },
    laboratorio: {
      nav: 'Chaos Lab',
      titulo: 'Chaos & Incident Lab',
      resumen: 'simulacros, runbooks y consola',
      aviso: 'en curso',
      label: 'Chaos engineering & respuesta a incidentes',
      bajada:
        'El ciclo completo de un incidente, en el orden en que ocurre: se inyecta el fallo, salta la alerta, el runbook lleva la respuesta paso a paso y la consola registra cada movimiento. Los simulacros no se cancelan al cambiar de vista: lo que se deja corriendo acá sigue corriendo.',
    },
  },

  nav: {
    cta: 'Contactar',
    volverArriba: 'Volver arriba',
  },

  acciones: {
    descargarCV: 'Descargar CV',
    verLabs: 'Ver Labs & Proyectos',
    contactar: 'Contactar',
    copiar: 'Copiar',
    copiado: 'Copiado',
    abrir: 'abrir →',
    cerrar: 'Cerrar',
  },

  // ── Antigüedad de los puestos ───────────────────────────────
  // Los usa `lib/periodo.js` para armar "2 años y 3 meses" a partir del mes
  // de ingreso. El texto se traduce; la cuenta, no.
  duracion: {
    anio: 'año',
    anios: 'años',
    mes: 'mes',
    meses: 'meses',
    union: 'y',
  },

  // ── Panel de estado en vivo ─────────────────────────────────
  estado: {
    label: 'Estado en vivo',
    titulo: 'Estado de los sistemas',
    // Se muestra según el peor estado individual verificado.
    banner: {
      ok: 'Todos los sistemas operativos',
      degradado: 'Servicio degradado',
      caido: 'Interrupción detectada',
      desconocido: 'Estado parcialmente verificado',
      cargando: 'Consultando el estado de los servicios…',
    },
    chequeadoEn: 'Verificado',
    reintentar: 'Volver a verificar',
    verDetalle: 'Ver detalle',
    ocultarDetalle: 'Ocultar detalle',
    hace: (s) => (s < 60 ? `hace ${s} s` : `hace ${Math.floor(s / 60)} min`),
    aviso:
      'Todo lo de este panel se consulta desde tu navegador en el momento: la latencia sale de una petición real a este sitio y el estado de CI, de la API pública de GitHub. Nada está precargado ni simulado.',
    // Etiquetas de estado por servicio.
    etiquetas: {
      ok: 'Operational',
      fallo: 'Failing',
      desconocido: 'Sin datos',
      consultando: 'Consultando…',
    },
    servicios: {
      origen: 'Latencia de ida y vuelta contra el origen que sirve esta página.',
      'ci-portfolio': 'Última corrida del pipeline que buildea y valida este sitio.',
      'ci-k8s-lab': 'Última corrida de yamllint + kubeconform sobre los manifiestos del lab.',
    },
    sinPipeline: 'Sin pipeline propio todavía',
    corrida: 'corrida',
    rama: 'rama',
    limiteApi: 'La API pública de GitHub limita las consultas por IP. Volvé a intentar en unos minutos.',
    sinRed: 'No se pudo alcanzar el servicio desde este navegador.',
  },

  // ── Sandbox de chaos engineering ────────────────────────────
  caos: {
    label: 'Chaos engineering',
    titulo: 'Rompé el sitio a propósito',
    bajada:
      'Un simulacro de incidente completo en diez segundos: se inyecta el fallo, salta la alerta, el panel de estado se pone en rojo, la bitácora registra cada fase y el auto-healing devuelve el servicio sin que nadie toque nada.',
    aviso:
      'Es un simulacro y está rotulado como tal en todas partes: no rompe nada, no afecta a otros visitantes y los chequeos reales siguen corriendo por debajo. Lo que se pone en rojo es el escenario, no el sitio.',
    simulacro: 'Simulacro',
    valorSimulado: 'valor simulado',
    avisoPanel:
      'Hay un simulacro de chaos engineering en curso: el servicio marcado muestra un valor inventado a propósito. Los demás siguen siendo chequeos reales, y al terminar el simulacro vuelve a verse el valor medido.',
    inyectar: 'Inyectar fallo',
    enCurso: 'Inyectado',
    activo: (titulo) => `Simulacro en curso · ${titulo}`,
    listo: 'Sin simulacro activo',
    listoDetalle: 'Elegí un escenario para inyectar un fallo controlado.',
    fase: 'Fase',
    restaurar: 'Restaurar ahora',
    autoHealing: (s) => `Auto-healing en ${s} s`,
    bitacoraVacia:
      'Acá se escribe la bitácora del simulacro. Las mismas líneas salen en la consola de más abajo.',
    nombresFase: {
      inyeccion: 'inyección',
      deteccion: 'detección',
      diagnostico: 'diagnóstico',
      remediacion: 'remediación',
      recuperado: 'recuperado',
    },
    escenarios: {
      latencia: {
        titulo: 'Inyectar latencia',
        descripcion:
          'El origen sigue respondiendo 200, pero tarda cuatro segundos. Es el fallo más difícil de detectar: nada está caído, todo está lento.',
      },
      'api-caida': {
        titulo: 'Simular caída de API',
        descripcion:
          'La dependencia externa deja de responder. El sitio tiene que degradarse sin arrastrar consigo lo que sí funciona.',
      },
      'error-500': {
        titulo: 'Simular error 500',
        descripcion:
          'Un despliegue malo empieza a devolver 5xx. La regla de umbral lo detecta y el rollback cierra el ciclo.',
      },
    },
    // Las líneas de la bitácora. Reciben el escenario y sacan de él lo
    // técnico, que no se traduce: la señal es la misma expresión en los dos
    // idiomas porque así se escribiría en una regla de alerta de verdad.
    fases: {
      inyeccion: (e) => `chaos: inyectando "${e.id}" sobre ${e.servicio} · severidad ${e.severidad}`,
      deteccion: (e) => `alerta disparada · ${e.senal}`,
      diagnostico: (e) => `diagnóstico: el chequeo de ${e.servicio} confirma la condición · abriendo runbook`,
      remediacion: (e) => `remediación automática · ${e.remedio}`,
      recuperado: (e) => `${e.servicio} operativo · el auto-healing cerró el ciclo sin intervención manual`,
      restaurado: (e) => `restauración manual · "${e.id}" cancelado antes del auto-healing`,
    },
    consola: {
      titulo: 'Escenarios de chaos engineering',
      pista: 'Usá `chaos <id>` para inyectar, y `chaos heal` para restaurar antes de tiempo.',
      sinEscenario: 'Sin simulacro activo.',
      enCurso: (id) => `simulacro "${id}" en curso · el rojo de abajo es del escenario, no del sitio`,
      inyectando: (id) => `Inyectando el escenario "${id}"…`,
      restaurando: (id) => `Restaurando "${id}" sin esperar al auto-healing…`,
      nadaQueRestaurar: 'No hay ningún simulacro activo.',
      noExiste: (id) => `chaos: no existe el escenario "${id}". Probá \`chaos\`.`,
      seguiEnPanel: 'Las fases se escriben acá y en la sección Chaos.',
    },
  },

  // ── Banner del sandbox ──────────────────────────────────────
  // Lo único que la portada dice sobre las otras dos vistas. Enumera lo
  // que hay del otro lado en vez de resumirlo en un adjetivo, porque es
  // leyendo qué hay como se decide entrar.
  sandbox: {
    etiqueta: 'Sandbox interactivo',
    titulo: 'Explorar el SRE Interactive Sandbox',
    texto:
      'Nueve paneles con datos reales: las métricas DORA del pipeline que publica esta página, la latencia p95 medida en vivo, la topología, un sandbox de chaos engineering con auto-healing, los runbooks paso a paso, el presupuesto de error, los post-mortems con su bitácora y una consola que responde comandos. Corre entero en tu navegador y no hay nada que instalar.',
    abrir: 'Explorar el sandbox',
    pie: 'cambia de vista · no recarga la página',
    vivo: 'quedó algo corriendo adentro',
  },

  // ── Resumen de trayectoria ──────────────────────────────────
  trayectoria: {
    verLogros: 'Ver logros',
    ocultarLogros: 'Ocultar logros',
    cuantos: (n) => `(${n})`,
  },

  // ── Tablero de telemetría y métricas DORA ───────────────────
  telemetria: {
    label: 'Telemetría & DORA',
    titulo: 'El tablero con el que este sitio se mira a sí mismo',
    bajada:
      'Las métricas DORA calculadas sobre el pipeline que publica esta página, más la latencia que está midiendo tu navegador ahora mismo. Cada tile muestra arriba el valor medido y abajo el objetivo declarado: cuando no coinciden, se ve.',
    tablero: 'dora-board · portfolio',
    ventana: (d) => `ventana ${d} d`,
    fuenteActions: 'fuente: github actions · main',
    objetivo: 'Objetivo',
    cumple: 'cumple',
    noCumple: 'fuera',
    sinDatos: 'sin datos',
    midiendo: 'midiendo…',
    comoSeMide: 'Cómo se mide',
    aviso:
      'Frecuencia de despliegue, lead time y change failure rate salen de la API pública de GitHub Actions, sobre las corridas reales de main. El MTTD sale del observability-lab, con su bitácora publicada. La latencia p95 la mide tu propio navegador mientras mirás este panel. El objetivo es una meta declarada, no un resultado, y por eso va rotulado aparte.',
    duranteSimulacro:
      'Hay un simulacro de chaos engineering en curso. Este tablero no lo refleja a propósito: sus números son mediciones reales y un simulacro no las cambia.',
    muestras: (n) => `p95 sobre ${n} muestras desde este navegador`,
    medianaDe: (n) => `mediana de ${n} despliegues con commit fechado`,
    corridasVerdes: (n) => `${n} corridas verdes en main`,
    fallidasDe: (f, t) => `${f} fallidas de ${t} corridas completadas`,
    mttdDetalle: (ventana, umbral) => `regla: ${umbral} % de 5xx en ventana de ${ventana} s`,
    // Anotaciones de los sparklines. Todas reciben números ya calculados
    // sobre la serie real: ninguna afirma nada que el gráfico de arriba no
    // esté mostrando, y cuando la serie no alcanza no se renderiza ninguna.
    anotaciones: {
      recuperado: (n) => `Recuperación: CFR 0 % en las últimas ${n} corridas, con rojos antes`,
      limpio: (n) => `CFR 0 % en las últimas ${n} corridas`,
      conFallas: (f, n) => `${f} fallidas en las últimas ${n} corridas`,
      optimizado: (antes, ahora, dias) =>
        `Optimizado: ${antes} → ${ahora} (mediana por mitades de la ventana de ${dias} d)`,
      arranque: (primera, estable) => `Arranque en frío ${primera} ms → ${estable} ms ya estabilizado`,
      referenciaP50: (p50) => `Línea punteada: p50 medido, ${p50} ms`,
    },
    tiles: {
      despliegues: 'Deployment frequency',
      leadTime: 'Lead time for changes',
      cfr: 'Change failure rate',
      mttd: 'MTTD · detección',
      p95: 'Latencia cliente p95',
    },
    cadencia: {
      diario: 'cadencia diaria',
      semanal: 'cadencia semanal',
      mensual: 'cadencia mensual',
      esporadico: 'cadencia esporádica',
    },
    unidades: {
      despliegues: (d) => `/ ${d} d`,
    },
    motivo: {
      limite: 'La API pública de GitHub cortó por límite de consultas. Volvé en unos minutos.',
      red: 'No se pudo alcanzar la API desde este navegador.',
      timeout: 'La consulta a la API tardó demasiado.',
      api: 'La API respondió algo inesperado.',
    },
  },

  // ── Command Center · runbooks de incidente ─────────────────
  playbooks: {
    label: 'Command Center',
    titulo: 'El runbook, paso a paso y en la consola de abajo',
    bajada:
      'Tres síntomas que aparecen en cualquier guardia: el proceso que se come la memoria, el que se come el CPU y el pool de conexiones agotado. Cada uno abre su runbook y se ejecuta un paso por vez, en el orden en que se haría de verdad — con el diagnóstico antes de la mitigación, porque reiniciar primero borra la evidencia y garantiza que el incidente vuelva.',
    aviso:
      'Esto es procedimiento, no una corrida registrada: los comandos son los que se escribirían, y las salidas son ilustrativas. No hay un cluster en vivo detrás y cada bloque que imprime la consola lo dice en su propia cabecera. Los incidentes que sí ocurrieron, con bitácora y números medidos, están en la sección de post-mortems.',
    abrir: 'Abrir runbook',
    abierto: 'Abierto',
    pasosCount: (n) => `${n} pasos`,
    sinPlaybook: 'Ningún runbook abierto',
    sinPlaybookDetalle: 'Elegí un síntoma para abrir su procedimiento.',
    elegiUno: 'Elegí uno de los tres runbooks de arriba para abrirlo acá.',
    listoParaCorrer: 'Abierto, sin ejecutar ningún paso todavía.',
    paso: 'Paso',
    correrPrimero: 'Ejecutar primer paso',
    correrSiguiente: 'Siguiente paso',
    finalizado: 'Runbook completo',
    reiniciar: 'Reiniciar el runbook',
    cerrar: 'Cerrar el runbook',
    salidaEnConsola: 'La salida de cada paso se escribe en la consola de más abajo.',
    completado: 'Runbook completo: el servicio quedó verificado, no solo mitigado.',
    escenarios: {
      'memory-leak': {
        titulo: 'Memory leak en la aplicación',
        descripcion:
          'El pod crece hasta el límite y el kernel lo mata. Reinicia, vuelve a crecer, y el gráfico dibuja una sierra.',
        hipotesis:
          'La hipótesis a descartar primero es la más barata: que no sea un leak sino un límite mal puesto. Recién si el consumo crece de forma monótona entre reinicios hay algo que perseguir en el heap.',
        pasos: {
          confirmar: {
            titulo: 'Confirmar cuál pod y cuánto',
            porQue:
              'Antes de hablar de leak hay que ver si el consumo está repartido o concentrado en una réplica. Si crecen las tres parejo, el problema es el límite; si crece una sola, es esa instancia.',
          },
          evidencia: {
            titulo: 'Buscar el OOMKill en el estado anterior',
            porQue:
              'Un pod que "se reinició solo" no dice nada. `Reason: OOMKilled` con exit code 137 sí: el kernel lo mató por memoria, y eso descarta un crash de la aplicación.',
          },
          capturar: {
            titulo: 'Capturar el heap ANTES de reiniciar',
            porQue:
              'Este es el paso que se saltea siempre. El rollout restart de abajo devuelve el servicio y borra la única evidencia que explica por qué se llenó. Sin el dump, el incidente se cierra como "reiniciado" y vuelve la semana que viene.',
          },
          mitigar: {
            titulo: 'Devolver el servicio',
            porQue:
              'Con la evidencia ya guardada, mitigar es barato. El rollout restart reemplaza los pods de a uno, así que el servicio no se corta mientras se recupera la memoria.',
          },
          verificar: {
            titulo: 'Verificar, no suponer',
            porQue:
              'Un incidente no se cierra cuando se ejecuta la mitigación: se cierra cuando la medición lo confirma. Si el consumo vuelve a la línea base, la mitigación funcionó y queda abierto el análisis del dump.',
          },
        },
      },
      'high-cpu': {
        titulo: 'CPU al tope en producción',
        descripcion:
          'Las tres réplicas al 95 % de su límite, latencia por las nubes y ninguna caída: el servicio responde, pero tarde.',
        hipotesis:
          'Con las tres réplicas iguales al mismo tiempo, la causa casi nunca es una instancia enferma: es algo que entró para todas a la vez. Un despliegue o un cambio de tráfico.',
        pasos: {
          confirmar: {
            titulo: 'Ver si es una réplica o son todas',
            porQue:
              'La distribución del síntoma es el primer dato del diagnóstico. Tres réplicas idénticas al tope descartan el problema local y apuntan a un cambio común.',
          },
          correlacionar: {
            titulo: 'Correlacionar con el último despliegue',
            porQue:
              'La pregunta más rentable de toda la guardia: ¿qué cambió? Un rollout seis minutos antes de la alerta no prueba la causa, pero ordena el resto de la investigación y habilita el rollback como mitigación.',
          },
          culpable: {
            titulo: 'Encontrar dónde se va el CPU',
            porQue:
              'Un profiler sobre el proceso vivo convierte la sospecha en un nombre de función. Sin este paso, el rollback arregla el síntoma y nadie aprende qué lo causó.',
          },
          mitigar: {
            titulo: 'Volver a la revisión anterior',
            porQue:
              'Con la causa acotada al cambio, el rollback es la mitigación más rápida y la de menor riesgo. Escalar horizontalmente habría comprado tiempo pagando el doble de infraestructura por el mismo bug.',
          },
          verificar: {
            titulo: 'Confirmar que volvió a la línea base',
            porQue:
              'El CPU de vuelta en decenas de milicores es lo que cierra la mitigación. Lo que sigue es el fix del patrón que se recompilaba en cada request, y eso ya no es guardia: es backlog.',
          },
        },
      },
      'db-connections': {
        titulo: 'Pool de conexiones agotado',
        descripcion:
          'La base rechaza conexiones nuevas, la aplicación devuelve 500 y el pool está lleno de sesiones que no hacen nada.',
        hipotesis:
          'Un pool lleno rara vez significa demasiado tráfico. Casi siempre significa transacciones que nadie cerró: conexiones tomadas, ociosas y sin devolver.',
        pasos: {
          confirmar: {
            titulo: 'Medir cuán cerca del techo está',
            porQue:
              'Antes de tocar nada hay que saber si faltan diez conexiones o dos. 198 de 200 explica los 500 sin necesidad de mirar los logs de la aplicación.',
          },
          quienes: {
            titulo: 'Ver en qué estado están esas conexiones',
            porQue:
              'Es el dato que decide el resto. 171 en `idle in transaction` contra 19 activas dice que el problema no es carga: son transacciones abiertas que la aplicación nunca cerró.',
          },
          contener: {
            titulo: 'Liberar las sesiones colgadas',
            porQue:
              'Cortar solo las ociosas de más de cinco minutos devuelve el servicio sin tocar las 19 que están trabajando. Es contención, no solución: si se corta y nada más, el pool se vuelve a llenar.',
          },
          mitigar: {
            titulo: 'Bajar el pool por réplica',
            porQue:
              'Tres réplicas con un pool de 60 cada una piden 180 conexiones a una base que da 200. Bajar el máximo por réplica ataca la causa estructural, y el rollout se verifica antes de dar el incidente por controlado.',
          },
          verificar: {
            titulo: 'Confirmar que el estado se estabilizó',
            porQue:
              'Sin `idle in transaction` en el listado, la contención funcionó. El fix definitivo —el bloque que no cierra la transacción cuando falla— queda como acción del post-mortem.',
          },
        },
      },
    },
    consola: {
      titulo: 'Runbooks de incidente disponibles',
      pista: 'Usá `playbook <id>` para abrirlo y `playbook next` para correr el paso siguiente.',
      sinPlaybook: 'Ningún runbook abierto.',
      nadaAbierto: 'No hay ningún runbook abierto. Probá `playbook`.',
      yaTerminado: 'El runbook ya llegó al último paso. Probá `playbook restart`.',
      noExiste: (id) => `playbook: no existe el runbook "${id}". Probá \`playbook\`.`,
      abriendo: (titulo) => `runbook abierto · ${titulo}`,
      abiertoEn: (titulo, paso, total) => `abierto: ${titulo} · paso ${paso}/${total}`,
      aviso: '# procedimiento · salidas ilustrativas, no hay un cluster en vivo detrás',
      senal: 'señal que dispara',
      paso: (n, total) => `paso ${n}/${total}`,
      terminado: (titulo) => `runbook completo · ${titulo} · servicio verificado, no solo mitigado`,
      reiniciado: (titulo) => `runbook reiniciado · ${titulo}`,
      cerrado: (titulo) => `runbook cerrado · ${titulo}`,
    },
  },

  // ── SLO y error budget ─────────────────────────────────────
  slo: {
    label: 'SLO & Error Budget',
    titulo: 'Cuántos minutos de caída compra cada nueve',
    bajada:
      'Un SLO no es una promesa: es un presupuesto. Elegí el objetivo y mirá cuánto tiempo caído permite en cada período — y cuánto de ese presupuesto se comieron los simulacros de chaos engineering que corriste en esta sesión.',
    tablero: 'slo-calculator · downtime permitido',
    elegirObjetivo: 'Elegir objetivo de disponibilidad',
    elegirPeriodo: 'Elegir período del presupuesto',
    tablaAria: 'Caída máxima permitida por período y objetivo de disponibilidad',
    periodo: 'Período',
    sinDatos: 'sin datos',
    periodos: {
      dia: 'por día',
      semana: 'por semana',
      mes: 'por mes',
      anio: 'por año',
    },
    notaTabla:
      'Aritmética pura: (1 − objetivo) × período. El mes son 30 días y el año 365, que es la convención con la que se publican estas tablas. La columna resaltada es la del objetivo elegido; las otras tres están al lado a propósito, porque la pregunta que importa no es cuánto permite 99,9 sino cuánto cuesta el nueve que sigue.',
    presupuestoDe: (objetivo, periodo) => `presupuesto de ${objetivo} ${periodo}`,
    tiles: {
      presupuesto: 'Presupuesto',
      consumido: 'Consumido',
      restante: 'Restante',
    },
    niveles: {
      sano: 'Presupuesto sano',
      atencion: 'Presupuesto en atención',
      critico: 'Presupuesto crítico',
      agotado: 'Presupuesto agotado',
    },
    simulacrosCorridos: (n) => (n === 1 ? '1 simulacro en esta sesión' : `${n} simulacros en esta sesión`),
    sinSimulacros: 'todavía no corriste ningún simulacro',
    porcentajeGastado: (p) => `${p} % del presupuesto`,
    desglose: {
      caido: (d) => `caída total: ${d}`,
      degradado: (d) => `degradación: ${d}`,
      enCurso: 'simulacro en curso · sumando',
    },
    avisoSinSimulacros:
      'El consumo lo generan los simulacros del sandbox de chaos engineering de más arriba. Inyectá uno y mirá cómo se come el presupuesto en tiempo real: diez segundos de simulacro son diez segundos de un mes de 99,99 %.',
    avisoConSimulacros:
      'Estos segundos son de reloj y están medidos, pero el incidente que los produjo fue simulado: es presupuesto gastado en un simulacro, no en una caída. Un simulacro cuenta entero, sea caída o degradación — ponderar la degradación exigiría saber qué fracción de las peticiones falló, y eso acá no se midió.',
  },

  // ── Topología en vivo (pestaña "Topología & Caos" del hub) ──
  topologia: {
    label: 'Topología en vivo',
    titulo: 'Las piezas que sirven esta página, con su estado real',
    tablero: 'topology · live',
    pista: 'pasá el cursor o tabulá sobre un nodo',
    bajada:
      'Las tres piezas que sirven esta página, con el estado y la latencia que se están midiendo ahora mismo. Las dos flechas salen del navegador porque este sitio es estático: no hay backend en el medio que llame a GitHub por vos.',
    leyenda:
      'Mismos chequeos que el panel de estado de arriba de la página. Si inyectás un fallo en el sandbox de chaos engineering, el nodo afectado se degrada acá también y queda rotulado como simulacro.',
    simulado: 'Este nodo está degradado por un simulacro: el valor es inventado a propósito y el chequeo real sigue corriendo por debajo.',
    desdeCache: 'sin medir · respuesta desde cache',
    sinDato: '—',
    nodos: {
      cliente: {
        titulo: 'Browser Client',
        sub: 'tu navegador',
        descripcion:
          'El navegador que está leyendo esto. Es el que cronometra las dos peticiones del diagrama, así que la latencia que ves es la tuya y no la de un monitor sintético en otro continente.',
      },
      edge: {
        titulo: 'Vercel Edge Network',
        sub: 'origen del sitio',
        descripcion:
          'El edge que sirve el HTML, el JS y los assets. Se mide con una petición real y sin cache a un archivo chico: da la ida y vuelta hasta el PoP más cercano, no el tiempo de descarga.',
      },
      actions: {
        titulo: 'GitHub Actions API',
        sub: 'api.github.com',
        descripcion:
          'La API pública de la que salen el estado del pipeline y los números del tablero DORA. Es la única dependencia externa del sitio, y por eso se muestra como nodo propio: cuando su límite de consultas corta, lo que queda sin datos es medible y está dicho.',
      },
    },
    enlaces: {
      origen: 'GET /favicon.svg',
      actions: 'GET /actions/runs',
    },
    estados: {
      ok: 'operativo',
      fallo: 'con fallo',
      corriendo: 'corrida en curso',
      consultando: 'consultando…',
      desconocido: 'sin datos',
    },
    campos: {
      latencia: 'Latencia',
      p50: 'p50',
      muestras: 'Muestras',
      codigo: 'Respuesta',
      entorno: 'Entorno',
      corrida: 'Corrida',
      rama: 'Rama',
      fuente: 'Fuente',
    },
    unidades: {
      ms: 'ms',
      p95: 'ms p95',
    },
  },

  // ── Badges de CI en las tarjetas de proyecto ────────────────
  ci: {
    titulo: 'GitHub Actions',
    passing: 'passing',
    failing: 'failing',
    corriendo: 'running',
    desconocido: 'unknown',
    verCorrida: 'Ver la corrida en GitHub',
  },

  // ── Consola interactiva ─────────────────────────────────────
  consola: {
    label: 'Consola',
    titulo: 'Probá los labs desde acá',
    bajada:
      'Una consola de verdad, no un GIF. Escribí `help` para ver los comandos disponibles: consulta las métricas medidas, el estado en vivo de los servicios y la bitácora de incidentes sin salir de la página.',
    titulobarra: 'portfolio-sandbox — sh',
    prompt: 'visitante@portfolio:~$',
    aviso:
      'Sandbox: las salidas de kubectl reproducen corridas registradas en los labs, no hay un cluster en vivo detrás. `status` y `curl /health` sí consultan en el momento.',
    ayudaInicial: 'Escribí `help` para empezar, o `metrics` para ir directo a los números.',
    ejecutar: 'Ejecutar',
    limpiar: 'Limpiar consola',
    focoAria: 'Consola interactiva: escribí un comando y presioná Enter',
    desconocido: (cmd) => `sh: ${cmd}: comando no encontrado. Probá \`help\`.`,
    faltaArgumento: (cmd) => `${cmd}: falta el argumento. Probá \`help\`.`,
    ayuda: {
      titulo: 'Comandos disponibles',
      comandos: [
        ['help', 'esta ayuda'],
        ['status', 'estado en vivo de los servicios (consulta real)'],
        ['metrics', 'métricas medidas en los labs, con su método'],
        ['incidents', 'bitácora de incidentes'],
        ['incident <id>', 'abre el post-mortem completo'],
        ['labs', 'laboratorios publicados y sus repos'],
        ['kubectl get pods', 'salida registrada del k8s-lab'],
        ['kubectl get nodes', 'nodos del cluster de laboratorio'],
        ['curl /health', 'health check armado con los chequeos en vivo'],
        ['curl /metrics', 'las mismas métricas en formato Prometheus'],
        ['chaos', 'escenarios de chaos engineering disponibles'],
        ['chaos <id>', 'inyecta un fallo simulado (auto-healing a los 10 s)'],
        ['chaos heal', 'restaura sin esperar al auto-healing'],
        ['playbook', 'runbooks de incidente disponibles'],
        ['playbook <id>', 'abre un runbook (salidas ilustrativas)'],
        ['playbook next', 'ejecuta el paso siguiente del runbook'],
        ['whoami', 'quién escribe todo esto'],
        ['cv', 'descarga el CV'],
        ['contact', 'datos de contacto'],
        ['lang <es|en>', 'cambia el idioma del sitio'],
        ['clear', 'limpia la pantalla'],
      ],
      pista: '↑ / ↓ recorren el historial · Tab autocompleta',
    },
    kubectl: {
      pods: (s) =>
        `# salida registrada · el tercer pod es el reemplazo del experimento de auto-healing (${s} s)`,
      nodes: '# salida registrada · cluster local de laboratorio, un solo nodo',
    },
    metrics: { titulo: 'Métricas medidas · fuente: bitácoras de los labs', metodo: 'método' },
    incidents: {
      titulo: 'Bitácora de incidentes — post-mortems de laboratorio',
      pista: 'Usá `incident <id>` para abrir el reporte completo.',
      noEncontrado: (id) => `incident: no existe el incidente "${id}". Probá \`incidents\`.`,
      abriendo: (cod) => `Abriendo el post-mortem ${cod}…`,
    },
    labs: { titulo: 'Laboratorios publicados' },
    status: { titulo: 'Chequeo en vivo desde este navegador', consultando: 'Consultando servicios…' },
    whoami: [
      'Samuel Eduardo García Baciliadis',
      'IT Incident Manager · Incident Analyst → Junior SRE / DevOps',
      'Buenos Aires, Argentina · Remoto / Híbrido',
      '',
      'Gestiono incidentes P1/P2 en Fintech y Telco. Lo que ves en este sitio',
      'son laboratorios donde rompo cosas a propósito para medir cómo se recuperan.',
    ],
    cv: { descargando: 'Descargando el CV orientado a SRE / DevOps…', enlace: 'Si no arranca solo, abrilo desde acá' },
    lang: { cambiado: (l) => `Idioma cambiado a ${l === 'es' ? 'español' : 'inglés'}.`, invalido: 'lang: usá `lang es` o `lang en`.' },
  },

  // ── Post-mortems ────────────────────────────────────────────
  postmortem: {
    severidad: 'Severidad',
    servicio: 'Servicio',
    lab: 'Laboratorio',
    fecha: 'Fecha',
    estado: 'Estado',
    duracion: 'Duración',
    impactoUsuario: 'Impacto al usuario',
    deteccion: 'Detección',
    timeline: 'Línea de tiempo',
    causaRaiz: 'Causa raíz',
    impacto: 'Impacto',
    acciones: 'Acciones correctivas',
    leccion: 'Lo que dejó',
    verBitacora: 'Ver la bitácora en GitHub',
    cerrar: 'Cerrar post-mortem',
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    resumenEjecutivo: 'Resumen',
  },

  // ── Formulario de contacto ──────────────────────────────────
  form: {
    nombre: 'Nombre',
    nombrePlaceholder: 'Cómo te llamás',
    email: 'Email',
    emailPlaceholder: 'tu@empresa.com',
    mensaje: 'Mensaje',
    mensajePlaceholder: 'Contame sobre la posición, el equipo o el proyecto.',
    enviar: 'Enviar mensaje',
    enviando: 'Enviando…',
    errores: {
      nombre: 'Ingresá tu nombre',
      email: 'Ingresá un email válido',
      mensaje: 'Contame un poco más (mínimo 10 caracteres)',
    },
    okFormspree: 'Mensaje enviado. Te respondo dentro de las próximas 24 h hábiles.',
    okMailto: 'Mensaje preparado en tu cliente de correo. ¡Gracias por escribir!',
    error: 'No se pudo enviar el mensaje.',
    errorCta: 'Escribime por correo',
    errorCola: (email) => `o copiá ${email}.`,
    pieFormspree: (email) => `Respondo a la casilla que dejes acá. También podés escribirme directo a ${email}`,
    pieMailto: (email) => `El formulario abre tu cliente de correo. También podés escribirme directo a ${email}`,
    asunto: (nombre) => `Contacto desde el portfolio — ${nombre}`,
    tiempoRespuesta: 'Tiempo de respuesta',
    sla: '< 24 h hábiles',
    slaTexto: '— el mismo criterio de SLA que aplico en operaciones.',
    githubLinea: 'GitHub · Labs y repos',
  },

  footer: {
    construido: 'Construido con React, Tailwind CSS y Lucide.',
  },

  meta: {
    title: 'Samuel García Baciliadis — IT Incident Manager & SRE / DevOps',
    description:
      'Incident Manager con experiencia en Fintech y Telecomunicaciones. Gestión de incidentes críticos P1/P2, observabilidad, RCA y reducción de MTTR. En transición hacia SRE / DevOps.',
  },
}
