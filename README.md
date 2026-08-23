# Portfolio — Samuel Eduardo García Baciliadis

Sitio personal de marca profesional: **IT Incident Manager · Incident Analyst → Junior SRE / DevOps Engineer**.
Dark mode técnico (estilo Vercel / status page), bilingüe ES/EN, React + Tailwind CSS + Lucide React.

🔗 **En vivo:** https://portfolio-crunchy2.vercel.app

## Levantar el proyecto

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera los CV + /dist
npm run preview    # sirve /dist localmente

npm run verificar          # paridad ES/EN, enlaces y post-mortems completos
npm run verificar:consola  # todos los comandos de la consola, sin navegador
npm run cv                 # regenera los dos CV en PDF
npm run og                 # regenera public/og-card.png
```

## Estructura

```
src/
  data/
    medidas.js           ← números crudos medidos en los labs (fuente única)
    content.js           ← TODO el texto del sitio en español
    content.en.js        ← el espejo en inglés
    incidentes.js        ← post-mortems (ES) · incidentes.en.js (EN)
    servicios.js         ← qué vigila el panel de estado y qué repo lleva badge
  i18n/LanguageProvider  contexto de idioma: elige el diccionario y sincroniza <html lang>
  estado/EstadoProvider  chequeos en vivo, compartidos por panel, badges y consola
  postmortem/…Provider   estado del modal, abierto desde las tarjetas o la consola
  lib/
    estado.js            chequeos reales (origen + GitHub Actions), con cache y timeout
    comandos.js          intérprete de la consola — función pura, testeable sin React
  components/
    Navbar.jsx           nav fijo, scroll-spy, menú mobile y selector de idioma
    Hero.jsx             headline, CTAs, terminal animada y métricas
    SystemStatus.jsx     banner "All systems operational" + detalle por servicio
    About.jsx            perfil híbrido ITIL → SRE + principios de trabajo
    Skills.jsx           4 cards expandibles de especialización
    LabMetrics.jsx       las tres métricas medidas, con método y bitácora
    Incidents.jsx        bitácora de incidentes → abre PostMortem.jsx
    PostMortem.jsx       reporte SRE completo en modal, navegable con ← →
    Projects.jsx         labs con filtros, comandos y badge de CI
    Console.jsx          consola interactiva (help, status, metrics, kubectl, curl…)
    Timeline.jsx         mapa de carrera vertical
    Contact.jsx          formulario validado + links directos
    ui/                  Section · StatusBadge · CopyButton · LangToggle · CIBadge
scripts/
  generar-og.mjs         genera public/og-card.png desde content.js
  generar-cv.mjs         genera los dos CV en PDF desde content.js
  verificar-contenido.mjs  paridad de idiomas, enlaces y post-mortems
  verificar-consola.mjs    ejercita el intérprete de comandos
.github/workflows/
  ci.yml                 verificación + build + artefactos en cada push
public/
  og-card.png            vista previa al compartir el link (1200×630)
