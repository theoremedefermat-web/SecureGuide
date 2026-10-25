// Génère le kit gratuit « Kit anti-arnaques 2026 » en PDF A4.
const { chromium } = require('playwright'); const fs = require('fs');
const FF = fs.readFileSync(__dirname + '/fonts.html', 'utf8');
const mark = fs.readFileSync('/home/claude/secureguide/src/brand/mark.svg', 'utf8');
const SENIORS = 'https://www.etsy.com/fr/listing/4542889118/guide-anti-arnaques-seniors-o-proteger';
const U = s => s + (s.includes('?') ? '&' : '?') + 'utm_source=kit&utm_medium=pdf&utm_campaign=kit2026';

const scams = [
  ['LU', 'Faux passage à Wero, puis faux appel de la banque',
   'Un email au nom de Payconiq ou Wero vous invite à « passer à Wero » via un lien ou un QR code. Ensuite, un faux employé de banque appelle et propose même d\'envoyer quelqu\'un chercher votre carte.',
   'Ne cliquez pas. Personne ne vient jamais chercher une carte à domicile.'],
  ['FR', 'Faux conseiller bancaire',
   'Le vrai numéro de votre banque s\'affiche (il est falsifié). On vous annonce une opération suspecte et on vous fait valider quelque chose dans votre appli pour « l\'annuler ».',
   'Une banque ne demande jamais de valider une opération pour en annuler une autre. Raccrochez, rappelez-la vous-même.'],
  ['BE', 'Validation itsme exigée au téléphone',
   'Un faux policier, banquier ou agent Proximus signale une connexion suspecte et vous pousse à confirmer une action dans itsme.',
   'Une validation itsme, c\'est vous qui la lancez. Jamais quelqu\'un d\'autre.'],
  ['BE · FR · LU', 'Faux remboursement ou fausse amende',
   'SMS ou email au nom des impôts, de votre caisse de pension ou de votre fournisseur d\'énergie. Écrits par IA, ils n\'ont plus de fautes.',
   'Tapez vous-même l\'adresse du site officiel. Ne passez jamais par le lien reçu.'],
  ['BE · FR · LU', 'WhatsApp « confirmez votre réservation »',
   'Le message cite votre vraie réservation d\'hôtel (données volées) et réclame un paiement urgent.',
   'Ne payez jamais via un lien reçu par message. Vérifiez dans l\'appli de réservation.'],
  ['BE · FR · LU', 'Le faux proche en détresse',
   '« Maman, j\'ai changé de numéro, j\'ai un souci, peux-tu payer cette facture ? » Un message d\'un numéro inconnu qui joue sur l\'émotion.',
   'Appelez votre proche sur son numéro habituel avant tout paiement. Convenez d\'un mot code familial.'],
];

