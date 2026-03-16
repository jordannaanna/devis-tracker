import Link from 'next/link';
import type { DevisRow } from '@/types';
import { formatMontant, formatDate } from '@/lib/format';
import { calcAgeJours } from '@/lib/rop';

interface Props {
  devis: DevisRow[];
  relance1: number;
  relance2: number;
}

export default function RelancesBlock({ devis, relance1, relance2 }: Props) {
  const candidats = devis
    .filter((d) => ['ENVOYE', 'EN_ATTENTE'].includes(d.statut))
    .map((d) => ({ ...d, age: calcAgeJours(d.dateRemise) }))
    .filter((d) => d.age > relance1)
    .sort((a, b) => b.age - a.age);

  if (candidats.length === 0) {
    return (
      <div className="card p-5 text-center text-gray-400 text-sm">
        ✅ Aucune relance urgente
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          🔔 Relances prioritaires
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            {candidats.filter((d) => d.age > relance1 && d.age <= relance2).length} &gt; {relance1}j
          </span>
          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
            {candidats.filter((d) => d.age > relance2).length} &gt; {relance2}j
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {candidats.map((d) => (
          <Link
            key={d.id}
            href={`/devis/${d.id}`}
            className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    d.age > relance2
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {d.age}j
                </span>
                <span className="text-xs text-gray-500">
                  #{d.numeroOffre}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {d.createurNom}
                </span>
              </div>
              <p className="text-sm text-gray-800 truncate mt-0.5">
                {d.intitule}
              </p>
              <p className="text-xs text-gray-400">
                {d.site} / {d.cctp} — remis le {formatDate(d.dateRemise)}
              </p>
            </div>
            <div className="ml-4 text-right flex-shrink-0">
              <p className="text-sm font-semibold text-gray-800">
                {formatMontant(d.montant)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
