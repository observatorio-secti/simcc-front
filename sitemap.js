const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');

const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/resultados', changefreq: 'weekly', priority: 0.8 },
  { url: '/dicionario', changefreq: 'weekly', priority: 0.8 },
  { url: '/pos-graduacao', changefreq: 'monthly', priority: 0.7 },
  { url: '/grupos-pesquisa', changefreq: 'monthly', priority: 0.7 },
  { url: '/informacoes', changefreq: 'monthly', priority: 0.7 },
  { url: '/indicadores', changefreq: 'monthly', priority: 0.7 },
  { url: '/producoes-recentes', changefreq: 'weekly', priority: 0.8 },
  { url: '/departamentos', changefreq: 'monthly', priority: 0.7 },
  { url: '/researcher', changefreq: 'daily', priority: 1.0 },
  { url: '/resultados-ia', changefreq: 'daily', priority: 0.9 },
  { url: '/paines-dados-externos', changefreq: 'monthly', priority: 0.6 },
  { url: '/indice-pesquisador', changefreq: 'monthly', priority: 0.7 },
  { url: '/relatar-problema', changefreq: 'monthly', priority: 0.5 },
  { url: '/pesquisadores-selecionados', changefreq: 'monthly', priority: 0.6 },
  { url: '/provimento-cargo', changefreq: 'monthly', priority: 0.6 },
  { url: '/listagens', changefreq: 'monthly', priority: 0.6 },
  { url: '/termos-uso', changefreq: 'yearly', priority: 0.5 },
  { url: '/sobre', changefreq: 'yearly', priority: 0.5 },
  { url: '/ufmg', changefreq: 'monthly', priority: 0.5 },
  { url: '/signIn', changefreq: 'monthly', priority: 0.5 },
  { url: '/signUp', changefreq: 'monthly', priority: 0.5 },
  { url: '/recoverPassword', changefreq: 'monthly', priority: 0.5 },
  { url: '/updatePassword', changefreq: 'monthly', priority: 0.5 },
  { url: '/dashboard/administrativo', changefreq: 'monthly', priority: 0.7 },
  { url: '/dashboard', changefreq: 'monthly', priority: 0.7 },
  {
    url: '/dashboard/parametros-pesquisa',
    changefreq: 'monthly',
    priority: 0.7,
  },
  { url: '/dashboard/secao-pessoal', changefreq: 'monthly', priority: 0.7 },
  { url: '/dashboard/relatar-problema', changefreq: 'monthly', priority: 0.5 },
  {
    url: '/dashboard/pesquisadores-selecionados',
    changefreq: 'monthly',
    priority: 0.6,
  },
  { url: '/dashboard/programas', changefreq: 'monthly', priority: 0.7 },
  { url: '/dashboard/departamentos', changefreq: 'monthly', priority: 0.7 },
  { url: '/dashboard/pesquisadores', changefreq: 'monthly', priority: 0.7 },
  { url: '/dashboard/inct', changefreq: 'monthly', priority: 0.6 },
  { url: '/dashboard/pesos-avaliacao', changefreq: 'monthly', priority: 0.6 },
  { url: '/dashboard/minhas-producoes', changefreq: 'monthly', priority: 0.6 },
  { url: '/dashboard/grupos-pesquisa', changefreq: 'monthly', priority: 0.6 },
  { url: '/dashboard/indicadores', changefreq: 'monthly', priority: 0.6 },
  { url: '/dashboard/baremas', changefreq: 'monthly', priority: 0.6 },
  {
    url: '/dashboard/enviar-notificacoes',
    changefreq: 'monthly',
    priority: 0.5,
  },
];

const sitemap = new SitemapStream({ hostname: 'https://conectee.eng.ufmg.br' });
streamToPromise(sitemap)
  .then((data) => fs.writeFileSync('./public/sitemap.xml', data))
  .catch(console.error);

links.forEach((link) => sitemap.write(link));
sitemap.end();
