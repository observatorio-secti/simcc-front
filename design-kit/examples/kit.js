/* Simcc Design Kit — helpers das páginas de exemplo (sem dependências).
   1. Monta a moldura (sidebar + topbar + crumbbar) a partir de <body data-page="…" data-crumbs="A|B">.
   2. Troca <i data-icon="nome"> por <svg> do sprite lucide.
   3. Tema claro/escuro, tabs, toggles e acordeões de demonstração. */
(function () {
  // Caminhos relativos ao próprio kit.js, para funcionar de qualquer página
  var BASE = document.currentScript ? document.currentScript.src : location.href;
  var ASSETS = new URL('../assets/', BASE).href;
  var SPRITE = ASSETS + 'icons/lucide-sprite.svg';

  function icon(name, cls) {
    return '<svg class="sc-icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="' + SPRITE + '#' + name + '"/></svg>';
  }
  window.scIcon = icon;

  /* Navegação pública — espelha src/components/app-sidebar.tsx (platformData) */
  var NAV = {
    quick: [
      ['home', 'Página Inicial', 'home.html'],
      ['search-check', 'Pesquisar', 'resultados.html'],
      ['sparkles', 'Pesquisar com IA', '#'],
    ],
    groups: [
      ['wrench', 'Ferramentas', [['download', 'Listagens', '#'], ['link-2', 'Dados', '#']]],
      ['panels-top-left', 'Páginas', [
        ['users', 'Grupos de Pesquisa', '#'], ['bar-chart-3', 'Indicadores', '#'], ['building-2', 'Instituições', '#'],
        ['landmark', 'Institutos de CT&I', '#'], ['graduation-cap', 'Pós-Graduação', '#'], ['square-play', 'Vídeos', '#'],
      ]],
      ['more-horizontal', 'Outros', [['a-arrow-up', 'Índice pesquisador', '#']]],
    ],
  };

  function navItem(item, active) {
    var on = item[2] === active;
    return '<a class="sc-nav-item' + (on ? ' is-active' : '') + '" href="' + item[2] + '"' + (on ? ' aria-current="page"' : '') + ' title="' + item[1] + '">' +
      icon(item[0]) + '<span class="sc-nav-text">' + item[1] + '</span></a>';
  }

  function buildShell() {
    var body = document.body;
    var page = document.getElementById('page');
    if (!page || body.dataset.shell === 'none') return;
    var active = body.dataset.page || '';
    var crumbs = (body.dataset.crumbs || 'Página inicial').split('|');

    var sidebar = '<aside class="sc-sidebar" aria-label="Menu principal">' +
      '<nav class="sc-nav-group"><div class="sc-nav-label">Acesso rápido</div>' +
      NAV.quick.map(function (i) { return navItem(i, active); }).join('') + '</nav>' +
      '<nav class="sc-nav-group"><div class="sc-nav-label">Plataforma</div>' +
      NAV.groups.map(function (g) {
        return '<div class="sc-nav-item" title="' + g[1] + '">' + icon(g[0]) + '<span class="sc-nav-text">' + g[1] + '</span>' + icon('chevron-down', 'sc-nav-caret sc-icon--sm') + '</div>' +
          '<div class="sc-nav-sub">' + g[2].map(function (i) { return navItem(i, active); }).join('') + '</div>';
      }).join('') + '</nav></aside>';

    var topbar = '<header class="sc-topbar">' +
      '<div class="sc-topbar__brand">' +
      '<a href="home.html"><img class="sc-logo sc-only-light" src="' + ASSETS + 'logo/simcc.svg" alt="Simcc">' +
      '<img class="sc-logo sc-only-dark" src="' + ASSETS + 'logo/simcc-white.svg" alt="Simcc"></a>' +
      '<span class="sc-topbar__sep"></span>' +
      '<img class="sc-gov" src="' + ASSETS + 'logo/governo-bahia-secti.png" alt="Governo da Bahia — SECTI">' +
      '<span class="sc-topbar__sep"></span>' +
      '<a class="sc-btn sc-btn--outline sc-btn--sm" href="#"><img src="' + ASSETS + 'logo/observatorio.svg" alt="" width="16" height="16"><span class="sc-hide-sm">Observatório</span></a>' +
      '</div>' +
      '<div class="sc-topbar__actions">' +
      '<button class="sc-btn sc-btn--outline sc-btn--sm sc-btn--icon" data-theme-toggle aria-label="Alternar tema">' + icon('sun', 'sc-icon--sm') + '</button>' +
      '<a class="sc-btn sc-btn--outline sc-btn--sm" href="#">' + icon('log-in', 'sc-icon--sm') + 'Entrar</a>' +
      '</div></header>';

    var crumbbar = '<div class="sc-crumbbar"><div class="sc-crumbbar__left">' +
      '<button class="sc-btn sc-btn--ghost sc-btn--xs sc-btn--icon" data-sidebar-toggle aria-label="Recolher menu">' + icon('panel-left') + '</button>' +
      '<span class="sc-vsep"></span><ol class="sc-breadcrumb">' +
      crumbs.map(function (c, i) {
        var last = i === crumbs.length - 1;
        return (i ? '<li aria-hidden="true">' + icon('chevron-right', 'sc-icon--sm') + '</li>' : '') +
          '<li' + (last ? ' aria-current="page"' : '') + '>' + (last ? c : '<a href="home.html">' + c + '</a>') + '</li>';
      }).join('') + '</ol></div></div>';

    var app = document.createElement('div');
    app.className = 'sc-app';
    app.innerHTML = sidebar + '<div class="sc-main">' + topbar + '<div class="sc-panel" id="panel">' + crumbbar + '</div></div>';
    body.insertBefore(app, page);
    app.querySelector('#panel').appendChild(page);
  }

  function hydrateIcons(root) {
    (root || document).querySelectorAll('i[data-icon]').forEach(function (el) {
      var tmp = document.createElement('span');
      tmp.innerHTML = icon(el.dataset.icon, el.className);
      el.replaceWith(tmp.firstChild);
    });
  }

  function theme() {
    var KEY = 'simcc-kit-theme';
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === 'dark') document.documentElement.classList.add('dark');
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-theme-toggle]');
      if (t) {
        var dark = document.documentElement.classList.toggle('dark');
        try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (e2) {}
        t.innerHTML = icon(dark ? 'moon' : 'sun', 'sc-icon--sm');
        return;
      }
      if (e.target.closest('[data-sidebar-toggle]')) {
        var sb = document.querySelector('.sc-sidebar');
        if (sb) sb.style.display = sb.style.display === 'none' ? '' : 'none';
      }
    });
  }

  function interactions() {
    document.addEventListener('click', function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab) {
        tab.parentElement.querySelectorAll('[role="tab"]').forEach(function (t) { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
      }
      var tg = e.target.closest('.sc-toggle button');
      if (tg) {
        tg.parentElement.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === tg ? 'true' : 'false'); });
        var target = document.querySelector(tg.parentElement.dataset.target || '');
        if (target) target.dataset.view = tg.dataset.view;
      }
      var col = e.target.closest('[data-collapse]');
      if (col) {
        var sec = col.closest('.sc-section');
        var body = sec && sec.querySelector('[data-collapsible]');
        if (body) {
          var hidden = body.hidden = !body.hidden;
          col.innerHTML = icon(hidden ? 'chevron-down' : 'chevron-up');
        }
      }
      var word = e.target.closest('[data-term]');
      if (word) {
        var input = document.querySelector('.sc-searchbar__input');
        if (input) { input.value = word.dataset.term; input.focus(); }
      }
    });
  }

  buildShell();
  hydrateIcons();
  theme();
  interactions();
  if (document.documentElement.classList.contains('dark')) {
    var t = document.querySelector('[data-theme-toggle]');
    if (t) t.innerHTML = icon('moon', 'sc-icon--sm');
  }
})();
