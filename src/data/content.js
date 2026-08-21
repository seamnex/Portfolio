// ─────────────────────────────────────────────────────────────
//  Contenido único del sitio (ES). Editá acá, no en los componentes.
// ─────────────────────────────────────────────────────────────

// ── GitHub ───────────────────────────────────────────────────
// Cuenta real: seamnex. Hoy tiene 0 repos públicos, y un perfil vacío
// resta más de lo que suma en una búsqueda de SRE/DevOps.
// Poné GITHUB_PUBLICO en true cuando haya al menos un repo con README:
// ahí aparecen solos el ícono del nav, el del hero, el del contacto y el del footer.
// Dato medido en observability-lab. Vive en una sola constante porque lo usan
// el hero y labMetrics: dos copias del mismo numero se desincronizan en cuanto
// una corrida nueva lo mueva, y la que quede vieja no avisa.
const MTTD_MEDIDO = '25,6'

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
  cv: '/cv-samuel-garcia-baciliadis.pdf', // ← dejar el PDF en /public
}

export const hero = {
  headline: ['Del incidente crítico', 'a la resiliencia por diseño.'],
  subtitle:
    'Gestiono incidentes P1/P2 en entornos de alto volumen —Fintech y Telecomunicaciones— liderando War Rooms, restaurando el servicio y cerrando el ciclo con RCA que evitan la reincidencia. Hoy llevo esa disciplina operacional hacia SRE y DevOps: observabilidad, automatización y sistemas que fallan poco y se recuperan rápido.',
  terminal: {
    prompt: 'samuel@sre-lab:~$',
    comando: 'kubectl get incidents --severity=P1 --status=resolved',
    salida: [
      { k: 'MTTD medido en lab', v: `${MTTD_MEDIDO} s — con bitácora`, tone: 'ok' },
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
export const labMetrics = {
  label: 'Métricas Clave de Infraestructura',
  titulo: 'Números que salieron de romper cosas, no de estimarlas',
  bajada:
    'Cada dato viene de una corrida con su bitácora publicada: entorno, método de medición y cantidad de muestras. Donde el resultado depende de una decisión de configuración, está también el costo de esa decisión.',
  items: [
    {
      id: 'autohealing',
      icono: 'HeartPulse',
      tone: 'ok',
      valor: '7,2',
      unidad: 's',
      titulo: 'Auto-healing en Kubernetes',
      resumen: 'Recuperación a 3/3 pods Ready después de matar un pod en caliente.',
      evidencia:
        '66 de 66 peticiones respondieron 200: el Service sacó al pod muerto del balanceo antes de que la sonda llegara a notarlo.',
      metodo: 'Sonda interna al Service a ~5 req/s · Kubernetes v1.36.1',
      repo: 'https://github.com/seamnex/k8s-lab#bitácora-de-experimentos',
    },
    {
      id: 'rolling',
      icono: 'RefreshCw',
      tone: 'accent',
      valor: '0',
      unidad: 'fallos',
      titulo: 'Rolling updates sin pérdidas',
      resumen: 'Peticiones perdidas durante el deploy, tras sumar un preStop hook de 10 s.',
      evidencia:
        '0 en 317 peticiones, contra 8 en 425 sin el hook (1,88 %). No eran 5xx sino código 000: kube-proxy ruteando a un nginx que ya había cerrado el listener. Se paga con un rollout ~1 s más lento.',
      metodo: 'A/B en el mismo cluster y la misma sesión, alternando solo el hook',
      repo: 'https://github.com/seamnex/k8s-lab#el-fix-cerrar-la-ventana-del-experimento-2',
    },
    {
      id: 'mttd',
      icono: 'Siren',
      tone: 'crit',
      valor: MTTD_MEDIDO,
      unidad: 's',
      titulo: 'MTTD de incidentes',
      resumen: 'Desde que la tasa de 5xx se dispara hasta que la alerta la detecta.',
      evidencia:
        'Baja a 11,5 s exigiendo una sola evaluación sobre el umbral, a costa de disparar con cualquier pico transitorio. MTTR total del ciclo: 75,1 s.',
      metodo: 'Marcadores en Elasticsearch, no cronómetro · ventana 60 s, umbral 5 %',
      repo: 'https://github.com/seamnex/observability-lab#bitácora-de-corridas',
    },
  ],
  // El hallazgo que mejor distingue el perfil: cuestionar el propio instrumento.
  nota: {
    titulo: 'El dato que no esperaba',
    texto:
      '45 de los 75 segundos de MTTR no fueron el incidente: fueron mi ventana deslizante midiendo. La prueba es que ese tramo dio 45,1 s y 45,2 s en dos corridas cuyos MTTD diferían a más del doble. Es una constante del instrumento, no del sistema — y significa que parte del MTTR que se reporta al negocio es latencia de la propia observabilidad.',
  },
}

export const about = {
  parrafos: [
    'Soy un perfil híbrido: vengo de la trinchera de la operación —la llamada a las 3 AM, el servicio caído, el cliente esperando— y hacia allí llevo las prácticas de ingeniería que evitan que esa llamada vuelva a ocurrir.',
    'Durante años gestioné incidentes críticos en Personal Pay (Fintech) y Telecom Argentina (Telecomunicaciones): coordiné War Rooms con equipos de infraestructura, desarrollo y negocio, prioricé bajo presión con criterio de impacto real, comuniqué estado a stakeholders y cerré cada evento con un RCA accionable. Ese trabajo me dejó una convicción: la mayoría de los incidentes no son sorpresas, son deuda técnica y falta de observabilidad que se cobran factura.',
    'Por eso hoy me especializo en SRE y DevOps. La gestión de incidentes bajo ITIL me da algo que no se aprende en un curso: entender qué falla, por qué falla y qué señales lo anticipaban. Sumado a Docker, Kubernetes, Infrastructure as Code, CI/CD y scripting, esa perspectiva se convierte en prevención: alertas que importan, runbooks que se ejecutan solos y arquitecturas que degradan con elegancia en lugar de caer.',
  ],
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
      'MTTD medido: 25,6 s — y 11,5 s con la regla más sensible',
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
      'preStop hook: de 8 fallos en 425 peticiones a 0 en 317',
      'PodDisruptionBudget verificado con la Eviction API (429 al segundo desalojo)',
      'CI que valida los manifiestos: yamllint + kubeconform en cada push',
    ],
    links: { repo: 'https://github.com/seamnex/k8s-lab', demo: null },
    comando: './scripts/medir_rollout.sh nginx:1.28-alpine',
  },
]

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
    periodo: 'Fintech',
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
  titulo: 'Hablemos de confiabilidad',
  bajada:
    'Estoy abierto a posiciones de Incident Management, SRE o DevOps Junior, y a proyectos donde la disponibilidad del servicio sea un requisito, no un deseo. Respondo dentro de las 24 horas hábiles.',
}
