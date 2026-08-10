import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TrendSparkline({ currentValue = 0, previousValue = null }) {
  if (previousValue === null || previousValue === undefined) {
    return (
      <div className="flex items-center gap-1">
        <Minus size={14} className="text-gray-400" />
        <span className="text-xs text-gray-400">-</span>
      </div>
    );
  }

  const safeCurrent = Number(currentValue) || 0;
  const safePrevious = Number(previousValue) || 1;

  if (safePrevious === 0) {
    return (
      <div className="flex items-center gap-1">
        <Minus size={14} className="text-gray-400" />
        <span className="text-xs text-gray-400">-</span>
      </div>
    );
  }

  const change = safeCurrent - safePrevious;
  const percentChange = ((change / safePrevious) * 100).toFixed(1);
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div className="flex items-center gap-1">
      {isNeutral ? (
        <Minus size={14} className="text-gray-400" />
      ) : isPositive ? (
        <TrendingUp size={14} className="text-green-400" />
      ) : (
        <TrendingDown size={14} className="text-red-400" />
      )}
      <span className={`text-xs font-semibold ${
        isNeutral ? 'text-gray-400' :
        isPositive ? 'text-green-400' : 'text-red-400'
      }`}>
        {isNeutral ? '0%' : `${isPositive ? '+' : ''}${percentChange}%`}
      </span>
    </div>
  );
}
