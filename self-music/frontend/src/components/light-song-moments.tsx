'use client';

import type { MusicMoment } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LightSongMomentsProps {
  moment: MusicMoment | null;
  className?: string;
  onClose?: () => void;
}

export function LightSongMoments({ moment, className, onClose }: LightSongMomentsProps) {
  if (!moment) return null;

  const getEnergyLevelText = (level: number) => {
    if (level <= -3) return '极度治愈';
    if (level <= -1) return '舒缓放松';
    if (level === 0) return '平和';
    if (level <= 2) return '激昂';
    return '极度激情';
  };

  const getEnergyLevelColor = (level: number) => {
    if (level < 0) return 'text-green-400';
    if (level === 0) return 'text-blue-400';
    return 'text-orange-400';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "rounded-xl backdrop-blur-sm bg-background/20 border border-white/10",
          "p-4 space-y-3 relative",
          className
        )}
      >
        {/* 关闭按钮 */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-background/40"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* 标题 */}
        <div className="flex items-center justify-between pr-8">
          <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
            音乐时刻
          </h3>
          {moment.comments && moment.comments.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {moment.comments.length} 跟评
            </span>
          )}
        </div>

        {/* 主要乐评 */}
        <div className="space-y-2">
          <p className="text-sm text-foreground/90 italic">
            &ldquo;{moment.content}&rdquo;
          </p>

          {/* 标签和元数据 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {moment.tags.length > 0 && (
              <div className="flex gap-1">
                {moment.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {moment.energyLevel !== 0 && (
              <span className={cn("font-medium", getEnergyLevelColor(moment.energyLevel))}>
                {getEnergyLevelText(moment.energyLevel)}
              </span>
            )}

            {moment.firstHeardYear && (
              <span>
                {moment.firstHeardYear}
                {moment.firstHeardPeriod && ` · ${moment.firstHeardPeriod}`}
              </span>
            )}
          </div>
        </div>

        {/* 跟评列表 */}
        {moment.comments && moment.comments.length > 0 && (
          <div className="pt-2 border-t border-white/5 space-y-2">
            {moment.comments.map((comment) => (
              <div
                key={comment.id}
                className="text-xs space-y-1 pl-3 border-l-2 border-primary/20"
              >
                <p className="text-foreground/70">{comment.content}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {comment.listenDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(comment.listenDate)}
                    </span>
                  )}
                  {comment.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {comment.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
