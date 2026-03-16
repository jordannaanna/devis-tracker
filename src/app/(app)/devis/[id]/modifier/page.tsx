import { notFound, redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import DevisForm from '@/components/devis/DevisForm';
import type { SessionData, DevisRow } from '@/types';

export default async function ModifierDevisPage({ params }: { params: { id: string } }) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (session.user?.role === 'DIRECTION') {
    redirect('/devis');
  }

  const devis = await prisma.devis.findUnique({ where: { id: parseInt(params.id) } });
  if (!devis) notFound();

  const devisRow: DevisRow = {
    ...devis,
    dateRemise: devis.dateRemise.toISOString(),
    dateDebut: devis.dateDebut?.toISOString() ?? null,
    dateFin: devis.dateFin?.toISOString() ?? null,
    createdAt: devis.createdAt.toISOString(),
    updatedAt: devis.updatedAt.toISOString(),
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modifier le devis</h1>
        <p className="text-sm text-gray-500 mt-0.5">N° {devis.numeroOffre} — {devis.intitule.slice(0, 60)}{devis.intitule.length > 60 ? '…' : ''}</p>
      </div>
      <DevisForm mode="edit" initial={devisRow} />
    </div>
  );
}
