// Periode de location et affichage du prix. Une location peut etre indiquee
// pour une duree personnalisee : un nombre (1 a 365) et une unite (jour,
// semaine, mois, annee). Ex. "25 000 FCFA/jour", "60 000 FCFA / 3 jours".
// Utilisable cote serveur comme cote navigateur.

export const PERIODES = [
  { value: 'mois', one: 'mois', many: 'mois', filter: 'Au mois' },
  { value: 'semaine', one: 'semaine', many: 'semaines', filter: 'À la semaine' },
  { value: 'jour', one: 'jour', many: 'jours', filter: 'À la journée' },
  { value: 'annee', one: 'an', many: 'ans', filter: "À l'année" }
];

export const DEFAULT_PERIODE = 'mois';
export const MAX_PERIODE_NOMBRE = 365;

export function normalizePeriode(value) {
  return PERIODES.some((p) => p.value === value) ? value : DEFAULT_PERIODE;
}

export function normalizePeriodeNombre(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 1 && n <= MAX_PERIODE_NOMBRE ? n : 1;
}

// "jour", "3 jours", "mois", "6 mois", "an", "2 ans"
export function describePeriode(periode, nombre) {
  const p = PERIODES.find((x) => x.value === normalizePeriode(periode));
  const n = normalizePeriodeNombre(nombre);
  return n === 1 ? p.one : `${n} ${p.many}`;
}

// Prix affiche : "150 000 FCFA/mois", "60 000 FCFA / 3 jours", ou
// "15 000 000 FCFA" pour une vente.
export function formatListingPrice(prix, type, periode, nombre) {
  const formatted = `${new Intl.NumberFormat('fr-FR').format(Number(prix) || 0)} FCFA`;
  if (type !== 'location') return formatted;
  return normalizePeriodeNombre(nombre) === 1
    ? `${formatted}/${describePeriode(periode, 1)}`
    : `${formatted} / ${describePeriode(periode, nombre)}`;
}
