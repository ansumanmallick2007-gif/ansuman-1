import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  color = 'indigo',
  badge
}) => {
  const colorMap = {
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-500/5',
      border: 'border-indigo-500/20',
      iconBg: 'bg-indigo-500/15 text-indigo-400',
      accent: 'text-indigo-400'
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      accent: 'text-emerald-400'
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-500/5',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-400',
      accent: 'text-amber-400'
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-500/5',
      border: 'border-cyan-500/20',
      iconBg: 'bg-cyan-500/15 text-cyan-400',
      accent: 'text-cyan-400'
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-500/5',
      border: 'border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-400',
      accent: 'text-rose-400'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${scheme.bg} border ${scheme.border} backdrop-blur-md relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
            {badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 font-sans tracking-tight">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1 font-semibold">
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : change === 0 ? (
              <Minus className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span className={isPositive ? 'text-emerald-400' : change === 0 ? 'text-gray-400' : 'text-rose-400'}>
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-gray-400 font-normal ml-1">vs last cycle</span>
          </div>
        ) : (
          <span className="text-gray-400 font-normal">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;

