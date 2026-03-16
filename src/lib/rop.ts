/**
 * Logique ROP conforme au fichier Excel :
 * - Si ROP > seuil (défaut 0.50), appliquer correction : ROP / facteur (défaut 100)
 *   → Cas d'une saisie en % par erreur (ex : 6 au lieu de 0.06)
 * - Sinon, ROP_corr = ROP
 * - Marge potentielle = Montant × ROP_corr
 */
export function calcRopCorr(
  rop: number | null | undefined,
  seuil = 0.5,
  facteur = 100,
): number | null {
  if (rop === null || rop === undefined) return null;
  if (rop > seuil) return rop / facteur;
  return rop;
}

export function calcMargePot(
  montant: number,
  ropCorr: number | null,
): number | null {
  if (ropCorr === null) return null;
  return montant * ropCorr;
}

export function calcResteAFaire(
  montant: number,
  montantReceptionne: number | null | undefined,
): number {
  if (!montantReceptionne) return montant;
  return Math.max(0, montant - montantReceptionne);
}

export function calcAgeJours(dateRemise: Date | string): number {
  const remise = typeof dateRemise === 'string' ? new Date(dateRemise) : dateRemise;
  const diff = Date.now() - remise.getTime();
  return Math.floor(diff / 86400000);
}
