const BAR_COUNT = 30;

export function formatAudioTime(seconds) {
  if (!seconds || Number.isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function computeWaveformBars(url, callback) {
  let cancelled = false;
  const cleanup = () => {
    cancelled = true;
  };

  try {
    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        if (cancelled) return;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) {
          callback(null);
          return;
        }
        const ctx = new Ctx();
        ctx.decodeAudioData(
          buffer,
          (audio) => {
            if (cancelled) {
              ctx.close();
              return;
            }
            const data = audio.getChannelData(0);
            const blockSize = Math.max(1, Math.floor(data.length / BAR_COUNT));
            const bars = [];
            for (let i = 0; i < BAR_COUNT; i++) {
              const start = i * blockSize;
              const end = Math.min(data.length, start + blockSize);
              let sum = 0;
              for (let j = start; j < end; j++) sum += Math.abs(data[j] || 0);
              bars.push(sum / Math.max(1, end - start));
            }
            const max = Math.max(...bars, 0.01);
            callback(bars.map((b) => Math.min(1, b / max)));
            ctx.close();
          },
          () => {
            if (!cancelled) callback(null);
          }
        );
      })
      .catch(() => {
        if (!cancelled) callback(null);
      });
  } catch {
    if (!cancelled) callback(null);
  }

  return cleanup;
}
