'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { DevisRow } from '@/types';
import { SITES, CCTP_LIST, AT_TEM_LIST, CREATEURS, TYPES_OFFRE, STATUTS } from '@/lib/constants';
import { calcRopCorr, calcMargePot, calcResteAFaire } from '@/lib/rop';
import { formatMontant, formatDateInput } from '@/lib/format';

interface Props {
  initial?: DevisRow;
  mode: 'create' | 'edit';
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function DevisForm({ initial, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    intitule: initial?.intitule ?? '',
    site: initial?.site ?? '',
    typeOffre: initial?.typeOffre ?? 'HORS_MARCHE',
    atTem: initial?.atTem ?? '',
    cctp: initial?.cctp ?? '',
    client: initial?.client ?? '',
    createurNom: initial?.createurNom ?? '',
    numeroOffre: initial?.numeroOffre ?? '',
    dateRemise: formatDateInput(initial?.dateRemise),
    indice: String(initial?.indice ?? 0),
    nombrePoints: initial?.nombrePoints ? String(initial.nombrePoints) : '',
    montant: initial?.montant ? String(initial.montant) : '',
    rop: initial?.rop ? String(initial.rop) : '',
    statut: initial?.statut ?? 'EN_ATTENTE',
    numeroCommande: initial?.numeroCommande ?? '',
    dateDebut: formatDateInput(initial?.dateDebut),
    dateFin: formatDateInput(initial?.dateFin),
    numeroPvReception: initial?.numeroPvReception ?? '',
    montantReceptionne: initial?.montantReceptionne ? String(initial.montantReceptionne) : '',
    nombreHeures: initial?.nombreHeures ? String(initial.nombreHeures) : '',
    commentaire: initial?.commentaire ?? '',
  });

  // Computed
  const ropNum = parseFloat(form.rop) || null;
  const montantNum = parseFloat(form.montant) || 0;
  const montantRecepNum = parseFloat(form.montantReceptionne) || null;
  const ropCorr = calcRopCorr(ropNum);
  const margePot = calcMargePot(montantNum, ropCorr);
  const raf = calcResteAFaire(montantNum, montantRecepNum);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.intitule || !form.site || !form.atTem || !form.cctp || !form.createurNom || !form.numeroOffre || !form.dateRemise || !form.montant) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSaving(true);
    try {
      const url = mode === 'create' ? '/api/devis' : `/api/devis/${initial!.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Erreur serveur');
      }
      const devis = await res.json();
      router.push(`/devis/${devis.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Section 1 : Identification */}
      <div className="card p-5">
        <h3 className="section-title mb-4">1. Identification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Intitulé" required>
              <textarea className="input h-20 resize-none" value={form.intitule} onChange={set('intitule')} placeholder="Descriptif de la prestation..." />
            </Field>
          </div>
          <Field label="Site" required>
            <select className="input" value={form.site} onChange={set('site')}>
              <option value="">— Sélectionner —</option>
              {SITES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Type d'offre" required>
            <select className="input" value={form.typeOffre} onChange={set('typeOffre')}>
              {Object.entries(TYPES_OFFRE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="AT/TEM" required>
            <select className="input" value={form.atTem} onChange={set('atTem')}>
              <option value="">— Sélectionner —</option>
              {AT_TEM_LIST.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="CCTP" required>
            <select className="input" value={form.cctp} onChange={set('cctp')}>
              <option value="">— Sélectionner —</option>
              {CCTP_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Client">
            <input className="input" value={form.client} onChange={set('client')} placeholder="Nom du client / donneur d'ordre" />
          </Field>
          <Field label="Créateur / Chargé d'affaires" required>
            <select className="input" value={form.createurNom} onChange={set('createurNom')}>
              <option value="">— Sélectionner —</option>
              {CREATEURS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="N° Offre" required>
            <input className="input font-mono" value={form.numeroOffre} onChange={set('numeroOffre')} placeholder="ex: 7483" />
          </Field>
          <Field label="Date de remise d'offre" required>
            <input type="date" className="input" value={form.dateRemise} onChange={set('dateRemise')} />
          </Field>
          <Field label="Indice">
            <input type="number" className="input" value={form.indice} onChange={set('indice')} min="0" placeholder="0" />
          </Field>
          <Field label="Nombre de points">
            <input type="number" className="input" value={form.nombrePoints} onChange={set('nombrePoints')} step="0.01" placeholder="—" />
          </Field>
        </div>
      </div>

      {/* Section 2 : Financier */}
      <div className="card p-5">
        <h3 className="section-title mb-4">2. Éléments financiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Montant (€)" required>
            <input type="number" className="input" value={form.montant} onChange={set('montant')} step="0.01" min="0" placeholder="ex: 25000" />
          </Field>
          <Field label="Nombre d'heures vendues">
            <input type="number" className="input" value={form.nombreHeures} onChange={set('nombreHeures')} step="0.5" min="0" placeholder="ex: 120" />
          </Field>
          <Field label="ROP (décimal, ex: 0.06 = 6%)">
            <input type="number" className="input" value={form.rop} onChange={set('rop')} step="0.001" min="0" max="1" placeholder="ex: 0.06" />
          </Field>
          <div className="bg-gray-50 rounded-md p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">ROP corrigé :</span>
              <span className="font-medium">{ropCorr !== null ? (ropCorr * 100).toFixed(2) + ' %' : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Marge potentielle :</span>
              <span className="font-medium text-green-700">{margePot !== null ? formatMontant(margePot) : '—'}</span>
            </div>
            {ropNum !== null && ropNum > 0.5 && (
              <p className="text-xs text-amber-600 mt-1">⚠ ROP corrigé (saisie en %)</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3 : Suivi */}
      <div className="card p-5">
        <h3 className="section-title mb-4">3. Suivi de l'offre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Statut" required>
            <select className="input" value={form.statut} onChange={set('statut')}>
              {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="N° Commande">
            <input className="input font-mono" value={form.numeroCommande} onChange={set('numeroCommande')} placeholder="—" />
          </Field>
          <Field label="Date début de prestation">
            <input type="date" className="input" value={form.dateDebut} onChange={set('dateDebut')} />
          </Field>
          <Field label="Date fin de prestation">
            <input type="date" className="input" value={form.dateFin} onChange={set('dateFin')} />
          </Field>
        </div>
      </div>

      {/* Section 4 : Réception */}
      <div className="card p-5">
        <h3 className="section-title mb-4">4. Réception</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="N° PV de réception">
            <input className="input font-mono" value={form.numeroPvReception} onChange={set('numeroPvReception')} placeholder="—" />
          </Field>
          <Field label="Montant réceptionné (€)">
            <input type="number" className="input" value={form.montantReceptionne} onChange={set('montantReceptionne')} step="0.01" min="0" placeholder="—" />
          </Field>
          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <p className="text-gray-500 text-xs mb-1">Reste à faire</p>
            <p className="text-xl font-bold text-blue-700">{formatMontant(raf)}</p>
          </div>
        </div>
      </div>

      {/* Section 5 : Commentaire */}
      <div className="card p-5">
        <h3 className="section-title mb-4">5. Commentaire</h3>
        <textarea
          className="input h-24 resize-none"
          value={form.commentaire}
          onChange={set('commentaire')}
          placeholder="Notes, observations, historique de la relance..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Annuler
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? '⏳ Enregistrement...' : mode === 'create' ? '✓ Créer le devis' : '✓ Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}
