export const SITES = ['CATTENOM', 'CHOOZ A', 'CHOOZ B', 'FESSENHEIM', 'NOGENT'] as const;

export const CCTP_LIST = ['ADHT', 'ALOG', 'AMAN', 'AMCR', 'ECCA', 'LOT', 'MAINTENANCE'] as const;

export const AT_TEM_LIST = ['AT1', 'AT2', 'AT3', 'AT4', 'TEM'] as const;

export const CREATEURS = [
  'Albert', 'Anthony', 'Baptiste', 'Benjamin', 'Carine', 'Cosi',
  'Dylan', 'Elodie', 'Florian', 'Jean-Luc', 'Marco', 'Micha',
  'Mostafa', 'Sébastien',
] as const;

export const TYPES_OFFRE: Record<string, string> = {
  MARCHE: 'Marché de base',
  HORS_MARCHE: 'Hors marché',
};

export const STATUTS: Record<string, string> = {
  ENVOYE: 'Envoyé',
  EN_ATTENTE: 'En attente',
  GAGNE: 'Gagné',
  PERDU: 'Perdu',
  COMMANDE_RECUE: 'Commande reçue',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  PV_RECU: 'PV reçu',
  CLOS: 'Clos',
};

export const STATUT_COLORS: Record<string, string> = {
  ENVOYE: 'bg-blue-100 text-blue-800',
  EN_ATTENTE: 'bg-amber-100 text-amber-800',
  GAGNE: 'bg-green-100 text-green-800',
  PERDU: 'bg-red-100 text-red-800',
  COMMANDE_RECUE: 'bg-indigo-100 text-indigo-800',
  EN_COURS: 'bg-violet-100 text-violet-800',
  TERMINE: 'bg-purple-100 text-purple-800',
  PV_RECU: 'bg-teal-100 text-teal-800',
  CLOS: 'bg-gray-100 text-gray-600',
};

export const STATUTS_ACTIFS = ['ENVOYE', 'EN_ATTENTE', 'GAGNE', 'COMMANDE_RECUE', 'EN_COURS'];

export const ROLES: Record<string, string> = {
  ADMIN: 'Administrateur',
  CHARGE_AFFAIRES: 'Chargé d\'affaires',
  DIRECTION: 'Direction',
};
