# Portfolio — Samuel Eduardo García Baciliadis

Sitio personal de marca profesional: **IT Incident Manager · Incident Analyst → Junior SRE / DevOps Engineer**.
Dark mode técnico (estilo Vercel / status page), React + Tailwind CSS + Lucide React.

🔗 **En vivo:** https://portfolio-crunchy2.vercel.app

## Levantar el proyecto

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist
npm run preview  # sirve /dist localmente
```

## Estructura

```
src/
  data/content.js        ← TODO el texto del sitio (editá acá)
  components/
    Navbar.jsx           nav fijo, scroll-spy y menú mobile
    Hero.jsx             headline, CTAs, terminal animada y métricas
    About.jsx            perfil híbrido ITIL → SRE + principios de trabajo
    Skills.jsx           4 cards expandibles de especialización
    Projects.jsx         labs y proyectos con filtros y copia de comandos
    Timeline.jsx         mapa de carrera vertical
    Contact.jsx          formulario validado + links directos
    Footer.jsx
    ui/Section.jsx       wrapper de sección (label + título + bajada)
    ui/StatusBadge.jsx   badge "Available" con punto titilante
    ui/CopyButton.jsx    copia rápida al portapapeles
scripts/
  generar-og.mjs         genera public/og-card.png desde content.js
.github/workflows/
  ci.yml                 build + verificación de artefactos en cada push
public/
  og-card.png            vista previa al compartir el link (1200×630)
  cv-samuel-garcia-baciliadis.pdf
```

## Antes de publicar — checklist

1. **`src/data/content.js` → `profile`**
   - `GITHUB_PUBLICO` ya está en `true`: la cuenta tiene los tres labs públicos y los
     links a GitHub se muestran en nav, hero, contacto y footer.
   - `email`, `ubicacion`: confirmados.
   - `cv`: el PDF vive en `public/cv-samuel-garcia-baciliadis.pdf`.
2. **Métricas del Hero** (`metrics`): los valores de `labMetrics` ya salen de corridas
   reales con bitácora. Pendiente: la terminal del hero sigue mostrando
   `MTTR promedio → ↓ reducción sostenida`, que es cualitativo. Si hay una cifra dura
   que se pueda compartir sin romper confidencialidad, va ahí; si no, se queda como está.
3. **Proyectos** (`projects`): los tres labs ya tienen `links.repo`. El único con
   `repo: null` es *MrJuan-Web* — las tarjetas ocultan el botón hasta que haya URL.
   Nunca poner `'#'`: renderiza un botón muerto.
4. **Formulario de contacto**: envía por **Formspree**. Requiere `VITE_FORMSPREE_ID`
   (ver `.env.example`). Sin esa variable el formulario no se rompe: vuelve al
   `mailto:` de antes.

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

`.github/workflows/ci.yml` corre en cada push y PR a `main`: `npm ci` + `npm run build`
desde cero, y después verifica que el build haya salido completo — que `og-card.png` y
el CV estén en `dist/`, que `og:image` sea absoluta y apunte a un archivo que existe, y
que ningún link de `content.js` haya quedado en `'#'`.

Vercel también buildea en cada push, pero avisa tarde y por mail: para cuando llega la
notificación, el commit roto ya es el que está publicado.

Lo que el CI **no** valida: que la card se vea bien ni que sus números sigan
coincidiendo con `content.js`. `npm run og` es manual a propósito — resvg no rasteriza
byte a byte igual en Linux que en Windows, así que comparar el PNG generado en CI
contra el versionado daría un rojo permanente y mentiroso.

## Deploy

**Vercel**: importá el repo → framework *Vite* → build `npm run build`, output `dist`.
Cargar `VITE_FORMSPREE_ID` en *Environment Variables* antes del primer build.
**Netlify**: build `npm run build`, publish directory `dist`.

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
