'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>上一页</span>
      </Button>

      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{currentPage}</span>
        {' / '}
        <span>{totalPages}</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="gap-1"
      >
        <span>下一页</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
