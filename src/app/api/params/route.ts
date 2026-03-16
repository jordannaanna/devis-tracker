import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import type { SessionData } from '@/types';

export async function GET() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const params = await prisma.params.findUnique({ where: { id: 1 } });
  return NextResponse.json(params);
}

export async function PUT(request: NextRequest) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Réservé admin' }, { status: 403 });

  const body = await request.json();
  const params = await prisma.params.upsert({
    where: { id: 1 },
    update: {
      ropMini: parseFloat(body.ropMini),
      ropCible: parseFloat(body.ropCible),
      seuilCorrectionRop: parseFloat(body.seuilCorrectionRop),
      facteurCorrectionRop: parseFloat(body.facteurCorrectionRop),
      relance1Jours: parseInt(body.relance1Jours),
      relance2Jours: parseInt(body.relance2Jours),
    },
    create: {
      id: 1,
      ropMini: parseFloat(body.ropMini),
      ropCible: parseFloat(body.ropCible),
      seuilCorrectionRop: parseFloat(body.seuilCorrectionRop),
      facteurCorrectionRop: parseFloat(body.facteurCorrectionRop),
      relance1Jours: parseInt(body.relance1Jours),
      relance2Jours: parseInt(body.relance2Jours),
    },
  });
  return NextResponse.json(params);
}
