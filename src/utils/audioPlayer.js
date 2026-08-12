let currentAudio = null;

export function playExclusive(audio) {
  if (!audio) return;
  if (currentAudio && currentAudio !== audio && !currentAudio.paused) {
    currentAudio.pause();
  }
  currentAudio = audio;
  audio.play().catch(() => {});
}

export function releaseExclusive(audio) {
  if (currentAudio === audio) {
    currentAudio = null;
  }
}
