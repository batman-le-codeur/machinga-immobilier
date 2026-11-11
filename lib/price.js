// Periode de location (prix par jour, par semaine ou par mois) et affichage
// du prix. Utilisable cote serveur comme cote navigateur.

export const PERIODES = [
  { value: 'mois', label: 'Par mois', suffix: 'mois' },
  { value: 'semaine', label: 'Par semaine', suffix: 'semaine' },
  { value: 'jour', label: 'Par jour', suffix: 'jour' }
];

export const DEFAULT_PERIODE = 'mois';

export function normalizePeriode(value) {
  return PERIODES.some((p) => p.value === value) ? value : DEFAULT_PERIODE;
}

// Prix affiche : "150 000 FCFA/mois", "25 000 FCFA/jour", ou "15 000 000 FCFA" pour une vente.
export function formatListingPrice(prix, type, periode) {
  const formatted = `${new Intl.NumberFormat('fr-FR').format(Number(prix) || 0)} FCFA`;
  if (type !== 'location') return formatted;
  const p = PERIODES.find((x) => x.value === normalizePeriode(periode));
  return `${formatted}/${p.suffix}`;
}
