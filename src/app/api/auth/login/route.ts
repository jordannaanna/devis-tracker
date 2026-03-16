import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import type { SessionData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json({ error: 'Identifiants requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { login } });

    if (!user || !user.actif) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.user = {
      id: user.id,
      login: user.login,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role as 'ADMIN' | 'CHARGE_AFFAIRES' | 'DIRECTION',
    };
    await session.save();

    return NextResponse.json({ ok: true, user: session.user });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
