'use client';

import { useState, useEffect, useRef } from 'react';
import { momentsAPI } from '@/lib/moments-api';
import type { MusicMoment } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { usePlayerStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { MomentsFilterBar } from '@/components/moments-filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

export default function MomentsPage() {
  const [moments, setMoments] = useState<MusicMoment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { replacePlaylistAndPlay } = usePlayerStore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 筛选和分页状态
  const [filters, setFilters] = useState({
    tags: [] as string[],
    energyLevel: null as number | null,
    years: [] as number[],
    periods: [] as string[]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    loadMoments();
  }, [filters, currentPage]);

  const loadMoments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await momentsAPI.getMoments({
        page: currentPage,
        limit: pageSize,
        tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
        energyLevel: filters.energyLevel ?? undefined,
        year: filters.years.length > 0 ? filters.years.join(',') : undefined,
        period: filters.periods.length > 0 ? filters.periods.join(',') : undefined
      });
      console.log('Moments response:', response);

      if (response && response.success && response.data) {
        setMoments(response.data);

        // 更新总页数
        if (response.totalPages) {
          setTotalPages(response.totalPages);
        } else if (response.total) {
          setTotalPages(Math.ceil(response.total / pageSize));
        } else {
          setTotalPages(1);
        }
      } else {
        setMoments([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to load moments:', error);
      setError(error instanceof Error ? error.message : '加载失败');
      setMoments([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaySong = async (moment: MusicMoment) => {
    if (!moment.songId) return;
    try {
      // 获取当前页所有歌曲
      const songPromises = moments.map(m => api.getSong(m.songId));
      const songResponses = await Promise.all(songPromises);
      const songs = songResponses
        .filter(res => res.success && res.data)
        .map(res => res.data!);

      if (songs.length > 0) {
        // 找到点击歌曲的索引
        const clickedSongIndex = songs.findIndex(song => song.id === moment.songId);
        replacePlaylistAndPlay(songs, clickedSongIndex >= 0 ? clickedSongIndex : 0);
      }
    } catch (error) {
      console.error('Failed to play song:', error);
    }
  };

  const handleLike = async (momentId: string) => {
    try {
      await momentsAPI.likeMoment(momentId);
      // Refresh moments to show updated like count
      loadMoments();
    } catch (error) {
      console.error('Failed to like moment:', error);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string[] | number[] | number | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // 筛选时重置到第一页
  };

  const handleResetFilters = () => {
    setFilters({ tags: [], energyLevel: null, years: [], periods: [] });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  };

  const getEnergyLevelText = (level: number) => {
    if (level <= -3) return '极度治愈';
    if (level <= -1) return '舒缓放松';
    if (level === 0) return '平和';
    if (level <= 2) return '激昂';
    return '极度激情';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-red-500">加载失败: {error}</p>
          <Button onClick={loadMoments}>重试</Button>
        </div>
      );
    }

    if (!moments || moments.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-12">
          还没有任何音乐时刻
        </p>
      );
    }

    // 瀑布流布局：将moments分成左右两列
    const leftColumnMoments = moments.filter((_, index) => index % 2 === 0);
    const rightColumnMoments = moments.filter((_, index) => index % 2 === 1);

    const renderMomentCard = (moment: MusicMoment) => (
      <Card key={moment.id} className="overflow-hidden hover:shadow-lg transition-shadow mb-6 py-1">
        <CardContent className="p-6">
          {/* Song Info */}
          <div
            className="flex items-center gap-4 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handlePlaySong(moment)}
          >
            {moment.song?.coverUrl && (
              <img
                src={moment.song.coverUrl}
                alt={moment.song.title || 'Song cover'}
                className="w-16 h-16 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold">{moment.song?.title || '未知歌曲'}</h3>
              <p className="text-sm text-muted-foreground">
                {moment.song?.artistName || '未知艺术家'}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <p className="text-foreground/90 mb-4 italic">&ldquo;{moment.content}&rdquo;</p>

          {/* Tags and Metadata */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            {moment.tags && moment.tags.length > 0 && moment.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
              >
                #{tag}
              </span>
            ))}
            {moment.energyLevel !== undefined && moment.energyLevel !== 0 && (
              <span className="text-xs text-muted-foreground">
                {getEnergyLevelText(moment.energyLevel)}
              </span>
            )}
            {moment.firstHeardYear && (
              <span className="text-xs text-muted-foreground">
                {moment.firstHeardYear}
                {moment.firstHeardPeriod && ` · ${moment.firstHeardPeriod}`}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(moment.id)}
              className="gap-2"
            >
              <Heart className="w-4 h-4" />
              <span>{moment.likeCount || 0}</span>
            </Button>
            <span className="text-xs text-muted-foreground">
              {moment.createdAt ? new Date(moment.createdAt).toLocaleDateString('zh-CN') : ''}
            </span>
          </div>

          {/* Comments for main moment */}
          {moment.comments && moment.comments.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs text-muted-foreground font-semibold mb-2">跟评 ({moment.comments.length})</p>
              {moment.comments.map((comment) => (
                <div key={comment.id} className="text-sm pl-4 border-l-2 border-muted">
                  <p className="text-foreground/80">{comment.content}</p>
                  {comment.listenDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.listenDate).toLocaleDateString('zh-CN')}
                      {comment.location && ` · ${comment.location}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );

    return (
      <>
        {/* 移动端：单列 */}
        <div className="lg:hidden space-y-6">
          {moments.map((moment) => renderMomentCard(moment))}
        </div>

        {/* 桌面端：瀑布流两列 */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
          {/* 左列 */}
          <div>
            {leftColumnMoments.map((moment) => renderMomentCard(moment))}
          </div>

          {/* 右列 */}
          <div>
            {rightColumnMoments.map((moment) => renderMomentCard(moment))}
          </div>
        </div>
      </>
    );
  };

  return (
    <motion.div
      className="h-full bg-background lg:flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Sidebar />

      <motion.div
        className="flex-1 flex flex-col relative overflow-hidden"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* 标题 - 固定在顶部 */}
        <motion.div
          className="flex-shrink-0 p-4 lg:p-6"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold">音乐朋友圈</h1>
        </motion.div>

        {/* 内容区域 - 可滚动 */}
        <motion.div
          className="flex-1 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="px-4 lg:px-6 pb-6 space-y-4">
              {/* 筛选栏 - 在滚动区域内 */}
              <MomentsFilterBar
                tags={filters.tags}
                energyLevel={filters.energyLevel}
                years={filters.years}
                periods={filters.periods}
                onTagsChange={(value) => handleFilterChange('tags', value)}
                onEnergyLevelChange={(value) => handleFilterChange('energyLevel', value)}
                onYearsChange={(value) => handleFilterChange('years', value)}
                onPeriodsChange={(value) => handleFilterChange('periods', value)}
                onReset={handleResetFilters}
              />

              {renderContent()}

              {/* 分页 */}
              {!isLoading && !error && moments.length > 0 && totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}