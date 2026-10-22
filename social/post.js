// Génère le visuel d'une publication Facebook SecureGuide (1080x1350, format portrait 4:5).
// Usage : node social/post.js social/posts/2026-10-22.json  -> crée le PNG à côté du JSON.
// JSON : { "type": "stat|alerte|reflexe|quiz|kit", "kicker": "...", "big": "516 M€" (stat),
//          "title": "Texte avec <em>mot en jaune</em>", "lines": ["...", "..."], "cta": "..." }
const fs = require('fs'); const path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PW_MODULE || 'playwright')); }
const dir = __dirname;
const FF = fs.readFileSync(path.join(dir, 'fonts.html'), 'utf8');
const mark = fs.readFileSync(path.join(dir, '../src/brand/mark.svg'), 'utf8');
const file = process.argv[2]; const P = JSON.parse(fs.readFileSync(file, 'utf8'));
const out = file.replace(/\.json$/, '.png');
const accent = { stat: '#F2B33D', alerte: '#D2453A', reflexe: '#2E9461', quiz: '#F2B33D', kit: '#F2B33D' }[P.type] || '#F2B33D';
const label = { stat: 'LE CHIFFRE', alerte: 'ALERTE ARNAQUE', reflexe: 'LE BON RÉFLEXE', quiz: 'VRAI OU FAUX ?', kit: 'KIT GRATUIT' }[P.type] || '';
const nb = s => s.replace(/« /g, '« ').replace(/ »/g, ' »').replace(/ ([:;?!])/g, ' $1');
const html = `<!doctype html><html><head><meta charset="utf-8">${FF}<style>
*{box-sizing:border-box;margin:0}body{width:1080px;height:1350px;font-family:Figtree,sans-serif;background:radial-gradient(120% 80% at 85% 0%,#123546,#0A2533 62%);color:#EAF3F7;overflow:hidden;position:relative}
.w{position:absolute;inset:0;padding:80px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center}
.brand{display:flex;align-items:center;gap:14px;font-family:Archivo;font-stretch:118%;font-weight:800;font-size:34px}.brand svg{width:56px;height:56px}.g{color:#F2B33D}
.tag{font-family:'JetBrains Mono';font-weight:700;font-size:22px;letter-spacing:.14em;padding:12px 18px;border-radius:10px;background:${accent};color:${P.type === 'alerte' || P.type === 'reflexe' ? '#fff' : '#2A1C00'}}
.k{font-family:'JetBrains Mono';font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:24px;color:#F2B33D;margin-top:90px}
.big{font-family:Archivo;font-stretch:125%;font-weight:900;font-size:190px;line-height:.9;color:${accent};margin-top:24px;letter-spacing:-.02em}
h1{font-family:Archivo;font-stretch:122%;font-weight:900;text-transform:uppercase;line-height:1;letter-spacing:-.01em;font-size:${P.big ? 56 : 76}px;margin-top:${P.big ? 30 : 26}px}
h1 em{font-style:normal;color:${accent}}
ul{list-style:none;margin-top:46px;display:grid;gap:22px}
li{font-size:34px;line-height:1.32;color:#D6E5EC;padding-left:52px;position:relative}
li:before{content:"";position:absolute;left:0;top:10px;width:30px;height:30px;border-radius:50%;background:${accent}}
li b{color:#fff}
.cta{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:20px;border-top:2px solid #24495B;padding-top:34px}
.cta span{font-size:30px;color:#CFE0E7;max-width:640px;line-height:1.3}
.cta b{font-family:Archivo;font-stretch:112%;font-weight:800;font-size:30px;color:#F2B33D;white-space:nowrap}
</style></head><body><div class="w">
<div class="top"><div class="brand">${mark}<span>Secure<span class="g">Guide</span></span></div>${label ? `<span class="tag">${label}</span>` : ''}</div>
${P.kicker ? `<div class="k">${nb(P.kicker)}</div>` : ''}
${P.big ? `<div class="big">${P.big}</div>` : ''}
<h1>${nb(P.title)}</h1>
${P.lines ? `<ul>${P.lines.map(l => `<li>${nb(l)}</li>`).join('')}</ul>` : ''}
<div class="cta"><span>${nb(P.cta || 'Les arnaques de la semaine, chaque dimanche')}</span><b>secureguide.fr</b></div>
</div></body></html>`;
(async () => {
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  const over = await p.evaluate(() => { const c = document.querySelector('.cta').getBoundingClientRect(); const u = document.querySelector('ul,h1').getBoundingClientRect(); return [...document.querySelectorAll('h1,ul,.big')].some(e => e.getBoundingClientRect().bottom > c.top - 10); });
  await p.screenshot({ path: out }); await b.close();
  console.log(out, over ? 'ATTENTION : le texte touche le bas, raccourcir' : 'ok');
})();
