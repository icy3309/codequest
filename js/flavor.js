'use strict';
/* =========================================================
   Tier-Texte je Modus: alles, was an das Maskottchen angelehnt
   ist (Sprüche, Ränge, Easter-Egg, Startseite, Geräusch-Art).
   🐭 Mimi (Käse) · 🐿️ Gurt (Nüsse) · 🍊 Capy (Orangen, Teich)
   Neue tierische Texte immer hier für ALLE drei Modi eintragen.
   ========================================================= */
const COMMON_LINES = {
  error: ['Huch! Lies mal die Meldung unten 🔍', 'Da klemmt was – ich schau mit 🔧'],
  hint: ['Gute Idee – Hilfe holen ist schlau! 💡', 'Ein kleiner Tipp kann Wunder wirken ✨'],
};

const FLAVOR = {
  mouse: {
    name: 'Mimi', who: 'deine Schraubermaus', snack: 'Käsestück für Käsestück', snackIcon: '🧀', namePh: 'kaese_maus',
    ranks: [['Babymaus', '🐭'], ['Krümelsucherin', '🧀'], ['Käsedetektivin', '🔍'], ['Schrauber-Maus', '🔧'], ['Mäusegenie', '🧠'], ['Käse-Architektin', '🏰'], ['Mäusekönigin', '👑']],
    lines: {
      idle: ['Du schaffst das! 🧀', 'Ich glaub an dich! 💕', 'Ein Käsestück nach dem anderen 🧀', 'Fehler sind nur Krümel auf dem Weg 🍪',
        'Piep piep – weiter so! 🐭', 'Programmieren ist wie Käse suchen: dranbleiben! 🔍', 'Kleine Schritte, großer Käse 🧀',
        'Ich halt schon mal den Schraubendreher bereit 🔧', 'Du bist richtig gut darin! ✨', 'Pause machen ist auch erlaubt ☕', 'Noch ein Level bis zum nächsten Käse! 🧀'],
      run: ['Ich schraub mal mit … 🔧', 'Mal sehen, was passiert … 👀', 'Los geht’s! 🐭💨'],
      pass: ['Juhuu! 🎉', 'Käse für dich! 🧀🧀🧀', 'Du bist die Beste! 💖', 'Perfekt geschraubt! 🔧✨', 'Piiiiep! Geschafft! 🎉'],
      fail: ['Fast! Du schaffst das 💪', 'Nicht schlimm – nochmal probieren! 🧀', 'Ein Krümel fehlt noch 🍪', 'Fehler sind zum Lernen da 💕'],
      dizzy: ['Puh, mir ist ganz schwindelig 😵 – Endlosschleife?', 'Ich renn im Kreis … 🌀 Endet deine Schleife?'],
      click: ['Piep! 🐭', 'Hihi, das kitzelt! 💕', 'Hallo du! 👋', 'Hast du Käse dabei? 🧀', 'Ich bin Mimi, deine Schraubermaus! 🔧'],
      sing: ['♪ piep piep ♪', '♫ pieps-di-piep ♫', '♪ la-la-piep ♪', '♫ mmh, Käsebeats ♫'],
      thoughts: ['🧀?', '💭 Käse …', '♪ ♫', '💕', 'Weiter lernen? 🐭', '✨', 'Piep!'],
      sleepy: 'Zzz … 💤', hello: 'Guten Morgen! ☀️🐭', project: 'Ein Projekt! Ich hab den Schraubendreher bereit 🔧',
    },
    egg: {
      word: 'piep', hints: ['piep?', 'hihi', 'nicht kitzeln!', 'piiiep!', 'noch ein bisschen …', 'fast …!'],
      rain: ['🧀', '🧀', '🧀', '🐭', '💕', '✨', '🧀'],
      first: '🧀 <b>Psst … du hast Mimis geheimes Käseversteck gefunden!</b><br>Zur Belohnung trägt Mimi jetzt ein Käsekrönchen. 👑',
      again: (n) => `🧀 Käseparty Nr. ${n}! Mimi freut sich riesig. 🐭💕`,
      badge: '🧀 Geheimer Käsefinder',
    },
  },
  squirrel: {
    name: 'Gurt', who: 'dein Schrauberhörnchen', snack: 'Nuss für Nuss', snackIcon: '🌰', namePh: 'nuss_hoernchen',
    ranks: [['Babyhörnchen', '🐿️'], ['Nusssammlerin', '🌰'], ['Nussdetektivin', '🔍'], ['Schrauber-Hörnchen', '🔧'], ['Hörnchengenie', '🧠'], ['Bau-Architektin', '🏰'], ['Hörnchenkönigin', '👑']],
    lines: {
      idle: ['Du schaffst das! 🌰', 'Ich glaub an dich! 💛', 'Eine Nuss nach der anderen 🌰', 'Fehler sind nur Nussschalen auf dem Weg 🥜',
        'Tschirp tschirp – weiter so! 🐿️', 'Programmieren ist wie Nüsse vergraben: dranbleiben! 🔍', 'Kleine Schritte, großer Vorrat 🌰',
        'Ich halt schon mal den Schraubendreher bereit 🔧', 'Du bist richtig gut darin! ✨', 'Eine Pause im Bau ist auch erlaubt 🌙', 'Noch ein Level bis zur nächsten Nuss! 🌰'],
      run: ['Ich schraub mal mit … 🔧', 'Mal sehen, was passiert … 👀', 'Los geht’s! 🐿️💨'],
      pass: ['Juhuu! 🎉', 'Nüsse für dich! 🌰🌰🌰', 'Du bist die Beste! 💛', 'Perfekt geschraubt! 🔧✨', 'Tschiiirp! Geschafft! 🎉'],
      fail: ['Fast! Du schaffst das 💪', 'Nicht schlimm – nochmal probieren! 🌰', 'Eine Nuss fehlt noch 🥜', 'Fehler sind zum Lernen da 💛'],
      dizzy: ['Puh, mir dreht sich alles 😵 – Endlosschleife?', 'Ich renn im Kreis wie um einen Baum … 🌀 Endet deine Schleife?'],
      click: ['Tschirp! 🐿️', 'Hihi, das kitzelt! 💛', 'Hallo du! 👋', 'Hast du Nüsse dabei? 🌰', 'Ich bin Gurt, dein Schrauberhörnchen! 🔧'],
      sing: ['♪ tschirp tschirp ♪', '♫ tschirpi-di-tschirp ♫', '♪ la-la-tschirp ♪', '♫ mmh, Nussbeats ♫'],
      thoughts: ['🌰?', '💭 Nüsse …', '♪ ♫', '💛', 'Weiter lernen? 🐿️', '🌙', 'Tschirp!'],
      sleepy: 'Zzz … Winterschlaf? 💤', hello: 'Nachtschicht! 🌙🐿️', project: 'Ein Projekt! Ich hab Nüsse und Schraubendreher bereit 🔧',
    },
    egg: {
      word: 'nuss', hints: ['tschirp?', 'hihi', 'nicht kitzeln!', 'tschiiirp!', 'noch ein bisschen …', 'fast …!'],
      rain: ['🌰', '🌰', '🥜', '🐿️', '💛', '✨', '🌰'],
      first: '🌰 <b>Psst … du hast Gurts geheimes Nussversteck gefunden!</b><br>Zur Belohnung trägt Gurt jetzt ein Nusskrönchen. 👑',
      again: (n) => `🌰 Nussparty Nr. ${n}! Gurt freut sich riesig. 🐿️💛`,
      badge: '🌰 Geheimer Nussfinder',
    },
  },
  capy: {
    name: 'Capy', who: 'dein Schrauber-Capybara', snack: 'Orange für Orange', snackIcon: '🍊', namePh: 'capy_fan',
    ranks: [['Babycapy', '🐣'], ['Orangensammlerin', '🍊'], ['Teichdetektivin', '🔍'], ['Schrauber-Capy', '🔧'], ['Capygenie', '🧠'], ['Teich-Architektin', '🪷'], ['Capykönigin', '👑']],
    lines: {
      idle: ['Ganz entspannt – du schaffst das! 🍊', 'Ich glaub an dich! 💚', 'Eine Orange nach der anderen 🍊', 'Fehler sind nur Wellen im Teich 🌊',
        'Blubb blubb – weiter so! 💦', 'Programmieren ist wie baden: einfach dranbleiben! 🛁', 'Kleine Schritte, große Orange 🍊',
        'Ich halt schon mal den Schraubendreher bereit 🔧', 'Du bist richtig gut darin! ✨', 'Ein kurzes Bad zwischendurch ist erlaubt 🪷', 'Noch ein Level bis zur nächsten Orange! 🍊'],
      run: ['Ich schraub mal mit … 🔧', 'Mal sehen, was passiert … 👀', 'Los geht’s! 💦'],
      pass: ['Juhuu! 🎉', 'Orangen für dich! 🍊🍊🍊', 'Du bist die Beste! 💚', 'Perfekt geschraubt! 🔧✨', 'Mmmh, geschafft – ganz entspannt! 🎉'],
      fail: ['Fast! Ganz ruhig, du schaffst das 💪', 'Nicht schlimm – nochmal probieren! 🍊', 'Eine Orange fehlt noch 🍊', 'Fehler sind zum Lernen da 💚'],
      dizzy: ['Puh, ich schwimm im Kreis 😵 – Endlosschleife?', 'Mir wird ganz wirbelig … 🌀 Endet deine Schleife?'],
      click: ['Blubb! 💦', 'Hihi, das kitzelt! 💚', 'Hallo du! 👋', 'Hast du eine Orange dabei? 🍊', 'Ich bin Capy, dein Schrauber-Capybara! 🔧'],
      sing: ['♪ blubb blubb ♪', '♫ mmmh-mmmh ♫', '♪ la-la-blubb ♪', '♫ entspannte Teichbeats ♫'],
      thoughts: ['🍊?', '💭 Orangen …', '♪ ♫', '💚', 'Weiter lernen? 🍊', '🪷', 'Blubb!'],
      sleepy: 'Zzz … ein Nickerchen im Teich 💤', hello: 'Ab in den Teich! 🍊💦', project: 'Ein Projekt! Ganz entspannt, ich hab den Schraubendreher bereit 🔧',
    },
    egg: {
      word: 'capy', hints: ['blubb?', 'hihi', 'nicht kitzeln!', 'blubb blubb!', 'noch ein bisschen …', 'fast …!'],
      rain: ['🍊', '🍊', '🪷', '💦', '💚', '✨', '🍊'],
      first: '🍊 <b>Psst … du hast Capys geheime Orangen-Oase gefunden!</b><br>Zur Belohnung trägt Capy jetzt eine goldene Orange. ✨',
      again: (n) => `🍊 Orangenparty Nr. ${n}! Capy freut sich ganz entspannt. 💚`,
      badge: '🍊 Geheime Orangen-Oase',
    },
  },
};

/** Aktuelle Tier-Texte (nach gewähltem Modus). */
function flavor() {
  const t = document.documentElement.dataset.theme || 'mouse';
  return FLAVOR[t] || FLAVOR.mouse;
}
/** Zufälliger Spruch der Art kind (idle, run, pass, …) fürs aktuelle Tier. */
function flavorLine(kind) {
  const L = flavor().lines[kind] || COMMON_LINES[kind] || flavor().lines.idle;
  return Array.isArray(L) ? L[Math.floor(Math.random() * L.length)] : L;
}
