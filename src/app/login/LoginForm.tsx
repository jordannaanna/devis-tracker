'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Identifiants incorrects');
        return;
      }
      const redirect = searchParams.get('redirect') ?? '/dashboard';
      router.push(redirect);
      router.refresh();
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Connexion</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Identifiant</label>
          <input
            className="input"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="votre.login"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center mt-2"
        >
          {loading ? '⏳ Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400 space-y-1">
        <p className="font-medium text-gray-500 mb-2">Comptes de démonstration :</p>
        <p>admin / admin123 — Administrateur</p>
        <p>marco / marco123 — Chargé d&apos;affaires</p>
        <p>direction / direction123 — Direction</p>
      </div>
    </div>
  );
}
