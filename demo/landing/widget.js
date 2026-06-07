/*! CallPilot AI Voice Widget — embeddable floating voice agent (ElevenLabs-style)
 * Usage (one line on any site):
 *   <script src="https://get.callpilotvoice.co.uk/widget.js"
 *           data-biz="salon" data-name="Glow Studio" data-owner="447700900123"
 *           data-color="#ff6b00" data-label="Talk to us"></script>
 * Visitors click the floating mic → an in-page panel opens → they talk to the AI (WebRTC), in the page.
 */
(function () {
  var s = document.currentScript;
  var biz   = (s && s.getAttribute('data-biz'))   || '';
  var name  = (s && s.getAttribute('data-name'))  || '';
  var owner = (s && s.getAttribute('data-owner')) || '';
  var color = (s && s.getAttribute('data-color')) || '#25d366';
  var label = (s && s.getAttribute('data-label')) || 'Talk to our AI receptionist';
  var side  = ((s && s.getAttribute('data-side')) || 'right').toLowerCase() === 'left' ? 'left' : 'right';

  var q = [];
  if (biz)   q.push('biz=' + encodeURIComponent(biz));
  if (name)  q.push('name=' + encodeURIComponent(name));
  if (owner) q.push('owner=' + encodeURIComponent(owner));
  if (biz)   q.push('lock=1'); // lock the picker only when a specific business is set
  var SRC = 'https://get.callpilotvoice.co.uk/talk/' + (q.length ? ('?' + q.join('&')) : '');

  var ID = 'cp-voice-widget';
  if (document.getElementById(ID)) return;

  var css = document.createElement('style');
  css.textContent =
    '#' + ID + '{position:fixed;' + side + ':20px;bottom:20px;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}' +
    '#' + ID + ' .cp-btn{display:flex;align-items:center;gap:10px;background:' + color + ';color:#fff;border:0;cursor:pointer;' +
      'padding:14px 20px;border-radius:999px;font-weight:700;font-size:15px;box-shadow:0 10px 30px rgba(0,0,0,.3)}' +
    '#' + ID + ' .cp-btn .cp-ico{font-size:20px;line-height:1}' +
    '#' + ID + ' .cp-panel{position:absolute;bottom:74px;' + side + ':0;width:380px;max-width:92vw;height:620px;max-height:78vh;' +
      'background:#0b141a;border-radius:20px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.5);display:none}' +
    '#' + ID + ' .cp-panel.open{display:block}' +
    '#' + ID + ' .cp-x{position:absolute;top:8px;' + (side === 'right' ? 'right' : 'left') + ':10px;z-index:2;background:rgba(255,255,255,.12);' +
      'color:#fff;border:0;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px}' +
    '#' + ID + ' iframe{width:100%;height:100%;border:0;display:block}' +
    '@media(max-width:480px){#' + ID + ' .cp-panel{width:94vw;height:80vh}}';
  document.head.appendChild(css);

  var wrap = document.createElement('div'); wrap.id = ID;
  var panel = document.createElement('div'); panel.className = 'cp-panel';
  var xbtn = document.createElement('button'); xbtn.className = 'cp-x'; xbtn.innerHTML = '✕'; xbtn.setAttribute('aria-label', 'Close');
  panel.appendChild(xbtn);
  var btn = document.createElement('button'); btn.className = 'cp-btn';
  btn.innerHTML = '<span class="cp-ico">🎙️</span><span>' + label + '</span>';
  wrap.appendChild(panel); wrap.appendChild(btn);
  document.body.appendChild(wrap);

  var iframe = null, open = false;
  function toggle() {
    open = !open;
    if (open) {
      if (!iframe) { // lazy-load so the mic isn't requested until opened
        iframe = document.createElement('iframe');
        iframe.setAttribute('allow', 'microphone; autoplay');
        iframe.src = SRC;
        panel.appendChild(iframe);
      }
      panel.classList.add('open');
    } else {
      panel.classList.remove('open');
    }
  }
  btn.addEventListener('click', toggle);
  xbtn.addEventListener('click', function (e) { e.stopPropagation(); open = true; toggle(); });
})();