const css = FF + `<style>
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Figtree,sans-serif;color:#0E1C24;font-size:11.5pt;line-height:1.5}
.pg{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;padding:20mm 18mm 18mm}
.pg:last-child{page-break-after:auto}
h1,h2,h3{font-family:Archivo;font-stretch:118%;font-weight:900;line-height:1.05;letter-spacing:-.01em}
h2{font-size:24pt;text-transform:uppercase;margin-bottom:6mm}
h2 em,h1 em{font-style:normal;color:#F2B33D}
.k{font-family:'JetBrains Mono';font-weight:700;font-size:8.5pt;letter-spacing:.14em;text-transform:uppercase;color:#8A6410}
.foot{position:absolute;left:18mm;right:18mm;bottom:9mm;display:flex;justify-content:space-between;font-family:'JetBrains Mono';font-size:7.5pt;color:#7A8B95;letter-spacing:.06em}
.dark{background:radial-gradient(120% 80% at 90% 0%,#123546,#0A2533 60%);color:#EAF3F7}
.dark .foot{color:#7FA0AF}
.brand{display:flex;align-items:center;gap:3mm;font-family:Archivo;font-stretch:118%;font-weight:800;font-size:15pt}
.brand svg{width:11mm;height:11mm}.g{color:#F2B33D}
.cover h1{font-size:50pt;text-transform:uppercase;margin-top:38mm}
.cover .sub{font-size:15pt;color:#CFE0E7;margin-top:8mm;max-width:140mm;line-height:1.35}
.tags{display:flex;gap:2.5mm;margin-top:12mm}
.tags span{border:1.2pt solid #F2B33D;color:#F2B33D;border-radius:20mm;padding:1.6mm 4mm;font-family:'JetBrains Mono';font-weight:700;font-size:9pt;letter-spacing:.1em}
.inside{position:absolute;left:18mm;right:18mm;bottom:26mm;display:grid;grid-template-columns:repeat(4,1fr);gap:4mm}
.inside div{border-top:2pt solid #F2B33D;padding-top:3mm;font-size:10pt;color:#CFE0E7}
.inside b{display:block;font-family:Archivo;font-stretch:112%;font-size:19pt;color:#fff}
.rule{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5mm;margin:6mm 0 9mm}
.rule div{background:#EEF2F4;border-radius:4mm;padding:5mm}
.rule b{display:block;font-family:Archivo;font-stretch:112%;font-weight:800;font-size:13pt;margin-bottom:2mm}
.big{background:#0A2533;color:#fff;border-radius:5mm;padding:8mm;margin-top:6mm}
.big p:first-child{font-family:Archivo;font-stretch:118%;font-weight:900;font-size:21pt;text-transform:uppercase;line-height:1.1}
.big p:first-child em{color:#F2B33D;font-style:normal}
.big p+p{margin-top:3mm;color:#CFE0E7}
ul.j{list-style:none;margin-top:4mm}
ul.j li{padding:2.6mm 0 2.6mm 9mm;border-bottom:.6pt solid #D5DEE3;position:relative}
ul.j li:before{content:"✕";position:absolute;left:0;top:2.3mm;color:#D2453A;font-weight:900}
.sc{border:1pt solid #D5DEE3;border-left:4pt solid #D2453A;border-radius:3mm;padding:4.2mm 5mm;margin-bottom:4.5mm;break-inside:avoid}
.sc h3{font-size:13.5pt;margin:1mm 0 2mm}
.sc p{font-size:10.5pt;color:#33444E}
.sc .do{margin-top:2.5mm;background:#FFF6E3;border-radius:2mm;padding:2.2mm 3mm;color:#2A1C00;font-weight:600}
.sc .do:before{content:"LE RÉFLEXE  ";font-family:'JetBrains Mono';font-size:8pt;font-weight:700;letter-spacing:.1em;color:#8A6410}
.card{border:1.4pt dashed #7A8B95;border-radius:4mm;padding:7mm;margin-top:4mm}
.card .h{display:flex;justify-content:space-between;align-items:center;margin-bottom:4mm}
.card .h b{font-family:Archivo;font-stretch:118%;font-weight:900;font-size:16pt;text-transform:uppercase}
.cols{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.cols h4{font-family:'JetBrains Mono';font-size:9pt;letter-spacing:.12em;background:#0A2533;color:#F2B33D;padding:1.6mm 3mm;border-radius:1.5mm;margin-bottom:2.5mm}
.cols p{font-size:9.6pt;margin-bottom:2.2mm;line-height:1.35}
.cols p b{display:block;font-size:11.5pt}
.motto{margin-top:5mm;text-align:center;background:#F2B33D;color:#2A1C00;border-radius:3mm;padding:4mm;font-family:Archivo;font-stretch:118%;font-weight:900;font-size:15pt;text-transform:uppercase}
.cut{font-family:'JetBrains Mono';font-size:8pt;color:#7A8B95;margin-top:2mm}
ol.chk{list-style:none;counter-reset:c;margin-top:2mm}
ol.chk li{counter-increment:c;display:grid;grid-template-columns:8mm 1fr;gap:3mm;padding:2.6mm 0;border-bottom:.6pt solid #D5DEE3;font-size:10.8pt}
ol.chk li:before{content:"";width:5.5mm;height:5.5mm;border:1.4pt solid #0A2533;border-radius:1.2mm;margin-top:.6mm}
ol.chk b{font-weight:700}
.offer{display:grid;grid-template-columns:44mm 1fr;gap:7mm;align-items:center;margin-top:8mm;background:#0A2533;color:#EAF3F7;border-radius:5mm;padding:7mm}
.cv{aspect-ratio:3/4;border-radius:1.5mm 4mm 4mm 1.5mm;background:linear-gradient(160deg,#17445A,#0A2533 70%);border:.8pt solid #2C5468;padding:5mm 4mm 4mm 7mm;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;transform:rotate(-3deg);box-shadow:0 4mm 6mm rgba(0,0,0,.4)}
.cv:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3mm;background:#D2453A}
.cv span{font-family:'JetBrains Mono';font-size:5.5pt;color:#9FBAC6;letter-spacing:.1em}
.cv b{font-family:Archivo;font-stretch:118%;font-weight:900;text-transform:uppercase;font-size:12pt;line-height:1.02;color:#fff}.cv b em{color:#F2B33D;font-style:normal}
.offer h3{font-size:16pt;text-transform:uppercase}
.offer p{font-size:10.3pt;color:#CFE0E7;margin-top:2mm}
.btn{display:inline-block;margin-top:4mm;background:#F2B33D;color:#2A1C00;font-family:Archivo;font-stretch:112%;font-weight:800;text-transform:uppercase;font-size:11pt;padding:3mm 5mm;border-radius:2.5mm;text-decoration:none}
a{color:inherit}
</style>`;

