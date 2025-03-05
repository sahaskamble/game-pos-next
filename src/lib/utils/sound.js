export const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3'); // Add an audio file to your public folder
  audio.play().catch(error => {
    console.error('Error playing notification sound:', error);
  });
};