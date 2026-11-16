-- Automatisch erzeugt: Wochenrätsel (Antworten nur als Hash).
insert into public.weekly_puzzles (slot, tier, title, answer_hash) values
  (0, 1, 'Wo ist der Roboter?', '3439ddabbf90c09f347a9b67df7dc0c1875d97bcace1f2e99747b07dbf52bb5a'),
  (0, 2, 'Besuchte Felder', '13578b98e709a1b1cc37580e96fdac8cda0999e93a0a43753588314afd56e704'),
  (0, 3, 'Kisten im Weg', '6fcac310e3b8b0f4191a39ef2b0f47da767b749190a94eb18a5e9c0fe0f802d4'),
  (1, 1, 'Vokal-Zähler', 'e736103f2c0359da4cf8c4e05be7047520822a6dff0177353fc6ff3bec9af903'),
  (1, 2, 'Caesar knacken', '9a7b803416901df7d9f5b0ccb50408c21929d12e504d2c487a96e201e189d1fb'),
  (1, 3, 'Anagramm-Gruppen', '09432e8c87c3682079f957d433efcac0bb1cd1137e15d6b864a6132bfcefcdbb'),
  (2, 1, '3er und 7er', '3483bf4d249770e3b897867f822a58272a1cbafc4714d11893a9499b5c5acb04'),
  (2, 2, 'Primzahl-Jagd', 'e56281e99f046464b3afdf597d59ad7d0695ecf8b018eff053354e1cdf7321d6'),
  (2, 3, 'Die längste Collatz-Kette', '7fa33ff670b4005f502fe66b1a3a75be321cfe253e889a4826382f1ff6da44e9'),
  (3, 1, 'Mias Punkte', '5a0b2370b3d706669f76cb8d57158d3d77be949c500771c2864b21729e1e937e'),
  (3, 2, 'Wer gewinnt?', 'c0d0372a52784d053b41cb0417d0ec6393a98c1f6643a28136d8733b0c1f2f68'),
  (3, 3, 'Die Liga-Tabelle', 'e313a4a9900b7256703b19eb5d8c993aa84affc478f82502e41310f0b09ee1e0')
on conflict (slot, tier) do update set title = excluded.title, answer_hash = excluded.answer_hash;
