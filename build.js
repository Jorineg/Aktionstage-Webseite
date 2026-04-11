import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync, readdirSync } from 'fs';
import { join, dirname } from 'path';

const LANGUAGES = ['de', 'en'];
const DEFAULT_LANG = 'de';
const DIST = 'dist';

const PAGES = [
  {
    template: 'src/pages/index.html',
    output: { de: 'index.html', en: 'en/index.html' },
    canonical: { de: '/', en: '/en/' },
    id: 'home'
  },
  {
    template: 'src/pages/impressum.html',
    output: { de: 'impressum/index.html', en: 'en/imprint/index.html' },
    canonical: { de: '/impressum/', en: '/en/imprint/' },
    id: 'impressum'
  },
  {
    template: 'src/pages/datenschutz.html',
    output: { de: 'datenschutz/index.html', en: 'en/privacy/index.html' },
    canonical: { de: '/datenschutz/', en: '/en/privacy/' },
    id: 'privacy'
  }
];

function loadMessages(lang) {
  return JSON.parse(readFileSync(`messages/${lang}.json`, 'utf-8'));
}

function loadPartials() {
  const partials = {};
  const dir = 'src/partials';
  if (existsSync(dir)) {
    for (const file of readdirSync(dir)) {
      if (file.endsWith('.html')) {
        const name = file.replace('.html', '');
        partials[name] = readFileSync(join(dir, file), 'utf-8');
      }
    }
  }
  return partials;
}

function buildAlternateLinks(page) {
  return `<link rel="alternate" hreflang="de" href="https://aktionstage.berlin${page.canonical.de}">
    <link rel="alternate" hreflang="en" href="https://aktionstage.berlin${page.canonical.en}">`;
}

function buildPageLinks(lang) {
  const links = {};
  for (const page of PAGES) {
    links[`link_${page.id}`] = page.canonical[lang];
  }
  return links;
}

function buildAltPageLinks(lang) {
  const altLang = lang === 'de' ? 'en' : 'de';
  const links = {};
  for (const page of PAGES) {
    links[`alt_link_${page.id}`] = page.canonical[altLang];
  }
  return links;
}

function processTemplate(template, replacements) {
  let result = template;
  const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    result = result.replaceAll(`{{${key}}}`, replacements[key]);
  }
  return result;
}

function build() {
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true });
  }
  mkdirSync(DIST, { recursive: true });

  const partials = loadPartials();

  for (const lang of LANGUAGES) {
    const messages = loadMessages(lang);
    const pageLinks = buildPageLinks(lang);
    const altPageLinks = buildAltPageLinks(lang);

    for (const page of PAGES) {
      let template = readFileSync(page.template, 'utf-8');

      for (const [name, content] of Object.entries(partials)) {
        template = template.replaceAll(`{{> ${name}}}`, content);
      }

      const vars = {
        ...messages,
        ...pageLinks,
        ...altPageLinks,
        canonical: page.canonical[lang],
        alternate_links: buildAlternateLinks(page),
        current_page: page.id,
        lang_prefix: lang === DEFAULT_LANG ? '' : `/${lang}`,
      };

      const html = processTemplate(template, vars);
      const outPath = join(DIST, page.output[lang]);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, html);
      console.log(`  ${outPath}`);
    }
  }

  if (existsSync('public')) {
    cpSync('public', DIST, { recursive: true });
  }

  mkdirSync(join(DIST, 'css'), { recursive: true });
  mkdirSync(join(DIST, 'js'), { recursive: true });

  if (existsSync('src/js/main.js')) {
    cpSync('src/js/main.js', join(DIST, 'js/main.js'));
  }

  console.log('\n  Build complete!\n');
}

build();
