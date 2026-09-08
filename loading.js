/* O C C U L T — shared loading overlay
   Include this on every page with:  <script src="loading.js"></script>
   placed right after the opening <body>
  <script src="loading.js"></script> tag.

   Behavior:
   - On any page, clicking a link to directory.html shows the eye overlay
     immediately, waits briefly so the animation is visible, then navigates.
   - On Directory.html itself, the overlay is shown instantly (no fade-in,
     so nothing behind it flashes) and stays up until the page has fully
     loaded, then fades out.
*/
(function () {
  var BLACK = '#060606';
  var ASH = '#f2ede4';
  var EMBER = '#c8a96e';
  var DIM = '#6a6458';

  var thisFile = window.location.pathname.split('/').pop() || 'index.html';
  var isDirectoryPage = thisFile === 'Directory.html';

  // ---- inject styles ----
  var style = document.createElement('style');
  style.textContent =
    '#occult-loading-overlay {' +
    '  position: fixed; inset: 0; z-index: 99999;' +
    '  background: ' + BLACK + ';' +
    '  display: flex; align-items: center; justify-content: center;' +
    '  opacity: 0; pointer-events: none;' +
    '  transition: opacity 0.5s ease;' +
    '}' +
    '#occult-loading-overlay.active { opacity: 1; pointer-events: all; }' +
    '#occult-loading-overlay.instant { transition: none; }' +
    '#occult-loading-canvas { width: min(50vw, 420px); height: auto; display: block; }';
  document.head.appendChild(style);

  // ---- inject overlay markup ----
  var overlay = document.createElement('div');
  overlay.id = 'occult-loading-overlay';
  if (isDirectoryPage) {
    overlay.className = 'active instant';
  }
  overlay.innerHTML = '<canvas id="occult-loading-canvas" width="500" height="500"></canvas>';
  document.documentElement.appendChild(overlay);
  // move it to be the very first thing painted, ahead of body content
  document.addEventListener('DOMContentLoaded', function () {
    if (overlay.parentNode !== document.body) {
      document.body.insertBefore(overlay, document.body.firstChild);
    }
  });

  // ---- eye animation (same as creator_home) ----
  var canvas = document.getElementById('occult-loading-canvas');
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var cx = W / 2, cy = H / 2;

  var PHRASE = "O C C U L T   ";
  var chars = PHRASE.split('');

  var pupilR = 42, maxR = 250, ringGap = 13, fontSize = 12;
  ctx.font = fontSize + "px 'Cormorant Garamond', Georgia, serif";
  var charW = ctx.measureText('O').width * 1.15;

  function eyePath() {
    var w = 260, h = 140;
    ctx.beginPath();
    ctx.moveTo(cx - w, cy);
    ctx.quadraticCurveTo(cx, cy - h, cx + w, cy);
    ctx.quadraticCurveTo(cx, cy + h, cx - w, cy);
    ctx.closePath();
  }

  var t = 0;
  var rafId = null;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    eyePath();
    ctx.clip();

    for (var r = pupilR + ringGap; r < maxR; r += ringGap) {
      var circumference = 2 * Math.PI * r;
      var n = Math.max(8, Math.floor(circumference / charW));
      var angleStep = (2 * Math.PI) / n;
      var dir = (Math.floor(r / ringGap) % 2 === 0) ? 1 : -1;
      var ringPhase = t * 0.015 * dir + r * 0.02;

      for (var i = 0; i < n; i++) {
        var angle = i * angleStep + ringPhase;
        var wobble = Math.sin(angle * 3 + t * 0.02 + r * 0.05) * 5;
        var rr = r + wobble;
        var ch = chars[i % chars.length];

        var x = cx + rr * Math.cos(angle);
        var y = cy + rr * Math.sin(angle);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = 'rgba(200,169,110,0.5)';
        ctx.fillText(ch, -1, 0);
        ctx.fillStyle = 'rgba(106,100,88,0.5)';
        ctx.fillText(ch, 1, 0);
        ctx.fillStyle = 'rgba(242,237,228,0.92)';
        ctx.fillText(ch, 0, 0);

        ctx.restore();
      }
    }
    ctx.restore();

    eyePath();
    ctx.strokeStyle = 'rgba(242,237,228,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pupilR);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(1, '#0c0c0c');
    ctx.beginPath();
    ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    t += 1;
    rafId = requestAnimationFrame(draw);
  }

  function startAnim() {
    if (rafId === null) draw();
  }
  function stopAnim() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function showOverlay() {
    overlay.classList.remove('instant');
    overlay.classList.add('active');
    startAnim();
  }
  function hideOverlay() {
    overlay.classList.remove('instant');
    overlay.classList.remove('active');
    setTimeout(stopAnim, 550);
  }

  // start the animation immediately if we're already showing (directory.html on arrival)
  if (isDirectoryPage) {
    startAnim();
    window.addEventListener('load', function () {
      setTimeout(hideOverlay, 450);
    });
  }

  // intercept any click on a link that points at directory.html, from any page
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href) return;
    var targetFile = href.split('/').pop().split('?')[0].split('#')[0];
    if (targetFile === 'Directory.html') {
      e.preventDefault();
      showOverlay();
      setTimeout(function () {
        window.location.href = href;
      }, 500);
    }
  });
})();
