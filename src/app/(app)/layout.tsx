import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionOptions } from '@/lib/session';
import AppLayout from '@/components/layout/AppLayout';
import type { SessionData } from '@/types';

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.user) {
    redirect('/login');
  }

  return <AppLayout user={session.user}>{children}</AppLayout>;
}
