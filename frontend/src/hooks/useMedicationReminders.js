import { useEffect, useRef } from 'react';

export function useMedicationReminders(medications) {
  const notifiedSet = useRef(new Set());

  useEffect(() => {
    // Request permission on mount if not already granted/denied
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!medications || medications.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      // format as HH:MM
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      medications.forEach(med => {
        med.reminder_times.forEach(time => {
          const uniqueKey = `${med.id}-${time}-${now.toDateString()}`; // one notification per day strictly for that time slot
          
          if (time === currentTime && !notifiedSet.current.has(uniqueKey)) {
            // Check if permission granted
            if ("Notification" in window && Notification.permission === "granted") {
              const notification = new Notification(`Time for ${med.name}!`, {
                body: `Reminder: Please take your medicine (${med.dosage}).`,
                icon: '/favicon.ico', // fallback icon
                requireInteraction: true // requires user to close it manually so they don't miss it
              });
              
              notification.onclick = () => {
                window.focus();
                notification.close();
              };
              
              notifiedSet.current.add(uniqueKey);
            }
          }
        });
      });
    }, 15000); // Check every 15 seconds to ensure we don't skip a minute boundary

    return () => clearInterval(interval);
  }, [medications]);
}
