import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import type { SessionData } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const id = parseInt(params.id);
  const devis = await prisma.devis.findUnique({ where: { id } });
  if (!devis) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  return NextResponse.json(devis);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (session.user.role === 'DIRECTION') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  const id = parseInt(params.id);

  try {
    const body = await request.json();

    const devis = await prisma.devis.update({
      where: { id },
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
        numeroOffre: body.numeroOffre,
        dateRemise: new Date(body.dateRemise),
        indice: parseInt(body.indice ?? '0') || 0,
        nombrePoints: body.nombrePoints ? parseFloat(body.nombrePoints) : null,
        montant: parseFloat(body.montant),
        rop: body.rop ? parseFloat(body.rop) : null,
        statut: body.statut,
        numeroCommande: body.numeroCommande || null,
        dateDebut: body.dateDebut ? new Date(body.dateDebut) : null,
        dateFin: body.dateFin ? new Date(body.dateFin) : null,
        numeroPvReception: body.numeroPvReception || null,
        montantReceptionne: body.montantReceptionne ? parseFloat(body.montantReceptionne) : null,
        commentaire: body.commentaire || null,
      },
    });

    return NextResponse.json(devis);
  } catch (err) {
    console.error('Update devis error:', err);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (session.user.role === 'DIRECTION') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  const id = parseInt(params.id);

  try {
    await prisma.devis.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Delete devis error:', err);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
