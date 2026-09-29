import { fmtDate, localISO } from '@/lib/format';

const lines = (v) => (v || '').split('\n').map((s) => s.trim()).filter(Boolean);
const stop = (s) => (/STOP$/i.test(s) ? s : `${s} STOP`);
const items = (v) => { const l = lines(v); return l.length ? l.map(stop).join(' ') : 'NEANT STOP'; };
const perLine = (v) => lines(v).map((l) => {
  const i = l.indexOf(' : ');
  return i > 0 ? { indent: 1, sub: l.slice(0, i), text: stop(l.slice(i + 3)) } : { indent: 1, text: stop(l) };
});
const block = (label, title, v) => {
  const l = perLine(v);
  return l.length ? [{ label, text: `${title} STOP` }, ...l] : [{ label, text: `${title} STOP NEANT STOP` }];
};
const V = (f) => f.vessel || 'NOM DU BATIMENT';
const HVRC = { text: 'H.V.R.C STOP' };
const vesselField = { key: 'vessel', label: 'Bâtiment concerné', type: 'vessel' };
const ta = (key, label, hint) => ({ key, label, type: 'textarea', hint });
const tx = (key, label, hint) => ({ key, label, type: 'text', hint });
const LINE_HINT = 'Une ligne par élément. Vide = NEANT';
const VESSEL_HINT = 'Une ligne par bâtiment : « V12 : texte »';
const vesselLines = (vessels, fn) => vessels.map(fn).join('\n');
const code = (v) => v.code || v.name;
const MOVE = { group: 'mouvement', recipients: 'movement', classification: 'SECRET CONFIDENTIEL', urgency: 'URGENT' };

export const MISSION_CHAPTERS = [
  ['A', 'Généralités', "Vue d'ensemble de la sortie"],
  ['B', 'Autorités contactées', 'Par ville : nom et fonction'],
  ['C', 'Visite du bâtiment par la population', 'Ville : nombre de visiteurs'],
  ['D', 'Arraisonnement et visite des bâtiments', 'Nom du bâtiment – position – date'],
  ['E', 'Exercices effectués', 'Manœuvre, transmission, artillerie, tir, sécurité'],
  ['F', 'Météorologie – Renseignements nautiques', 'Temps, état de la mer, cyclones, différences avec les cartes'],
  ['G', 'Étude et visite de régions isolées – Étude de ports', 'Habitants, autorités, production, besoins…'],
  ['H', 'Mouvement du bâtiment', 'Date/heure – lieu – distance parcourue'],
  ['I', 'Consommation', 'Gazole, huiles, essence, eau douce, munitions'],
  ['J', 'Matériels', 'Incidents par service, mesures prises, observations'],
  ['K', 'Santé', 'Maladies, débarquement éventuel'],
  ['L', 'Assistance – Sauvetage', 'Assistances au matériel et au personnel'],
  ['M', 'Matériels et personnels transportés', 'Trajet, nature, poids, bénéficiaires'],
  ['N', 'Conclusion', 'Réflexions personnelles et suggestions'],
].map(([key, title, hint]) => ({ key, title, hint }));

