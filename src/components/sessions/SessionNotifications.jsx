'use client';

import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { useCollection } from "@/lib/hooks/useCollection";
import { differenceInMinutes } from 'date-fns';
import { playNotificationSound } from '@/lib/utils/sound';
import { Button } from '../ui/button';

export function SessionNotifications() {
  const { data: sessions } = useCollection("sessions", {
    filter: 'status = "Active"',
    expand: 'device_id,customer_id'
  });
  const [checkedSessions, setCheckedSessions] = useState(new Set());

  useEffect(() => {
    const checkSessionEndTimes = () => {
      if (!sessions) return;

      sessions.forEach(session => {
        if (checkedSessions.has(session.id)) return;

        const sessionEndTime = new Date(session.session_out);
        const timeUntilEnd = differenceInMinutes(sessionEndTime, new Date());

        if (timeUntilEnd <= 5 && timeUntilEnd > 0) {
          // Play notification sound
          playNotificationSound();

          toast({
            title: "Session Ending Soon",
            description: `Session for ${session.expand.device_id.name} (${session.expand.customer_id.customer_name}) ends in ${timeUntilEnd} minutes`,
            duration: 10000,
            variant: "warning",
            action: (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Navigate to session details or trigger extend session dialog
                    window.location.href = `/booking/${session.device_id}`;
                  }}
                >
                  View Session
                </Button>
              </div>
            ),
          });

          setCheckedSessions(prev => new Set([...prev, session.id]));
        }
      });
    };

    const interval = setInterval(checkSessionEndTimes, 60000);
    checkSessionEndTimes();

    return () => clearInterval(interval);
  }, [sessions, checkedSessions, toast]);

  return null;
}

