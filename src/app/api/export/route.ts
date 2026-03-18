import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import { calcRopCorr, calcMargePot, calcResteAFaire, calcAgeJours } from '@/lib/rop';
import { STATUTS, TYPES_OFFRE } from '@/lib/constants';
import type { SessionData } from '@/types';

function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const str = cell ?? '';
          if (str.includes(';') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(';'),
    )
    .join('\n');
}

export async function GET(request: NextRequest) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  // Mêmes filtres que la liste
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  const p = request.nextUrl.searchParams;
  const site = p.get('site');
  if (site && site !== 'Tous') where.siteNorm = site.toUpperCase();
  const cctp = p.get('cctp');
  if (cctp && cctp !== 'Tous') where.cctpNorm = cctp.toUpperCase();
  const atTem = p.get('atTem');
  if (atTem && atTem !== 'Tous') where.atTem = atTem;
  const createur = p.get('createur');
  if (createur && createur !== 'Tous') where.createurNorm = createur.toUpperCase();
  const statut = p.get('statut');
  if (statut && statut !== 'Tous') where.statut = statut;
  const typeOffre = p.get('typeOffre');
  if (typeOffre && typeOffre !== 'Tous') where.typeOffre = typeOffre;

  const devis = await prisma.devis.findMany({ where, orderBy: { dateRemise: 'desc' } });

  const params = await prisma.params.findUnique({ where: { id: 1 } });
  const seuil = params?.seuilCorrectionRop ?? 0.5;
  const facteur = params?.facteurCorrectionRop ?? 100;

  const header = [
    'N° Offre', 'Intitulé', 'Site', 'Type', 'AT/TEM', 'CCTP', 'Client', 'Créateur',
    'Date remise', 'Indice', 'Nb Points', 'Montant (€)', 'ROP', 'ROP corr.', 'Marge pot. (€)',
    'Nb Heures vendues', 'Statut', 'N° Commande', 'Date début', 'Date fin', 'N° PV',
    'Montant réc. (€)', 'Reste à faire (€)', 'Âge (j)', 'Commentaire',
  ];

  const rows = devis.map((d) => {
    const ropCorr = calcRopCorr(d.rop, seuil, facteur);
    const margePot = calcMargePot(d.montant, ropCorr);
    const raf = calcResteAFaire(d.montant, d.montantReceptionne);
    const age = calcAgeJours(d.dateRemise);
    const fmt = (d: Date | null) => d ? new Intl.DateTimeFormat('fr-FR').format(d) : '';
    return [
      d.numeroOffre,
      d.intitule,
      d.site,
      TYPES_OFFRE[d.typeOffre] ?? d.typeOffre,
      d.atTem,
      d.cctp,
      d.client ?? '',
      d.createurNom,
      fmt(d.dateRemise),
      String(d.indice),
      d.nombrePoints ? String(d.nombrePoints) : '',
      d.montant.toFixed(2),
      d.rop ? d.rop.toFixed(4) : '',
      ropCorr ? ropCorr.toFixed(4) : '',
      margePot ? margePot.toFixed(2) : '',
      d.nombreHeures ? String(d.nombreHeures) : '',
      STATUTS[d.statut] ?? d.statut,
      d.numeroCommande ?? '',
      fmt(d.dateDebut),
      fmt(d.dateFin),
      d.numeroPvReception ?? '',
      d.montantReceptionne ? d.montantReceptionne.toFixed(2) : '',
      raf.toFixed(2),
      String(age),
      d.commentaire ?? '',
    ];
  });

  const csv = '\uFEFF' + toCsv([header, ...rows]);
  const filename = `devis-export-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
