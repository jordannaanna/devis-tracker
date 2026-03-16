import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatMontant, formatDate } from '@/lib/format';
import { calcAgeJours } from '@/lib/rop';
import StatutBadge from '@/components/ui/StatutBadge';

export default async function RelancesPage() {
  const params = await prisma.params.findUnique({ where: { id: 1 } });
  const relance1 = params?.relance1Jours ?? 30;
  const relance2 = params?.relance2Jours ?? 45;

  const rawDevis = await prisma.devis.findMany({
    where: { statut: { in: ['ENVOYE', 'EN_ATTENTE'] } },
    orderBy: { dateRemise: 'asc' },
  });

  const devis = rawDevis
    .map((d) => ({ ...d, age: calcAgeJours(d.dateRemise) }))
    .filter((d) => d.age > relance1)
    .sort((a, b) => b.age - a.age);

  const urgent = devis.filter((d) => d.age > relance2);
  const aRelancer = devis.filter((d) => d.age > relance1 && d.age <= relance2);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relances</h1>
        <p className="text-sm text-gray-500 mt-0.5">Offres sans retour client nécessitant une action</p>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-red-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Urgent (&gt; {relance2}j)</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{urgent.length}</p>
          <p className="text-xs text-gray-400">{formatMontant(urgent.reduce((s, d) => s + d.montant, 0))}</p>
        </div>
        <div className="card p-4 border-l-4 border-amber-400">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">À relancer (&gt; {relance1}j)</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{aRelancer.length}</p>
          <p className="text-xs text-gray-400">{formatMontant(aRelancer.reduce((s, d) => s + d.montant, 0))}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total à traiter</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{devis.length}</p>
          <p className="text-xs text-gray-400">{formatMontant(devis.reduce((s, d) => s + d.montant, 0))}</p>
        </div>
      </div>

      {devis.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-lg">✅ Aucune relance nécessaire</p>
          <p className="text-sm mt-1">Toutes les offres en attente ont moins de {relance1} jours.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Offres en attente — à relancer</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3 text-left">Urgence</th>
                  <th className="px-4 py-3 text-left">N° Offre</th>
                  <th className="px-4 py-3 text-left">Intitulé</th>
                  <th className="px-4 py-3 text-left">Site / CCTP</th>
                  <th className="px-4 py-3 text-left">Créateur</th>
                  <th className="px-4 py-3 text-left">Date remise</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {devis.map((d) => (
                  <tr key={d.id} className={`border-b border-gray-100 transition-colors ${d.age > relance2 ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-amber-50/40'}`}>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                        d.age > relance2
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.age}j
                        {d.age > relance2 && ' 🔴'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">
                      {d.numeroOffre}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs">
                      <span title={d.intitule}>
                        {d.intitule.length > 55 ? d.intitule.slice(0, 55) + '…' : d.intitule}
                      </span>
                      {d.client && (
                        <p className="text-xs text-gray-400 mt-0.5">{d.client}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium">{d.site}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-indigo-700 font-medium">{d.cctp}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{d.createurNom}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(d.dateRemise)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">
                      {formatMontant(d.montant)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatutBadge statut={d.statut} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/devis/${d.id}/modifier`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Mettre à jour
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
