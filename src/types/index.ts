export type UserRole = 'ADMIN' | 'CHARGE_AFFAIRES' | 'DIRECTION';

export type StatutDevis =
  | 'ENVOYE'
  | 'EN_ATTENTE'
  | 'GAGNE'
  | 'PERDU'
  | 'COMMANDE_RECUE'
  | 'EN_COURS'
  | 'TERMINE'
  | 'PV_RECU'
  | 'CLOS';

export type TypeOffre = 'MARCHE' | 'HORS_MARCHE';

export interface SessionUser {
  id: number;
  login: string;
  nom: string;
  prenom: string;
  role: UserRole;
}

export interface SessionData {
  user?: SessionUser;
}

export interface DevisRow {
  id: number;
  intitule: string;
  site: string;
  siteNorm: string;
  typeOffre: string;
  atTem: string;
  cctp: string;
  cctpNorm: string;
  client: string | null;
  createurNom: string;
  createurNorm: string;
  userId: number | null;
  numeroOffre: string;
  dateRemise: string;
  indice: number;
  nombrePoints: number | null;
  montant: number;
  rop: number | null;
  statut: string;
  numeroCommande: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  numeroPvReception: string | null;
  montantReceptionne: number | null;
  nombreHeures: number | null;
  commentaire: string | null;
  createdAt: string;
  updatedAt: string;
  // Champs calculés (côté client)
  ropCorr?: number | null;
  margePot?: number | null;
  resteAFaire?: number;
  ageJours?: number;
}

export interface KpiData {
  nbOffres: number;
  nbGagne: number;
  nbPerdu: number;
  nbEnAttente: number;
  nbDecides: number;
  totalMontant: number;
  montantGagne: number;
  montantPerdu: number;
  montantAttente: number;
  tauxDecision: number;
  tauxGainNb: number;
  tauxGainVal: number;
  nbRelance1: number;
  nbRelance2: number;
  montantRelance1: number;
  montantRelance2: number;
  nbAvecCommande: number;
  nbSansCommande: number;
  nbAvecPv: number;
  montantReceptionne: number;
  resteAFaireTotal: number;
  ropMoyen: number;
  margePotConsolidee: number;
  // Breakdowns
  parSite: Array<{ site: string; nbOffres: number; nbGagne: number; nbPerdu: number; nbEnAttente: number; montant: number; montantGagne: number }>;
  parCctp: Array<{ cctp: string; nbOffres: number; nbGagne: number; montantGagne: number; ropMoyen: number }>;
  parCreateur: Array<{ createur: string; nbOffres: number; nbGagne: number; montantGagne: number }>;
  parMois: Array<{ mois: string; nbOffres: number; montant: number; montantGagne: number; margePot: number; heures: number }>;
  totalHeures: number;
  heuresParMois: Array<{ mois: string; heures: number; heuresGagne: number }>;
  heuresParSite: Array<{ site: string; heures: number }>;
  heuresParCctp: Array<{ cctp: string; heures: number }>;
  heuresParCreateur: Array<{ createur: string; heures: number }>;
}

export interface FiltresDevis {
  search?: string;
  site?: string;
  cctp?: string;
  atTem?: string;
  createur?: string;
  statut?: string;
  typeOffre?: string;
  mois?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ParamsMetier {
  id: number;
  ropMini: number;
  ropCible: number;
  seuilCorrectionRop: number;
  facteurCorrectionRop: number;
  relance1Jours: number;
  relance2Jours: number;
}
