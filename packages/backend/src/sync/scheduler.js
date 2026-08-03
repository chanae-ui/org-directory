import cron from 'node-cron';
import { runSync } from './mondaySync.js';

// רץ כל יום ב-03:00 בלילה
export function startScheduledSync() {
  cron.schedule('0 3 * * *', async () => {
    try {
      await runSync();
    } catch (err) {
      console.error('סנכרון מתוזמן נכשל:', err);
    }
  });

  console.log('סנכרון יומי מתוזמן ל-03:00');
}
