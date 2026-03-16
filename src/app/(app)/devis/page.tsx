import { Suspense } from 'react';
import Link from 'next/link';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import FilterBar from '@/components/devis/FilterBar';
import DevisTable from '@/components/devis/DevisTable';
import type { SessionData, DevisRow } from '@/types';

interface SearchParams {
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

function buildFiltersUrl(searchParams: SearchParams): string {
  const p = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => { if (v) p.set(k, v); });
  return p.toString();
}

export default async function DevisListPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (searchParams.site && searchParams.site !== 'Tous') where.siteNorm = searchParams.site.toUpperCase();
  if (searchParams.cctp && searchParams.cctp !== 'Tous') where.cctpNorm = searchParams.cctp.toUpperCase();
  if (searchParams.atTem && searchParams.atTem !== 'Tous') where.atTem = searchParams.atTem;
  if (searchParams.createur && searchParams.createur !== 'Tous') where.createurNorm = searchParams.createur.toUpperCase();
  if (searchParams.statut && searchParams.statut !== 'Tous') where.statut = searchParams.statut;
  if (searchParams.typeOffre && searchParams.typeOffre !== 'Tous') where.typeOffre = searchParams.typeOffre;
  if (searchParams.mois) {
    const [y, m] = searchParams.mois.split('-').map(Number);
    where.dateRemise = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59) };
  }
  if (searchParams.search) {
    where.OR = [
      { intitule: { contains: searchParams.search } },
      { numeroOffre: { contains: searchParams.search } },
      { client: { contains: searchParams.search } },
    ];
  }

  const rawDevis = await prisma.devis.findMany({ where, orderBy: { dateRemise: 'desc' } });
  const devis = rawDevis.map((d) => ({
    ...d,
    dateRemise: d.dateRemise.toISOString(),
    dateDebut: d.dateDebut?.toISOString() ?? null,
    dateFin: d.dateFin?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  })) as DevisRow[];

  const canEdit = session.user?.role !== 'DIRECTION';
  const filtersUrl = buildFiltersUrl(searchParams);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <p className="text-sm text-gray-500 mt-0.5">{devis.length} devis trouvés</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/export${filtersUrl ? '?' + filtersUrl : ''}`}
            className="btn-secondary"
          >
            ↓ Export CSV
          </a>
          {canEdit && (
            <Link href="/devis/nouveau" className="btn-primary">
              + Nouveau devis
            </Link>
          )}
        </div>
      </div>

      <Suspense>
        <FilterBar />
      </Suspense>

      <DevisTable devis={devis} canEdit={canEdit} />
    </div>
  );
}
