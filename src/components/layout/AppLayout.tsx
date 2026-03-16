import Sidebar from './Sidebar';
import type { SessionUser } from '@/types';

interface Props {
  user: SessionUser;
  children: React.ReactNode;
}

export default function AppLayout({ user, children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
