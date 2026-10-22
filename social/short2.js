// Short v2 : illustration IA en fond (zoom lent), sous-titres mot à mot synchronisés sur la voix, CTA final.
// Usage : node social/short2.js social/shorts/XXX.json
// JSON : { "label": "ALERTE ARNAQUE", "audio": "XXX-voix.mp3",
//   "images": [ { "src": "img1.jpg", "from": 0, "to": 9.5 }, ... ],
//   "phrases": [ { "from": 0.1, "to": 2.4, "text": "Si votre banque vous appelle,", "hi": ["banque"] }, ... ],
//   "stickers": [ { "from": 7, "to": 11, "text": "516 M€ volés en 2025", "sub": "Source : OSMP" } ],
//   "cta": { "from": 27.5, "title": "Kit gratuit", "url": "secureguide.fr/kit" } }
const fs = require('fs'); const path = require('path'); const os = require('os'); const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const dir = __dirname;
const FF = fs.readFileSync(path.join(dir, 'fonts.html'), 'utf8');
const mark = fs.readFileSync(path.join(dir, '../src/brand/mark.svg'), 'utf8');
const file = process.argv[2]; const base = path.dirname(file); const S = JSON.parse(fs.readFileSync(file, 'utf8'));
const out = file.replace(/\.json$/, '.mp4');
const audio = path.join(base, S.audio);
const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio]).toString()) + 0.6;
const img = f => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(base, f)).toString('base64');
// Mots : chaque phrase est découpée en mots, répartis sur sa durée au prorata du nombre de lettres.
const words = [];
S.phrases.forEach((p, pi) => {
  const ws = p.text.split(/\s+/).filter(Boolean); const tot = ws.reduce((a, w) => a + w.length + 1.5, 0);
  let t = p.from; ws.forEach(w => { const d = (p.to - p.from) * (w.length + 1.5) / tot; words.push({ w, from: t, to: t + d, p: pi, hi: (p.hi || []).some(h => w.toLowerCase().includes(h.toLowerCase())) }); t += d; });
});
const data = { images: S.images.map(i => ({ ...i, src: img(i.src) })), phrases: S.phrases, words, stickers: S.stickers || [], cta: S.cta, dur };
const html = `<!doctype html><html><head><meta charset="utf-8">${FF}<style>
*{box-sizing:border-box;margin:0}html,body{width:1080px;height:1920px;overflow:hidden;background:#0A2533}
body{font-family:Figtree,sans-serif;color:#fff;position:relative}
.bg{position:absolute;left:0;top:0;width:1080px;height:1920px;background-size:cover;background-position:center 30%;opacity:0;transition:opacity .35s}
.bg.on{opacity:1}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,37,51,.55) 0%,rgba(10,37,51,0) 18%,rgba(10,37,51,0) 42%,rgba(10,37,51,.88) 62%,#0A2533 78%)}
.top{position:absolute;left:70px;right:70px;top:130px;display:flex;justify-content:space-between;align-items:center;z-index:5}
.brand{display:flex;align-items:center;gap:16px;font-family:Archivo;font-stretch:118%;font-weight:800;font-size:44px;text-shadow:0 2px 12px rgba(0,0,0,.5)}.brand svg{width:72px;height:72px}.g{color:#F2B33D}
.tag{font-family:'JetBrains Mono';font-weight:700;font-size:28px;letter-spacing:.14em;padding:14px 20px;border-radius:12px;background:#D2453A;color:#fff}
#cap{position:absolute;left:70px;right:70px;top:1160px;font-family:Archivo;font-stretch:118%;font-weight:900;text-transform:uppercase;font-size:92px;line-height:1.06;letter-spacing:-.01em;text-align:center;z-index:6}
#cap span{display:inline-block;margin:0 .2em;color:rgba(255,255,255,.38);transition:color .08s,transform .12s}
#cap span.said{color:#fff}
#cap span.now{color:#fff;transform:scale(1.08)}
#cap span.hi.said,#cap span.hi.now{color:#F2B33D}
.stk{position:absolute;left:70px;top:430px;z-index:7;background:#F2B33D;color:#2A1C00;border-radius:18px;padding:22px 30px;transform:rotate(-3deg) scale(.6);opacity:0;transition:all .3s cubic-bezier(.2,1.4,.3,1);box-shadow:0 10px 0 #B07A12}
.stk.on{opacity:1;transform:rotate(-3deg) scale(1)}
.stk b{display:block;font-family:Archivo;font-stretch:120%;font-weight:900;font-size:64px;line-height:1}
.stk small{font-size:26px;font-weight:600}
.ctaw{position:absolute;inset:0;background:#0A2533;z-index:9;display:flex;flex-direction:column;justify-content:center;padding:0 80px;opacity:0;transition:opacity .4s}
.ctaw.on{opacity:1}
.ctaw .k{font-family:'JetBrains Mono';font-weight:700;letter-spacing:.12em;font-size:34px;color:#F2B33D}
.ctaw h1{font-family:Archivo;font-stretch:122%;font-weight:900;text-transform:uppercase;font-size:120px;line-height:.98;margin:24px 0 40px}
.ctaw h1 em{font-style:normal;color:#F2B33D}
.ctaw .u{display:inline-block;background:#F2B33D;color:#2A1C00;font-family:Archivo;font-stretch:112%;font-weight:800;font-size:60px;padding:26px 36px;border-radius:18px;box-shadow:0 10px 0 #B07A12;align-self:flex-start}
.ctaw p{font-size:40px;color:#CFE0E7;margin-top:46px}
.bar{position:absolute;left:0;bottom:0;height:12px;background:#F2B33D;width:0;z-index:10}
</style></head><body>
${data.images.map((im, i) => `<div class="bg" id="bg${i}" style="background-image:url(${im.src})"></div>`).join('')}
<div class="shade"></div>
<div class="top"><div class="brand">${mark}<span>Secure<span class="g">Guide</span></span></div><span class="tag">${S.label || 'ALERTE ARNAQUE'}</span></div>
<div id="cap"></div>
${data.stickers.map((s, i) => `<div class="stk" id="st${i}"><b>${s.text}</b>${s.sub ? `<small>${s.sub}</small>` : ''}</div>`).join('')}
<div class="ctaw" id="cta"><div class="k">${S.cta.kicker || 'GRATUIT · PDF · 6 PAGES'}</div><h1>${S.cta.title}</h1><span class="u">${S.cta.url}</span><p>${S.cta.sub || 'Lien dans la description'}</p></div>
<div class="bar" id="bar"></div>
<script>
const D=${JSON.stringify({ ...data, images: data.images.map(({ src, ...r }) => r) })};
const cap=document.getElementById('cap');let curP=-1;
function frame(t){
  const cl=x=>Math.max(0,Math.min(1,x));
  D.images.forEach((im,i)=>{const e=document.getElementById('bg'+i);e.style.opacity=(t>=im.from&&t<im.to+0.4)?cl((t-im.from)/0.35+(i===0?1:0)):0;
    const k=Math.min(1,Math.max(0,(t-im.from)/(im.to-im.from)));e.style.transform='scale('+(1.04+0.10*k)+') translateY('+(-20*k)+'px)';});
  let p=D.phrases.findIndex(p=>t>=p.from-0.05&&t<(p.to+0.35));
  if(p!==curP){curP=p;cap.innerHTML=p<0?'':D.words.map((w,i)=>w.p===p?'<span data-i="'+i+'" class="'+(w.hi?'hi':'')+'">'+w.w+'</span>':'').join('');}
  cap.querySelectorAll('span').forEach(s=>{const w=D.words[+s.dataset.i];s.classList.toggle('said',t>=w.to);s.classList.toggle('now',t>=w.from&&t<w.to);});
  D.stickers.forEach((s,i)=>{const e=document.getElementById('st'+i);const k=cl(Math.min((t-s.from)/0.22,(s.to-t)/0.18));
    const ov=k<1&&t-s.from<0.22?1+0.12*Math.sin(k*Math.PI):1;e.style.opacity=k;e.style.transform='rotate(-3deg) scale('+((0.6+0.4*k)*ov)+')';});
  document.getElementById('cta').style.opacity=cl((t-D.cta.from)/0.4);
  document.getElementById('bar').style.width=(100*t/D.dur)+'%';
}
window.go=()=>{const t0=performance.now();(function loop(){const t=(performance.now()-t0)/1000;frame(t);if(t<D.dur)requestAnimationFrame(loop)})();};
frame(0);
</script></body></html>`;
(async () => {
  // Rendu image par image (déterministe) : chaque frame est calculée à son temps exact, puis encodée avec la voix.
  const { spawn } = require('child_process');
  const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const b = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({ content: '*{transition:none!important}' });
  const fps = 30, n = Math.ceil(dur * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-i', audio,
    '-map', '0:v', '-map', '1:a', '-t', dur.toFixed(2), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '19',
    '-af', 'apad,loudnorm=I=-14:TP=-1.5', '-c:a', 'aac', '-b:a', '160k', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => frame(t), i / fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 88 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1.2', '-i', out, '-frames:v', '1', out.replace(/\.mp4$/, '-cover.jpg')]);
  console.log(out, dur.toFixed(1) + 's', n + ' frames');
})();
