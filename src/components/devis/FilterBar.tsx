'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { SITES, CCTP_LIST, AT_TEM_LIST, CREATEURS, TYPES_OFFRE, STATUTS } from '@/lib/constants';

interface Props {
  showStatut?: boolean;
  showType?: boolean;
  showSearch?: boolean;
}

export default function FilterBar({ showStatut = true, showType = true, showSearch = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'Tous' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const resetAll = () => {
    router.push(pathname);
  };

  const val = (key: string) => searchParams.get(key) ?? 'Tous';
  const hasFilters = [...searchParams.keys()].length > 0;

  return (
    <div className="card px-4 py-3">
      <div className="flex flex-wrap gap-3 items-end">
        {showSearch && (
          <div className="flex-1 min-w-[180px]">
            <label className="label">Recherche</label>
            <input
              className="input"
              placeholder="N° offre, intitulé, client..."
              defaultValue={searchParams.get('search') ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                const params = new URLSearchParams(searchParams.toString());
                if (v) params.set('search', v); else params.delete('search');
                router.push(`${pathname}?${params.toString()}`);
              }}
            />
          </div>
        )}

        <div>
          <label className="label">Site</label>
          <select className="input w-36" value={val('site')} onChange={(e) => updateFilter('site', e.target.value)}>
            <option>Tous</option>
            {SITES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="label">CCTP</label>
          <select className="input w-32" value={val('cctp')} onChange={(e) => updateFilter('cctp', e.target.value)}>
            <option>Tous</option>
            {CCTP_LIST.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label">AT/TEM</label>
          <select className="input w-28" value={val('atTem')} onChange={(e) => updateFilter('atTem', e.target.value)}>
            <option>Tous</option>
            {AT_TEM_LIST.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Créateur</label>
          <select className="input w-32" value={val('createur')} onChange={(e) => updateFilter('createur', e.target.value)}>
            <option>Tous</option>
            {CREATEURS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {showStatut && (
          <div>
            <label className="label">Statut</label>
            <select className="input w-36" value={val('statut')} onChange={(e) => updateFilter('statut', e.target.value)}>
              <option>Tous</option>
              {Object.entries(STATUTS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        )}

        {showType && (
          <div>
            <label className="label">Type</label>
            <select className="input w-32" value={val('typeOffre')} onChange={(e) => updateFilter('typeOffre', e.target.value)}>
              <option>Tous</option>
              {Object.entries(TYPES_OFFRE).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label">Mois</label>
          <input
            type="month"
            className="input w-36"
            value={searchParams.get('mois') ?? ''}
            onChange={(e) => updateFilter('mois', e.target.value)}
          />
        </div>

        {hasFilters && (
          <div className="self-end">
            <button onClick={resetAll} className="btn-secondary btn-sm">
              ✕ Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