const foot = n => `<div class="foot"><span>SECUREGUIDE.FR · KIT ANTI-ARNAQUES · ÉDITION OCTOBRE 2026</span><span>${n} / 6</span></div>`;
const html0 = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Kit anti-arnaques 2026 · SecureGuide.fr</title>${css}</head><body>

<section class="pg dark cover">
<div class="brand">${mark}<span>Secure<span class="g">Guide</span>.fr</span></div>
<div class="k" style="color:#F2B33D;margin-top:30mm">Kit gratuit · édition octobre 2026</div>
<h1 style="margin-top:6mm">Kit<br>anti-<br><em>arnaques</em><br>2026</h1>
<p class="sub">Les arnaques qui circulent en ce moment, le piège de chacune, et les réflexes qui protègent toute la famille.</p>
<div class="tags"><span>FRANCE</span><span>BELGIQUE</span><span>LUXEMBOURG</span></div>
<div class="inside"><div><b>3</b>règles qui évitent presque tout</div><div><b>6</b>arnaques du moment décryptées</div><div><b>1</b>carte des numéros utiles à afficher</div><div><b>10</b>points pour sécuriser la famille</div></div>
${foot(1)}</section>

<section class="pg">
<div class="k">Avant tout</div>
<h2>Toutes les arnaques suivent <em style="color:#C88A14">le même scénario</em></h2>
<p>Peu importe le canal (appel, SMS, email, WhatsApp), l'escroc utilise toujours trois leviers. Les repérer, c'est déjà se protéger.</p>
<div class="rule">
<div><b>1. L'urgence</b>« Votre compte est piraté », « dernier rappel », « vite, avant ce soir ». La précipitation empêche de réfléchir.</div>
<div><b>2. L'autorité</b>Il se présente comme votre banque, la police, les impôts, un opérateur. Le numéro affiché peut être falsifié.</div>
<div><b>3. Le secret</b>« Ne raccrochez pas », « n'en parlez à personne ». Il veut vous isoler de ceux qui pourraient vous alerter.</div>
</div>
<div class="k">Les 5 « jamais »</div>
<p style="margin-top:2mm">Aucune banque, aucun service public, aucun policier ne vous demandera jamais :</p>
<ul class="j">
<li>de <b>valider une opération</b> dans votre application pour en « annuler » une autre ;</li>
<li>de <b>donner un code</b> reçu par SMS, votre mot de passe ou le code de votre carte ;</li>
<li>de <b>virer votre argent vers un « compte sécurisé »</b> ;</li>
<li>de <b>remettre votre carte</b> à un coursier ou un agent qui passe chez vous ;</li>
<li>de <b>payer via un lien</b> reçu par SMS, email ou WhatsApp.</li>
</ul>
<div class="big"><p>Le réflexe qui protège de presque tout : <em>raccrocher et rappeler</em>.</p>
<p>Raccrochez, attendez quelques minutes (ou prenez un autre téléphone), puis rappelez vous-même le numéro inscrit au dos de votre carte ou dans l'application officielle.</p></div>
${foot(2)}</section>

