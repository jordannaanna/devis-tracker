import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import { computeKpis } from '@/lib/kpi';
import { formatMontant, formatPourcent, formatMois } from '@/lib/format';
import KpiCard from '@/components/ui/KpiCard';
import BarChart from '@/components/dashboard/BarChart';
import type { SessionData, DevisRow } from '@/types';

export default async function DirectionPage() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (session.user?.role === 'CHARGE_AFFAIRES') {
    redirect('/dashboard');
  }

  const rawDevis = await prisma.devis.findMany({ orderBy: { dateRemise: 'desc' } });
  const params = await prisma.params.findUnique({ where: { id: 1 } });

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
    <div className="p-6 space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Vue Direction</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Synthèse consolidée — Lecture seule — Généré le {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* KPIs synthétiques */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Vue globale</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Offres totales" value={kpi.nbOffres} sub={`${kpi.nbDecides} décidées`} />
          <KpiCard label="Montant total devisé" value={formatMontant(kpi.totalMontant)} color="blue" />
          <KpiCard label="Taux de gain (nb)" value={formatPourcent(kpi.tauxGainNb)} color="green" sub={`${kpi.nbGagne}/${kpi.nbDecides}`} />
          <KpiCard label="Taux de gain (val)" value={formatPourcent(kpi.tauxGainVal)} color="green" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Gagné" value={formatMontant(kpi.montantGagne)} color="green" sub={`${kpi.nbGagne} offres`} />
        <KpiCard label="En attente" value={formatMontant(kpi.montantAttente)} color="amber" sub={`${kpi.nbEnAttente} offres`} />
        <KpiCard label="Perdu" value={formatMontant(kpi.montantPerdu)} color="red" sub={`${kpi.nbPerdu} offres`} />
        <KpiCard label="Marge pot. consolidée" value={formatMontant(kpi.margePotConsolidee)} color="purple" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Avec commande" value={kpi.nbAvecCommande} color="blue" />
        <KpiCard label="Avec PV reçu" value={kpi.nbAvecPv} color="green" />
        <KpiCard label="Montant réceptionné" value={formatMontant(kpi.montantReceptionne)} color="green" />
        <KpiCard label="Reste à faire" value={formatMontant(kpi.resteAFaireTotal)} color="blue" />
      </div>

      {/* Alertes */}
      {(kpi.nbRelance2 > 0 || kpi.nbRelance1 > 0) && (
        <div className={`rounded-lg border px-5 py-4 ${kpi.nbRelance2 > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <h3 className="font-semibold text-gray-800 mb-1">⚠ Alertes relances</h3>
          <div className="flex gap-6 text-sm">
            <span className="text-amber-700">
              <b>{kpi.nbRelance1}</b> offres &gt; {params?.relance1Jours ?? 30}j — {formatMontant(kpi.montantRelance1)}
            </span>
            <span className="text-red-700 font-semibold">
              <b>{kpi.nbRelance2}</b> offres &gt; {params?.relance2Jours ?? 45}j URGENT — {formatMontant(kpi.montantRelance2)}
            </span>
          </div>
        </div>
      )}

      {/* Tableaux de breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Par site */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Par site</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                <th className="px-2 py-2 text-left">Site</th>
                <th className="px-2 py-2 text-right">Offres</th>
                <th className="px-2 py-2 text-right">Gagné</th>
                <th className="px-2 py-2 text-right">Perdu</th>
                <th className="px-2 py-2 text-right">Montant gagné</th>
              </tr>
            </thead>
            <tbody>
              {kpi.parSite.sort((a, b) => b.montantGagne - a.montantGagne).map((row) => (
                <tr key={row.site} className="table-row">
                  <td className="table-cell font-medium">{row.site}</td>
                  <td className="table-cell text-right">{row.nbOffres}</td>
                  <td className="table-cell text-right text-green-700 font-bold">{row.nbGagne}</td>
                  <td className="table-cell text-right text-red-600">{row.nbPerdu}</td>
                  <td className="table-cell text-right font-semibold">{formatMontant(row.montantGagne)}</td>
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
              .map((c) => ({ label: c.cctp, value: c.montantGagne, color: 'bg-blue-500' }))}
            formatValue={formatMontant}
          />
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="table-head">
                <th className="px-2 py-2 text-left">CCTP</th>
                <th className="px-2 py-2 text-right">Offres</th>
                <th className="px-2 py-2 text-right">Gagnées</th>
                <th className="px-2 py-2 text-right">ROP moy.</th>
              </tr>
            </thead>
            <tbody>
              {kpi.parCctp.sort((a, b) => b.montantGagne - a.montantGagne).map((row) => (
                <tr key={row.cctp} className="table-row">
                  <td className="table-cell font-medium">{row.cctp}</td>
                  <td className="table-cell text-right">{row.nbOffres}</td>
                  <td className="table-cell text-right text-green-700">{row.nbGagne}</td>
                  <td className="table-cell text-right">{formatPourcent(row.ropMoyen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Par mois */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title mb-4">Évolution mensuelle</h3>
          <BarChart
            items={kpi.parMois.map((m) => ({ label: formatMois(m.mois), value: m.montant, color: 'bg-blue-400' }))}
            formatValue={formatMontant}
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-head">
                  <th className="px-2 py-2 text-left">Mois</th>
                  <th className="px-2 py-2 text-right">Offres</th>
                  <th className="px-2 py-2 text-right">Montant devisé</th>
                  <th className="px-2 py-2 text-right">Montant gagné</th>
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
          </div>
        </div>
      </div>
    </div>
  );
}
