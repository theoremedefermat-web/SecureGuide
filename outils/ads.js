const { chromium } = require('playwright');const fs=require('fs');
const FF=require('fs').readFileSync('fonts.html','utf8');
const mark=fs.readFileSync('/home/claude/secureguide/src/brand/mark.svg','utf8');
const css=FF+`
<style>*{box-sizing:border-box;margin:0}body{width:1080px;height:1080px;font-family:Figtree,sans-serif;background:radial-gradient(120% 90% at 85% 0%,#123546,#0A2533 60%);color:#EAF3F7;overflow:hidden;position:relative}
.w{position:absolute;inset:0;padding:80px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:14px;font-family:Archivo;font-stretch:118%;font-weight:800;font-size:34px}.brand svg{width:56px;height:56px}.g{color:#F2B33D}
h1{font-family:Archivo;font-stretch:125%;font-weight:900;text-transform:uppercase;line-height:.98;letter-spacing:-.01em}
em{font-style:normal;color:#F2B33D}.k{font-family:'JetBrains Mono';font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:24px;color:#F2B33D}
.cv{position:absolute;width:340px;aspect-ratio:3/4;border-radius:6px 16px 16px 6px;background:linear-gradient(160deg,#17445A,#0A2533 70%);box-shadow:0 40px 60px -20px rgba(0,0,0,.6);padding:40px 34px 34px 52px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;border:1px solid #2C5468}
.cv:before{content:"";position:absolute;left:0;top:0;bottom:0;width:22px;background:var(--ac)}
.cv .t{font-family:Archivo;font-stretch:118%;font-weight:900;text-transform:uppercase;font-size:34px;line-height:1.02}.cv .t em{color:var(--ac)}
.cv .s{font-family:'JetBrains Mono';font-size:15px;color:#9FBAC6;letter-spacing:.1em}
.btn{display:inline-block;background:#F2B33D;color:#2A1C00;font-family:Archivo;font-stretch:112%;font-weight:800;text-transform:uppercase;font-size:34px;padding:24px 34px;border-radius:14px;box-shadow:0 8px 0 #B07A12}
</style>`;
const pages={
'pub-1-seniors-appel':`${css}<div class="w"><div class="brand">${mark}<span>Secure<span class="g">Guide</span></span></div>
<div style="margin-top:70px" class="k">Faux conseiller bancaire</div>
<h1 style="font-size:74px;margin-top:22px;max-width:580px">«&nbsp;Madame, votre compte est <em>piraté</em>&nbsp;»</h1>
<p style="font-size:34px;margin-top:34px;max-width:520px;color:#CFE0E7;line-height:1.3">Vos parents sauraient-ils raccrocher ?</p>
<div style="margin-top:auto"><span class="btn">Le guide à leur offrir</span></div></div>
<div class="cv" style="--ac:#D2453A;right:70px;top:300px;transform:rotate(4deg)"><span class="s">SECUREGUIDE.FR</span><span class="t">Guide<br>anti-<br>arnaques<br><em>seniors</em></span><span class="s">16 FICHES · PDF</span></div>`,
'pub-2-seniors-fiches':`${css}<div class="w"><div class="brand">${mark}<span>Secure<span class="g">Guide</span></span></div>
<h1 style="font-size:56px;margin-top:64px;max-width:540px">16 arnaques que vos parents doivent <em>reconnaître</em></h1>
<ul style="list-style:none;margin-top:34px;font-size:30px;line-height:1.7;color:#CFE0E7">
<li>✓ Faux conseiller bancaire</li><li>✓ Faux petit-enfant en détresse</li><li>✓ Faux SMS et emails piégés</li><li>✓ Faux support technique</li></ul>
<div style="margin-top:auto;display:flex;align-items:center;gap:26px"><span class="btn">Guide PDF à offrir</span><span style="font-size:28px;color:#9FBAC6">Téléchargement immédiat</span></div></div>
<div class="cv" style="--ac:#D2453A;right:60px;top:270px;transform:rotate(-3deg);width:320px"><span class="s">SECUREGUIDE.FR</span><span class="t">Guide<br>anti-<br>arnaques<br><em>seniors</em></span><span class="s">PDF · FRANÇAIS</span></div>`,
'pub-3-test':`${css}<div class="w" style="align-items:flex-start"><div class="brand">${mark}<span>Secure<span class="g">Guide</span></span></div>
<div style="margin-top:90px" class="k">Test gratuit · 2 minutes</div>
<h1 style="font-size:96px;margin-top:24px;max-width:860px;position:relative">Votre famille est-elle <em>vraiment</em> protégée ?</h1>
<p style="font-size:36px;margin-top:36px;color:#CFE0E7;line-height:1.3;max-width:820px">10 questions, un score sur 100 et les 3 failles à fermer en priorité.</p>
<div style="margin-top:auto"><span class="btn">Faire le test</span></div></div>
<svg style="position:absolute;right:-90px;top:120px;width:460px;opacity:.55" viewBox="0 0 240 240"><circle cx="120" cy="120" r="110" fill="none" stroke="#2C5468" stroke-width="2"/><circle cx="120" cy="120" r="74" fill="none" stroke="#2C5468" stroke-width="2"/><circle cx="120" cy="120" r="38" fill="none" stroke="#2C5468" stroke-width="2"/><path d="M120 120 L120 10 A110 110 0 0 1 215 65 Z" fill="#F2B33D" opacity=".25"/><line x1="120" y1="120" x2="215" y2="65" stroke="#F2B33D" stroke-width="3"/><circle cx="178" cy="70" r="7" fill="#D2453A"/></svg>`
};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [n,h] of Object.entries(pages)){const p=await b.newPage({viewport:{width:1080,height:1080}});await p.setContent(h,{waitUntil:'networkidle'}).catch(()=>{});await p.waitForTimeout(800);await p.screenshot({path:`/home/claude/kit-pub/${n}.png`});await p.close();}
await b.close();console.log('ok');})();
