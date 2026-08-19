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
```

## Antes de publicar — checklist

1. **`src/data/content.js` → `profile`**
   - `GITHUB_URL` ya apunta a `https://github.com/seamnex`, pero **`GITHUB_PUBLICO` está en `false`**
     porque la cuenta todavía no tiene repos públicos. El sitio oculta todos los links a GitHub
     mientras esté en `false`. Pasalo a `true` recién cuando haya al menos un repo con README.
   - `email`, `ubicacion`: confirmar.
   - `cv`: dejar el PDF en `public/cv-samuel-garcia-baciliadis.pdf`.
2. **Métricas del Hero** (`metrics`): ajustar `+8 años` y los valores a tus números reales.
   Si tenés cifras duras de MTTR o disponibilidad que podés compartir, reemplazá los textos
   cualitativos — un número concreto vale más que "reducción sostenida".
3. **Proyectos** (`projects`): `links.repo` y `links.demo` están en `null`; las tarjetas ocultan
   los botones hasta que pongas la URL real. Nunca dejes `'#'`: renderiza un botón muerto.
4. **Formulario**: hoy abre el cliente de correo vía `mailto:`. Para recibir mensajes sin eso,
   cambiá el `onSubmit` de `Contact.jsx` por un `POST` a Formspree, EmailJS o una función serverless.

## Deploy

**Vercel**: importá el repo → framework *Vite* → build `npm run build`, output `dist`.
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
