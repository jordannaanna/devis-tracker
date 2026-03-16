import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import type { SessionData } from '@/types';

function buildWhere(params: URLSearchParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  const site = params.get('site');
  if (site && site !== 'Tous') where.siteNorm = site.toUpperCase();

  const cctp = params.get('cctp');
  if (cctp && cctp !== 'Tous') where.cctpNorm = cctp.toUpperCase();

  const atTem = params.get('atTem');
  if (atTem && atTem !== 'Tous') where.atTem = atTem;

  const createur = params.get('createur');
  if (createur && createur !== 'Tous') where.createurNorm = createur.toUpperCase();

  const statut = params.get('statut');
  if (statut && statut !== 'Tous') where.statut = statut;

  const typeOffre = params.get('typeOffre');
  if (typeOffre && typeOffre !== 'Tous') where.typeOffre = typeOffre;

  const mois = params.get('mois');
  if (mois) {
    const [year, month] = mois.split('-').map(Number);
    where.dateRemise = {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0, 23, 59, 59),
    };
  }

  const dateDebutFilter = params.get('dateDebut');
  const dateFinFilter = params.get('dateFin');
  if (dateDebutFilter || dateFinFilter) {
    where.dateRemise = {
      ...(dateDebutFilter ? { gte: new Date(dateDebutFilter) } : {}),
      ...(dateFinFilter ? { lte: new Date(dateFinFilter) } : {}),
    };
  }

  const search = params.get('search');
  if (search) {
    where.OR = [
      { intitule: { contains: search } },
      { numeroOffre: { contains: search } },
      { client: { contains: search } },
    ];
  }

  return where;
}

export async function GET(request: NextRequest) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const where = buildWhere(request.nextUrl.searchParams);

  const devis = await prisma.devis.findMany({
    where,
    orderBy: { dateRemise: 'desc' },
  });

  return NextResponse.json(devis);
}

export async function POST(request: NextRequest) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (session.user.role === 'DIRECTION') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();

    const devis = await prisma.devis.create({
      data: {
        intitule: body.intitule,
        site: body.site,
        siteNorm: body.site.toUpperCase(),
        typeOffre: body.typeOffre,
        atTem: body.atTem,
        cctp: body.cctp,
        cctpNorm: body.cctp.toUpperCase(),
        client: body.client || null,
        createurNom: body.createurNom,
        createurNorm: body.createurNom.toUpperCase(),
        userId: session.user.id,
        numeroOffre: body.numeroOffre,
        dateRemise: new Date(body.dateRemise),
        indice: parseInt(body.indice ?? '0') || 0,
        nombrePoints: body.nombrePoints ? parseFloat(body.nombrePoints) : null,
        montant: parseFloat(body.montant),
        rop: body.rop ? parseFloat(body.rop) : null,
        statut: body.statut ?? 'EN_ATTENTE',
        numeroCommande: body.numeroCommande || null,
        dateDebut: body.dateDebut ? new Date(body.dateDebut) : null,
        dateFin: body.dateFin ? new Date(body.dateFin) : null,
        numeroPvReception: body.numeroPvReception || null,
        montantReceptionne: body.montantReceptionne ? parseFloat(body.montantReceptionne) : null,
        commentaire: body.commentaire || null,
      },
    });

    return NextResponse.json(devis, { status: 201 });
  } catch (err) {
    console.error('Create devis error:', err);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
