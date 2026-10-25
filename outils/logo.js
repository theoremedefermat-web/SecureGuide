const { chromium } = require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const svg=fs.readFileSync('/home/claude/secureguide/src/brand/mark.svg','utf8');
const p=await b.newPage({viewport:{width:520,height:300}});
await p.setContent(`<body style="margin:0;background:#0A2533;display:flex;gap:30px;align-items:center;padding:20px">
<div style="width:220px">${svg}</div><div style="width:34px">${svg.replace(/sg-/g,'b-')}</div><div style="width:16px">${svg.replace(/sg-/g,'c-')}</div>
<div style="background:#fff;padding:10px;width:34px">${svg.replace(/sg-/g,'d-')}</div></body>`);
await p.screenshot({path:'logo.png'});await b.close();})();
