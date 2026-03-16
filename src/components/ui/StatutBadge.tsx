import { STATUTS, STATUT_COLORS } from '@/lib/constants';

interface Props {
  statut: string;
  size?: 'sm' | 'md';
}

export default function StatutBadge({ statut, size = 'md' }: Props) {
  const label = STATUTS[statut] ?? statut;
  const color = STATUT_COLORS[statut] ?? 'bg-gray-100 text-gray-600';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClass}`}>
      {label}
    </span>
  );
}
