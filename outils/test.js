const { chromium } = require('playwright');
const B='http://localhost:8765', OUT=process.argv[2];
const exe='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const log=(...a)=>console.log(...a); let fails=0; const ok=(c,m)=>{ if(!c){fails++;log('  ✗',m)} else log('  ✓',m) };
async function quiz(p, answers){ // answers: index of option per question (0 Oui,1 Partie,2 Non,3 NA)
  await p.goto(B+'/test-protection/'); await p.click('#start');
  for (let k=0;k<answers.length;k++){ await p.click(`#opt-${k}-${answers[k]}`); }
  await p.waitForTimeout(1700);
  return p.evaluate(()=>({score:+document.getElementById('score').textContent, level:document.getElementById('level').textContent,
    h:document.getElementById('prioh').textContent, fixes:[...document.querySelectorAll('#fixes .fix strong')].map(x=>x.textContent),
    note:document.getElementById('prionote').hidden?'':document.getElementById('prionote').textContent,
    reco:document.querySelector('#reco .reco b')?.textContent||'', recoHref:document.querySelector('#reco .reco a')?.href||'', free:!!document.querySelector('#reco .free'),
    capVisible:!document.getElementById('capture').hidden, resVisible:!document.getElementById('result').hidden }));
}
(async()=>{
 const b=await chromium.launch({executablePath:exe});
 for (const [name,vp] of [['mobile',{width:390,height:844}],['desktop',{width:1366,height:860}]]){
  log(`\n=== ${name} ===`);
  const ctx=await b.newContext({viewport:vp, deviceScaleFactor: name==='mobile'?2:1, isMobile:name==='mobile', hasTouch:name==='mobile'}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  // Accueil
  await p.goto(B+'/'); await p.waitForTimeout(400);
  const cta=await p.$('.h-ctas .btn-y'); const bb=await cta.boundingBox();
  ok((await cta.textContent())==='Faire le test' && (await cta.getAttribute('href'))==='/test-protection/','CTA principal = Faire le test → /test-protection/');
  ok(bb.y+bb.height<=vp.height,`CTA principal visible sans défiler (bas à ${Math.round(bb.y+bb.height)}px / ${vp.height})`);
  ok((await p.textContent('.h-ctas .btn-l'))==='Voir le Radar','Action secondaire = Voir le Radar');
  ok(!(await p.$('.kit-bar')),'Pas de bandeau kit concurrent sur l\'accueil');
  const navs=await p.$$eval('.links a',as=>as.map(a=>a.textContent+'|'+a.getAttribute('href')));
  ok(navs.includes('E-books|/ebooks/') && navs.includes('Faire le test|/test-protection/') && !navs.some(n=>n.includes('Boutique')),'Navigation : '+navs.join(', '));
  const tt=await p.$eval('h1',h=>getComputedStyle(h).textTransform+' '+getComputedStyle(h).fontSize); ok(tt.startsWith('none'),'Titre accueil en casse naturelle ('+tt+')');
  await p.screenshot({path:`${OUT}/${name}-accueil.png`});
  await p.screenshot({path:`${OUT}/${name}-accueil-complet.png`,fullPage:true});
  // Débordement horizontal sur toutes les pages
  for (const u of ['/','/test-protection/','/ebooks/','/radar/','/guides/','/kit/','/guides/vpn-famille/']){ await p.goto(B+u); const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); ok(ov<=0,`Pas de défilement horizontal ${u}`); const up=await p.$$eval('h1,h2',hs=>hs.filter(h=>getComputedStyle(h).textTransform==='uppercase').length); ok(up===0,`Aucun titre en majuscules ${u}`); }
  // Quiz : intro
  await p.goto(B+'/test-protection/');
  const intro=await p.textContent('.specs'); ok(/5 questions/.test(intro.replace(/\s+/g,' ')) && /1 min/.test(intro),'Intro : '+intro.replace(/\s+/g,' '));
  await p.screenshot({path:`${OUT}/${name}-test-intro.png`});
  await p.click('#start'); ok((await p.textContent('#qnum')).startsWith('01')&&(await p.textContent('#qnum')).includes('/05'),'Compteur 01/05');
  ok((await p.$$('#segs i')).length===5,'5 segments de progression');
  await p.click('#opt-0-2'); await p.click('#opt-1-1');
  ok((await p.textContent('#qnum')).startsWith('03'),'Avance à la question 3');
  ok(await p.$eval('#segs',s=>s.querySelectorAll('i.on').length)===2,'Progression 2/5');
  await p.click('#back'); ok((await p.textContent('#qnum')).startsWith('02'),'Retour arrière vers la question 2');
  ok(await p.$eval('#opt-1-1',b=>b.classList.contains('sel')&&b.getAttribute('aria-pressed')==='true'),'La réponse précédente est mise en évidence');
  await p.screenshot({path:`${OUT}/${name}-test-question.png`});
  await p.click('#back'); ok(await p.$eval('#back',b=>b.hidden),'Pas de bouton retour sur la question 1');
  const nq=await p.$$eval('#opt-4-0',x=>x.length); 
  // Scénarios
  const S=[
   ['Tout Oui',[0,0,0,0,0],{score:100,n:0,reco:'',free:true}],
   ['Tout Non',[2,2,2,2,2],{score:0,n:3,reco:'Guide cybersécurité en famille',note:true}],
   ['Seul « messages suspects » = Non',[0,0,2,0,0],{score:75,n:1,reco:'Guide anti-arnaques pour les seniors'}],
   ['Seul « enfants » = Non',[0,0,0,0,2],{score:85,n:1,reco:'Parents, enfants et écrans'}],
   ['Pas d\'enfants + mots de passe Non',[2,0,0,0,3],{score:76,n:1,reco:'Guide cybersécurité en famille'}],
   ['Pas d\'enfants + tout Oui',[0,0,0,0,3],{score:100,n:0,reco:'',free:true}],
   ['Réponses partielles',[1,1,0,1,3],{score:65,n:3,reco:'Guide cybersécurité en famille'}],
   ['Messages Non + 2FA en partie',[0,1,2,0,0],{score:63,n:2,reco:'Guide anti-arnaques pour les seniors'}],
  ];
  for (const [lab,a,e] of S){ const r=await quiz(p,a);
    ok(r.resVisible && r.score===e.score && r.fixes.length===e.n && r.reco===e.reco && (!e.free||r.free) && (!!r.note===!!e.note),
      `${lab} → ${r.score}/100 « ${r.level} », ${r.h} [${r.fixes.join(' ; ')}] ${r.reco?'→ '+r.reco:'→ Radar gratuit'}${r.note?' ('+r.note+')':''}`);
    if(r.recoHref) ok(r.recoHref.includes('etsy.com'),'  lien Etsy du guide conseillé');
    if(lab==='Tout Non'||lab==='Seul « messages suspects » = Non'){ await p.screenshot({path:`${OUT}/${name}-resultat-${e.score}.png`,fullPage:true}); }
  }
  // Modifier mes réponses
  await quiz(p,[0,0,2,0,0]); await p.click('#edit'); ok((await p.textContent('#qnum')).startsWith('05')&&await p.$eval('#opt-4-0',b=>b.classList.contains('sel')),'« Modifier mes réponses » revient à la question 5 avec les réponses gardées');
  await p.click('#back'); await p.click('#back'); await p.click('#opt-2-0'); await p.click('#opt-3-0'); await p.click('#opt-4-0'); await p.waitForTimeout(1700);
  ok(+(await p.textContent('#score'))===100,'Après correction de la réponse 3 → 100/100');
  ok(await p.$eval('#capture form',f=>!!f) ,'Formulaire Radar facultatif présent après le résultat');
  // E-books
  await p.goto(B+'/ebooks/'); await p.screenshot({path:`${OUT}/${name}-ebooks.png`}); await p.screenshot({path:`${OUT}/${name}-ebooks-complet.png`,fullPage:true});
  const eb=await p.$$eval('.eb',es=>es.map(e=>({id:e.id,t:e.querySelector('h2').textContent,f:e.querySelector('.eb-for').textContent,n:e.querySelectorAll('.sh-in li').length,b:e.querySelector('.btn-y').textContent,h:e.querySelector('.btn-y').href})));
  ok(eb.length===4,'4 e-books : '+eb.map(e=>e.t).join(' | '));
  eb.forEach(e=>ok(e.f&&e.n>=3&&e.b==='Voir le guide et son prix sur Etsy'&&e.h.startsWith('https://www.etsy.com/'),`${e.t} : public « ${e.f} », ${e.n} sujets, bouton Etsy`));
  ok(!(await p.content()).match(/\d+[,.]?\d*\s?€/),'Aucun prix inventé');
  ok(await p.$eval('[aria-current="page"]',a=>a.textContent)==='E-books','Onglet E-books actif');
  ok(!!(await p.$('.eb-free')),'Bloc gratuit distinct des e-books payants');
  // Redirection
  await p.goto(B+'/boutique/#parents'); await p.waitForTimeout(600); ok(p.url().endsWith('/ebooks/#parents'),'/boutique/#parents → '+p.url().replace(B,''));
  // Liens accueil → e-books
  await p.goto(B+'/'); await p.click('a.g[href="/ebooks/#seniors"]'); ok(p.url().endsWith('/ebooks/#seniors'),'Accueil → /ebooks/#seniors');
  ok(errs.length===0,'Aucune erreur JavaScript '+errs.join(';'));
  await ctx.close();
 }
 await b.close(); log(`\n${fails?fails+' ÉCHEC(S)':'TOUS LES TESTS PASSENT'}`);
})();
