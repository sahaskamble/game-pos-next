'use client';
import { useEffect, useState } from 'react';
// import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCollection } from "@/lib/hooks/useCollection";
import { differenceInMinutes } from 'date-fns';
import { Button } from '../ui/button';
import { NOTIFICATION_PATH, NOTIFICATION_SOUND_PATH } from '@/constants/main';
import Link from 'next/link';
import { X } from 'lucide-react';

// Define constant for notification sound path
export function SessionNotifications() {
  const { data: sessions } = useCollection("sessions", {
    filter: 'status = "Active"',
    expand: 'device_id,customer_id'
  });

  const [isOpen, setIsOpen] = useState(true);
  const [checkedSessions, setCheckedSessions] = useState(new Set());
  const [notifiedFiveMin, setNotifiedFiveMin] = useState(new Set());
  const [notifiedEnd, setNotifiedEnd] = useState(new Set());
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [swRegistration, setSwRegistration] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [notificationAudio, setNotificationAudio] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationContent, setNotificationContent] = useState({ title: '', body: '' });
  const [currentSession, setCurrentSession] = useState(null);

  // Detect if user is on mobile device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        setIsMobile(isMobileDevice);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Initialize notification audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(NOTIFICATION_SOUND_PATH);
      audio.setAttribute('playsinline', '');
      audio.preload = 'auto';
      setNotificationAudio(audio);
    }
  }, []);

  // Request notification permission and check for mobile support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if notifications are supported
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);

        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          // Don't auto-request on mobile - many mobile browsers require user interaction first
          if (!isMobile) {
            Notification.requestPermission().then(permission => {
              setNotificationPermission(permission);
            });
          }
        }
      }

      // Register service worker for push notifications
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            setSwRegistration(registration);
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      }
    }
  }, [isMobile]);

  // Function to play custom notification sound
  const playNotificationSound = () => {
    try {
      if (typeof window === 'undefined' || !notificationAudio) return;

      // Reset audio to beginning in case it was already played
      notificationAudio.currentTime = 0;

      // Play the notification sound
      const playPromise = notificationAudio.play();

      // Handle play() promise to catch any autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing notification sound:', error);

          // If autoplay was prevented (common on mobile), we'll need user interaction
          if (error.name === 'NotAllowedError' && isMobile) {
            console.log('Autoplay prevented on mobile, waiting for user interaction');
          }
        });
      }

      return notificationAudio;
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Function to send browser notification with enhanced mobile support
  const sendBrowserNotification = (title, body, url = '/', sessionData = null) => {
    // Play notification sound
    playNotificationSound();

    // Show dialog notification
    setNotificationContent({ title, body });
    setCurrentSession(sessionData);
    setIsNotificationOpen(true);

    // Show browser notification for desktop and mobile browsers that support it
    if (notificationPermission === 'granted' && 'Notification' in window) {
      try {
        // Enhanced notification options for mobile browsers
        const notificationOptions = {
          body: body,
          icon: '/notification-icon.png',
          badge: '/notification-badge.png', // Small icon for Android notification bar
          tag: `session-${Date.now()}`, // Group similar notifications on mobile
          renotify: true, // Force notification even if tag exists (good for mobile)
          requireInteraction: true, // Keep notification until user interacts (where supported)
          silent: false, // Use system sound on mobile
        };

        // Add vibration for mobile devices that support it
        if (isMobile && 'vibrate' in navigator) {
          notificationOptions.vibrate = [100, 50, 100];
        }

        const notification = new Notification(title, notificationOptions);

        notification.onclick = function() {
          // On mobile, focusing existing windows works differently
          if (isMobile) {
            window.location.href = url;
          } else {
            window.open(url, '_blank');
            window.focus();
          }
        };
      } catch (error) {
        console.error('Notification error:', error);
      }
    }

    // Use service worker for push notifications if available (better for mobile)
    if (swRegistration && swRegistration.active) {
      try {
        // Enhanced service worker notification for mobile
        const swOptions = {
          body: body,
          icon: '/notification-icon.png',
          badge: '/notification-badge.png',
          tag: `session-${Date.now()}`,
          renotify: true,
          requireInteraction: true,
          data: { url },
          actions: isMobile ? [
            { action: 'view', title: 'View Session' },
            { action: 'dismiss', title: 'Dismiss' }
          ] : undefined
        };

        if (isMobile && 'vibrate' in navigator) {
          swOptions.vibrate = [100, 50, 100];
        }

        swRegistration.showNotification(title, swOptions)
          .catch(err => console.error('Service worker notification error:', err));
      } catch (error) {
        console.error('Service worker error:', error);
      }
    }
  };

  useEffect(() => {
    const checkSessionEndTimes = () => {
      if (!sessions) return;

      const now = new Date();

      sessions.forEach(session => {
        const sessionId = session.id;
        const sessionEndTime = new Date(session.session_out);
        const timeUntilEnd = differenceInMinutes(sessionEndTime, now);
        const deviceName = session?.expand?.device_id?.name || 'Unknown Device';
        const customerName = session?.expand?.customer_id?.customer_name || 'Unknown Customer';
        const sessionUrl = `/booking/${session.device_id}`;

        // Check for 5-minute warning
        if (timeUntilEnd <= 5 && timeUntilEnd > 0 && !notifiedFiveMin.has(sessionId)) {
          sendBrowserNotification(
            "Session Ending Soon",
            `Session for ${deviceName} (${customerName}) ends in ${timeUntilEnd} minutes`,
            sessionUrl,
            session
          );

          // Mark as notified
          setNotifiedFiveMin(prev => new Set([...prev, sessionId]));
          setCheckedSessions(prev => new Set([...prev, sessionId]));
        }

        // Check for session end
        if (timeUntilEnd <= 0 && !notifiedEnd.has(sessionId)) {
          sendBrowserNotification(
            "Session Ended",
            `Session for ${deviceName} (${customerName}) has ended`,
            sessionUrl,
            session
          );

          // Mark as notified
          setNotifiedEnd(prev => new Set([...prev, sessionId]));
        }
      });
    };

    // Check immediately
    checkSessionEndTimes();

    // Set up interval for checking sessions (every minute)
    const interval = setInterval(checkSessionEndTimes, 60000);

    return () => clearInterval(interval);
  }, [sessions, checkedSessions, notifiedFiveMin, notifiedEnd, notificationPermission, swRegistration, audioUnlocked, notificationAudio]);

  // Test notification sound function
  const testNotificationSound = () => {
    if (isMobile && !audioUnlocked) {
      // For mobile, we need to unlock audio first
      if (notificationAudio) {
        notificationAudio.play().then(() => {
          setAudioUnlocked(true);
          console.log("Audio unlocked on mobile");
        }).catch(e => {
          console.log("Couldn't unlock audio:", e);

          // Try an alternative approach for iOS
          if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            document.addEventListener('touchend', function unlockAudio() {
              if (notificationAudio) {
                notificationAudio.play().then(() => {
                  setAudioUnlocked(true);
                  document.removeEventListener('touchend', unlockAudio);
                }).catch(() => { });
              }
            }, { once: true });
          }
        });
      }
    } else {
      // For desktop or unlocked mobile, play directly
      playNotificationSound();
    }
  };

  // Mobile-specific permission request button with audio unlock
  const requestNotificationPermission = () => {
    // Unlock audio on mobile with user interaction
    if (isMobile && notificationAudio) {
      notificationAudio.play().then(() => {
        setAudioUnlocked(true);
        console.log("Audio unlocked on mobile");
      }).catch(e => {
        console.log("Couldn't unlock audio:", e);

        // Try an alternative approach for iOS
        if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          document.addEventListener('touchend', function unlockAudio() {
            if (notificationAudio) {
              notificationAudio.play().then(() => {
                setAudioUnlocked(true);
                document.removeEventListener('touchend', unlockAudio);
              }).catch(() => { });
            }
          }, { once: true });
        }
      });
    } else {
      // For desktop, just ensure the audio is loaded
      if (notificationAudio) {
        notificationAudio.load();
      }
    }

    // Then proceed with notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);

        if (permission === 'granted' && 'serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            console.log('Ready for notifications');
          });
        }
      });
    }
  };

  // Show permission button only if needed
  if (notificationPermission !== 'granted' && notificationPermission !== 'denied') {
    return (
      <>
        <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <DialogContent className="max-w-none w-screen h-screen p-0 rounded-none">
            <DialogHeader className="p-6">
              <DialogTitle>{notificationContent.title}</DialogTitle>
              <DialogDescription>{notificationContent.body}</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="default"
            size={isMobile ? "lg" : "default"}
            className={isMobile ? "px-6 py-3 text-lg" : ""}
            onClick={requestNotificationPermission}
          >
            {isMobile ? 'Enable Sound & Notifications' : 'Enable Notifications'}
          </Button>
        </div>
      </>
    );
  }

  return (
    <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
      <DialogContent className="max-w-[80dvw] w-auto h-auto p-0 rounded-none">
        <DialogHeader className="p-6">
          <DialogTitle className='text-xl md:text-4xl'>{notificationContent.title}</DialogTitle>
          <DialogDescription className='text-lg md:text-2xl'>{notificationContent.body}</DialogDescription>
        </DialogHeader>

        <div className="p-6 mt-auto" onClick={() => setIsNotificationOpen(false)}>
          <Link
            href={currentSession?.expand?.device_id?.type === 'VR'
              ? `/booking/vr/close/${currentSession?.device_id}`
              : `/booking/close/${currentSession?.device_id}`}
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white inline-flex justify-center items-center rounded-lg gap-2 transition-colors"
          >
            <X className="h-5 w-5" />
            <span>Close Session</span>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