```

## Regla de oro del contenido

**Ningún número llega al sitio sin una corrida que lo respalde.** Los valores medidos
viven en `src/data/medidas.js` como números crudos, una sola vez, y de ahí los toman el
hero, las métricas, los post-mortems, la consola, la card de Open Graph y los CV.

Dos copias del mismo dato se desincronizan en cuanto una corrida nueva lo mueva, y la
que queda vieja no avisa. Además el separador decimal cambia con el idioma (7,2 en
español, 7.2 en inglés): el dato crudo tiene una sola verdad y dos formatos.

## Idiomas

El sitio arranca en el idioma del navegador —español si empieza por `es`, inglés en
cualquier otro caso— y recuerda lo que el visitante elija. `content.js` y `content.en.js`
exportan **exactamente los mismos nombres**; el proveedor decide de cuál leer.

`content.en.js` no reescribe lo que no es prosa: importa los repos, el stack, los íconos
y los comandos del archivo en español y solo pisa los textos. Una URL duplicada en dos
archivos es una URL que se desincroniza.

> Si agregás una clave en un idioma y la olvidás en el otro, **el build no falla**:
> renderiza un hueco en la mitad del sitio que menos mirás. Por eso `npm run verificar`
> compara los caminos de los dos diccionarios y corre en CI antes del build.

## Estado en vivo y badges de CI

El panel bajo el hero y los badges de las tarjetas salen de chequeos **reales hechos
desde el navegador del visitante**, no de valores fijos:

| Servicio | Qué se consulta |
|---|---|
| `edge · origen del sitio` | Una petición cronometrada a `/favicon.svg` del propio origen |
| `github-actions · Portfolio` | Última corrida en `main`, API pública de GitHub |
| `github-actions · k8s-lab` | Ídem, workflow `lint` (yamllint + kubeconform) |

Hay tres estados posibles y ninguno se inventa: `ok`, `fallo` y **`desconocido`**, que
dice además por qué (límite de la API, sin red, sin pipeline). Un `desconocido` nunca se
degrada a verde: si no se pudo verificar algo, el titular dice "estado parcialmente
verificado", que es lo que efectivamente pasó.

**Para sumar un badge a un lab**, agregá su repo en `pipelines` de `src/data/servicios.js`.
Hoy solo `k8s-lab` tiene workflows; `vagrant-lab` y `observability-lab` no, y por eso no
muestran badge — un "passing" verde sobre un repo sin CI sería directamente falso.

La API pública de GitHub permite 60 consultas por hora y por IP. Los resultados se
cachean 5 minutos en `sessionStorage` y el proveedor es uno solo para los tres
consumidores (panel, badges y consola), así que un repo vigilado por dos de ellos no
gasta dos consultas.

## Post-mortems

`src/data/incidentes.js` tiene cuatro incidentes con formato de informe SRE: línea de
tiempo, causa raíz, impacto, acciones correctivas con su estado, y lección.

Las fallas fueron **inyectadas a propósito en los labs** y el aviso va arriba de las
tarjetas, no en letra chica al pie. No son incidentes de producción de un empleador, y
presentarlos como tales sería mentir en el único lugar donde un entrevistador va a
repreguntar. Lo que se evalúa acá es el método, no el evento.

La línea de tiempo lista **solo instantes medidos**. No hay pasos intermedios inventados
para que el relato quede más prolijo.

## Consola interactiva

`Console.jsx` con historial (↑ ↓), autocompletado (Tab) y quince comandos. Qué es real
y qué es una reproducción, que es la parte que importa:

- `status`, `curl /health` → los chequeos **en vivo** del panel.
- `metrics`, `curl /metrics` → salen de `medidas.js`. El segundo, en formato Prometheus.
- `incidents`, `incident <id>` → la bitácora; el segundo **abre el modal del post-mortem**.
- `kubectl get pods|nodes` → **salidas registradas** de corridas del k8s-lab. La aclaración
  va dentro del propio bloque de salida, no solo en el aviso de la cabecera: quien copie
  esas líneas a otro lado se lleva la aclaración pegada.
- `lang es|en`, `cv`, `labs`, `whoami`, `contact`, `help`, `clear`.

El intérprete (`src/lib/comandos.js`) es una función pura y se prueba sin navegador:
`npm run verificar:consola` corre los quince comandos en los dos idiomas y en los tres
estados posibles del panel.

## CV en PDF

`npm run cv` genera los dos CV orientados a **IT Incident Manager / SRE / DevOps**:

```
public/cv-samuel-garcia-baciliadis-sre.pdf      (ES)
public/cv-samuel-garcia-baciliadis-sre-en.pdf   (EN)
```

El botón del hero sirve el del idioma activo. **No se versionan** y `npm run build` los
regenera: son un derivado determinista de `content.js`, y un binario versionado al lado
de su fuente es un binario que queda viejo en silencio. Así, el CV que se descarga de
Vercel no puede contradecir a la web.

Casi todo el contenido se deriva de los exports que ya existen —`timeline`, `projects`,
`labMetrics`—; en `cv` de `content.js` solo vive lo propio del formato: titular, resumen,
competencias agrupadas y formación.

**Los períodos salen de `timeline[].periodo`** ("Fintech", "Telecomunicaciones"…). Si
querés fechas exactas del tipo *Jun 2024 – actualidad*, cambiálas ahí: las toman el CV y
también la sección de trayectoria del sitio.

El diseño es de una sola columna y sin cajas de texto a propósito: los parsers de ATS
leen el flujo de texto y se atragantan con layouts a dos columnas. Un CV lindo que el ATS
lee mal no llega a ojos humanos. Tampoco lleva teléfono ni documento: el archivo se
publica en una URL abierta.

## Formulario de contacto

`Contact.jsx` postea a `https://formspree.io/f/$VITE_FORMSPREE_ID` y maneja cuatro
estados: `idle → enviando → ok | error`. En `error` ofrece el mailto como salida, para
que un fallo de red no se lleve puesto el contacto. Incluye un honeypot (`_gotcha`)
contra bots.

**Puesta en marcha:**

