interface BarItem {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

interface Props {
  items: BarItem[];
  formatValue?: (v: number) => string;
}

export default function BarChart({ items, formatValue }: Props) {
  if (items.length === 0) return null;

  const maxVal = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-24 truncate flex-shrink-0 text-right">
            {item.label}
          </span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${item.color ?? 'bg-blue-500'}`}
              style={{ width: `${Math.max(2, (item.value / maxVal) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-24 flex-shrink-0">
            {formatValue ? formatValue(item.value) : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
