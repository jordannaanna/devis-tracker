import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { sessionOptions } from '@/lib/session';
import { calcRopCorr, calcMargePot, calcResteAFaire, calcAgeJours } from '@/lib/rop';
import { formatMontant, formatMontantPrecis, formatDate, formatPourcent } from '@/lib/format';
import { STATUTS, TYPES_OFFRE } from '@/lib/constants';
import StatutBadge from '@/components/ui/StatutBadge';
import type { SessionData } from '@/types';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex py-2.5 border-b border-gray-100 last:border-0">
      <dt className="w-52 flex-shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium">{value ?? '—'}</dd>
    </div>
  );
}

export default async function DevisDetailPage({ params }: { params: { id: string } }) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const devis = await prisma.devis.findUnique({ where: { id: parseInt(params.id) } });

  if (!devis) notFound();

  const params2 = await prisma.params.findUnique({ where: { id: 1 } });
  const ropCorr = calcRopCorr(devis.rop, params2?.seuilCorrectionRop ?? 0.5, params2?.facteurCorrectionRop ?? 100);
  const margePot = calcMargePot(devis.montant, ropCorr);
  const raf = calcResteAFaire(devis.montant, devis.montantReceptionne);
  const age = calcAgeJours(devis.dateRemise);

  const canEdit = session.user?.role !== 'DIRECTION';

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/devis" className="text-sm text-blue-600 hover:text-blue-800">← Liste</Link>
            <span className="text-gray-300">|</span>
            <span className="font-mono text-sm text-gray-500">#{devis.numeroOffre}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{devis.intitule}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatutBadge statut={devis.statut} />
          {canEdit && (
            <Link href={`/devis/${devis.id}/modifier`} className="btn-secondary">
              ✎ Modifier
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Identification */}
        <div className="card p-5">
          <h3 className="section-title mb-3">Identification</h3>
          <dl>
            <Row label="Site" value={devis.site} />
            <Row label="Type d'offre" value={TYPES_OFFRE[devis.typeOffre] ?? devis.typeOffre} />
            <Row label="AT/TEM" value={devis.atTem} />
            <Row label="CCTP" value={<span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold">{devis.cctp}</span>} />
            <Row label="Client" value={devis.client} />
            <Row label="Créateur" value={devis.createurNom} />
            <Row label="Date de remise" value={formatDate(devis.dateRemise)} />
            <Row label="Indice" value={devis.indice} />
            {devis.nombrePoints && <Row label="Nb de points" value={devis.nombrePoints} />}
            <Row label="Âge" value={
              <span className={`font-semibold ${age > 45 ? 'text-red-700' : age > 30 ? 'text-amber-700' : 'text-gray-700'}`}>
                {age} jours
                {age > 45 && ' ⚠ RELANCE URGENTE'}
                {age > 30 && age <= 45 && ' · À relancer'}
              </span>
            } />
          </dl>
        </div>

        {/* Financier */}
        <div className="card p-5">
          <h3 className="section-title mb-3">Financier</h3>
          <dl>
            <Row label="Montant" value={<span className="text-lg font-bold text-blue-700">{formatMontantPrecis(devis.montant)}</span>} />
            <Row label="ROP brut" value={devis.rop !== null ? formatPourcent(devis.rop) : null} />
            <Row label="ROP corrigé" value={ropCorr !== null ? formatPourcent(ropCorr) : null} />
            <Row label="Marge potentielle" value={
              margePot !== null
                ? <span className="text-green-700 font-semibold">{formatMontantPrecis(margePot)}</span>
                : null
            } />
            {devis.rop !== null && devis.rop > 0.5 && (
              <div className="text-xs text-amber-600 py-1">⚠ ROP corrigé automatiquement (saisie en %)</div>
            )}
          </dl>
        </div>

        {/* Suivi */}
        <div className="card p-5">
          <h3 className="section-title mb-3">Suivi</h3>
          <dl>
            <Row label="Statut" value={<StatutBadge statut={devis.statut} />} />
            <Row label="N° Commande" value={devis.numeroCommande
              ? <span className="font-mono text-sm">{devis.numeroCommande}</span>
              : <span className="text-gray-400">Non reçue</span>
            } />
            <Row label="Date début" value={formatDate(devis.dateDebut)} />
            <Row label="Date fin" value={formatDate(devis.dateFin)} />
          </dl>
        </div>

        {/* Réception */}
        <div className="card p-5">
          <h3 className="section-title mb-3">Réception</h3>
          <dl>
            <Row label="N° PV de réception" value={devis.numeroPvReception
              ? <span className="font-mono text-sm">{devis.numeroPvReception}</span>
              : <span className="text-gray-400">Non reçu</span>
            } />
            <Row label="Montant réceptionné" value={formatMontantPrecis(devis.montantReceptionne)} />
            <Row label="Reste à faire" value={
              <span className="text-blue-700 font-bold">{formatMontant(raf)}</span>
            } />
          </dl>
        </div>

        {/* Commentaire */}
        {devis.commentaire && (
          <div className="card p-5 lg:col-span-2">
            <h3 className="section-title mb-2">Commentaire</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{devis.commentaire}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Créé le {formatDate(devis.createdAt)} · Modifié le {formatDate(devis.updatedAt)}
      </p>
    </div>
  );
}
