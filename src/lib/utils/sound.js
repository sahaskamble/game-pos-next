// utils/sound.js

/**
 * Play a notification sound with fallbacks
 * @returns {Promise} A promise that resolves when the sound finishes or fails
 */
export const playNotificationSound = async () => {
  // Try different sound approaches in sequence until one works
  return new Promise(async (resolve) => {
    // Try method 1: Web Audio API with beep (most reliable)
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2); // Short beep

        setTimeout(resolve, 200); // Resolve after beep finishes
        return;
      }
    } catch (e) {
      console.log('Web Audio API beep failed:', e);
    }

    // Try method 2: HTML5 Audio (might fail on some mobile browsers)
    try {
      if (typeof window !== 'undefined' && window.Audio) {
        const audio = new Audio();

        // Set up event handlers
        audio.onended = () => resolve();
        audio.onerror = () => {
          console.log('Audio playback failed');
          resolve();
        };

        // Try to play
        audio.src = '/notification-sound.mp3';
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.log('Audio play failed:', e);
            resolve();
          });
        }

        // Safety timeout in case events don't fire
        setTimeout(resolve, 2000);
        return;
      }
    } catch (e) {
      console.log('HTML5 Audio failed:', e);
    }

    // If all methods fail, just resolve
    resolve();
  });
};
