'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SessionUser } from '@/types';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/devis', label: 'Devis', icon: '📋' },
  { href: '/relances', label: 'Relances', icon: '🔔' },
];

const NAV_DIRECTION = [
  { href: '/direction', label: 'Vue Direction', icon: '👔' },
];

const NAV_ADMIN = [
  { href: '/parametres', label: 'Paramètres', icon: '⚙️' },
];

interface Props {
  user: SessionUser;
}

export default function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isActive = (href: string) =>
    href === '/devis' ? pathname.startsWith('/devis') : pathname === href;

  const allItems = [
    ...NAV_ITEMS,
    ...(user.role === 'DIRECTION' || user.role === 'ADMIN' ? NAV_DIRECTION : []),
    ...(user.role === 'ADMIN' ? NAV_ADMIN : []),
  ];

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-200">
        <h1 className="font-bold text-blue-800 text-base leading-tight">
          Suivi Devis
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Gestion des offres</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {allItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-blue-50 text-blue-800'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-800 truncate">
            {user.prenom} {user.nom}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {user.role === 'ADMIN' ? 'Administrateur' : user.role === 'DIRECTION' ? 'Direction' : 'Chargé d\'affaires'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-gray-500 hover:text-red-600 transition-colors py-1"
        >
          → Déconnexion
        </button>
      </div>
    </aside>
  );
}
