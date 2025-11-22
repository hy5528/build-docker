'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { momentsAPI } from '@/lib/moments-api';

interface MomentsFilterBarProps {
  tags: string[];
  energyLevel: number | null;
  years: number[];
  periods: string[];
  onTagsChange: (tags: string[]) => void;
  onEnergyLevelChange: (level: number | null) => void;
  onYearsChange: (years: number[]) => void;
  onPeriodsChange: (periods: string[]) => void;
  onReset: () => void;
  className?: string;
}

export function MomentsFilterBar({
  tags,
  energyLevel,
  years,
  periods,
  onTagsChange,
  onEnergyLevelChange,
  onYearsChange,
  onPeriodsChange,
  onReset,
  className
}: MomentsFilterBarProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [tagsRes, yearsRes, periodsRes] = await Promise.all([
        momentsAPI.getTags(),
        momentsAPI.getYears(),
        momentsAPI.getPeriods()
      ]);

      if (tagsRes.success) setAvailableTags(tagsRes.data || []);
      if (yearsRes.success) setAvailableYears(yearsRes.data || []);
      if (periodsRes.success) setAvailablePeriods(periodsRes.data || []);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter(t => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  const toggleYear = (year: number) => {
    if (years.includes(year)) {
      onYearsChange(years.filter(y => y !== year));
    } else {
      onYearsChange([...years, year]);
    }
  };

  const togglePeriod = (period: string) => {
    if (periods.includes(period)) {
      onPeriodsChange(periods.filter(p => p !== period));
    } else {
      onPeriodsChange([...periods, period]);
    }
  };

  const getEnergyLevelText = (level: number) => {
    if (level <= -3) return '极度治愈';
    if (level <= -1) return '舒缓放松';
    if (level === 0) return '平和';
    if (level <= 2) return '激昂';
    return '极度激情';
  };

  const hasActiveFilters = tags.length > 0 || energyLevel !== null || years.length > 0 || periods.length > 0;

  return (
    <div className={cn("p-4 bg-background/50 backdrop-blur-sm rounded-lg border", className)}>
      {/* 标题栏 */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">筛选条件</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="ml-auto gap-1 h-7"
          >
            <X className="h-3 w-3" />
            <span className="text-xs">清空</span>
          </Button>
        )}
      </div>

      {/* 第一行：标签 */}
      {availableTags.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground font-medium whitespace-nowrap min-w-[60px]">标签</label>
            <div className="flex flex-wrap gap-2 flex-1">
              {availableTags.map((tag) => (
                <Button
                  key={tag}
                  variant={tags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                  className="h-7 text-xs"
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 第二行：能量等级、年份、时期 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 能量等级 */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground font-medium whitespace-nowrap min-w-[60px]">能量</label>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Slider
                value={[energyLevel ?? 0]}
                onValueChange={(value) => onEnergyLevelChange(value[0] === 0 ? null : value[0])}
                min={-5}
                max={5}
                step={1}
                className="flex-1"
              />
              {energyLevel !== null ? (
                <span className="text-xs text-foreground font-medium whitespace-nowrap w-16 text-right">
                  {energyLevel > 0 ? `+${energyLevel}` : energyLevel}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground whitespace-nowrap w-16 text-right">
                  全部
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 年份 */}
        {availableYears.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground font-medium whitespace-nowrap min-w-[60px]">年份</label>
            <div className="flex flex-wrap gap-2 flex-1">
              {availableYears.map((y) => (
                <Button
                  key={y}
                  variant={years.includes(y) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleYear(y)}
                  className="h-7 text-xs"
                >
                  {y}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 时期 */}
        {availablePeriods.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground font-medium whitespace-nowrap min-w-[60px]">时期</label>
            <div className="flex flex-wrap gap-2 flex-1">
              {availablePeriods.map((p) => (
                <Button
                  key={p}
                  variant={periods.includes(p) ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePeriod(p)}
                  className="h-7 text-xs"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
