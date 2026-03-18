import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import { computeKpis } from '@/lib/kpi';
import { formatMontant, formatPourcent, formatMois } from '@/lib/format';
import KpiCard from '@/components/ui/KpiCard';
import RelancesBlock from '@/components/dashboard/RelancesBlock';
import BarChart from '@/components/dashboard/BarChart';
import FilterBar from '@/components/devis/FilterBar';
import type { SessionData, DevisRow } from '@/types';

interface SearchParams {
  site?: string;
  cctp?: string;
  atTem?: string;
  createur?: string;
  mois?: string;
  typeOffre?: string;
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const params = await prisma.params.findUnique({ where: { id: 1 } });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (searchParams.site && searchParams.site !== 'Tous') where.siteNorm = searchParams.site.toUpperCase();
  if (searchParams.cctp && searchParams.cctp !== 'Tous') where.cctpNorm = searchParams.cctp.toUpperCase();
  if (searchParams.atTem && searchParams.atTem !== 'Tous') where.atTem = searchParams.atTem;
  if (searchParams.createur && searchParams.createur !== 'Tous') where.createurNorm = searchParams.createur.toUpperCase();
  if (searchParams.mois) {
    const [y, m] = searchParams.mois.split('-').map(Number);
    where.dateRemise = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59) };
  }
  if (searchParams.typeOffre && searchParams.typeOffre !== 'Tous') where.typeOffre = searchParams.typeOffre;

  const rawDevis = await prisma.devis.findMany({ where, orderBy: { dateRemise: 'desc' } });
  const devis = rawDevis.map((d) => ({
    ...d,
    dateRemise: d.dateRemise.toISOString(),
    dateDebut: d.dateDebut?.toISOString() ?? null,
    dateFin: d.dateFin?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  })) as DevisRow[];

  const kpi = computeKpis(
    devis,
    params?.relance1Jours ?? 30,
    params?.relance2Jours ?? 45,
    params?.seuilCorrectionRop ?? 0.5,
    params?.facteurCorrectionRop ?? 100,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vue consolidée des offres — {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Filtres */}
      <FilterBar showStatut={false} showSearch={false} />

      {/* KPI Row 1 : Volumes */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Volumes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <KpiCard label="Nb offres" value={kpi.nbOffres} sub={`${kpi.nbDecides} décidées`} />
          <KpiCard label="Montant total devisé" value={formatMontant(kpi.totalMontant)} color="blue" />
          <KpiCard label="Montant gagné" value={formatMontant(kpi.montantGagne)} color="green" sub={`${kpi.nbGagne} offres`} />
          <KpiCard label="Montant en attente" value={formatMontant(kpi.montantAttente)} color="amber" sub={`${kpi.nbEnAttente} offres`} />
          <KpiCard label="Montant perdu" value={formatMontant(kpi.montantPerdu)} color="red" sub={`${kpi.nbPerdu} offres`} />
        </div>
      </div>

      {/* KPI Row 2 : Taux */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <KpiCard label="Taux de décision" value={formatPourcent(kpi.tauxDecision)} sub={`${kpi.nbDecides}/${kpi.nbOffres}`} />
          <KpiCard label="Taux de gain (nb)" value={formatPourcent(kpi.tauxGainNb)} color="green" sub={`${kpi.nbGagne}/${kpi.nbDecides}`} />
          <KpiCard label="Taux de gain (val)" value={formatPourcent(kpi.tauxGainVal)} color="green" />
          <KpiCard label="ROP moyen" value={formatPourcent(kpi.ropMoyen)} color="blue" />
          <KpiCard label="Marge pot. consolidée" value={formatMontant(kpi.margePotConsolidee)} color="purple" />
        </div>
      </div>

      {/* KPI Row 3 : Suivi */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Suivi commandes & réception</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <KpiCard label="Avec commande reçue" value={kpi.nbAvecCommande} color="blue" />
          <KpiCard label="Gagnés sans commande" value={kpi.nbSansCommande} color="amber" />
          <KpiCard label="Avec PV reçu" value={kpi.nbAvecPv} color="green" />
          <KpiCard label="Montant réceptionné" value={formatMontant(kpi.montantReceptionne)} color="green" />
          <KpiCard label="Reste à faire total" value={formatMontant(kpi.resteAFaireTotal)} color="blue" />
        </div>
      </div>

      {/* KPI Row 4 : Heures vendues */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Heures vendues</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <KpiCard label="Total heures vendues" value={`${kpi.totalHeures.toLocaleString('fr-FR')} h`} color="blue" />
        </div>
      </div>

      {/* Tableau heures par mois */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Heures vendues par mois</h3>
        {kpi.heuresParMois.filter((m) => m.heures > 0).length === 0 ? (
          <p className="text-sm text-gray-400">Aucune heure renseignée</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                <th className="px-2 py-2 text-left">Mois</th>
                <th className="px-2 py-2 text-right">Heures vendues</th>
                <th className="px-2 py-2 text-right">dont Gagnées</th>
                <th className="px-2 py-2 text-right">% Gagnées</th>
              </tr>
            </thead>
            <tbody>
              {kpi.heuresParMois.filter((m) => m.heures > 0).map((row) => (
                <tr key={row.mois} className="table-row">
                  <td className="table-cell font-medium">{formatMois(row.mois)}</td>
                  <td className="table-cell text-right font-semibold">{row.heures.toLocaleString('fr-FR')} h</td>
                  <td className="table-cell text-right text-green-700">{row.heuresGagne.toLocaleString('fr-FR')} h</td>
                  <td className="table-cell text-right text-gray-500">
                    {row.heures > 0 ? `${Math.round((row.heuresGagne / row.heures) * 100)} %` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Heures par site / CCTP / créateur */}
      {kpi.totalHeures > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-5">
            <h3 className="section-title mb-4">Heures par site</h3>
            <BarChart
              items={kpi.heuresParSite.map((r) => ({ label: r.site, value: r.heures, color: 'bg-blue-400' }))}
              formatValue={(v) => `${v.toLocaleString('fr-FR')} h`}
            />
          </div>
          <div className="card p-5">
            <h3 className="section-title mb-4">Heures par CCTP</h3>
            <BarChart
              items={kpi.heuresParCctp.map((r) => ({ label: r.cctp, value: r.heures, color: 'bg-indigo-400' }))}
              formatValue={(v) => `${v.toLocaleString('fr-FR')} h`}
            />
          </div>
          <div className="card p-5">
            <h3 className="section-title mb-4">Heures par créateur</h3>
            <BarChart
              items={kpi.heuresParCreateur.map((r) => ({ label: r.createur, value: r.heures, color: 'bg-purple-400' }))}
              formatValue={(v) => `${v.toLocaleString('fr-FR')} h`}
            />
          </div>
        </div>
      )}

      {/* KPI Row 6 : Relances */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Alertes relances</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label={`En attente > ${params?.relance1Jours ?? 30}j`}
            value={kpi.nbRelance1}
            color="amber"
            sub={formatMontant(kpi.montantRelance1)}
          />
          <KpiCard
            label={`En attente > ${params?.relance2Jours ?? 45}j — URGENT`}
            value={kpi.nbRelance2}
            color="red"
            sub={formatMontant(kpi.montantRelance2)}
          />
        </div>
      </div>

      {/* Blocs analytiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Relances prioritaires */}
        <RelancesBlock
          devis={devis}
          relance1={params?.relance1Jours ?? 30}
          relance2={params?.relance2Jours ?? 45}
        />

        {/* Par site */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Par site</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                <th className="px-2 py-2 text-left">Site</th>
                <th className="px-2 py-2 text-right">Offres</th>
                <th className="px-2 py-2 text-right">Gagnées</th>
                <th className="px-2 py-2 text-right">Attente</th>
                <th className="px-2 py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {kpi.parSite.map((row) => (
                <tr key={row.site} className="table-row">
                  <td className="table-cell font-medium">{row.site}</td>
                  <td className="table-cell text-right">{row.nbOffres}</td>
                  <td className="table-cell text-right text-green-700 font-medium">{row.nbGagne}</td>
                  <td className="table-cell text-right text-amber-700">{row.nbEnAttente}</td>
                  <td className="table-cell text-right font-semibold">{formatMontant(row.montant)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Par CCTP */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Montant gagné par CCTP</h3>
          <BarChart
            items={kpi.parCctp
              .sort((a, b) => b.montantGagne - a.montantGagne)
              .map((c) => ({ label: c.cctp, value: c.montantGagne, color: 'bg-green-500' }))}
            formatValue={formatMontant}
          />
        </div>

        {/* Par mois */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Montant devisé par mois</h3>
          {kpi.parMois.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune donnée</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="table-head">
                  <th className="px-2 py-2 text-left">Mois</th>
                  <th className="px-2 py-2 text-right">Offres</th>
                  <th className="px-2 py-2 text-right">Montant</th>
                  <th className="px-2 py-2 text-right">Gagné</th>
                  <th className="px-2 py-2 text-right">Marge pot.</th>
                </tr>
              </thead>
              <tbody>
                {kpi.parMois.map((row) => (
                  <tr key={row.mois} className="table-row">
                    <td className="table-cell font-medium">{formatMois(row.mois)}</td>
                    <td className="table-cell text-right">{row.nbOffres}</td>
                    <td className="table-cell text-right">{formatMontant(row.montant)}</td>
                    <td className="table-cell text-right text-green-700">{formatMontant(row.montantGagne)}</td>
                    <td className="table-cell text-right text-purple-700">{formatMontant(row.margePot)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Par créateur */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Performance par créateur</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                <th className="px-2 py-2 text-left">Créateur</th>
                <th className="px-2 py-2 text-right">Offres</th>
                <th className="px-2 py-2 text-right">Gagnées</th>
                <th className="px-2 py-2 text-right">Montant gagné</th>
              </tr>
            </thead>
            <tbody>
              {kpi.parCreateur.map((row) => (
                <tr key={row.createur} className="table-row">
                  <td className="table-cell font-medium">{row.createur}</td>
                  <td className="table-cell text-right">{row.nbOffres}</td>
                  <td className="table-cell text-right text-green-700 font-medium">{row.nbGagne}</td>
                  <td className="table-cell text-right font-semibold">{formatMontant(row.montantGagne)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {session?.user?.role !== 'CHARGE_AFFAIRES' && (
        <div className="text-xs text-gray-400 text-right">
          Connecté en tant que {session?.user?.prenom} {session?.user?.nom} ({session?.user?.role})
        </div>
      )}
    </div>
  );
}
