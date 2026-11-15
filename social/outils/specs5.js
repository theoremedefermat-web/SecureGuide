// Specs (short3.js) des Shorts 013 à 017, version gratuite : voix Hortense, images reprises des Shorts précédents.
// Intro en phrase 1, réflexe en phrase 6, outro en phrase 7 (différente à chaque Short).
const fs = require('fs'); const path = require('path');
const dir = process.argv[2];
const subsOf = n => JSON.parse(fs.readFileSync(path.join(dir, n, 'subs.json'), 'utf8'));
const KIT = { kicker: 'GUIDE ANTI-ARNAQUE · GRATUIT', title: 'Le kit <em>anti-arnaques</em> 2026', url: 'www.secureguide.fr/kit' };

function build(o) {
  const subs = subsOf(o.dir);
  const P = (n, k) => subs[n - 1][k][0];               // début du morceau k de la phrase n
  const sentences = subs.map((ss, i) => ({ wav: `t${i + 1}.wav`, gap: i === 0 ? 0.45 : i === 5 ? 0.6 : 0.35,
    subs: ss.map(([a, b, t]) => [a, b, t, o.hi[t] || []]) }));
  o.imgs.forEach((f, i) => fs.copyFileSync(path.join(dir, f), path.join(dir, o.dir, `img${i + 1}.jpg`)));
  const last = P(7, 1) - 0.05;
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
  build({ out: '013-sms-controle-technique', dir: 's013', imgs: ['s002/img2.jpg', 's004/img2.jpg', 's007/img3.jpg'],
    intro: { img: 'img2.jpg', text: '⚠ NOUVELLE ARNAQUE', sub: 'France · nov. 2026' },
    hi: { 'Attention,': ['Attention,'], 'voici une nouvelle arnaque,': ['nouvelle', 'arnaque,'], 'qui vise les automobilistes.': ['automobilistes.'],
      'Vous recevez un SMS.': ['SMS.'], '« Votre contrôle technique a expiré. »': ['expiré.'], '« Régularisez sous 48 h. »': ['48', 'h.'],
      'Le message cite votre vraie plaque.': ['vraie', 'plaque.'], 'Et votre nom.': ['nom.'],
      'Le site de rendez-vous Auto-Planning a été piraté.': ['piraté.'], 'Les pirates revendiquent 18 millions de personnes.': ['18', 'millions'],
      'Le lien mène à un faux site de paiement.': ['faux'], 'Il vole votre carte bancaire.': ['carte', 'bancaire.'],
      'Le réflexe :': ['réflexe'], 'un SMS ne réclame jamais une amende.': ['jamais'], 'Vérifiez la date de votre dernier contrôle.': ['date'],
      'Envoyez cette vidéo à quelqu’un qui a une voiture.': ['voiture.'], 'Le guide complet est sur secureguide.fr.': ['guide'] },
    scenes: P => [
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.45, 1.25], move: 'in', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'chat', title: 'SMS · Contrôle technique', icon: '🚗', items: [['in', 'Votre contrôle technique a expiré. Régularisez sous 48 h 👉 [lien]', P(2, 1)]], s: 2, o: 0, es: 3, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.55, 0.5, 1.7], move: 'in', tint: 'red', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'tag', text: '🚘 VOTRE VRAIE PLAQUE', sub: 'et votre vrai nom', s: 3, o: 0.05, es: 4, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.5, 0.5, 1], move: 'out', tint: 'dark', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'tag', text: 'PIRATAGE AUTO-PLANNING', sub: '450 centres · JeChange, oct. 2026', s: 4, o: 0.05, es: 4, eo: P(4, 1) },
      { type: 'counter', value: 18, suffix: ' millions', label: 'DE PERSONNES REVENDIQUÉES', count: 0.8, s: 4, o: P(4, 1), es: 5, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.5, 0.5, 1.2], move: 'in', tint: 'red', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'stamp', text: 'FAUX<br>PAIEMENT', sub: 'votre carte est volée', s: 5, o: P(5, 1), es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: P(2, 1), sfx: 'msg' }, { s: 4, o: P(4, 1), sfx: 'tick' }, { s: 4, o: P(4, 1) + 0.8, sfx: 'impact', shake: [0.4, 16] },
      { s: 5, o: P(5, 1), sfx: 'impact', shake: [0.55, 26], flash: '#fff' }],
    rules: { big: 'PAS PAR SMS', size: 110, items: [['✗', 'Un SMS ne réclame jamais une amende'], ['✓', 'Vérifiez la date de votre dernier contrôle'], ['✓', 'Amende ? Uniquement sur amendes.gouv.fr']] },
    ctaSub: 'Envoyez-la à un automobiliste.', quiet: [[4, -0.05, 5, -0.1]] }),

  build({ out: '014-faux-agent-luxtrust-carte', dir: 's014', imgs: ['s007/img1.jpg', 's006/img2.jpg', 's005/img2.jpg'],
    intro: { img: 'img2.jpg', text: '⚠ ARNAQUE EN COURS', sub: 'Luxembourg · 4 nov. 2026' },
    hi: { 'Voici une arnaque': ['arnaque'], 'qui a piégé deux hommes au Luxembourg.': ['deux', 'hommes'],
      'Un « agent LuxTrust » vous appelle.': ['LuxTrust'], 'Il parle d’une opération suspecte.': ['suspecte.'],
      'Il vous fait valider des demandes dans l’application.': ['valider'], 'Et les escrocs font des virements.': ['virements.'],
      'Puis un faux agent sonne chez vous.': ['faux', 'agent'], 'Il vient chercher votre carte, « pour la détruire ».': ['carte,'],
      'En fait, il retire de l’argent avec.': ['retire'], 'Le réflexe :': ['réflexe'], 'personne ne vient chercher votre carte.': ['personne'],
      'Et ne validez rien que vous n’avez pas lancé.': ['rien'], 'Dites-le à vos parents.': ['parents.'], 'Toutes nos alertes sont sur secureguide.fr.': ['alertes'] },
    scenes: P => [
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.5, 1.2], move: 'in', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'phone', name: '« Agent LuxTrust »', sub: 'Opération suspecte', flip: P(2, 1), s: 2, o: 0.05, es: 3, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.45, 1.7], move: 'in', tint: 'red', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'confirm', title: 'LuxTrust', sub: 'Confirmer l’opération ?', btn: 'Valider', presses: [1.0, 1.6, 2.2], s: 3, o: 0, es: 4, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.5, 0.5, 1.2], move: 'in', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'tag', text: '🚪 UN FAUX AGENT', sub: 'vient chercher la carte', s: 4, o: 0.05, es: 5, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.5, 0.5, 1.1], move: 'out', tint: 'dark', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'stamp', text: 'ARGENT<br>RETIRÉ', sub: "Police grand-ducale · L'essentiel", s: 5, o: 0.3, es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: 0.05, sfx: 'ring' }, { s: 3, o: 1.0, sfx: 'tick' }, { s: 3, o: 1.6, sfx: 'tick' }, { s: 3, o: 2.2, sfx: 'tick' },
      { s: 4, o: 0.05, sfx: 'dingdong' }, { s: 5, o: 0.3, sfx: 'impact', shake: [0.55, 26], flash: '#fff' }],
    rules: { big: 'PERSONNE', size: 130, items: [['✗', 'Personne ne vient chercher votre carte'], ['✗', 'Ne validez rien que vous n’avez pas lancé'], ['✓', 'Victime ? Carte : Worldline 49 10 10']] },
    ctaSub: 'Dites-le à vos parents.', quiet: [[5, -0.05, 6, -0.1]] }),

  build({ out: '015-money-mule', dir: 's015', imgs: ['s010/img1.jpg', 's007/img2.jpg', 's008/img2.jpg'],
    intro: { img: 'img3.jpg', text: '⚠ ARGENT FACILE ?', sub: 'Luxembourg · nov. 2026' },
    hi: { 'Voici une arnaque': ['arnaque'], 'qui peut vous faire arrêter.': ['arrêter.'], 'On vous propose de l’argent facile.': ['facile.'],
      'Recevoir un virement sur votre compte.': ['virement'], 'Puis le renvoyer ailleurs, contre une commission.': ['commission.'],
      'Mais cet argent a été volé.': ['volé.'], 'À des victimes d’hameçonnage.': ['victimes'], 'En prêtant votre compte, vous aidez à le blanchir.': ['blanchir.'],
      'Au Luxembourg, la police a arrêté une femme.': ['arrêté'], 'Elle avait prêté son compte.': ['prêté'], 'Le réflexe :': ['réflexe'],
      'ne prêtez jamais votre compte ni votre carte.': ['jamais'], 'Même à un proche, même pour un job.': ['proche,', 'job.'],
      'Montrez cette vidéo à un jeune autour de vous.': ['jeune'], 'Et suivez nos alertes sur secureguide.fr.': ['alertes'] },
    scenes: P => [
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.45, 1.2], move: 'in', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'chat', title: 'Offre de « job »', icon: '💸', items: [['in', 'Tu reçois un virement, tu le renvoies, tu gardes une commission 😉', 0.3], ['out', 'C’est légal ?', P(2, 2)], ['in', 'Bien sûr, c’est rapide 👍', P(2, 2) + 0.9, true]], s: 2, o: 0, es: 3, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.5, 0.5, 1.3], move: 'in', tint: 'red', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'stamp', text: 'ARGENT<br>VOLÉ', sub: 'à des victimes de phishing', s: 3, o: 0.2, es: 4, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.6, 0.45, 1.8], move: 'in', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'tag', text: '🔁 MULE FINANCIÈRE', sub: 'vous blanchissez sans le savoir', s: 4, o: 0.05, es: 5, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.5, 0.5, 1], move: 'out', tint: 'dark', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'tag', text: 'POLICE GRAND-DUCALE', sub: "arrestation · L'essentiel, nov. 2026", s: 5, o: 0.05, es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: 0.3, sfx: 'msg' }, { s: 2, o: P(2, 2), sfx: 'msg' }, { s: 2, o: P(2, 2) + 0.9, sfx: 'msg' },
      { s: 3, o: 0.2, sfx: 'impact', shake: [0.55, 26], flash: '#fff' }, { s: 4, o: 0.05, sfx: 'pop' }, { s: 5, o: -0.05, sfx: 'boom', flash: '#000' }, { s: 5, o: 0.05, sfx: 'pop' }],
    rules: { big: 'JAMAIS', size: 150, items: [['✗', 'Ne prêtez jamais votre compte'], ['✗', 'Ni votre carte, même à un proche'], ['✓', 'Un doute ? Appelez votre banque']] },
    ctaSub: 'Montrez-la à un jeune.', quiet: [[5, -0.05, 6, -0.1]] }),

  build({ out: '016-fuite-pluxee', dir: 's016', imgs: ['s002/img1.jpg', 's006/img3.jpg', 's003/img2.jpg'],
    intro: { img: 'img3.jpg', text: '⚠ FUITE DE DONNÉES', sub: 'Pluxee Belgique · 4 nov. 2026' },
    hi: { 'Voici une arnaque à prévoir,': ['prévoir,'], 'si vous avez des chèques-repas Pluxee.': ['chèques-repas'],
      'Pluxee Belgique a prévenu ses utilisateurs.': ['prévenu'], 'Des inconnus ont peut-être eu accès à leurs données.': ['données.'],
      'Nom, email, téléphone.': ['Nom,', 'email,', 'téléphone.'], 'De quoi vous envoyer un faux message Pluxee.': ['faux'],
      'Avec un lien vers une fausse page de connexion.': ['fausse'], 'Ou vous appeler, en vous citant par votre nom.': ['nom.'],
      'Le réflexe :': ['réflexe'], 'ne cliquez sur aucun lien.': ['aucun'], 'Ouvrez vous-même l’application.': ['vous-même'],
      'Vos collègues ont aussi des chèques-repas ?': ['collègues'], 'Partagez-leur cette vidéo.': ['Partagez-leur'], 'Le guide est sur secureguide.fr.': ['guide'] },
    scenes: P => [
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.45, 1.2], move: 'in', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'tag', text: '📧 EMAIL DE PLUXEE', sub: 'accès non autorisé possible', s: 2, o: 0.05, es: 3, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.4, 1.7], move: 'in', tint: 'red', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'stamp', text: 'DONNÉES<br>EXPOSÉES', sub: 'nom · email · téléphone', s: 3, o: 0.1, es: 4, eo: 0 },
      { type: 'img', src: 'img2.jpg', crop: [0.5, 0.5, 1.2], move: 'in', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'chat', title: '« Pluxee »', icon: '🍽', items: [['in', 'Votre carte va être bloquée. Reconnectez-vous ici 👉 [lien]', 0.3, true]], s: 4, o: 0, es: 5, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.5, 0.45, 1.2], move: 'in', tint: 'dark', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'phone', name: '« Service Pluxee »', sub: 'Il connaît votre nom', flip: 1.4, s: 5, o: 0.05, es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: 0.05, sfx: 'pop' }, { s: 3, o: 0.1, sfx: 'impact', shake: [0.55, 26], flash: '#fff' }, { s: 3, o: 0.05, sfx: 'glitch', glitch: 0.4 },
      { s: 4, o: 0.3, sfx: 'msg' }, { s: 5, o: 0.05, sfx: 'ring' }],
    rules: { big: 'AUCUN LIEN', size: 110, items: [['✗', 'Ne cliquez sur aucun lien'], ['✓', 'Ouvrez vous-même l’application'], ['✓', 'Suspect ? suspect@safeonweb.be']] },
    ctaSub: 'Partagez-la à vos collègues.' }),

  build({ out: '017-faux-service-fraude-arkea', dir: 's017', imgs: ['s002/img3.jpg', 's004/img3.jpg', 's005/img3.jpg'],
    intro: { img: 'img3.jpg', text: '⚠ CYBERATTAQUE BANCAIRE', sub: 'Crédit Mutuel Arkéa · nov. 2026' },
    hi: { 'Voici une arnaque': ['arnaque'], 'qui profite d’une cyberattaque contre une banque.': ['cyberattaque'],
      'Le Crédit Mutuel Arkéa, maison mère de Fortuneo,': ['Arkéa,', 'Fortuneo,'], 'a confirmé une cyberattaque.': ['cyberattaque.'],
      'Les escrocs en profitent.': ['escrocs'], 'Un faux « service fraude » vous appelle au sujet de l’attaque.': ['faux'],
      'Il vous demande de valider une opération.': ['valider'], 'Ou de donner un code reçu par SMS.': ['code'],
      'Selon la banque, ses clients ne perdent rien.': ['rien.'], 'Le vrai danger, c’est ce faux appel.': ['faux', 'appel.'],
      'Le réflexe :': ['réflexe'], 'ne donnez jamais un code reçu par SMS.': ['jamais'], 'Raccrochez, et rappelez votre conseiller.': ['Raccrochez,'],
      'Une question ? Posez-la en commentaire.': ['commentaire.'], 'Notre kit gratuit est sur secureguide.fr.': ['kit', 'gratuit'] },
    scenes: P => [
      { type: 'img', src: 'img2.jpg', crop: [0.5, 0.5, 1.1], move: 'out', tint: 'dark', s: 2, o: 0, es: 3, eo: 0 },
      { type: 'tag', text: 'CRÉDIT MUTUEL ARKÉA', sub: 'et Fortuneo · ToutSurMesFinances', s: 2, o: 0.05, es: 3, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.5, 1.2], move: 'in', s: 3, o: 0, es: 4, eo: 0 },
      { type: 'phone', name: '« Service fraude »', sub: 'Votre banque', flip: P(3, 1) + 0.6, s: 3, o: P(3, 1), es: 4, eo: 0 },
      { type: 'img', src: 'img1.jpg', crop: [0.5, 0.45, 1.7], move: 'in', tint: 'red', s: 4, o: 0, es: 5, eo: 0 },
      { type: 'chat', title: 'SMS · Votre banque', icon: '🔐', items: [['in', 'Code de validation : 482 913. Ne le communiquez à personne.', P(4, 1)]], s: 4, o: 0, es: 5, eo: 0 },
      { type: 'img', src: 'img3.jpg', crop: [0.5, 0.5, 1.1], move: 'in', s: 5, o: 0, es: 6, eo: 0 },
      { type: 'stamp', text: 'FAUX<br>APPEL', sub: 'la banque ne demande jamais ce code', s: 5, o: P(5, 1), es: 6, eo: 0 }],
    fx: P => [{ s: 2, o: 0.05, sfx: 'pop' }, { s: 3, o: P(3, 1), sfx: 'ring' }, { s: 4, o: P(4, 1), sfx: 'msg' },
      { s: 5, o: P(5, 1), sfx: 'impact', shake: [0.55, 26], flash: '#fff' }],
    rules: { big: 'RACCROCHEZ', size: 92, items: [['✗', 'Ne donnez jamais un code reçu par SMS'], ['✓', 'Raccrochez'], ['✓', 'Rappelez vous-même votre conseiller']] },
    ctaSub: 'Une question ? En commentaire.' })];

for (const s of S) fs.writeFileSync(path.join(dir, s.out + '.spec.json'), JSON.stringify(s, null, 1));
console.log(S.map(s => s.out).join('\n'));
