// Génère un YouTube Short vertical (1080x1920, MP4) en texte animé à partir d'un JSON de scènes.
// Usage : node social/short.js social/shorts/AAAA-MM-JJ.json  -> MP4 à côté du JSON.
// JSON : { "label": "ALERTE ARNAQUE", "accent": "#D2453A", "scenes": [ { "k": "petit titre", "t": "Gros texte avec <em>jaune</em>", "s": "sous-texte", "d": 4.5 }, ... ] }
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const dir = __dirname;
const FF = fs.readFileSync(path.join(dir, 'fonts.html'), 'utf8');
const mark = fs.readFileSync(path.join(dir, '../src/brand/mark.svg'), 'utf8');
const file = process.argv[2]; const S = JSON.parse(fs.readFileSync(file, 'utf8'));
const out = file.replace(/\.json$/, '.mp4');
const A = S.accent || '#F2B33D';
const nb = s => (s || '').replace(/« /g, '« ').replace(/ »/g, ' »').replace(/ ([:;?!])/g, ' $1');
let t = S.lead ?? 0.4; const total = S.scenes.reduce((a, s) => a + (s.d || 4.5), t) + 0.3;
const scenes = S.scenes.map((s, i) => {
  const d = s.d || 4.5, st = t; t += d;
  return `<section style="animation:show ${d}s linear ${st}s both"><div class="in">
  ${s.k ? `<div class="k" style="animation-delay:${st + .05}s">${nb(s.k)}</div>` : ''}
  <h1 style="animation-delay:${st + .15}s">${nb(s.t)}</h1>
  ${s.s ? `<p style="animation-delay:${st + .7}s">${nb(s.s)}</p>` : ''}
  </div><div class="bar" style="animation:grow ${d}s linear ${st}s both"></div></section>`;
}).join('');
const html = `<!doctype html><html><head><meta charset="utf-8">${FF}<style>
*{box-sizing:border-box;margin:0}html,body{width:1080px;height:1920px;overflow:hidden}
body{font-family:Figtree,sans-serif;background:radial-gradient(120% 70% at 80% 0%,#15405A,#0A2533 60%);color:#EAF3F7;position:relative}
.top{position:absolute;left:80px;right:80px;top:150px;display:flex;justify-content:space-between;align-items:center;z-index:5}
.brand{display:flex;align-items:center;gap:16px;font-family:Archivo;font-stretch:118%;font-weight:800;font-size:44px}.brand svg{width:72px;height:72px}.g{color:#F2B33D}
.tag{font-family:'JetBrains Mono';font-weight:700;font-size:28px;letter-spacing:.14em;padding:14px 20px;border-radius:12px;background:${A};color:#fff;animation:pulse 1.6s ease-in-out infinite}
section{position:absolute;inset:0;display:flex;align-items:center;padding:0 80px;opacity:0}
.in{width:100%}
.k{font-family:'JetBrains Mono';font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:34px;color:#F2B33D;margin-bottom:34px;animation:up .5s cubic-bezier(.2,.8,.2,1) both}
h1{font-family:Archivo;font-stretch:122%;font-weight:900;text-transform:uppercase;font-size:98px;line-height:1;letter-spacing:-.01em;animation:pop .55s cubic-bezier(.2,1.4,.3,1) both}
h1 em{font-style:normal;color:${A === '#D2453A' ? '#F2B33D' : A}}
p{font-size:48px;line-height:1.3;color:#CFE0E7;margin-top:46px;animation:up .5s cubic-bezier(.2,.8,.2,1) both}
p b{color:#fff}
.bar{position:absolute;left:80px;bottom:300px;height:10px;border-radius:6px;background:#F2B33D;transform-origin:left;width:920px}
.foot{position:absolute;left:80px;right:80px;bottom:190px;font-family:Archivo;font-stretch:112%;font-weight:800;font-size:40px;color:#9FBAC6;display:flex;justify-content:space-between}
.foot b{color:#F2B33D}
@keyframes show{0%{opacity:0}4%{opacity:1}94%{opacity:1}100%{opacity:0}}
@keyframes pop{from{opacity:0;transform:scale(.86) translateY(30px)}to{opacity:1;transform:none}}
@keyframes up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes pulse{50%{transform:scale(1.06)}}
</style></head><body>
<div class="top"><div class="brand">${mark}<span>Secure<span class="g">Guide</span></span></div><span class="tag">${S.label || 'ALERTE ARNAQUE'}</span></div>
${scenes}
<div class="foot"><span>Radar des arnaques</span><b>secureguide.fr</b></div>
</body></html>`;
(async () => {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'short-'));
  const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const b = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, recordVideo: { dir: tmp, size: { width: 1080, height: 1920 } } });
  const p = await ctx.newPage();
  const t0 = Date.now();
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  const lead = (Date.now() - t0) / 1000;
  await p.waitForTimeout(total * 1000 + 300);
  await ctx.close(); await b.close();
  const webm = fs.readdirSync(tmp).find(f => f.endsWith('.webm'));
  // On coupe le temps de chargement, on ajoute une piste audio silencieuse (YouTube l'exige pour certaines options) et on encode en H.264.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.max(0, lead)), '-i', path.join(tmp, webm),
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-t', String(total), '-r', '30',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-shortest', out]);
  // Vignette : capture au milieu de la 1re scène
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '2', '-i', out, '-frames:v', '1', out.replace(/\.mp4$/, '-cover.jpg')]);
  console.log(out, total.toFixed(1) + 's');
})();
