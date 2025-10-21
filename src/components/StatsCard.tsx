import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
}

export const StatsCard = memo(({ title, value, icon, className, valueClassName }: StatsCardProps) => {
  return (
    <div className={cn(
      "glass-card rounded-xl p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-slide-in",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm md:text-base text-gray-300">{title}</h3>
        {icon && <div className="text-xl md:text-2xl">{icon}</div>}
      </div>
      <div className={cn(
        "text-2xl md:text-4xl font-bold",
        valueClassName
      )}>
        {value}
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';
