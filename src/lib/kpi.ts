import type { DevisRow, KpiData } from '@/types';
import { calcRopCorr, calcMargePot, calcAgeJours } from './rop';

export function computeKpis(
  devis: DevisRow[],
  relance1 = 30,
  relance2 = 45,
  seuilRop = 0.5,
  facteurRop = 100,
): KpiData {
  const today = new Date();

  const gagne = devis.filter((d) => d.statut === 'GAGNE');
  const perdu = devis.filter((d) => d.statut === 'PERDU');
  const enAttente = devis.filter((d) =>
    ['ENVOYE', 'EN_ATTENTE', 'COMMANDE_RECUE', 'EN_COURS'].includes(d.statut),
  );
  const decides = [...gagne, ...perdu];

  const totalMontant = devis.reduce((s, d) => s + d.montant, 0);
  const montantGagne = gagne.reduce((s, d) => s + d.montant, 0);
  const montantPerdu = perdu.reduce((s, d) => s + d.montant, 0);
  const montantAttente = enAttente.reduce((s, d) => s + d.montant, 0);

  const enAttenteFiltre = devis.filter((d) =>
    ['ENVOYE', 'EN_ATTENTE'].includes(d.statut),
  );
  const relance1List = enAttenteFiltre.filter(
    (d) => calcAgeJours(d.dateRemise) > relance1,
  );
  const relance2List = enAttenteFiltre.filter(
    (d) => calcAgeJours(d.dateRemise) > relance2,
  );

  const tauxDecision = devis.length > 0 ? decides.length / devis.length : 0;
  const tauxGainNb = decides.length > 0 ? gagne.length / decides.length : 0;
  const tauxGainVal =
    montantGagne + montantPerdu > 0
      ? montantGagne / (montantGagne + montantPerdu)
      : 0;

  const avecRop = devis.filter((d) => d.rop !== null);
  const ropMoyen = avecRop.length > 0
    ? avecRop.reduce((s, d) => s + (d.rop ?? 0), 0) / avecRop.length
    : 0;

  const margePotConsolidee = devis.reduce((s, d) => {
    const rc = calcRopCorr(d.rop, seuilRop, facteurRop);
    const mp = calcMargePot(d.montant, rc);
    return s + (mp ?? 0);
  }, 0);

  const montantReceptionne = devis.reduce(
    (s, d) => s + (d.montantReceptionne ?? 0),
    0,
  );
  const resteAFaireTotal = devis.reduce((s, d) => {
    const raf = d.montantReceptionne !== null
      ? Math.max(0, d.montant - (d.montantReceptionne ?? 0))
      : d.montant;
    return s + raf;
  }, 0);

  // Breakdown par site
  const sitesUniques = [...new Set(devis.map((d) => d.siteNorm))];
  const parSite = sitesUniques.map((site) => {
    const rows = devis.filter((d) => d.siteNorm === site);
    return {
      site: rows[0]?.site ?? site,
      nbOffres: rows.length,
      nbGagne: rows.filter((d) => d.statut === 'GAGNE').length,
      nbPerdu: rows.filter((d) => d.statut === 'PERDU').length,
      nbEnAttente: rows.filter((d) => ['ENVOYE', 'EN_ATTENTE'].includes(d.statut)).length,
      montant: rows.reduce((s, d) => s + d.montant, 0),
      montantGagne: rows.filter((d) => d.statut === 'GAGNE').reduce((s, d) => s + d.montant, 0),
    };
  });

  // Breakdown par CCTP
  const cctpsUniques = [...new Set(devis.map((d) => d.cctpNorm))];
  const parCctp = cctpsUniques.map((cctp) => {
    const rows = devis.filter((d) => d.cctpNorm === cctp);
    const avecRopCctp = rows.filter((d) => d.rop !== null);
    return {
      cctp: rows[0]?.cctp ?? cctp,
      nbOffres: rows.length,
      nbGagne: rows.filter((d) => d.statut === 'GAGNE').length,
      montantGagne: rows.filter((d) => d.statut === 'GAGNE').reduce((s, d) => s + d.montant, 0),
      ropMoyen: avecRopCctp.length > 0
        ? avecRopCctp.reduce((s, d) => s + (d.rop ?? 0), 0) / avecRopCctp.length
        : 0,
    };
  });

  // Breakdown par créateur
  const createursUniques = [...new Set(devis.map((d) => d.createurNom))];
  const parCreateur = createursUniques.map((c) => {
    const rows = devis.filter((d) => d.createurNom === c);
    return {
      createur: c,
      nbOffres: rows.length,
      nbGagne: rows.filter((d) => d.statut === 'GAGNE').length,
      montantGagne: rows.filter((d) => d.statut === 'GAGNE').reduce((s, d) => s + d.montant, 0),
    };
  }).sort((a, b) => b.montantGagne - a.montantGagne);

  // Totaux heures
  const totalHeures = devis.reduce((s, d) => s + (d.nombreHeures ?? 0), 0);

  // Breakdown par mois
  const moisMap = new Map<string, { nbOffres: number; montant: number; montantGagne: number; margePot: number; heures: number }>();
  devis.forEach((d) => {
    const date = new Date(d.dateRemise);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = moisMap.get(key) ?? { nbOffres: 0, montant: 0, montantGagne: 0, margePot: 0, heures: 0 };
    const rc = calcRopCorr(d.rop, seuilRop, facteurRop);
    const mp = calcMargePot(d.montant, rc) ?? 0;
    moisMap.set(key, {
      nbOffres: existing.nbOffres + 1,
      montant: existing.montant + d.montant,
      montantGagne: existing.montantGagne + (d.statut === 'GAGNE' ? d.montant : 0),
      margePot: existing.margePot + mp,
      heures: existing.heures + (d.nombreHeures ?? 0),
    });
  });
  const parMois = [...moisMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mois, vals]) => ({ mois, ...vals }));

  // Heures par mois (avec heures gagnées)
  const heuresParMois = parMois.map((m) => ({
    mois: m.mois,
    heures: m.heures,
    heuresGagne: devis
      .filter((d) => {
        const date = new Date(d.dateRemise);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === m.mois && d.statut === 'GAGNE';
      })
      .reduce((s, d) => s + (d.nombreHeures ?? 0), 0),
  }));

  // Heures par site
  const heuresParSite = sitesUniques.map((site) => ({
    site: devis.find((d) => d.siteNorm === site)?.site ?? site,
    heures: devis.filter((d) => d.siteNorm === site).reduce((s, d) => s + (d.nombreHeures ?? 0), 0),
  })).filter((r) => r.heures > 0).sort((a, b) => b.heures - a.heures);

  // Heures par CCTP
  const heuresParCctp = cctpsUniques.map((cctp) => ({
    cctp: devis.find((d) => d.cctpNorm === cctp)?.cctp ?? cctp,
    heures: devis.filter((d) => d.cctpNorm === cctp).reduce((s, d) => s + (d.nombreHeures ?? 0), 0),
  })).filter((r) => r.heures > 0).sort((a, b) => b.heures - a.heures);

  // Heures par créateur
  const heuresParCreateur = createursUniques.map((c) => ({
    createur: c,
    heures: devis.filter((d) => d.createurNom === c).reduce((s, d) => s + (d.nombreHeures ?? 0), 0),
  })).filter((r) => r.heures > 0).sort((a, b) => b.heures - a.heures);

  return {
    nbOffres: devis.length,
    nbGagne: gagne.length,
    nbPerdu: perdu.length,
    nbEnAttente: enAttente.length,
    nbDecides: decides.length,
    totalMontant,
    montantGagne,
    montantPerdu,
    montantAttente,
    tauxDecision,
    tauxGainNb,
    tauxGainVal,
    nbRelance1: relance1List.length,
    nbRelance2: relance2List.length,
    montantRelance1: relance1List.reduce((s, d) => s + d.montant, 0),
    montantRelance2: relance2List.reduce((s, d) => s + d.montant, 0),
    nbAvecCommande: devis.filter((d) => d.numeroCommande).length,
    nbSansCommande: gagne.filter((d) => !d.numeroCommande).length,
    nbAvecPv: devis.filter((d) => d.numeroPvReception).length,
    montantReceptionne,
    resteAFaireTotal,
    ropMoyen,
    margePotConsolidee,
    totalHeures,
    parSite,
    parCctp,
    parCreateur,
    parMois,
    heuresParMois,
    heuresParSite,
    heuresParCctp,
    heuresParCreateur,
  };
}
