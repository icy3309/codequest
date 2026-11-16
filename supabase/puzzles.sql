-- Automatisch erzeugt: Wochenrätsel. Hashes enthalten einen geheimen Zusatzwert (app_secrets.puzzle_pepper).
delete from public.weekly_puzzles;
insert into public.weekly_puzzles (slot, tier, title, answer_hash) values
  (0, 1, 'Wo ist der Roboter?', 'fb2fb6f6a10661616f091f78e66f80a416030c2b51936c7ab8d1c246039fd8c6'),
  (0, 2, 'Besuchte Felder', '864934bf5c0b424b23b0114e0e9a9b92cfe5b16d5d28a99a9aca48bf05300b02'),
  (0, 3, 'Kisten im Weg', '985adf4019e3437c17e56c73e19a2163e95a6c385e26cbf4d4eac917eb08addf'),
  (1, 1, 'Vokal-Zähler', '8eac9677a8265677eff4c7549a72429ca5816e7c460db26646a8086bbf443fd6'),
  (1, 2, 'Caesar knacken', '0e311bb1e9bf2aac0035bc59a604e8a3241dc98b9677fc77da52f11993dcc8d2'),
  (1, 3, 'Anagramm-Gruppen', 'ae38aabfdc09c874cd4236264364b8a6a999188aeb3d362a96a28a9acd44d6c5'),
  (2, 1, '3er und 7er', '4c61f0255643fff76b4d310a4697b42459bd6365a52981cd3fcec885c77c12a2'),
  (2, 2, 'Primzahl-Jagd', '641dbd0f389fa792b9edbda0e220025edb544c9f95026da884dfbfe18d5ba290'),
  (2, 3, 'Die längste Collatz-Kette', '85f7e5e3c8027fa091844ffb22e02d9cffd8c97d766214dc9172c01c618deb05'),
  (3, 1, 'Mias Punkte', '9987be5a1397cd04fc624517797f2cfafac2526abb3594e844a74653ef8b4a98'),
  (3, 2, 'Wer gewinnt?', '4caa2f1f418c35308f032b2f0e1422e3d617e63625fb3304f37eb800a9dcf40c'),
  (3, 3, 'Die Liga-Tabelle', 'b39c23ee5e032f032f103a8110f2b09667ea35542eaeafbde85ebd2f68e277c6')
on conflict (slot, tier) do update set title = excluded.title, answer_hash = excluded.answer_hash;
