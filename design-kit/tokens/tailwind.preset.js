/**
 * Simcc Design Kit — preset Tailwind (área pública).
 *
 * Uso em tailwind.config.js:
 *   module.exports = { presets: [require('./design-kit/tokens/tailwind.preset.js')], ... }
 *
 * Mantém os nomes que o código já usa (eng-blue, eng-dark-blue, neutral-*) e
 * adiciona os dicionários semânticos como cores nomeadas, para que nenhum
 * componente precise mais de hex literal (bg-[#20BDBE]) ou de cadeias de
 * ternários para escolher cor.
 *
 *   bg-eng-blue            → ação primária
 *   bg-search-article      → cor do tipo de busca "article"
 *   bg-area-saude          → grande área CIÊNCIAS DA SAÚDE
 *   border-l-qualis-A1     → borda do card de produção
 *   bg-prod-patente        → tipo de produção
 *
 * Os namespaces sm-* (navy/sky/red) do Console continuam no tailwind.config.js
 * e não fazem parte deste kit.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1920px',
    },
    fontFamily: {
      sans: ['Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        'eng-blue': '#559FB8',
        'eng-dark-blue': '#024A60',
        brand: {
          DEFAULT: '#559FB8',
          strong: '#024A60',
          soft: '#E3F0F4',
          teal: '#00757A',
          wine: '#9C1F2E',
        },
        deco: { DEFAULT: '#C8D7E1', soft: '#E1EAF0' },
        search: {
          profile: '#1D4ED8',
          article: '#3B82F6',
          book: '#EC4899',
          patent: '#06B6D4',
          software: '#0D9488',
          speaker: '#F97316',
          area: '#22C55E',
          name: '#EF4444',
          abstract: '#EAB308',
          maria: '#559FB8',
        },
        area: {
          agrarias: '#F87171',
          exatas: '#4ADE80',
          saude: '#20BDBE',
          humanas: '#F5831F',
          biologicas: '#EB008B',
          engenharias: '#FCB712',
          sociais: '#009245',
          linguistica: '#A67C52',
          outros: '#1B1464',
        },
        prod: {
          artigo: '#5F82ED',
          'livro-capitulo': '#D15697',
          livro: '#792F4C',
          capitulo: '#DBAFD0',
          patente: '#66B4D0',
          software: '#096670',
          marca: '#1B1464',
          relatorio: '#662D91',
          congresso: '#FF5800',
          simposio: '#D53A2C',
          seminario: '#FFBD7B',
          oficina: '#FCEE21',
        },
        orient: {
          ic: '#8BFBD3',
          mestrado: '#67A896',
          doutorado: '#425450',
          tcc: '#77D2B6',
          outra: '#577E74',
          monografia: '#2F7F7C',
          posdoc: '#46724B',
        },
        qualis: {
          A1: '#34663C',
          A2: '#9DC356',
          A3: '#B1C38A',
          A4: '#BEC4B3',
          B1: '#D56438',
          B2: '#DD883D',
          B3: '#E3B081',
          B4: '#E3AC96',
          C: '#CE3830',
          SQ: '#4A1314',
        },
        status: {
          concluida: '#6BC26B',
          andamento: '#DBB540',
        },
        bolsa: { PQ: '#00D000', DT: '#183EFF' },
        gender: { f: '#D15697', m: '#5F82ED' },
        'chart-neutral': {
          1: '#213E59',
          2: '#354E68',
          3: '#485F78',
          4: '#5C7188',
          5: '#6F8399',
          6: '#98A8BA',
        },
      },
      borderRadius: {
        // rounded-md (6px) é o padrão de controles; rounded-lg (8px) cards; rounded-xl (12px) painel
        panel: '12px',
      },
      height: {
        topbar: '40px',
        crumbbar: '68px',
      },
      maxWidth: {
        content: '1200px',
      },
      fontSize: {
        hero: ['clamp(1.875rem, 1.2rem + 2.6vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.05em' }],
      },
      backgroundImage: {
        'deco-home': "url('/src/assets/bg_home.png')",
        'deco-graduate': "url('/src/assets/bg_graduate.png')",
        'deco-indicadores': "url('/src/assets/bg_indicadores.png')",
        'deco-researcher': "url('/src/assets/bg_researcher.png')",
      },
    },
  },
};
