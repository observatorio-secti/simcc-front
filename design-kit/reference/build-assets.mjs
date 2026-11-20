// Legado: lê logos e fundos de src/ da plataforma anterior. Rode sobre um
// checkout da tag legado-v1 (os arquivos gerados já estão em design-kit/assets).
import fs from 'fs'; import path from 'path';
const root = process.argv[2], out = path.join(root,'design-kit/assets');
// logos: JSX -> SVG
function jsx2svg(file){
  let s = fs.readFileSync(file,'utf8');
  let m = s.match(/<svg[\s\S]*<\/svg>/); if(!m) throw file; s = m[0];
  s = s.replace(/\{\.\.\.props\}/g,'').replace(/className=\{[^}]*\}/g,'').replace(/className="[^"]*"/g,'')
   .replace(/height="100%"/,'').replace(/(\w)([A-Z])(\w*)=/g,(a,b,c,d)=> b+'-'+c.toLowerCase()+d+'=')
   .replace(/clip-path-units/g,'clipPathUnits').replace(/view-box/g,'viewBox')
   .replace(/=\{"([^"]*)"\}/g,'="$1"').replace(/=\{'([^']*)'\}/g,'="$1"').replace(/><\/path>/g,'/>');
  if(!/xmlns=/.test(s)) s=s.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
  return s;
}
for (const [src,dst] of [['LogoIapos','simcc.svg'],['LogoIaposWhite','simcc-white.svg'],['LogoObservatorio','observatorio.svg']])
  fs.writeFileSync(path.join(out,'logo',dst), jsx2svg(path.join(root,'src/components/svg',src+'.tsx')));
fs.copyFileSync(path.join(root,'public/logo.svg'), path.join(out,'logo/simbolo.svg'));
fs.copyFileSync(path.join(root,'src/assets/governo-bahia-secti.png'), path.join(out,'logo/governo-bahia-secti.png'));
for (const b of ['bg_home','bg_graduate','bg_indicadores','bg_researcher'])
  fs.copyFileSync(path.join(root,'src/assets',b+'.png'), path.join(out,'backgrounds',b.replace('bg_','')+'.png'));
// lucide sprite
const icons = process.argv[3].split(',');
const dir = path.join(root,'node_modules/lucide-react/dist/esm/icons');
let sym = [];
for (const name of icons){
  const f = path.join(dir,name+'.js');
  if(!fs.existsSync(f)){ console.error('MISSING', name); continue; }
  let src = fs.readFileSync(f,'utf8');
  const al = src.match(/export \{ default \} from '\.\/([^']+)'/); if(al) src = fs.readFileSync(path.join(dir,al[1]),'utf8');
  const arr = src.match(/createLucideIcon\("[^"]+", (\[[\s\S]*\])\);/)[1];
  const nodes = (0,eval)("("+arr+")");
  const inner = nodes.map(([tag,attrs])=> '<'+tag+' '+Object.entries(attrs).filter(([k])=>k!=='key').map(([k,v])=>`${k}="${v}"`).join(' ')+'/>').join('');
  sym.push(`<symbol id="${name}" viewBox="0 0 24 24">${inner}</symbol>`);
}
fs.writeFileSync(path.join(out,'icons/lucide-sprite.svg'),
 `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n${sym.join('\n')}\n</svg>\n`);
console.log('icons', sym.length);
