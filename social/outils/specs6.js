// Specs (short3.js) des Shorts 018 à 022 (Radar n°5), version gratuite : voix Hortense, images reprises des Shorts précédents.
// Intro en phrase 1, réflexe en phrase 6, outro en phrase 7 (différente à chaque Short).
// Usage : node social/outils/specs6.js social/shorts
const fs = require('fs'); const path = require('path');
const dir = process.argv[2];
const subsOf = n => JSON.parse(fs.readFileSync(path.join(dir, n, 'subs.json'), 'utf8'));
const KIT = { kicker: 'GUIDE ANTI-ARNAQUE · GRATUIT', title: 'Le kit <em>anti-arnaques</em> 2026', url: 'www.secureguide.fr/kit' };
const bare = w => w.toLowerCase().replace(/[.,;:?!«»"]/g, '');

function build(o) {
  const subs = subsOf(o.dir);
  const P = (n, k) => subs[n - 1][k][0];               // début du morceau k de la phrase n
  const keys = new Set(o.hi.map(bare));                // mots à surligner dans les sous-titres
  const sentences = subs.map((ss, i) => ({ wav: `t${i + 1}.wav`, gap: i === 0 ? 0.45 : i === 5 ? 0.6 : 0.35,
    subs: ss.map(([a, b, t]) => [a, b, t, t.split(' ').filter(w => keys.has(bare(w)))]) }));
  o.imgs.forEach((f, i) => fs.copyFileSync(path.join(dir, f), path.join(dir, o.dir, `img${i + 1}.jpg`)));
  const last = P(7, subs[6].length - 1) - 0.05;        // l'encart final arrive avec la dernière partie de l'outro
  const scenes = [
    { type: 'img', src: o.intro.img, crop: [0.5, 0.5, 1.35], move: 'in', s: 1, o: 0, es: 2, eo: 0, tint: 'red' },
    { type: 'tag', text: o.intro.text, sub: o.intro.sub, s: 1, o: 0.05, es: 2, eo: 0 },
    ...o.scenes(P),
    { type: 'rules', kicker: 'LE RÉFLEXE', big: o.rules.big, bigSize: o.rules.size, bigAt: P(6, 1) - 0.1,
      items: o.rules.items.map(([ic, tx], j) => [ic, tx, j < 2 ? P(6, j + 1) + 0.1 : P(6, 2) + 1.4]), s: 6, o: 0, es: 7, eo: last }];
  const fx = [
    { s: 1, o: 0, sfx: 'boom', flash: '#fff' }, { s: 1, o: 0.05, sfx: 'glitch', glitch: 0.4, shake: [0.35, 16] },
    ...[2, 3, 4, 5].map(s => ({ s, o: -0.05, sfx: 'whoosh', flash: '#fff' })),
    ...o.fx(P),
    { s: 6, o: -1.5, sfx: 'riser' }, { s: 6, o: -0.05, sfx: 'whoosh', flash: '#fff' },
    { s: 6, o: P(6, 1) - 0.1, sfx: 'impact', shake: [0.45, 20] }, { s: 6, o: P(6, 1) + 0.1, sfx: 'pop' }, { s: 6, o: P(6, 2) + 0.1, sfx: 'pop' },
    { s: 7, o: last - 0.05, sfx: 'whoosh', flash: '#fff' }];
  return { out: o.out, dir: o.dir, label: 'ALERTE ARNAQUE', speed: 1.04, sentences, images: [], scenes, fx,
    quiet: o.quiet || [], cta: { ...KIT, sub: o.ctaSub, offset: last, sentence: 7 } };
}

const S = [
  build({ out: '018-fusion-free-faux-messages', dir: 's018', imgs: ['s002/img2.jpg', 's004/img2.jpg', 's003/img1.jpg'],
    intro: { img: 'img3.jpg', text: '⚠ ABONNÉS FREE', sub: 'fusion du 1er décembre 2026' },
    hi: ['Attention', 'Free', 'prévenus', 'escrocs', 'faux', 'payer', 'carte', 'fausse', 'bancaire', 'réflexe', 'rien', 'jamais', 'famille', 'Radar'],
    scenes: P => [
      { type: 'img', src: 'img3.jpg', crop: [0.5, 0.5, 1.1], move: 'out', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'tag', text: 'FREE MOBILE → FREE', sub: "le 1er décembre · Tom's Guide", s: 2, o: 0.05, es: 2, eo: P(2, 1) },
      { type: 'stamp', text: '15,8<br>MILLIONS', sub: "d'abonnés prévenus", s: 2, o: P(2, 1), es: 3, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.45, 1.25], move: 'in', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'chat', title: '« Free »', icon: '📩', items: [['in', 'Suite à la fusion Free, régularisez votre abonnement 👉 [lien]', P(3, 1), true]], s: 3, o: 0, es: 4, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.55, 0.5, 1.7], move: 'in', tint: 'red', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'tag', text: '💳 « VOTRE CARTE »', sub: 'à mettre à jour, dit le message', s: 4, o: 0.05, es: 5, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.5, 0.5, 1.2], move: 'in', tint: 'red', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'stamp', text: 'FAUSSE<br>PAGE', sub: 'votre carte est volée', s: 5, o: P(5, 1), es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: 0.05, sfx: 'pop' }, { s: 2, o: P(2, 1), sfx: 'tick' }, { s: 3, o: P(3, 1), sfx: 'msg' }, { s: 4, o: 0.05, sfx: 'pop' },
      { s: 5, o: P(5, 1), sfx: 'impact', shake: [0.55, 26], flash: '#fff' }],
    rules: { big: 'RIEN À FAIRE', size: 92, items: [['✓', 'Forfaits et prix ne changent pas'], ['✗', 'Free ne demande jamais votre carte par message'], ['✓', 'Un doute ? Espace abonné ou 3244']] },
    ctaSub: 'Prévenez votre famille.' }),

  build({ out: '019-faux-pv-qr-code', dir: 's019', imgs: ['s010/img2.jpg', 's004/img2.jpg', 's007/img3.jpg'],
    intro: { img: 'img1.jpg', text: '⚠ NOUVELLE ARNAQUE', sub: 'France · 13 nov. 2026' },
    hi: ['Attention', 'nouvelle', 'pare-brise', 'papier', 'QR', 'code', '35', '48', '135', 'faux', 'carte', 'achats', 'revendent', 'réflexe', 'jamais', 'courrier', 'guide'],
    scenes: P => [
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.5, 1.15], move: 'in', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'tag', text: '🚗 SUR LE PARE-BRISE', sub: 'logo officiel et QR code', s: 2, o: 0.05, es: 3, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.55, 0.45, 1.6], move: 'in', tint: 'red', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'counter', value: 35, suffix: ' €', label: '« SOUS 48 HEURES »', count: 0.5, s: 3, o: 0.1, es: 4, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.5, 0.5, 1.2], move: 'in', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'confirm', title: 'Paiement de l’amende', sub: 'Numéro de carte · date · code', btn: 'Payer 35 €', presses: [P(4, 1) + 0.6], s: 4, o: 0, es: 5, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.5, 0.5, 1.05], move: 'out', tint: 'dark', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'stamp', text: 'CARTE<br>VOLÉE', sub: 'source : JeChange, nov. 2026', s: 5, o: 0.2, es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: 0.05, sfx: 'pop' }, { s: 3, o: 0.1, sfx: 'tick' }, { s: 3, o: 0.6, sfx: 'impact', shake: [0.4, 16] }, { s: 4, o: P(4, 1) + 0.6, sfx: 'tick' },
      { s: 5, o: 0.2, sfx: 'impact', shake: [0.55, 26], flash: '#fff' }],
    rules: { big: 'JAMAIS', size: 150, items: [['✗', 'Ne payez jamais avec ce QR code'], ['✓', 'Un vrai avis arrive par courrier'], ['✓', 'Paiement : amendes.gouv.fr seulement']] },
    ctaSub: 'Enregistrez cette vidéo.', quiet: [[5, -0.05, 6, -0.1]] }),

  build({ out: '020-faux-conseiller-coursier-10000', dir: 's020', imgs: ['s007/img1.jpg', 's006/img2.jpg', 's007/img3.jpg'],
    intro: { img: 'img3.jpg', text: '⚠ PLUS DE 10 000 €', sub: 'Pétange, Luxembourg · nov. 2026' },
    hi: ['arnaque', '10', '000', '€', 'Booking', 'conseiller', 'sécuriser', 'lien', 'accès', 'plafonds', 'coursier', 'cartes', 'détruire', 'réflexe', 'jamais', 'Raccrochez', 'famille', 'kit', 'gratuit'],
    scenes: P => [
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.5, 1.2], move: 'in', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'phone', name: 'Numéro inconnu', sub: '« Paiements suspects sur Booking »', flip: P(2, 1), s: 2, o: 0.05, es: 3, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.45, 1.7], move: 'in', tint: 'red', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'tag', text: '🏦 « VOTRE BANQUE »', sub: 'un faux conseiller rappelle', s: 3, o: 0.05, es: 4, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.6, 0.5, 1.3], move: 'in', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'stamp', text: 'PLAFONDS<br>RELEVÉS', sub: 'il a vos accès bancaires', s: 4, o: P(4, 1), es: 5, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.5, 0.5, 1.15], move: 'in', tint: 'dark', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'tag', text: '🛵 UN COURSIER', sub: "vient chercher les cartes · L'essentiel", s: 5, o: 0.05, es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: 0.05, sfx: 'ring' }, { s: 3, o: 0.05, sfx: 'pop' }, { s: 4, o: P(4, 1), sfx: 'impact', shake: [0.55, 26], flash: '#fff' },
      { s: 5, o: -0.05, sfx: 'boom', flash: '#000' }, { s: 5, o: 0.05, sfx: 'dingdong' }],
    rules: { big: 'RACCROCHEZ', size: 92, items: [['✗', 'Aucune banque ne vient chercher vos cartes'], ['✓', 'Raccrochez, rappelez vous-même'], ['✓', 'Victime ? Worldline (+352) 49 10 10']] },
    ctaSub: 'Transférez-la à votre famille.', quiet: [[5, -0.05, 6, -0.1]] }),

  build({ out: '021-rencontre-faux-theatre', dir: 's021', imgs: ['s010/img1.jpg', 's009/img3.jpg', 's004/img2.jpg'],
    intro: { img: 'img1.jpg', text: '⚠ APPLIS DE RENCONTRE', sub: 'Luxembourg · nov. 2026' },
    hi: ['arnaque', 'rencontre', 'WhatsApp', 'théâtre', 'lien', '70', '€', 'fausse', 'police', 'carte', 'réflexe', 'rien', 'inconnu', 'place', 'célibataire', 'alertes'],
    scenes: P => [
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.45, 1.2], move: 'in', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'chat', title: 'Nouveau match', icon: '💬', items: [['in', 'Coucou 😊 on continue sur WhatsApp ?', 0.3]], s: 2, o: 0, es: 3, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.5, 0.5, 1.2], move: 'in', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'chat', title: 'WhatsApp', icon: '🎭', items: [['in', 'On va au théâtre ? 🎭', 0.2], ['in', 'Prends la place à côté de la mienne 👉 [lien]', P(3, 1), true]], s: 3, o: 0, es: 4, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.5, 0.5, 1.2], move: 'in', tint: 'red', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'stamp', text: 'FAUSSE<br>BILLETTERIE', sub: 'la pièce n’existe pas', s: 4, o: P(4, 1), es: 5, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.55, 0.45, 1.6], move: 'out', tint: 'dark', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'tag', text: 'POLICE GRAND-DUCALE', sub: "via L'essentiel, nov. 2026", s: 5, o: 0.05, es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: 0.3, sfx: 'msg' }, { s: 3, o: 0.2, sfx: 'msg' }, { s: 3, o: P(3, 1), sfx: 'msg' },
      { s: 4, o: P(4, 1), sfx: 'impact', shake: [0.55, 26], flash: '#fff' }, { s: 5, o: 0.05, sfx: 'pop' }],
    rules: { big: 'PAS DE LIEN', size: 110, items: [['✗', 'N’achetez rien via un lien reçu'], ['✓', 'Proposez de vous retrouver sur place'], ['✓', 'Victime ? Bloquez votre carte']] },
    ctaSub: 'Envoyez-la à un ami célibataire.' }),

  build({ out: '022-panne-outlook-faux-email', dir: 's022', imgs: ['s004/img3.jpg', 's007/img3.jpg', 's002/img1.jpg'],
    intro: { img: 'img2.jpg', text: '⚠ PANNE OUTLOOK', sub: 'faux emails · nov. 2026' },
    hi: ['arnaque', 'panne', 'Outlook', 'faux', 'supprimés', '24', 'Restaurer', 'mot', 'passe', 'Microsoft', 'États-Unis', 'réflexe', 'cliquez', 'pouce', 'kit', 'gratuit'],
    scenes: P => [
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.5, 1.1], move: 'in', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'tag', text: '📧 PANNE DU 12 NOV.', sub: 'Outlook et Microsoft 365', s: 2, o: 0.05, es: 3, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.5, 0.45, 1.25], move: 'in', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'chat', title: '« Outage »', icon: '📩', items: [['in', 'Des messages retenus seront supprimés sous 24 h. [Restaurer]', 0.2, true]], s: 3, o: 0, es: 4, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.6, 0.5, 1.4], move: 'in', tint: 'red', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'stamp', text: 'FAUX<br>SITE', sub: 'il vole votre mot de passe', s: 4, o: P(4, 1), es: 5, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.5, 1], move: 'out', tint: 'dark', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'tag', text: 'ALERTE DE MICROSOFT', sub: 'via Clubic, 14 nov. 2026', s: 5, o: 0.05, es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: 0.05, sfx: 'pop' }, { s: 3, o: 0.2, sfx: 'msg' }, { s: 4, o: P(4, 1), sfx: 'impact', shake: [0.55, 26], flash: '#fff' }, { s: 5, o: 0.05, sfx: 'pop' }],
    rules: { big: 'NE CLIQUEZ PAS', size: 76, items: [['✗', 'Ne cliquez pas sur « Restaurer »'], ['✓', 'Vos emails ne seront pas supprimés'], ['✓', 'Déjà cliqué ? Changez votre mot de passe']] },
    ctaSub: 'Un pouce si elle vous a servi.' })];

for (const s of S) fs.writeFileSync(path.join(dir, s.out + '.spec.json'), JSON.stringify(s, null, 1));
console.log(S.map(s => s.out).join('\n'));