<section class="pg">
<div class="k">Radar des arnaques · octobre 2026</div>
<h2>Les arnaques du moment</h2>
${scams.slice(0, 3).map(([c, t, p, d]) => `<div class="sc"><span class="k">${c}</span><h3>${t}</h3><p>${p}</p><p class="do">${d}</p></div>`).join('')}
<p style="font-size:9.5pt;color:#5A6B75;margin-top:3mm">Sources : Police grand-ducale, Observatoire de la sécurité des moyens de paiement, Safeonweb, Cybermalveillance.gouv.fr.</p>
${foot(3)}</section>

<section class="pg">
<div class="k">Radar des arnaques · octobre 2026</div>
<h2>Les arnaques du moment <span style="color:#7A8B95">(suite)</span></h2>
${scams.slice(3).map(([c, t, p, d]) => `<div class="sc"><span class="k">${c}</span><h3>${t}</h3><p>${p}</p><p class="do">${d}</p></div>`).join('')}
<div class="big" style="margin-top:5mm"><p>De nouvelles arnaques <em>chaque semaine</em></p><p>Le Radar des arnaques est mis à jour tous les dimanches sur secureguide.fr/radar. Vous le recevez aussi par email, puisque vous êtes inscrit.</p></div>
${foot(4)}</section>

