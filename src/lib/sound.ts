export const playSound = (type: 'success' | 'error' | 'tick' | 'process') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'success') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, now);    // A4
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      oscillator.start(now);
      oscillator.stop(now + 0.4);
    } else if (type === 'error') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } else if (type === 'tick') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } else if (type === 'process') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(220, now);
      oscillator.frequency.linearRampToValueAtTime(330, now + 0.5);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      oscillator.start(now);
      oscillator.stop(now + 0.6);
    }
  } catch (e) {
  }
};