export const MESSAGE_TYPES = {
  CRHAS: {
    name: 'CRHAS', label: "CR hebdomadaire d'activités spécifiques", group: 'hebdo', due: 'Jeudi',
    recipients: 'weekly', classification: 'DIFFUSION RESTREINTE', urgency: 'URGENT',
    fields: [
      { key: 'week_from', label: 'Semaine du', type: 'date' }, { key: 'week_to', label: 'Au', type: 'date' },
      ta('alpha', 'ALPHA — Opérations en mer et activités portuaires', LINE_HINT),
      ta('bravo', 'BRAVO — Vérification du matériel', LINE_HINT),
      ta('charlie', 'CHARLIE — Instruction de spécialité et entraînement', LINE_HINT),
      ta('secundo', 'SECUNDO — Observations et suggestions', LINE_HINT),
    ],
    initial: () => ({ week_from: localISO(-6), week_to: localISO() }),
    build: (f) => [
      { label: 'OBJET', text: 'CRHAS STOP' }, HVRC,
      { label: 'PRIMO', text: `ACTIVITES SEMAINE DU ${fmtDate(f.week_from)} AU ${fmtDate(f.week_to)} STOP` },
      { label: 'ALPHA', indent: 1, text: `OPERATION EN MER ET ACTIVITES PORTUAIRES STOP ${items(f.alpha)}` },
      { label: 'BRAVO', indent: 1, text: `VERIFICATION DU MATERIEL STOP ${items(f.bravo)}` },
      { label: 'CHARLIE', indent: 1, text: `INSTRUCTION DE SPECIALITE ET ENTRAINEMENT DU PERSONNEL STOP ${items(f.charlie)}` },
      { label: 'SECUNDO', text: `OBSERVATIONS ET SUGGESTIONS STOP ${items(f.secundo)}` },
    ],
  },
  CRHSBE: {
    name: 'CRHSBE', label: 'CR hebdomadaire de situation des bâtiments et engins', group: 'hebdo', due: 'Jeudi',
    recipients: 'weekly', classification: 'DIFFUSION RESTREINTE', urgency: 'URGENT',
    fields: [
      { key: 'sit_date', label: 'Situation du', type: 'date' },
      ta('dispo', 'PRIMO — Bâtiments et engins disponibles', VESSEL_HINT),
      ta('indispo', 'SECUNDO — Bâtiments et engins indisponibles', VESSEL_HINT),
    ],
    initial: ({ vessels }) => {
      const fmt = (v) => `${code(v)} : VB ${v.vb ?? 0} % STOP ${v.situation || ''}`.trim();
      return {
        sit_date: localISO(),
        dispo: vesselLines(vessels.filter((v) => v.status === 'disponible'), fmt),
        indispo: vesselLines(vessels.filter((v) => v.status !== 'disponible'), fmt),
      };
    },
    build: (f) => [
      { label: 'OBJET', text: 'CRHSBE STOP' },
      { text: `H.V.R.C STOP SITUATION BATIMENTS ET ENGINS DU ${fmtDate(f.sit_date)} STOP` },
      ...block('PRIMO', 'BATIMENTS ET ENGINS DISPONIBLES', f.dispo),
      ...block('SECUNDO', 'BATIMENTS ET ENGINS INDISPONIBLES', f.indispo),
    ],
  },
  CRHTER: {
    name: 'CRHTER', label: "CR hebdomadaire des travaux d'entretien et réparations", group: 'hebdo', due: 'Jeudi',
    recipients: 'weekly', classification: 'DIFFUSION RESTREINTE', urgency: 'URGENT',
    fields: [
      { key: 'week_from', label: 'Semaine du', type: 'date' }, { key: 'week_to', label: 'Au', type: 'date' },
      ta('travaux', 'PRIMO — Travaux effectués', VESSEL_HINT),
      ta('difficultes', 'SECUNDO — Difficultés rencontrées', VESSEL_HINT),
      { key: 'prev_from', label: 'Prévision semaine du', type: 'date' }, { key: 'prev_to', label: 'Au', type: 'date' },
      ta('prevision', 'TERTIO — Prévision travaux', VESSEL_HINT),
    ],
    initial: ({ vessels }) => ({
      week_from: localISO(-6), week_to: localISO(), prev_from: localISO(1), prev_to: localISO(7),
      travaux: vesselLines(vessels, (v) => `${code(v)} : NEANT`),
      difficultes: vesselLines(vessels.filter((v) => v.status !== 'disponible'), (v) => `${code(v)} : ${v.situation || 'NEANT'}`),
    }),
    build: (f) => [
      { label: 'OBJET', text: 'CRHTER STOP' }, HVRC,
      ...block('PRIMO', `TRAVAUX EFFECTUES SEMAINE DU ${fmtDate(f.week_from)} AU ${fmtDate(f.week_to)}`, f.travaux),
      ...block('SECUNDO', 'DIFFICULTES RENCONTREES', f.difficultes),
      ...block('TERTIO', `PREVISION TRAVAUX SEMAINE DU ${fmtDate(f.prev_from)} AU ${fmtDate(f.prev_to)}`, f.prevision),
    ],
  },
  AVIDEP: {
    ...MOVE, name: 'AVIDEP', label: 'Avis de départ',
    fields: [vesselField, tx('place', "Port ou mouillage d'appareillage", 'Ex : ANTSIRANANA'), { key: 'vb', label: 'VB (%) — si différent du plein', type: 'number' }],
    initial: () => ({}),
    build: (f) => [
      { label: 'OBJET', text: `AVIDEP ${V(f)} STOP` },
      { text: `H.V.R.C STOP AVIDEP DE ${f.place || '...'} STOP${f.vb !== undefined && f.vb !== '' ? ` VB ${f.vb} STOP` : ''}` },
    ],
  },
  ARRAVI: {
    ...MOVE, name: 'ARRAVI', label: "Avis d'arrivée",
    fields: [vesselField, tx('place', "Port ou mouillage d'arrivée", 'Ex : MOUILLAGE DE BAIE D\'ANGOTSY'), { key: 'vb', label: 'VB (%)', type: 'number' }],
    initial: () => ({}),
    build: (f) => [
      { label: 'OBJET', text: `ARRAVI ${V(f)} STOP` },
      { text: `H.V.R.C STOP ARRAVI AU ${f.place || '...'} STOP VB ${f.vb ?? '..'} STOP` },
    ],
  },
  POSIT: {
    ...MOVE, name: 'POSIT', label: 'Message de position (12h00)', defaultTime: '12:00',
    fields: [
      vesselField, tx('position', 'Position', 'Azimut / Point / Distance ou Lat/Long — ex : 135 / NOSY AKAO / 30'),
      tx('route', 'Route', 'Ex : 157'), tx('vitesse', 'Vitesse (nds)', 'Ex : 07'),
      tx('vent', 'Vent (quadrant + Beaufort)', 'Ex : NE 1'), tx('mer', 'État de la mer', 'Ex : 4'),
      tx('nebulosite', 'Nébulosité (octas)', 'Ex : 4'), { key: 'vb', label: 'VB (%)', type: 'number' },
    ],
    initial: () => ({}),
    build: (f) => [
      { label: 'OBJET', text: `POSIT ${V(f)} STOP` },
      { text: `H.V.R.C STOP ${f.position || '...'} STOP ${f.route || '..'} - ${f.vitesse || '..'} STOP ${f.vent || '..'}-${f.mer || '.'}-${f.nebulosite || '.'} STOP VB ${f.vb ?? '..'} STOP` },
    ],
  },
  AVIMOUV: {
    ...MOVE, name: 'AVIMOUV', label: 'Avis de mouvement (sortie ≤ 4 h)', classification: 'NON CLASSE', urgency: 'IMMEDIAT',
    fields: [vesselField, tx('from', 'Port de départ', 'Ex : ANTSIRANANA'), tx('purpose', 'Pour…', 'Ex : PASSATION EN MER'), tx('duration', 'Durée probable', 'Ex : QUATRE (04) HEURES')],
    initial: () => ({}),
    build: (f) => [
      { label: 'OBJET', text: `AVIMOUV ${V(f)} STOP` },
      { text: `H.V.R.C STOP AVIMOUV DE ${f.from || '...'} POUR ${f.purpose || '...'} STOP DUREE ${f.duration || '...'} STOP` },
    ],
  },
  MODMOUV: {
    ...MOVE, name: 'MODMOUV', label: 'Modification de mouvement',
    fields: [vesselField, ta('primo', "PRIMO — Référence de l'ordre modifié"), ta('secundo', 'SECUNDO — Mouvements modifiés'), ta('tertio', 'TERTIO — Raison de la modification'), ta('quarto', 'QUARTO ET QUINTO — Logistique / Transmission', 'Ex : SANS CHANGEMENT')],
    initial: () => ({}),
    build: (f) => [
      { label: 'OBJET', text: `MODMOUV ${V(f)} STOP` }, HVRC,
      { label: 'PRIMO', text: items(f.primo) }, { label: 'SECUNDO', text: items(f.secundo) },
      { label: 'TERTIO', text: items(f.tertio) }, { label: 'QUARTO ET QUINTO', text: items(f.quarto) },
    ],
  },
  PROJORDMOUV: {
    ...MOVE, name: 'PROJET ORDMOUV', label: "Projet d'ordre de mouvement (Sortie > 4 h)",
    fields: [vesselField, ta('primo', 'PRIMO — Appareillage / Retour', 'Ex : APPAREILLAGE DE FORT-DAUPHIN LE 23/10/26 A 0500C'), ta('secundo', 'SECUNDO — Détail des mouvements, escales'), ta('tertio', 'TERTIO — Proposition de mission'), ta('quarto', 'QUARTO — Logistique technique et approvisionnement'), ta('quinto', 'QUINTO ET SEXTO — Transmission / Comptes-rendus', 'Ex : SELON REGLEMENTATION EN VIGUEUR')],
    initial: () => ({}),
    build: (f) => [
      { label: 'OBJET', text: 'PROJET ORDMOUV STOP' }, { text: `HV ADRESSER PROJET ORDMOUV ${V(f)} STOP` },
      { label: 'PRIMO', text: items(f.primo) }, { label: 'SECUNDO', text: items(f.secundo) },
      { label: 'TERTIO', text: items(f.tertio) }, { label: 'QUARTO', text: items(f.quarto) },
      { label: 'QUINTO ET SEXTO', text: items(f.quinto) },
    ],
  },
  CRAJ: {
    ...MOVE, group: 'mission', name: 'CRAJ', label: "CR d'activités journalières en mission", classification: 'NON CLASSE',
    fields: [
      vesselField, { key: 'day', label: 'Journée du', type: 'date' },
      ta('alpha', 'ALPHA — Position au cours de la journée', 'Zone de navigation / Mouillage de… / À quai à…'),
      ta('bravo', 'BRAVO — Bâtiments rencontrés, infractions AEM, arraisonnements', LINE_HINT),
      ta('charlie', 'CHARLIE — Autres activités de la mission', LINE_HINT),
      ta('delta', 'DELTA — Exercices effectués', LINE_HINT),
      ta('secundo', 'SECUNDO — Difficultés, mesures prises, besoins', LINE_HINT),
      ta('tertio', 'TERTIO — Logistique (vivres, combustible, eau)', LINE_HINT),
      ta('quarto', 'QUARTO — Prévision du lendemain', LINE_HINT),
    ],
    initial: () => ({ day: localISO() }),
    build: (f) => [
      { label: 'OBJET', text: `CRAJ ${V(f)} STOP` }, HVRC,
      { label: 'PRIMO', text: `ACTIVITES JOURNEE DU ${fmtDate(f.day)} STOP` },
      { label: 'ALPHA', indent: 1, text: items(f.alpha) }, { label: 'BRAVO', indent: 1, text: items(f.bravo) },
      { label: 'CHARLIE', indent: 1, text: items(f.charlie) }, { label: 'DELTA', indent: 1, text: items(f.delta) },
      { label: 'SECUNDO', text: `DIFFICULTES RENCONTREES STOP ${items(f.secundo)}` },
      { label: 'TERTIO', text: `LOGISTIQUE STOP ${items(f.tertio)}` },
      { label: 'QUARTO', text: `PREVISION ACTIVITES DU LENDEMAIN STOP ${items(f.quarto)}` },
    ],
  },
  CRMISSION: {
    group: 'mission', kind: 'document', name: 'CR DE MISSION', label: 'Compte-rendu de mission',
    recipients: 'movement', classification: 'DIFFUSION RESTREINTE', urgency: 'ROUTINE',
    fields: [
      vesselField, { key: 'from', label: 'Mission du', type: 'date' }, { key: 'to', label: 'Au', type: 'date' },
      ...MISSION_CHAPTERS.map((c) => ({ key: `chap_${c.key}`, label: `Chapitre ${c.key} — ${c.title}`, type: 'textarea', hint: c.hint })),
    ],
    initial: () => ({ to: localISO() }),
    build: () => [],
  },
};

export const GROUPS = [
  { key: 'hebdo', title: 'Comptes rendus hebdomadaires', note: 'Destinataire : Base Navale' },
  { key: 'mouvement', title: 'Mouvement & position', note: 'Destinataires : COFONA – Base Navale' },
  { key: 'mission', title: 'En mission', note: 'Journalier et fin de mission' },
];

export const CLASSIFICATIONS = ['TRES SECRET', 'SECRET', 'SECRET CONFIDENTIEL', 'DIFFUSION RESTREINTE', 'NON CLASSE'];
export const URGENCIES = [['FLASH', 'Z : FLASH'], ['IMMEDIAT', 'O : IMMEDIAT'], ['URGENT', 'P : URGENT'], ['ROUTINE', 'R : ROUTINE'], ['PROJET', 'PROJET']];