1. Crear el formulario en [formspree.io](https://formspree.io) apuntando a la casilla propia.
2. Copiar el ID del endpoint (`https://formspree.io/f/`**`abcdwxyz`**).
3. Cargarlo en Vercel → *Settings* → *Environment Variables* como `VITE_FORMSPREE_ID`.
4. **Redeploy.** Vite hornea las `VITE_*` en tiempo de build; cargar la variable sin
   volver a buildear no cambia nada en el sitio publicado.

Para probar en local: copiar `.env.example` a `.env` y completar el ID.

## Vista previa al compartir (Open Graph)

`public/og-card.png` (1200×630) es lo que muestran LinkedIn, WhatsApp, Slack y X cuando
se comparte el link. **No se edita a mano**: se genera desde `src/data/content.js`, así
que el headline y las tres métricas de la card son literalmente los mismos datos que
publica el sitio.

```bash
npm run og    # regenera public/og-card.png
```

La primera corrida baja Inter y JetBrains Mono a `scripts/.fuentes/` (ignorado por git)
para que la card salga con la tipografía real del sitio y no con la del sistema.

> Al cambiar la imagen, subir el `?v=` de `og:image` en `index.html`. Los scrapers
> cachean por URL y sin eso siguen mostrando la card vieja durante días.
> Para forzar el refresco: [Post Inspector de LinkedIn](https://www.linkedin.com/post-inspector/).

## CI

`.github/workflows/ci.yml` corre en cada push y PR a `main`, en cuatro capas:

1. **Contenido** — `npm run verificar`: los dos diccionarios son espejo, ningún enlace
   quedó en `'#'` y los post-mortems están completos. Va antes del build a propósito: si
   falta una traducción, el error tiene que decir eso y no aparecer como una página en
   blanco veinte segundos después. Por eso mismo **no** exige que los PDF del CV existan:
   en un checkout limpio todavía no se generaron, y que el archivo que promete
   `profile.cv` haya llegado a `dist/` es una pregunta que recién tiene respuesta después
   de buildear — la contesta el paso 3.
2. **Build** — `npm ci` + `npm run build` desde cero, sin `VITE_FORMSPREE_ID`, para
   ejercitar el camino de respaldo del formulario.
3. **Artefactos** — `og-card.png` y los dos CV están en `dist/`, y `og:image` es absoluta
   y apunta a un archivo que existe. Las rutas de los CV se leen de `content.js`, no se
   escriben en el YAML.
4. **Consola** — `npm run verificar:consola`.

Lo que **no** valida: que la card OG se vea bien ni que sus números sigan coincidiendo
con `content.js`. `npm run og` es manual a propósito — resvg no rasteriza byte a byte
igual en Linux que en Windows, y comparar el PNG generado en CI contra el versionado
daría un rojo permanente y mentiroso. El CV no tiene ese problema: lo genera el build.

## Antes de publicar — checklist

1. **`src/data/content.js` → `profile`**: `GITHUB_PUBLICO` está en `true`; `email` y
   `ubicacion` confirmados.
2. **Métricas** (`medidas.js`): cada valor tiene bitácora publicada en su repo.
3. **Proyectos**: al sumar uno nuevo, nunca poner `'#'` en `links` — renderiza un botón
   muerto; con `null` la tarjeta oculta el botón sola, y `npm run verificar` rechaza
   los `'#'`. La barra de filtros se arma desde las categorías que existen: si vuelve a
   haber un proyecto que no sea un lab, la pestaña *Proyectos Web* reaparece sola.
4. **Traducciones**: correr `npm run verificar` antes de pushear.
5. **Formulario**: `VITE_FORMSPREE_ID` cargado en Vercel.

## Deploy

**Vercel**: importá el repo → framework *Vite* → build `npm run build`, output `dist`.
Cargar `VITE_FORMSPREE_ID` en *Environment Variables* antes del primer build.
**Netlify**: build `npm run build`, publish directory `dist`.

> El build corre `scripts/generar-cv.mjs`, que necesita `pdf-lib` (devDependency).
> Vercel y Netlify instalan devDependencies por defecto; si alguna vez configurás
> `NODE_ENV=production` en el install, el build va a fallar ahí y con razón.

## Paleta

| Uso | Token | Hex |
|---|---|---|
| Fondo profundo | `base-900` | `#070A12` |
| Fondo principal | `base-800` | `#0B0F19` |
| Superficies / cards | `base-700` | `#111827` |
| Bordes | `base-600` | `#1B2333` |
| Acento primario | `accent` | `#06B6D4` |
| Acento secundario | `accent-soft` | `#14B8A6` |
| Estado OK / online | `ok` | `#10B981` |
| Degradado / warning | `warn` | `#F59E0B` |
| Incidente / crítico | `crit` | `#FB7185` |
