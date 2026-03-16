import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions } from '@/lib/session';
import DevisForm from '@/components/devis/DevisForm';
import type { SessionData } from '@/types';

export default async function NouveauDevisPage() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (session.user?.role === 'DIRECTION') {
    redirect('/devis');
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
        <p className="text-sm text-gray-500 mt-0.5">Créer une nouvelle offre</p>
      </div>
      <DevisForm mode="create" />
    </div>
  );
}
