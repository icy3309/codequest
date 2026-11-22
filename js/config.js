'use strict';
/* ---------------------------------------------------------
   Supabase-Zugangsdaten für den Online-Teil (Freunde, Rangliste,
   Wochenrätsel-Wertung).
   Zu finden in Supabase unter: Project Settings → API
   - Project URL               → SUPABASE_URL
   - anon / publishable key    → SUPABASE_ANON_KEY
   Beide Werte sind öffentlich und dürfen ins Repo – geschützt wird
   alles über die Row-Level-Security in supabase/schema.sql.
   Leer lassen = Offline-Modus: Lernen funktioniert trotzdem komplett.
   --------------------------------------------------------- */
const SUPABASE_URL = 'https://rqvfkpwqozovgqxinfqu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HwJFCKhr07MJf98Kgtjrqg_BRtPiS-3';

/* Angaben für Impressum und Datenschutz (nur nötig, wenn die Seite öffentlich ist). */
const SITE_OWNER = {
  name: 'Jasper Haag',
  street: '',           // ← Postanschrift (Straße, Hausnummer) – noch offen
  city: '',             // ← PLZ und Ort – noch offen
  email: 'icy3309adi@gmail.com',
};

const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
