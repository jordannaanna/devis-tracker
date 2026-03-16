import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Paramètres métier
  await prisma.params.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      ropMini: 0.02,
      ropCible: 0.06,
      seuilCorrectionRop: 0.5,
      facteurCorrectionRop: 100,
      relance1Jours: 30,
      relance2Jours: 45,
    },
  });

  // Utilisateurs
  const users = [
    { login: 'admin', password: 'admin123', nom: 'Durand', prenom: 'Admin', role: 'ADMIN' },
    { login: 'marco', password: 'marco123', nom: 'MARTIN', prenom: 'Marco', role: 'CHARGE_AFFAIRES' },
    { login: 'albert', password: 'albert123', nom: 'DUPONT', prenom: 'Albert', role: 'CHARGE_AFFAIRES' },
    { login: 'elodie', password: 'elodie123', nom: 'BERNARD', prenom: 'Elodie', role: 'CHARGE_AFFAIRES' },
    { login: 'direction', password: 'direction123', nom: 'Générale', prenom: 'Direction', role: 'DIRECTION' },
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { login: u.login },
      update: {},
      create: { ...u, password: hashed },
    });
  }
  console.log('✅ Utilisateurs créés');

  // Nettoyage des devis existants
  await prisma.devis.deleteMany();

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  // Devis de démonstration (inspirés du fichier Excel réel)
  const devisData = [
    {
      intitule: 'Prestation SECU / RP TEM durant les AT',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'HORS_MARCHE', atTem: 'TEM', cctp: 'AMCR', cctpNorm: 'AMCR',
      client: 'Adrien HONORE', createurNom: 'Marco', createurNorm: 'MARCO',
      numeroOffre: '6716', dateRemise: daysAgo(52), indice: 0,
      montant: 226488.96, rop: 0.06, statut: 'GAGNE',
      numeroCommande: '5925222000', dateDebut: daysAgo(300), dateFin: daysAgo(10),
      numeroPvReception: null, montantReceptionne: 62214.56,
      commentaire: 'Prestation longue durée TEM',
    },
    {
      intitule: 'Gardiennage de SAS à l\'EIE et accès secouru',
      site: 'NOGENT', siteNorm: 'NOGENT',
      typeOffre: 'HORS_MARCHE', atTem: 'AT1', cctp: 'ALOG', cctpNorm: 'ALOG',
      client: 'Carinne DEDELLA', createurNom: 'Mostafa', createurNorm: 'MOSTAFA',
      numeroOffre: '6937', dateRemise: daysAgo(52), indice: 0,
      montant: 50498.63, rop: 0.06, statut: 'PERDU',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Logistique - Remplacement détecteur 2RPN043',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'HORS_MARCHE', atTem: 'AT2', cctp: 'ALOG', cctpNorm: 'ALOG',
      client: 'Morad BOULHARTS', createurNom: 'Marco', createurNorm: 'MARCO',
      numeroOffre: '6999', dateRemise: daysAgo(52), indice: 0,
      montant: 4812.72, rop: 0.12, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Logistique - Remplacement détecteur 4RPN013',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'HORS_MARCHE', atTem: 'AT4', cctp: 'ALOG', cctpNorm: 'ALOG',
      client: 'Morad BOULHARTS', createurNom: 'Marco', createurNorm: 'MARCO',
      numeroOffre: '7006', dateRemise: daysAgo(52), indice: 0,
      montant: 9625.44, rop: 0.12, statut: 'GAGNE',
      numeroCommande: '1025054000', dateDebut: daysAgo(45), dateFin: daysAgo(44),
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Divers PTJ - Déplacement mobilier et petites réparations 2026',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'HORS_MARCHE', atTem: 'TEM', cctp: 'ALOG', cctpNorm: 'ALOG',
      client: 'Michel DENIS', createurNom: 'Cosi', createurNorm: 'COSI',
      numeroOffre: '7483', dateRemise: daysAgo(52), indice: 0,
      montant: 73606.89, rop: 0.05, statut: 'PERDU',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Contrat de maintenance préventive installations électriques',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'MARCHE', atTem: 'TEM', cctp: 'AMAN', cctpNorm: 'AMAN',
      client: 'EDF CNPE Cattenom', createurNom: 'Marco', createurNorm: 'MARCO',
      numeroOffre: '7681', dateRemise: daysAgo(52), indice: 0,
      montant: 96239.52, rop: 0.10, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: 'Offre marché - en attente retour client',
    },
    {
      intitule: 'Prestations de désamiantage bâtiment auxiliaire',
      site: 'FESSENHEIM', siteNorm: 'FESSENHEIM',
      typeOffre: 'HORS_MARCHE', atTem: 'TEM', cctp: 'LOT', cctpNorm: 'LOT',
      client: 'EDF CNPE Fessenheim', createurNom: 'Carine', createurNorm: 'CARINE',
      numeroOffre: '7743', dateRemise: daysAgo(52), indice: 0,
      montant: 75194.60, rop: 0.15, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Maintenance conditionnelle pompes primaires',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'MARCHE', atTem: 'AT3', cctp: 'AMAN', cctpNorm: 'AMAN',
      client: 'EDF SA', createurNom: 'Jean-luc', createurNorm: 'JEAN-LUC',
      numeroOffre: '7785', dateRemise: daysAgo(52), indice: 0,
      montant: 51365.66, rop: 0.10, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: 'Indice A - En cours de validation technique',
    },
    {
      intitule: 'Contrôle réglementaire échangeurs thermiques',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'MARCHE', atTem: 'AT4', cctp: 'ADHT', cctpNorm: 'ADHT',
      client: 'EDF CNPE Cattenom', createurNom: 'Albert', createurNorm: 'ALBERT',
      numeroOffre: '7612', dateRemise: daysAgo(52), indice: 0,
      montant: 3921.96, rop: 0.10, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Inspection réglementaire tuyauteries VD3',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'MARCHE', atTem: 'AT2', cctp: 'ADHT', cctpNorm: 'ADHT',
      client: 'EDF CNPE Cattenom', createurNom: 'Albert', createurNorm: 'ALBERT',
      numeroOffre: '7738', dateRemise: daysAgo(52), indice: 0,
      montant: 520.03, rop: 0.10, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Prestation peinture et revêtements sols galerie accessoire',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'HORS_MARCHE', atTem: 'AT4', cctp: 'ADHT', cctpNorm: 'ADHT',
      client: 'Michel BERTRAND', createurNom: 'Marco', createurNorm: 'MARCO',
      numeroOffre: '7934', dateRemise: daysAgo(51), indice: 0,
      montant: 882.00, rop: 0.10, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Opérations de manutention lourde réacteur 3',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'MARCHE', atTem: 'AT3', cctp: 'AMAN', cctpNorm: 'AMAN',
      client: 'EDF CNPE Cattenom', createurNom: 'Micha', createurNorm: 'MICHA',
      numeroOffre: '7867', dateRemise: daysAgo(52), indice: 0,
      montant: 29519.36, rop: 0.10, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Câblage et raccordement armoires électriques bâtiment diesel',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'MARCHE', atTem: 'AT2', cctp: 'AMAN', cctpNorm: 'AMAN',
      client: 'EDF CNPE Cattenom', createurNom: 'Micha', createurNorm: 'MICHA',
      numeroOffre: '7729', dateRemise: daysAgo(52), indice: 0,
      montant: 19516.80, rop: 0.10, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Support logistique AT CHOOZ B - Réacteur 1',
      site: 'CHOOZ B', siteNorm: 'CHOOZ B',
      typeOffre: 'MARCHE', atTem: 'AT1', cctp: 'ALOG', cctpNorm: 'ALOG',
      client: 'EDF CNPE Chooz', createurNom: 'Elodie', createurNorm: 'ELODIE',
      numeroOffre: '7820', dateRemise: daysAgo(30), indice: 0,
      montant: 42500.00, rop: 0.019, statut: 'GAGNE',
      numeroCommande: 'CMD-2026-0142', dateDebut: daysAgo(20), dateFin: daysAgo(5),
      numeroPvReception: 'PV-2026-0142', montantReceptionne: 42500.00,
      commentaire: 'Terminé. PV reçu.',
    },
    {
      intitule: 'Maintenance préventive systèmes de ventilation salle des machines',
      site: 'CHOOZ B', siteNorm: 'CHOOZ B',
      typeOffre: 'MARCHE', atTem: 'TEM', cctp: 'AMAN', cctpNorm: 'AMAN',
      client: 'EDF CNPE Chooz', createurNom: 'Elodie', createurNorm: 'ELODIE',
      numeroOffre: '7835', dateRemise: daysAgo(25), indice: 0,
      montant: 18750.00, rop: 0.019, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Contrat d\'astreinte et intervention rapide sécurité',
      site: 'CHOOZ A', siteNorm: 'CHOOZ A',
      typeOffre: 'MARCHE', atTem: 'TEM', cctp: 'AMCR', cctpNorm: 'AMCR',
      client: 'EDF CNPE Chooz A', createurNom: 'Albert', createurNorm: 'ALBERT',
      numeroOffre: '7856', dateRemise: daysAgo(20), indice: 0,
      montant: 89000.00, rop: 0.10, statut: 'GAGNE',
      numeroCommande: 'CMD-2026-0156', dateDebut: daysAgo(10), dateFin: null,
      numeroPvReception: null, montantReceptionne: 30000.00,
      commentaire: 'Commande reçue. Prestation en cours.',
    },
    {
      intitule: 'Prestation de nettoyage et décontamination zone contrôlée',
      site: 'NOGENT', siteNorm: 'NOGENT',
      typeOffre: 'HORS_MARCHE', atTem: 'TEM', cctp: 'ECCA', cctpNorm: 'ECCA',
      client: 'EDF CNPE Nogent', createurNom: 'Mostafa', createurNorm: 'MOSTAFA',
      numeroOffre: '7879', dateRemise: daysAgo(52), indice: 0,
      montant: 62758.08, rop: 0.05, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Instrumentation et mesure boucles primaires - VD4',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'MARCHE', atTem: 'AT4', cctp: 'ADHT', cctpNorm: 'ADHT',
      client: 'EDF CNPE Cattenom', createurNom: 'Albert', createurNorm: 'ALBERT',
      numeroOffre: '7910', dateRemise: daysAgo(15), indice: 0,
      montant: 45000.00, rop: 0.10, statut: 'GAGNE',
      numeroCommande: 'CMD-2026-0178', dateDebut: daysAgo(5), dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: 'Commande reçue. À démarrer.',
    },
    {
      intitule: 'Logistique spécialisée transfert déchets faiblement radioactifs',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'HORS_MARCHE', atTem: 'AT1', cctp: 'ALOG', cctpNorm: 'ALOG',
      client: 'ORANO Projets', createurNom: 'Jean-Luc', createurNorm: 'JEAN-LUC',
      numeroOffre: '7917', dateRemise: daysAgo(52), indice: 0,
      montant: 1252.80, rop: 0.10, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: null,
    },
    {
      intitule: 'Formation sécurité radioprotection N2E',
      site: 'CATTENOM', siteNorm: 'CATTENOM',
      typeOffre: 'HORS_MARCHE', atTem: 'TEM', cctp: 'AMCR', cctpNorm: 'AMCR',
      client: 'EDF RH Lorraine', createurNom: 'Elodie', createurNorm: 'ELODIE',
      numeroOffre: '7950', dateRemise: daysAgo(10), indice: 0,
      montant: 12500.00, rop: 0.15, statut: 'EN_ATTENTE',
      numeroCommande: null, dateDebut: null, dateFin: null,
      numeroPvReception: null, montantReceptionne: null,
      commentaire: 'En attente validation budget client',
    },
  ];

  for (const d of devisData) {
    await prisma.devis.create({ data: d });
  }

  console.log(`✅ ${devisData.length} devis créés`);
  console.log('');
  console.log('👤 Comptes de test :');
  console.log('   admin / admin123 (Administrateur)');
  console.log('   marco / marco123 (Chargé d\'affaires)');
  console.log('   direction / direction123 (Direction)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
