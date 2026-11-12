/* Mergio Studios · script del sito */
(function () {
  'use strict';

  /* ---------- Google Play ----------
     Quando un gioco esce in produzione sul Play Store, basta mettere  pubblicato: true  qui sotto:
     tutti i tasti di quel gioco, in tutte le pagine, diventano «Scaricalo da Google Play» con il link giusto. */
  var NEGOZIO = {
    sintonizzati: { pubblicato: false, url: 'https://play.google.com/store/apps/details?id=it.mergiostudios.sintonizzati' },
    chidinoi: { pubblicato: false, url: 'https://play.google.com/store/apps/details?id=com.mergiostudios.chidinoi' }
  };
  document.querySelectorAll('[data-negozio]').forEach(function (t) {
    var g = NEGOZIO[t.dataset.negozio];
    if (g && g.pubblicato) {
      t.href = g.url; t.removeAttribute('aria-disabled');
      t.querySelector('span').textContent = 'Scaricalo da Google Play';
    }
  });

  /* ---------- Sintonizzati: la radio da provare ---------- */
  var prova = document.querySelector('.prova');
  if (prova) {
    var CARTE = [
      { a: 'Cibo terribile', b: 'Cibo delizioso', indizio: 'Pizza con l’ananas', centro: 15 },   // 91 MHz
      { a: 'Animale innocuo', b: 'Animale pericoloso', indizio: 'Un’oca arrabbiata', centro: 68 },
      { a: 'Freddo', b: 'Caldo', indizio: 'Il caffè dimenticato sulla scrivania', centro: 41 },
      { a: 'Film da vedere da soli', b: 'Film da vedere in compagnia', indizio: 'Un horror', centro: 77 },
      { a: 'Inutile', b: 'Indispensabile', indizio: 'Il caricabatterie in vacanza', centro: 91 }
    ];
    // centro: posizione sulla scala 0–100, cioè (MHz − 88) × 5
    // metà larghezza delle fasce (su una scala 0–100), come nel gioco: 5, 4, 3, 2 e 1 punto
    var MEZZE = [0.94, 2.5, 4.69, 7.81, 12.5];
    var ESITI = ['Fuori frequenza', 'Solo fruscio', 'Segnale debole', 'Segnale pulito', 'Segnale forte', 'Sintonia perfetta'];
    var X0 = 44, X1 = 556, NS = 'http://www.w3.org/2000/svg';
    var xDi = function (v) { return X0 + (X1 - X0) * v / 100; };
    var svg = prova.querySelector('svg'), cursore = prova.querySelector('input[type="range"]');
    var crea = function (nome, attributi, dove) {
      var e = document.createElementNS(NS, nome);
      for (var k in attributi) e.setAttribute(k, attributi[k]);
      (dove || svg).appendChild(e); return e;
    };

    crea('rect', { x: 0, y: 0, width: 600, height: 250, rx: 12, fill: '#FFF0C7' });
    var segnale = crea('g', { 'class': 'segnale' });
    crea('line', { x1: X0, y1: 78, x2: X1, y2: 78, stroke: '#6B4A00', 'stroke-width': 1.5, opacity: .55 });
    var tacche = crea('g', { stroke: '#6B4A00', 'stroke-linecap': 'round' });
    for (var i = 0; i <= 100; i++) {
      var lunga = i % 10 === 0, media = i % 5 === 0;
      crea('line', { x1: xDi(i), y1: 78, x2: xDi(i), y2: 78 + (lunga ? 40 : media ? 26 : 13), 'stroke-width': lunga ? 3.2 : media ? 2.2 : 1.2, opacity: lunga ? .95 : media ? .75 : .5 }, tacche);
    }
    var cifre = crea('g', { fill: '#6B4A00', 'font-family': 'Michroma, Verdana, sans-serif', 'font-size': 19, 'text-anchor': 'middle' });
    for (var f = 88; f <= 108; f += 4) crea('text', { x: xDi((f - 88) * 5), y: 58 }, cifre).textContent = f;
    var lancetta = crea('g', { 'class': 'lancetta' }), ago = crea('g', { 'class': 'lancetta-dentro' }, lancetta);
    crea('rect', { x: -5, y: 10, width: 10, height: 230, rx: 5, fill: '#FFF0C7' }, ago);
    crea('rect', { x: -3, y: 12, width: 6, height: 226, rx: 3, fill: '#E5463A' }, ago);
    crea('circle', { cx: 0, cy: 205, r: 15, fill: '#E5463A', stroke: '#FFF0C7', 'stroke-width': 4 }, ago);
    var cifreDisplay = prova.querySelector('.display b'), manopola = prova.querySelector('.manopola');

    var quale = 0;
    var testo = function (sel, t) { prova.querySelector(sel).textContent = t; };
    var muovi = function () {
      var v = +cursore.value;
      lancetta.setAttribute('transform', 'translate(' + xDi(v) + ' 0)');
      if (cifreDisplay) cifreDisplay.textContent = (88 + v / 5).toFixed(1);          // la frequenza sul display
      if (manopola) manopola.style.transform = 'rotate(' + (v - 50) * 2.7 + 'deg)';   // la manopola gira con la lancetta
    };
    var tastoRivela = prova.querySelector('.rivela'), tastoAltra = prova.querySelector('.altra');

    function mostraCarta() {
      var c = CARTE[quale];
      testo('.cassetta.a .parole', c.a); testo('.cassetta.b .parole', c.b); testo('.indizio strong', c.indizio);
      prova.classList.remove('rivelata');
      while (segnale.firstChild) segnale.removeChild(segnale.firstChild);
      // le fasce del segnale: più chiare e più strette verso il centro
      var tinte = [['#46E3A2', 1], ['#0E9C68', .79], ['#0E9C68', .59], ['#1A8C96', .42], ['#1A8C96', .3]];
      for (var k = 4; k >= 0; k--) {
        var s = Math.max(X0 - 30, xDi(c.centro - MEZZE[k])), d = Math.min(X1 + 30, xDi(c.centro + MEZZE[k]));
        crea('rect', { x: s, y: 8, width: d - s, height: 234, fill: '#FFF0C7' }, segnale);
        crea('rect', { x: s, y: 8, width: d - s, height: 234, fill: tinte[k][0], 'fill-opacity': tinte[k][1] }, segnale);
      }
      cursore.value = 50; cursore.disabled = false; muovi();
      testo('.esito p', 'Trascinate la lancetta dove la mettereste voi.');
      tastoRivela.hidden = false; tastoAltra.hidden = true;
    }
    cursore.addEventListener('input', function () { prova.classList.add('toccata'); muovi(); });
    tastoRivela.addEventListener('click', function () {
      var c = CARTE[quale], distanza = Math.abs(+cursore.value - c.centro), punti = 0;
      for (var k = 0; k < 5; k++) if (distanza <= MEZZE[k]) { punti = 5 - k; break; }
      prova.classList.add('rivelata'); cursore.disabled = true;
      var p = prova.querySelector('.esito p');
      p.textContent = ESITI[punti] + (punti ? ': +' + punti + (punti === 1 ? ' punto' : ' punti') : ': 0 punti');
      var nota = document.createElement('small');
      nota.textContent = punti >= 4 ? 'Siete sulla stessa frequenza.' : punti ? 'Ci siete andati vicino.' : 'Qui a tavola partirebbe la discussione.';
      p.appendChild(nota);
      tastoRivela.hidden = true; tastoAltra.hidden = false; tastoAltra.focus();
    });
    tastoAltra.addEventListener('click', function () { quale = (quale + 1) % CARTE.length; mostraCarta(); cursore.focus(); });
    mostraCarta();
  }

  /* ---------- Chi di Noi: la domanda da provare ---------- */
  var domanda = document.querySelector('.domanda');
  if (domanda) {
    var DOMANDE = [
      '…risponderebbe a un messaggio dopo tre giorni con «scusa, visto ora»?',
      '…sopravviverebbe meno a lungo in un film horror?',
      '…mangerebbe l’ultima fetta di pizza senza chiedere?',
      '…scoppierebbe a ridere nel momento meno adatto?',
      '…finirebbe in televisione per il motivo sbagliato?',
      '…ha più schede aperte sul telefono in questo momento?'
    ];
    var n = 0, dove = domanda.querySelector('.testo');
    var fermo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    domanda.querySelector('button').addEventListener('click', function () {
      n = (n + 1) % DOMANDE.length;
      if (fermo) { dove.textContent = DOMANDE[n]; return; }
      // la carta si gira: il testo cambia a metà giro, quando è di taglio
      domanda.classList.remove('gira'); void domanda.offsetWidth; domanda.classList.add('gira');
      setTimeout(function () { dove.textContent = DOMANDE[n]; }, 190);
    });
    domanda.addEventListener('animationend', function (e) { if (e.target === domanda) domanda.classList.remove('gira'); });
  }
})();
