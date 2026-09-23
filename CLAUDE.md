# CLAUDE.md — Portfolio de Samuel García Baciliadis

Sitio de marca personal: **IT Incident Manager / Incident Analyst → Junior SRE / DevOps**.
Estética de status page en modo oscuro, bilingüe ES/EN. En vivo en Vercel (deploy automático en cada push a `main`).

## Stack

- **Vite 5 + React 18** (SPA, JavaScript/JSX — sin TypeScript, **no es Next.js**)
- **Tailwind CSS 3** + `lucide-react` para íconos
- `pdf-lib` (CV y post-mortems en PDF) · `@resvg/resvg-js` (card OG)
- Node 22 en CI y en Vercel

## Comandos

```bash
npm run dev                # http://localhost:5173
npm run build              # genera los CV en PDF + vite build → dist/
npm run preview            # sirve dist/
npm run verificar          # paridad ES/EN, enlaces y post-mortems completos
npm run verificar:consola  # ejercita el intérprete de la consola sin navegador
npm run cv                 # regenera los CV
npm run og                 # regenera public/og-card.png (manual a propósito)
```

Antes de dar un cambio por terminado: `npm run verificar && npm run build && npm run verificar:consola`
(es lo mismo que corre `.github/workflows/ci.yml`).

## Arquitectura

- **Tres vistas** (`perfil`, `observabilidad`, `laboratorio`) en `src/components/vistas/`, elegidas por
  `src/navegacion/VistaProvider.jsx`. Regla central: **cambiar de vista oculta, nunca desmonta**; el primer
  montaje es perezoso. Un ancla nueva (`#algo`) tiene que registrarse en el mapa de `VistaProvider`, si no
  se comporta como enlace muerto.
- **Proveedores** anidados en `src/App.jsx` en orden de dependencia: idioma → vistas → avisos → estado →
  caos → telemetría → post-mortem → playbooks. Respetar ese orden al sumar uno.
- **Lógica pura** en `src/lib/` (intérprete de la consola, SLO, DORA, chequeos de estado): testeable sin React.
- **Componentes** en `src/components/`, primitivas en `src/components/ui/`.
- **Scripts de build/verificación** en `scripts/` (`.mjs`, Node puro).

## Contenido y datos

- Todo el texto vive en `src/data/content.js` (ES) y `src/data/content.en.js` (EN), **nunca en los componentes**.
  Los dos exportan exactamente los mismos nombres; una clave en un idioma y no en el otro no rompe el build,
  deja un hueco — por eso existe `npm run verificar`.
- `src/data/medidas.js` es la **fuente única de números medidos**, guardados crudos (sin formato).
  **Ningún número entra al sitio sin una corrida real que lo respalde**: no inventar métricas, MTTR,
  disponibilidad ni resultados de labs. Los post-mortems son fallas inyectadas en labs y así deben decirlo.
- Los estados de servicio son `ok`, `fallo` o `desconocido`; un `desconocido` nunca se muestra como verde.

## Estándares de código

- Seguir el estilo existente: nombres y comentarios en español, comentarios que explican el *porqué*.
- Componentes funcionales con hooks; estado compartido vía los providers existentes, no estado global nuevo.
- Tailwind con la paleta del sitio: fondo `#0B0F19`, acento cyan `#06B6D4`, verde `#10B981` (OK),
  coral `#FB7185` (incidentes). Mobile-first; verificar el menú y las vistas en ancho de teléfono.
- Accesibilidad: un solo `<main>`, landmarks correctos, foco visible, `aria-*` en controles interactivos.
- No versionar derivados (`public/cv-*.pdf` los genera el build).
- Secretos solo por variables de entorno (`VITE_FORMSPREE_ID`, ver `.env.example`); nunca en el código.

## Enfoque SRE / Observabilidad

- El sitio es una demostración de práctica SRE: SLO/error budget, DORA, post-mortems sin culpa, runbooks,
  sandbox de caos y telemetría. Los cambios deben mantener esa coherencia y ser honestos sobre qué es real
  (chequeos en vivo desde el navegador) y qué es reproducción (salidas registradas de los labs).
- Chequeos en vivo con timeout y caché (`src/lib/estado.js`); respetar el límite de 60 req/h de la API pública de GitHub.
- Validación visual: con el MCP de Playwright, abrir `http://localhost:5173` y revisar las tres vistas en
  escritorio y móvil, sin errores en consola.
- Producción: con el MCP de Vercel, revisar el estado del deployment y los logs después de cada push a `main`.
