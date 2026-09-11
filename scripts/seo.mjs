// ─────────────────────────────────────────────────────────────
//  Datos estructurados (schema.org) para el <head>.
//
//  El sitio es una SPA sin SSR: lo que un crawler, un parser de ATS o el
//  scraper de LinkedIn ven sin ejecutar JavaScript es el index.html y
//  nada más. Este módulo arma el bloque JSON-LD (Person + WebSite) que
//  Vite inyecta en el <head> en cada build —ver vite.config.js—, así que
//  el perfil se lee entero desde el HTML estático.
//
//  Igual que la card de Open Graph y el CV: el contenido NO se escribe
//  acá. Sale de src/data/content.js, la única fuente de verdad. Un
//  JSON-LD escrito a mano en index.html es un JSON-LD que en tres meses
//  anuncia un rol que ya no figura en el sitio.
//
//  Va en español a propósito: la búsqueda es Argentina / LATAM y ese es
//  el idioma en que un reclutador de acá lo va a leer.
// ─────────────────────────────────────────────────────────────
import * as es from '../src/data/content.js'

export const SITIO_URL = 'https://portfolio-eight-ashen-34.vercel.app'

/** Empleador actual: el primer puesto de la trayectoria que sigue abierto. */
function empleadorActual(timeline) {
  const actual = timeline.find((t) => t.tipo === 'trabajo' && /presente|actualidad/i.test(t.periodo))
  return actual ? { '@type': 'Organization', name: actual.org } : undefined
}

/** Formación, en el vocabulario de schema.org. */
function credenciales(formacion) {
  return formacion.map((f) => ({
    '@type': 'EducationalOccupationalCredential',
    name: f.titulo,
    credentialCategory: f.org,
    ...(f.detalle ? { description: f.detalle } : {}),
  }))
}

/**
 * Habilidades principales: el nombre de cada dominio y sus herramientas,
 * sin duplicados. Es lo que un ATS compara contra la descripción del
 * puesto, así que van tal cual figuran en las tarjetas del sitio.
 */
function habilidades(skills) {
  const todas = skills.flatMap((s) => [s.titulo, ...s.items])
  return [...new Set(todas)]
}

export function jsonLd(contenido = es) {
  const { profile, skills, timeline, cv, ui } = contenido
  const persona = `${SITIO_URL}/#persona`
  const sitio = `${SITIO_URL}/#sitio`

  const person = {
    '@type': 'Person',
    '@id': persona,
    name: profile.nombre,
    alternateName: profile.alias,
    jobTitle: profile.rol,
    description: ui.meta.description,
    url: `${SITIO_URL}/`,
    image: `${SITIO_URL}/og-card.png`,
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Buenos Aires',
      addressCountry: 'AR',
    },
    nationality: { '@type': 'Country', name: 'Argentina' },
    knowsLanguage: ['es', 'en'],
    sameAs: [profile.linkedin, profile.github].filter(Boolean),
    worksFor: empleadorActual(timeline),
    hasOccupation: {
      '@type': 'Occupation',
      name: profile.rol,
      occupationLocation: { '@type': 'City', name: 'Buenos Aires, Argentina' },
      skills: skills.map((s) => s.titulo).join(' · '),
    },
    // `seeks` es la forma de decir qué busca sin inventar un puesto: el
    // objetivo declarado en el hero, como texto.
    seeks: { '@type': 'Demand', name: profile.target },
    knowsAbout: habilidades(skills),
    hasCredential: credenciales(cv.formacion),
  }

  const website = {
    '@type': 'WebSite',
    '@id': sitio,
    url: `${SITIO_URL}/`,
    name: ui.meta.title,
    description: ui.meta.description,
    inLanguage: 'es-AR',
    author: { '@id': persona },
    about: { '@id': persona },
  }

  // `undefined` no sobrevive a JSON.stringify: si un día no hay puesto
  // abierto, `worksFor` desaparece solo en vez de quedar en null.
  return { '@context': 'https://schema.org', '@graph': [person, website] }
}

/**
 * El bloque listo para el <head>. `</` se escapa porque un `</script>`
 * dentro de un string —una descripción, un item— cerraría el tag antes de
 * tiempo; en JSON `<\/` sigue siendo `</` al parsear.
 */
export function bloqueJsonLd(contenido = es) {
  return JSON.stringify(jsonLd(contenido), null, 2).replace(/<\//g, '<\\/')
}
