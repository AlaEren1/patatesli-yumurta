"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Video, Link as LinkIcon, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import WordDictionaryPopup from '@/components/WordDictionaryPopup';
import { useUserStore } from '@/store/useUserStore';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Segment {
  text: string;
  offset: number;   // seconds
  duration: number;
}

interface PopupState {
  word: string;
  context: string;
  style: React.CSSProperties;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) return parsed.searchParams.get('v');
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
    return null;
  } catch {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Word-level Tap-to-Translate for transcript lines ─────────────────────────
function TranscriptLine({
  segment,
  isActive,
  onClick,
  onWordClick,
}: {
  segment: Segment;
  isActive: boolean;
  onClick: () => void;
  onWordClick: (word: string, context: string, e: React.MouseEvent) => void;
}) {
  const words = segment.text.split(/(\s+)/);

  return (
    <div
      className={`relative flex gap-4 items-start px-5 py-4 rounded-2xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-transparent border border-indigo-500/25 shadow-[0_0_30px_rgba(99,102,241,0.12)]'
          : 'border border-transparent hover:bg-white/[0.03] opacity-50 hover:opacity-75'
      }`}
    >
      {/* Active glow bar on the left */}
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
      )}

      {/* Timestamp pill */}
      <button
        onClick={onClick}
        className={`flex-shrink-0 font-mono text-xs px-2.5 py-1.5 rounded-lg transition-all duration-200 mt-0.5 ${
          isActive
            ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 shadow-sm'
            : 'bg-white/5 text-slate-600 hover:bg-indigo-500/20 hover:text-indigo-300 border border-white/5'
        }`}
      >
        {formatTime(segment.offset)}
      </button>

      {/* Clickable words */}
      <p className={`text-base leading-8 transition-all duration-300 ${
        isActive ? 'text-white font-semibold tracking-wide' : 'text-slate-500'
      }`}>
        {words.map((word, i) =>
          /^\s+$/.test(word) ? (
            <span key={i}>{word}</span>
          ) : (
            <span
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                const clean = word.replace(/[.,!?¿¡;:"""()]/g, '');
                if (clean.length > 1) onWordClick(clean, segment.text, e);
              }}
              className={`cursor-pointer rounded-md px-0.5 transition-all duration-100 ${
                isActive
                  ? 'hover:bg-indigo-400/30 hover:text-indigo-100'
                  : 'hover:bg-white/10 hover:text-slate-300'
              }`}
            >
              {word}
            </span>
          )
        )}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VideoRoom() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasOnboarded, targetLanguage } = useUserStore();
  const [mounted, setMounted] = useState(false);

  // Input state
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [transcriptStatus, setTranscriptStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // YouTube IFrame API
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Popup
  const [popup, setPopup] = useState<PopupState | null>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !hasOnboarded) router.push('/onboarding');
  }, [hasOnboarded, mounted, router]);

  // ── Load YouTube IFrame API script once ──────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).YT) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }, []);

  // ── Initialise player when videoId is set ────────────────────────────────
  useEffect(() => {
    if (!videoId || typeof window === 'undefined') return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new (window as any).YT.Player('yt-player', {
        videoId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            // Start polling current time
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = setInterval(() => {
              if (playerRef.current?.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
              }
            }, 200);
          },
        },
      });
    };

    // YT API might already be ready
    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // ── Sync active line from currentTime ────────────────────────────────────
  useEffect(() => {
    if (!segments.length) return;
    let idx = 0;
    for (let i = 0; i < segments.length; i++) {
      if (currentTime >= segments[i].offset) idx = i;
      else break;
    }
    setActiveIndex(idx);
  }, [currentTime, segments]);

  // ── Auto-scroll active line into view ────────────────────────────────────
  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeIndex]);

  // ── Seek video to a clicked segment ─────────────────────────────────────
  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  }, []);

  // ── Word popup ────────────────────────────────────────────────────────────
  const handleWordClick = (word: string, context: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopup({
      word,
      context,
      style: {
        position: 'fixed',
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - 320),
        zIndex: 9999,
      },
    });
  };

  // ── Load video handler ────────────────────────────────────────────────────
  const handleLoad = async () => {
    const id = extractYouTubeId(urlInput.trim());
    if (!id) {
      setErrorMsg('Please paste a valid YouTube URL or Video ID.');
      setTranscriptStatus('error');
      return;
    }

    setVideoId(id);
    setSegments([]);
    setActiveIndex(0);
    setTranscriptStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/transcript?videoId=${id}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Transcript unavailable.');
        setTranscriptStatus('error');
      } else {
        setSegments(data.segments);
        setTranscriptStatus('success');
        
        // Track video watch
        if (user) {
          supabase.rpc('increment_videos_watched', { target_user_id: user.id })
            .then(({ error }) => {
              if (error) console.error('Failed to increment videos_watched:', error.message);
            });
        }
      }
    } catch {
      setErrorMsg('A network error occurred. Please try again.');
      setTranscriptStatus('error');
    }
  };

  const handleReset = () => {
    setUrlInput('');
    setVideoId(null);
    setSegments([]);
    setTranscriptStatus('idle');
    setErrorMsg('');
    setActiveIndex(0);
    if (pollRef.current) clearInterval(pollRef.current);
    if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
  };

  if (!mounted || !hasOnboarded) return null;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans" onClick={() => setPopup(null)}>
      <div className="max-w-[1440px] mx-auto p-6 lg:p-10 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-2 text-rose-400 hover:text-rose-300 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          {videoId && (
            <button onClick={handleReset} className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">
              ← Load a different video
            </button>
          )}
        </div>

        {/* URL Input Landing */}
        {!videoId ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
            <div className="w-full max-w-2xl space-y-6 text-center">
              <div className="w-16 h-16 bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/30 shadow-lg shadow-rose-500/10">
                <Video className="w-8 h-8 text-rose-400" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">Video Room</h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Paste any YouTube link in <span className="text-rose-400 font-bold">{targetLanguage}</span>. Watch it while the synchronized transcript follows along — tap words to translate!
              </p>

              <div className="flex gap-3 mt-8">
                <div className="flex-1 flex items-center space-x-3 bg-[#141A29] border border-white/10 rounded-2xl px-5 py-4 focus-within:border-rose-500/50 transition-colors shadow-lg">
                  <LinkIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-transparent outline-none text-slate-200 placeholder:text-slate-600 font-medium text-base"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleLoad}
                  className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_24px_rgba(239,68,68,0.35)] hover:shadow-[0_0_32px_rgba(239,68,68,0.5)] active:scale-[0.97] whitespace-nowrap"
                >
                  Load Video
                </button>
              </div>

              {transcriptStatus === 'error' && (
                <div className="flex items-center space-x-3 bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-rose-400 text-left animate-in fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
              )}
              <p className="text-xs text-slate-600 font-medium">Works with any YouTube video that has CC or auto-generated captions.</p>
            </div>
          </div>

        ) : (
          // Playback View
          <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300">

            {/* Left: Embedded Player */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                {/* YouTube IFrame API target */}
                <div id="yt-player" className="w-full h-full" />
              </div>
              <div className="flex items-center space-x-2 text-indigo-400/70 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Click a timestamp pill to jump the video — tap any word to translate it.</span>
              </div>
            </div>

            {/* Right: Synchronized Transcript */}
            <div className="lg:w-[500px] xl:w-[560px] flex flex-col bg-[#0E1320] rounded-3xl border border-white/8 shadow-2xl overflow-hidden" style={{ maxHeight: '80vh' }}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02] flex-shrink-0">
                <h3 className="font-bold text-white flex items-center space-x-2.5">
                  <div className="w-7 h-7 bg-rose-500/20 rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4 text-rose-400" />
                  </div>
                  <span className="text-base">Transcript</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Live Sync</span>
                </div>
              </div>

              {/* Segments */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1" onClick={(e) => e.stopPropagation()}>
                {transcriptStatus === 'loading' && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                    <p className="font-medium text-slate-500">Fetching transcript…</p>
                  </div>
                )}
                {transcriptStatus === 'error' && (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 py-16">
                    <AlertCircle className="w-10 h-10 text-rose-500/50" />
                    <p className="text-slate-400 font-medium text-center">{errorMsg}</p>
                  </div>
                )}
                {transcriptStatus === 'success' && segments.map((seg, i) => (
                  <div key={i} ref={i === activeIndex ? activeLineRef : undefined}>
                    <TranscriptLine
                      segment={seg}
                      isActive={i === activeIndex}
                      onClick={() => seekTo(seg.offset)}
                      onWordClick={handleWordClick}
                    />
                  </div>
                ))}

                {/* Bottom padding so last line isn't cut off */}
                {transcriptStatus === 'success' && <div className="h-24" />}
              </div>

              {/* Bottom fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0E1320] to-transparent pointer-events-none rounded-b-3xl" />
            </div>

          </div>
        )}
      </div>

      {/* Word Popup */}
      {popup && (
        <div onClick={(e) => e.stopPropagation()}>
          <WordDictionaryPopup
            word={popup.word}
            context={popup.context}
            onClose={() => setPopup(null)}
            style={popup.style}
          />
        </div>
      )}
    </div>
  );
}
