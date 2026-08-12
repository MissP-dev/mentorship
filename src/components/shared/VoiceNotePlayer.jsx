import { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { computeWaveformBars, formatAudioTime } from '../../utils/audioWaveform';
import { playExclusive, releaseExclusive } from '../../utils/audioPlayer';

const FALLBACK_BARS = Array(30).fill(0.5);

export default function VoiceNotePlayer({ audioUrl, isOwn = false, initialBars }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bars, setBars] = useState(initialBars || null);

  useEffect(() => {
    if (initialBars) return undefined;
    return computeWaveformBars(audioUrl, (computed) => setBars(computed));
  }, [audioUrl, initialBars]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleEnd = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnd);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnd);
      releaseExclusive(audio);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      playExclusive(audio);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const toggleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    audio.playbackRate = next;
    setPlaybackRate(next);
  };

  const displayBars = (bars && bars.length ? bars : FALLBACK_BARS);
  const progress = duration ? currentTime / duration : 0;
  const activeIndex = Math.floor(progress * displayBars.length);

  return (
    <div className="flex items-center gap-2.5 min-w-[220px] max-w-[280px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isOwn ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'
        }`}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <button onClick={handleSeek} className="flex-1 min-w-0 cursor-pointer" aria-label="Seek">
        <div className="flex items-end gap-[2.5px] h-8">
          {displayBars.map((height, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full ${
                i <= activeIndex
                  ? isOwn
                    ? 'bg-white'
                    : 'bg-purple-500'
                  : isOwn
                    ? 'bg-white/40'
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={{ height: `${Math.max(4, Math.round(height * 26))}px` }}
            />
          ))}
        </div>
      </button>
      <span
        className={`text-xs font-medium tabular-nums w-10 text-right shrink-0 ${
          isOwn ? 'text-white' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {formatAudioTime(currentTime)}
      </span>
      <button
        onClick={toggleSpeed}
        className={`text-xs font-semibold shrink-0 ${isOwn ? 'text-purple-200' : 'text-purple-600 dark:text-purple-400'}`}
        title="Playback speed"
      >
        {playbackRate}x
      </button>
    </div>
  );
}