<section class="pg">
<div class="k">À imprimer et à poser près du téléphone</div>
<h2>Les bons numéros</h2>
<p>Découpez cette carte et collez-la près du téléphone fixe, ou offrez-la à vos parents. En cas de doute, c'est elle qu'on regarde.</p>
<div class="card">
<div class="h"><b>En cas d'arnaque</b><div class="brand" style="font-size:11pt">${mark.replace('<svg', '<svg style="width:8mm;height:8mm"')}<span>Secure<span style="color:#C88A14">Guide</span></span></div></div>
<div class="cols">
<div><h4>FRANCE</h4>
<p><b>Ma banque</b>Numéro au dos de la carte</p>
<p><b>17cyber.gouv.fr</b>Aide aux victimes en ligne</p>
<p><b>33700</b>Transférer un SMS suspect (gratuit)</p>
<p><b>17</b>Police secours</p></div>
<div><h4>BELGIQUE</h4>
<p><b>Card Stop · 078 170 170</b>Bloquer une carte</p>
<p><b>suspicious@safeonweb.be</b>Transférer un message suspect</p>
<p><b>Police locale</b>Porter plainte</p>
<p><b>101</b>Police secours</p></div>
<div><h4>LUXEMBOURG</h4>
<p><b>Ma banque</b>Numéro au dos de la carte</p>
<p><b>BEE SECURE · 8002 1234</b>Helpline gratuite</p>
<p><b>113</b>Police grand-ducale</p>
<p><b>112</b>Urgences</p></div>
</div>
<div class="motto">Je raccroche. Je rappelle moi-même.</div>
<p style="margin-top:4mm;font-size:10pt"><b>Notre mot code familial :</b> ______________________ <span style="color:#5A6B75">(à demander si un « proche » appelle d'un numéro inconnu)</span></p>
</div>
<p class="cut">✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</p>
<div class="k" style="margin-top:9mm">Déjà cliqué, payé ou donné un code ?</div>
<h3 style="font-size:17pt;text-transform:uppercase;margin:2mm 0 3mm">Les 4 gestes dans l'heure</h3>
<ol class="chk" style="counter-reset:n">
<li><span><b>Appelez votre banque immédiatement</b> pour bloquer carte et accès. Chaque minute compte pour récupérer l'argent.</span></li>
<li><span><b>Changez vos mots de passe</b> de banque en ligne et d'email, depuis un autre appareil si possible.</span></li>
<li><span><b>Gardez les preuves</b> : heure de l'appel, numéro affiché, captures des messages, opérations concernées.</span></li>
<li><span><b>Portez plainte</b> et prévenez vos proches : les escrocs recontactent souvent leurs victimes.</span></li>
</ol>
${foot(5)}</section>

<section class="pg">
<div class="k">En 30 minutes, ce week-end</div>
<h2>10 points pour sécuriser la famille</h2>
<ol class="chk">
<li><span><b>Activez les notifications</b> de votre application bancaire : vous voyez chaque opération en direct.</span></li>
<li><span><b>Activez la double authentification</b> sur votre email principal : c'est la clé de tous vos comptes.</span></li>
<li><span><b>Utilisez un mot de passe différent</b> pour chaque site important, rangé dans un gestionnaire de mots de passe.</span></li>
<li><span><b>Faites les mises à jour</b> du téléphone et de l'ordinateur dès qu'elles sont proposées.</span></li>
<li><span><b>Choisissez un mot code familial</b> pour vérifier qu'un appel « urgent » vient bien d'un proche.</span></li>
<li><span><b>Mettez le compte WhatsApp en sécurité</b> : Réglages › Compte › Validation en deux étapes.</span></li>
<li><span><b>Ne scannez pas un QR code reçu</b> par email ou collé sur un parcmètre pour payer.</span></li>
<li><span><b>Vérifiez si vos données ont fuité</b> sur haveibeenpwned.com et changez les mots de passe concernés.</span></li>
<li><span><b>Imprimez la carte des numéros</b> (page 5) et posez-la près du téléphone de vos parents.</span></li>
<li><span><b>Parlez-en</b> à vos parents, vos enfants et vos collègues : une arnaque connue est une arnaque évitée.</span></li>
</ol>
<div class="offer">
<div class="cv"><span>SECUREGUIDE.FR</span><b>Guide<br>anti-<br>arnaques<br><em>seniors</em></b><span>PDF · FRANÇAIS</span></div>
<div><span class="k" style="color:#F2B33D">Pour protéger vos parents</span>
<h3 style="margin-top:2mm">Le guide anti-arnaques seniors</h3>
<p>Faux conseiller bancaire, SMS et emails piégés, bons réflexes en cas de doute : un guide simple, pensé pour être offert à ceux qui ne lisent pas les alertes en ligne.</p>
<a class="btn" href="${U(SENIORS)}">Voir le guide · 5,99 €</a></div>
</div>
${foot(6)}</section>
</body></html>`;

const html = html0.replace(/« /g,'«\u00a0').replace(/ »/g,'\u00a0»').replace(/ ([:;?!])/g,'\u00a0$1');
(async () => {
  fs.writeFileSync(__dirname + '/kit.html', html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.setContent(html, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const out = process.argv[2];
  await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  // aperçus PNG pour contrôle
  await p.setViewportSize({ width: 794, height: 1123 });
  const n = await p.$$eval('.pg', e => e.length);
  for (let i = 0; i < n; i++) { const el = (await p.$$('.pg'))[i]; await el.screenshot({ path: `${__dirname}/kit-p${i + 1}.png` }); }
  await b.close(); console.log('ok', n);
})();
