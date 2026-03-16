'use client';

import { useState, useEffect } from 'react';
import type { ParamsMetier } from '@/types';

export default function ParametresPage() {
  const [params, setParams] = useState<ParamsMetier | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/params')
      .then((r) => r.json())
      .then(setParams);
  }, []);

  const handleSave = async () => {
    if (!params) return;
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/params', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) setMsg('✅ Paramètres enregistrés');
      else setMsg('❌ Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (!params) return <div className="p-6 text-gray-400">Chargement...</div>;

  const set = (k: keyof ParamsMetier, v: string) =>
    setParams((p) => p ? { ...p, [k]: parseFloat(v) || 0 } : p);

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres métier</h1>

      {msg && (
        <div className={`rounded-md px-4 py-3 text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg}
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h3 className="section-title">ROP</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">ROP mini (décimal)</label>
            <input type="number" className="input" step="0.001" value={params.ropMini} onChange={(e) => set('ropMini', e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Actuellement : {(params.ropMini * 100).toFixed(1)}%</p>
          </div>
          <div>
            <label className="label">ROP cible (décimal)</label>
            <input type="number" className="input" step="0.001" value={params.ropCible} onChange={(e) => set('ropCible', e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Actuellement : {(params.ropCible * 100).toFixed(1)}%</p>
          </div>
          <div>
            <label className="label">Seuil correction ROP</label>
            <input type="number" className="input" step="0.01" value={params.seuilCorrectionRop} onChange={(e) => set('seuilCorrectionRop', e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Si ROP &gt; seuil → diviser par facteur</p>
          </div>
          <div>
            <label className="label">Facteur correction ROP</label>
            <input type="number" className="input" step="1" value={params.facteurCorrectionRop} onChange={(e) => set('facteurCorrectionRop', e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Diviseur (défaut : 100)</p>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="section-title">Relances</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Relance 1 (jours)</label>
            <input type="number" className="input" step="1" min="1" value={params.relance1Jours} onChange={(e) => set('relance1Jours', e.target.value)} />
          </div>
          <div>
            <label className="label">Relance 2 — URGENT (jours)</label>
            <input type="number" className="input" step="1" min="1" value={params.relance2Jours} onChange={(e) => set('relance2Jours', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? '⏳ Enregistrement...' : '✓ Enregistrer'}
        </button>
      </div>
    </div>
  );
}
