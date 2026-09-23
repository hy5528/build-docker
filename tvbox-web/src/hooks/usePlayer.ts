'use client'

import { useEffect, useRef, useState } from 'react'
import Artplayer from 'artplayer'
import Hls from 'hls.js'
import type { DanmakuItem } from '@/types'
import { DanmakuManager, parseDanmaku } from '@/lib/danmaku'

interface UsePlayerOptions {
  container: HTMLElement | null
  url: string
  type?: 'hls' | 'mp4' | 'm3u8'
  danmaku?: DanmakuItem[]
  autoplay?: boolean
  onProgress?: (currentTime: number, duration: number) => void
  onEnded?: () => void
  onError?: (error: Error) => void
}

export function usePlayer() {
  const playerRef = useRef<Artplayer | null>(null)
  const danmakuRef = useRef<DanmakuManager | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)

  // 初始化播放器
  const initPlayer = async (options: UsePlayerOptions) => {
    const { container, url, type, danmaku, autoplay, onProgress, onEnded, onError } = options

    if (!container) return

    // 销毁旧播放器
    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }

    // 创建弹幕管理器
    danmakuRef.current = new DanmakuManager()

    // 创建播放器
    const player = new Artplayer({
      container,
      url,
      type: type || (url.includes('.m3u8') ? 'hls' : 'mp4'),
      autoplay: autoplay ?? true,
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: '#23ade5',
      lang: navigator.language.toLowerCase(),
      moreVideoAttr: {
        crossOrigin: 'anonymous',
      },
      customType: {
        hls: function (video: HTMLVideoElement, url: string) {
          if (Hls.isSupported()) {
            const hls = new Hls()
            hls.loadSource(url)
            hls.attachMedia(video)
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url
          }
        },
      },
      controls: [
        {
          name: 'danmaku-toggle',
          position: 'right',
          html: '<span>弹幕</span>',
          tooltip: '切换弹幕',
          selector: [
            { html: '显示', value: true },
            { html: '隐藏', value: false },
          ],
          onSelect: function (item) {
            if (item.value) {
              danmakuRef.current?.show()
            } else {
              danmakuRef.current?.hide()
            }
            return item.html
          },
        },
      ],
    })

    // 初始化弹幕
    const danmakuContainer = document.createElement('div')
    danmakuContainer.className = 'art-danmaku'
    danmakuContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;'
    container.appendChild(danmakuContainer)
    
    if (danmaku && danmaku.length > 0) {
      danmakuRef.current.init(danmakuContainer, player.video)
      danmakuRef.current.load(danmaku)
    }

    // 事件监听
    player.on('play', () => {
      setIsPlaying(true)
      danmakuRef.current?.play()
    })

    player.on('pause', () => {
      setIsPlaying(false)
      danmakuRef.current?.pause()
    })

    player.on('video:timeupdate', () => {
      setCurrentTime(player.currentTime)
      onProgress?.(player.currentTime, player.duration)
    })

    player.on('video:loadedmetadata', () => {
      setDuration(player.duration)
    })

    player.on('video:ended', () => {
      setIsPlaying(false)
      onEnded?.()
    })

    player.on('error', (error) => {
      console.error('播放错误:', error)
      onError?.(error)
    })

    playerRef.current = player

    return player
  }

  // 发送弹幕
  const sendDanmaku = (text: string, color: string = '#ffffff') => {
    if (!danmakuRef.current || !playerRef.current) return

    danmakuRef.current.add({
      time: playerRef.current.currentTime,
      type: 'right',
      color,
      text,
    })
  }

  // 播放控制
  const play = () => playerRef.current?.play()
  const pause = () => playerRef.current?.pause()
  const seek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = time
    }
  }

  // 音量控制
  const setVolumeLevel = (vol: number) => {
    if (playerRef.current) {
      playerRef.current.volume = vol
      setVolume(vol)
    }
  }

  const toggleMute = () => {
    if (playerRef.current) {
      playerRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  // 全屏
  const toggleFullscreen = () => {
    playerRef.current?.fullscreen?.toggle()
  }

  // 切换播放状态
  const toggle = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  // 销毁
  const destroy = () => {
    danmakuRef.current?.destroy()
    playerRef.current?.destroy()
    playerRef.current = null
    danmakuRef.current = null
  }

  return {
    initPlayer,
    destroy,
    play,
    pause,
    seek,
    toggle,
    setVolume: setVolumeLevel,
    toggleMute,
    toggleFullscreen,
    sendDanmaku,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
  }
}
