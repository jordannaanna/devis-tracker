interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'default' | 'green' | 'red' | 'amber' | 'blue' | 'purple';
  small?: boolean;
}

const colorMap = {
  default: 'text-gray-900',
  green: 'text-green-700',
  red: 'text-red-700',
  amber: 'text-amber-700',
  blue: 'text-blue-700',
  purple: 'text-purple-700',
};

export default function KpiCard({ label, value, sub, color = 'default', small = false }: Props) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
      <p className={`mt-1 font-bold ${small ? 'text-xl' : 'text-2xl'} ${colorMap[color]}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}
