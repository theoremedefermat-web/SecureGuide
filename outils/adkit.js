const { chromium } = require('playwright');const fs=require('fs');
const FF=fs.readFileSync('fonts.html','utf8');
const mark=fs.readFileSync('/home/claude/secureguide/src/brand/mark.svg','utf8');
const p1='data:image/jpeg;base64,'+fs.readFileSync('/home/claude/secureguide/src/kit/kit-p1.jpg').toString('base64');
const p5='data:image/jpeg;base64,'+fs.readFileSync('/home/claude/secureguide/src/kit/kit-p5.jpg').toString('base64');
const css=FF+`<style>*{box-sizing:border-box;margin:0}body{width:1080px;height:1080px;font-family:Figtree,sans-serif;background:radial-gradient(120% 90% at 85% 0%,#123546,#0A2533 60%);color:#EAF3F7;overflow:hidden;position:relative}
.w{position:absolute;inset:0;padding:76px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:14px;font-family:Archivo;font-stretch:118%;font-weight:800;font-size:34px}.brand svg{width:56px;height:56px}.g{color:#F2B33D}
h1{font-family:Archivo;font-stretch:125%;font-weight:900;text-transform:uppercase;line-height:.98;letter-spacing:-.01em}
em{font-style:normal;color:#F2B33D}.k{font-family:'JetBrains Mono';font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:24px;color:#F2B33D}
.btn{display:inline-block;background:#F2B33D;color:#2A1C00;font-family:Archivo;font-stretch:112%;font-weight:800;text-transform:uppercase;font-size:34px;padding:24px 34px;border-radius:14px;box-shadow:0 8px 0 #B07A12}
img{position:absolute;border-radius:6px 14px 14px 6px;box-shadow:0 40px 60px -20px rgba(0,0,0,.7)}
.badge{position:absolute;background:#F2B33D;color:#2A1C00;font-family:Archivo;font-stretch:118%;font-weight:900;font-size:40px;text-transform:uppercase;padding:14px 22px;border-radius:14px;transform:rotate(-6deg);box-shadow:0 6px 0 #B07A12}
</style>`;
const html=`${css}<div class="w"><div class="brand">${mark}<span>Secure<span class="g">Guide</span></span></div>
<div style="margin-top:64px" class="k">Kit PDF · FR · BE · LU</div>
<h1 style="font-size:66px;margin-top:20px;max-width:480px">Les arnaques du moment en <em>6 pages</em></h1>
<p style="font-size:30px;margin-top:28px;max-width:440px;color:#CFE0E7;line-height:1.3">+ la carte des bons numéros à poser près du téléphone de vos parents</p>
<div style="margin-top:auto"><span class="btn">Recevoir le kit</span></div></div>
<img src="${p5}" style="width:290px;right:36px;top:330px;transform:rotate(7deg)">
<img src="${p1}" style="width:320px;right:130px;top:290px;transform:rotate(-5deg)">
<span class="badge" style="right:90px;top:760px">Gratuit</span>`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1080,height:1080}});
await p.setContent(html);await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:'/home/claude/secureguide/src/ads/pub-4-kit.png'});await b.close();})();
