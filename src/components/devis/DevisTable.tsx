'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DevisRow } from '@/types';
import { formatMontant, formatDate } from '@/lib/format';
import { calcAgeJours } from '@/lib/rop';
import StatutBadge from '@/components/ui/StatutBadge';

interface Props {
  devis: DevisRow[];
  canEdit: boolean;
}

export default function DevisTable({ devis, canEdit }: Props) {
  const router = useRouter();

  const handleDelete = async (id: number, intitule: string) => {
    if (!confirm(`Supprimer le devis "${intitule}" ? Cette action est irréversible.`)) return;
    const res = await fetch(`/api/devis/${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
    else alert('Erreur lors de la suppression');
  };

  if (devis.length === 0) {
    return (
      <div className="card p-10 text-center text-gray-400">
        <p className="text-lg">Aucun devis trouvé</p>
        <p className="text-sm mt-1">Modifiez vos filtres ou créez un nouveau devis.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="table-head">
              <th className="px-4 py-3 text-left">N° Offre</th>
              <th className="px-4 py-3 text-left">Intitulé</th>
              <th className="px-4 py-3 text-left">Site</th>
              <th className="px-4 py-3 text-left">CCTP</th>
              <th className="px-4 py-3 text-left">Créateur</th>
              <th className="px-4 py-3 text-left">Date remise</th>
              <th className="px-4 py-3 text-right">Montant</th>
              <th className="px-4 py-3 text-center">Âge</th>
              <th className="px-4 py-3 text-center">Statut</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devis.map((d) => {
              const age = calcAgeJours(d.dateRemise);
              const isRelance2 = ['ENVOYE', 'EN_ATTENTE'].includes(d.statut) && age > 45;
              const isRelance1 = ['ENVOYE', 'EN_ATTENTE'].includes(d.statut) && age > 30 && age <= 45;

              return (
                <tr key={d.id} className="table-row">
                  <td className="table-cell font-mono text-xs font-semibold text-blue-700">
                    {d.numeroOffre}
                  </td>
                  <td className="table-cell max-w-xs">
                    <Link
                      href={`/devis/${d.id}`}
                      className="hover:text-blue-700 transition-colors line-clamp-2"
                      title={d.intitule}
                    >
                      {d.intitule.length > 60 ? d.intitule.slice(0, 60) + '…' : d.intitule}
                    </Link>
                    {d.client && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{d.client}</p>
                    )}
                  </td>
                  <td className="table-cell text-xs">
                    <span className="font-medium">{d.site}</span>
                    <br />
                    <span className="text-gray-400">{d.typeOffre === 'MARCHE' ? 'Marché' : 'H.M.'}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {d.cctp}
                    </span>
                    <br />
                    <span className="text-xs text-gray-400">{d.atTem}</span>
                  </td>
                  <td className="table-cell text-xs text-gray-600">{d.createurNom}</td>
                  <td className="table-cell text-xs">{formatDate(d.dateRemise)}</td>
                  <td className="table-cell text-right font-semibold text-gray-800">
                    {formatMontant(d.montant)}
                    {d.rop && (
                      <div className="text-xs font-normal text-gray-400">
                        ROP {(d.rop * 100).toFixed(1)}%
                      </div>
                    )}
                  </td>
                  <td className="table-cell text-center">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isRelance2
                          ? 'bg-red-100 text-red-700'
                          : isRelance1
                          ? 'bg-amber-100 text-amber-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {age}j
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <StatutBadge statut={d.statut} size="sm" />
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/devis/${d.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Voir
                      </Link>
                      {canEdit && (
                        <>
                          <Link
                            href={`/devis/${d.id}/modifier`}
                            className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete(d.id, d.intitule)}
                            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
        {devis.length} devis affichés
      </div>
    </div>
  );
}
