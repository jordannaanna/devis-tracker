import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Suivi Devis</h1>
          <p className="text-gray-500 mt-1">Outil de gestion des offres</p>
        </div>
        <Suspense fallback={<div className="card p-8 text-center text-gray-400">Chargement...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
